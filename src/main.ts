import { InstanceBase, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import type { SpaceCommzTypes } from './manifest.js'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import express from 'express'
import cors from 'cors'
import { Server } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { UpdatePresetDefinitions } from './preset.js'
import { VOLUME_DEFAULT, VOLUME_MAX, VOLUME_MIN } from './inputFields.js'

export class ModuleInstance extends InstanceBase<SpaceCommzTypes> {
	config!: ModuleConfig // Setup in init()
	private app: any
	private http: Server
	io: SocketIOServer
	pls: any = []
	activePls: Record<string, { speaker: string; time: any; isSpeaking: boolean }> = {}
	barValues: Record<number, number> = {}
	mute: boolean = false
	private barInterval: ReturnType<typeof setInterval> | null = null
	private clientCount: number = 0
	constructor(internal: unknown) {
		super(internal)

		this.app = express()
		this.http = new Server(this.app)
		this.io = new SocketIOServer(this.http, {
			cors: {
				origin: '*',
			},
		})
		this.app.use(cors())
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, _secrets: undefined): Promise<void> {
		this.config = config
		this.io.on('connection', (socket) => {
			this.clientCount++
			this.updateStatus(InstanceStatus.Ok)

			socket.on('disconnect', () => {
				this.clientCount--
				this.log('debug', `Client disconnected (${this.clientCount} remaining)`)
				if (this.clientCount <= 0) {
					this.clientCount = 0
					this.updateStatus(InstanceStatus.Connecting, 'Waiting for a connection')
				}
			})

			socket.on('updatePls', (msg: unknown) => {
				try {
					if (!Array.isArray(msg)) {
						this.log('warn', 'updatePls: expected array')
						return
					}
					this.pls = msg
					this.updateVariableDefinitions()
					this.updatePreset()
					this.checkFeedbacks('talkState', 'listenState', 'volumeLevel')
				} catch (e) {
					this.log('error', `updatePls handler error: ${e}`)
				}
			})

			socket.on('updateActivePls', (msg: unknown) => {
				try {
					if (typeof msg !== 'object' || msg === null || Array.isArray(msg)) {
						this.log('warn', 'updateActivePls: expected object')
						return
					}
					this.activePls = msg as Record<string, { speaker: string; time: any; isSpeaking: boolean }>
					this.updateVariableDefinitions()
					this.startBarAnimation()
					this.checkFeedbacks('listenState')
				} catch (e) {
					this.log('error', `updateActivePls handler error: ${e}`)
				}
			})

			socket.on('updateMute', (msg: unknown) => {
				try {
					if (typeof msg !== 'boolean') {
						this.log('warn', 'updateMute: expected boolean')
						return
					}
					this.mute = msg
					this.checkFeedbacks('muteState')
				} catch (e) {
					this.log('error', `updateMute handler error: ${e}`)
				}
			})
		})

		this.http.on('error', (e: NodeJS.ErrnoException) => {
			if (e.code === 'EADDRINUSE') {
				this.updateStatus(InstanceStatus.ConnectionFailure, `Port ${this.config.port} is already in use`)
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure, `HTTP server error: ${e.message}`)
			}
			this.log('error', `HTTP server error: ${e.message}`)
		})

		this.http.listen(this.config.port, () => {
			this.log('info', `PanelServer started on port ${this.config.port}`)
		})
		this.updateStatus(InstanceStatus.Connecting, 'Waiting for a connection')

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePreset() // export presets
	}
	getActivePl(plId: string): { speaker: string; time: any; isSpeaking: boolean } | undefined {
		return this.activePls[plId]
	}

	// Volume as last reported by the panel on the PL object. PLs that predate
	// volume support (or haven't reported yet) fall back to the panel default.
	getPlVolume(index: number): number {
		const pl = this.pls[index]
		if (!pl || typeof pl.volume !== 'number' || Number.isNaN(pl.volume)) {
			return VOLUME_DEFAULT
		}
		return this.clampVolume(pl.volume)
	}

	clampVolume(value: number): number {
		return Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, Math.round(value)))
	}

	// Push an absolute volume to the panel and reflect it locally so repeated
	// relative steps don't stall waiting for the panel's updatePls round-trip.
	setPlVolume(index: number, value: number): void {
		const pl = this.pls[index]
		if (!pl) {
			return
		}
		const volume = this.clampVolume(value)
		pl.volume = volume
		this.io.emit('setVolumePL', pl.id, volume)
		this.updateVariableDefinitions()
		this.checkFeedbacks('volumeLevel')
	}

	// Mirror the animated speaking state into variables: the level drives the
	// listen gauge, the speaker name the talk button's second line.
	updateLevelVariables(): void {
		const values: Record<string, string | number> = {}
		this.pls.forEach((pl: any, i: number) => {
			values['pl_' + (i + 1) + '_level'] = this.barValues[i] ?? 0
			const active = this.getActivePl(pl.id)
			values['pl_' + (i + 1) + '_speaker'] = active?.isSpeaking ? active.speaker : ''
		})
		this.setVariableValues(values)
	}

	startBarAnimation(): void {
		// Clear any existing interval
		if (this.barInterval) {
			clearInterval(this.barInterval)
			this.barInterval = null
		}

		// Check if any active PLs are being listened to
		const hasActive = this.pls.some((pl: any) => pl.listen && this.getActivePl(pl.id)?.isSpeaking)

		if (hasActive) {
			this.barInterval = setInterval(() => {
				this.pls.forEach((pl: any, i: number) => {
					const active = this.getActivePl(pl.id)
					if (pl.listen && active?.isSpeaking) {
						this.barValues[i] = Math.floor(Math.random() * 70) + 20 // 20-90
					} else {
						this.barValues[i] = 0
					}
				})
				this.updateLevelVariables()
				this.checkFeedbacks('listenState')
			}, 200)
		} else {
			// Reset all bar values
			this.barValues = {}
			this.updateLevelVariables()
			this.checkFeedbacks('listenState')
		}
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		if (this.barInterval) {
			clearInterval(this.barInterval)
			this.barInterval = null
		}
		this.io.close()
		this.http.close()
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig, _secrets: undefined): Promise<void> {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
	updatePreset(): void {
		UpdatePresetDefinitions(this)
	}
}

// Companion 5 loads the class from the default export and reads upgrade
// scripts from a named `UpgradeScripts` export (replaces runEntrypoint).
export default ModuleInstance
export { UpgradeScripts }

import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import express = require('express')
import cors = require('cors')
import { Server } from 'http'
import * as socketio from 'socket.io'
import { UpdatePresetDefinitions } from './preset.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	private app: any
	private http: Server
	io: socketio.Server
	pls: any = []
	activePls: Record<string, { speaker: string; time: any; isSpeaking: boolean }> = {}
	barValues: Record<number, number> = {}
	mute: boolean = false
	private barInterval: ReturnType<typeof setInterval> | null = null
	constructor(internal: unknown) {
		super(internal)

		this.app = express()
		this.http = new Server(this.app)
		this.io = new socketio.Server(this.http, {
			cors: {
				origin: '*',
			},
		})
		this.app.use(cors())
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.io.on('connection', (socket) => {
			this.updateStatus(InstanceStatus.Ok)
			socket.on('disconnect', () => {
				console.log('A user disconnected')
			})
			socket.on('updatePls', (msg) => {
				console.log('pls updated')
				this.pls = msg
				this.updateVariableDefinitions()
				this.updatePreset()
				this.checkFeedbacks('soloState', 'talkState', 'listenState')
			})

			socket.on('updateActivePls', (msg) => {
				this.activePls = msg
				this.updateVariableDefinitions()
				this.startBarAnimation()
				this.checkFeedbacks('listenState')
			})

			socket.on('updateMute', (msg) => {
				console.log('mute updated')
				this.mute = msg
				this.checkFeedbacks('muteState')
			})
		})
		this.http.listen(this.config.port, () => {
			console.log('PanelServer Started on port ' + this.config.port)
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
				this.checkFeedbacks('listenState')
			}, 200)
		} else {
			// Reset all bar values
			this.barValues = {}
			this.checkFeedbacks('listenState')
		}
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		if (this.barInterval) {
			clearInterval(this.barInterval)
			this.barInterval = null
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
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

runEntrypoint(ModuleInstance, UpgradeScripts)

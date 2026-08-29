import type { InstanceTypes } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

/**
 * The typed surface of this module: config, actions, feedbacks and variables.
 * 2.x checks every definition and callback against this, so option shapes are
 * declared once here rather than being cast at each use site.
 */
export interface SpaceCommzTypes extends InstanceTypes {
	config: ModuleConfig
	secrets: undefined
	actions: {
		listenPlByIndex: { options: { index: number; mode: string } }
		talkPlByIndex: { options: { index: number; mode: string } }
		setVolumePlByIndex: { options: { index: number; volume: number } }
		volumeUpPlByIndex: { options: { index: number; step: number } }
		volumeDownPlByIndex: { options: { index: number; step: number } }
		mute: { options: { mode: string } }
	}
	feedbacks: {
		talkState: { type: 'boolean'; options: { index: number } }
		listenState: { type: 'advanced'; options: { index: number } }
		volumeLevel: { type: 'advanced'; options: { index: number } }
		muteState: { type: 'boolean'; options: Record<string, never> }
	}
	variables: Record<string, string | number | undefined>
}

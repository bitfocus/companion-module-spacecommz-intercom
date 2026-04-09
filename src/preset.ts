import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'
import { ModuleInstance } from './main.js'

export function UpdatePresetDefinitions(self: ModuleInstance): void {
	let presets: CompanionPresetDefinitions = {}
	//@ts-ignore
	self.pls.forEach((pl: any, index: any) => {
		presets['talkPL' + index] = {
			type: 'button',
			category: 'Talk Channels',
			name: 'Talk Channel ' + index,
			style: {
				text: '$(SpaceCommz:pl_' + (index + 1) + '_name)',
				color: combineRgb(255, 255, 255),
				size: '18',
				bgcolor: combineRgb(35, 27, 60),
			},
			steps: [
				{
					down: [
						{
							actionId: 'talkPlByIndex',
							options: {
								index: index + 1,
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'talkState',
					options: {
						index: index + 1,
					},
					style: {
						bgcolor: combineRgb(141, 108, 239),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		}
		presets['listenPL' + index] = {
			type: 'button',
			category: 'Listen Channels',
			name: 'Listen ' + index,
			style: {
				text: '$(SpaceCommz:pl_' + (index + 1) + '_name)',
				color: combineRgb(255, 255, 255),
				size: '18',
				bgcolor: combineRgb(5, 40, 18),
			},
			steps: [
				{
					down: [
						{
							actionId: 'listenPlByIndex',
							options: {
								index: index + 1,
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'listenState',
					options: {
						index: index + 1,
					},
				},
			],
		}
		presets['mute'] = {
			type: 'button',
			category: 'Control',
			name: 'mute',
			style: {
				text: 'Mute',
				color: combineRgb(255, 255, 255),
				size: '18',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'mute',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'muteState',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
		}
	})
	self.setPresetDefinitions(presets)
}

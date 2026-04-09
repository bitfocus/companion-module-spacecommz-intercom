import { combineRgb } from '@companion-module/base'
import { graphics } from 'companion-module-utils'
import type { ModuleInstance } from './main.js'
import { indexInput } from './inputFields.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		/* soloState: {
			name: 'PL Solo State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(141, 108, 239),
				color: combineRgb(255, 255, 255),
			},
			options: [indexInput],
			callback: (feedback) => {
				let index = feedback.options.index as number -1
				if(!self.pls[index]){
					return false
				}
				return (self.pls[index].solo)
				
			},
		}, */
		talkState: {
			name: 'PL Talk State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(141, 108, 239),
				color: combineRgb(255, 255, 255),
			},
			options: [indexInput],
			callback: (feedback) => {
				let index = (feedback.options.index as number) - 1
				if (!self.pls[index]) {
					if (index >= 0) {
						self.log('debug', `talkState: PL index ${index + 1} out of range (have ${self.pls.length})`)
					}
					return false
				}
				return self.pls[index].talk
			},
		},
		listenState: {
			name: 'PL Listen State',
			type: 'advanced',
			options: [indexInput],
			callback: (feedback) => {
				let index = (feedback.options.index as number) - 1
				if (!self.pls[index]) {
					if (index >= 0) {
						self.log('debug', `listenState: PL index ${index + 1} out of range (have ${self.pls.length})`)
					}
					return {}
				}
				if (self.pls[index].listen) {
					const barValue = self.barValues[index] ?? 0
					return {
						bgcolor: combineRgb(22, 162, 73),
						color: combineRgb(255, 255, 255),
						imageBuffer: graphics.bar({
							width: feedback.image!.width,
							height: feedback.image!.height,
							colors: [
								{ size: 50, color: combineRgb(0, 255, 0), background: combineRgb(0, 255, 0), backgroundOpacity: 64 },
								{
									size: 25,
									color: combineRgb(255, 255, 0),
									background: combineRgb(255, 255, 0),
									backgroundOpacity: 64,
								},
								{ size: 25, color: combineRgb(255, 0, 0), background: combineRgb(255, 0, 0), backgroundOpacity: 64 },
							],
							barLength: feedback.image!.height - 10,
							barWidth: 6,
							value: barValue,
							type: 'vertical',
							offsetX: 64,
							offsetY: 5,
							opacity: 255,
						}),
					}
				}
				return {
					bgcolor: combineRgb(5, 40, 18),
					color: combineRgb(255, 255, 255),
				}
			},
		},
		muteState: {
			name: 'Mic Muted',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return !self.mute
			},
		},
	})
}

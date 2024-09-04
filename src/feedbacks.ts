import { combineRgb } from '@companion-module/base'
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
				let index = feedback.options.index as number -1
				console.log(self.pls[index],"checking")
				if(!self.pls[index]){
					return false
				}
				return (self.pls[index].talk)
			},
		},
		listenState: {
			name: 'PL Listen State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(22, 162, 73),
				color: combineRgb(255, 255, 255),
			},
			options: [indexInput],
			callback: (feedback) => {
				let index = feedback.options.index as number -1
				//if index doesnt exist on pls array return false
				if(!self.pls[index]){
					return false
				}
				return (self.pls[index].listen)
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
	}
}
	)
}

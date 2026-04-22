import type { ModuleInstance } from './main.js'
import { indexInput, modeToggle } from './inputFields.js'
export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		/* soloPlByIndex: {
			name: 'soloByIndex',
			options: [indexInput, modeToggle],
			callback: async (event) => {
				
				// @ts-ignore
				self.io.emit('soloPL', self.pls[event.options.index - 1].id)
			},
		}, */
		listenPlByIndex: {
			name: 'listenByIndex',
			options: [indexInput, modeToggle],
			callback: async (event) => {
				const index = (event.options.index as number) - 1
				if (index < 0 || index >= self.pls.length) {
					self.log('warn', `listenByIndex: PL index ${index + 1} out of range (have ${self.pls.length})`)
					return
				}
				self.io.emit('listenPL', self.pls[index].id)
			},
		},
		talkPlByIndex: {
			name: 'talkByIndex',
			options: [indexInput, modeToggle],
			callback: async (event) => {
				const index = (event.options.index as number) - 1
				if (index < 0 || index >= self.pls.length) {
					self.log('warn', `talkByIndex: PL index ${index + 1} out of range (have ${self.pls.length})`)
					return
				}
				self.io.emit('talkPL', self.pls[index].id)
			},
		},
		mute: {
			name: 'Mute',
			options: [modeToggle],
			callback: async (event) => {
				self.io.emit('mute', event.options.mode)
			},
		},
	})
}

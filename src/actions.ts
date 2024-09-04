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
				// @ts-ignore
				self.io.emit('listenPL', self.pls[event.options.index - 1].id)
			},
		},
		talkPlByIndex: {
			name: 'talkByIndex',
			options: [indexInput, modeToggle],
			callback: async (event) => {
				// @ts-ignore
				self.io.emit('talkPL', self.pls[event.options.index - 1].id)
			},
		},
		mute: {
			name: 'Mute',
			options: [modeToggle],
			callback: async (event) => {
				// @ts-ignore
				self.io.emit('mute', event.options.mode)
			},
		},
	})
}
 
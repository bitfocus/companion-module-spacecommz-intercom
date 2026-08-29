import type { CompanionVariableDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	// 2.x takes definitions as an object keyed by variable id, not an array.
	const definitions: CompanionVariableDefinitions = {}
	const values: Record<string, string | number | undefined> = {}
	if (self.pls.length != 0) {
		self.pls.forEach((_pl: any, index: number) => {
			const nameId = 'pl_' + (index + 1) + '_name'
			definitions[nameId] = { name: nameId }
			values[nameId] = _pl.name

			const volumeId = 'pl_' + (index + 1) + '_volume'
			definitions[volumeId] = { name: volumeId }
			values[volumeId] = self.getPlVolume(index)

			// Drives the listen button's speaking gauge (0 when not speaking).
			const levelId = 'pl_' + (index + 1) + '_level'
			definitions[levelId] = { name: levelId }
			values[levelId] = self.barValues[index] ?? 0

			// Who is currently talking on this PL, blank when nobody is.
			const speakerId = 'pl_' + (index + 1) + '_speaker'
			const active = self.getActivePl(_pl.id)
			definitions[speakerId] = { name: speakerId }
			values[speakerId] = active?.isSpeaking ? active.speaker : ''
		})
		self.setVariableDefinitions(definitions)
		self.setVariableValues(values)
	}
}

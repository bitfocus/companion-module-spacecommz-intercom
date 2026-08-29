import { CompanionInputFieldDropdown, CompanionInputFieldNumber } from '@companion-module/base'

// Mirrors the SpaceCommZ PartyLine volume slider bounds and default.
export const VOLUME_MIN = 5
export const VOLUME_MAX = 100
export const VOLUME_DEFAULT = 70

export const modeToggle: CompanionInputFieldDropdown<'mode', string> = {
	id: 'mode',
	type: 'dropdown',
	label: 'Mode',
	default: 'toggle',
	choices: [
		{ label: 'Toggle', id: 'toggle' },
		{ label: 'On', id: 'on' },
		{ label: 'Off', id: 'off' },
	],
}

export const indexInput: CompanionInputFieldNumber<'index'> = {
	id: 'index',
	type: 'number',
	label: 'Pl index',
	default: 1,
	min: 1,
	max: 200,
}

export const volumeInput: CompanionInputFieldNumber<'volume'> = {
	id: 'volume',
	type: 'number',
	label: 'Volume',
	default: VOLUME_DEFAULT,
	min: VOLUME_MIN,
	max: VOLUME_MAX,
	range: true,
	step: 1,
}

export const volumeStepInput: CompanionInputFieldNumber<'step'> = {
	id: 'step',
	type: 'number',
	label: 'Step',
	default: 5,
	min: 1,
	max: VOLUME_MAX,
}

import { CompanionPresetDefinitions, CompanionPresetSection, combineRgb } from '@companion-module/base'
import { ModuleInstance } from './main.js'
import type { SpaceCommzTypes } from './manifest.js'
import { VOLUME_MAX, VOLUME_MIN } from './inputFields.js'

// Layered presets position each element explicitly (percentages of the button),
// so text and graphics no longer fight for the same space the way the old flat
// style did - the volume gauge sits below the label rather than under it.
//
// Note: `fontsize` is a percentage of the element's own height, not pixels -
// Companion renders it as `fontsize * elementHeight / 100 / 1.2`.
const expr = (expression: string) => ({ value: expression, isExpression: true as const })
const plain = (value: string) => ({ value, isExpression: false as const })

// Shared element geometry so talk, listen and volume buttons line up.
// A label needs >= 20*1.2/72 = 34% of the button's height to render at 20px.
const LABEL_ONLY = { y: 3, height: 94 } // no meter: label owns the button
const LABEL_WITH_METER = { y: 3, height: 69 } // leaves room for a bottom gauge
const LABEL_WITH_SUB = { y: 3, height: 55 } // leaves room for a sub-label below
const SUB_LABEL = { y: 60, height: 37 } // smaller second line (speaker name)
const METER = { x: 8, y: 84, width: 84, height: 8 }
const WHITE = combineRgb(255, 255, 255)

const background = (color: number) => ({
	type: 'box' as const,
	id: 'background',
	opacity: 100,
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	color,
})

// Audio-meter colouring: green up to 60, orange to 85, red above. Hard bands
// (gradient: false) rather than a blend, and multiColour so the whole scale is
// visible at once the way a real level meter reads.
const VOLUME_STOPS = [{ value: 0, color: combineRgb(124, 106, 240), gradient: false }]

const METER_STOPS = [
	{ value: 0, color: combineRgb(0, 200, 60), gradient: false },
	{ value: 60, color: combineRgb(255, 165, 0), gradient: false },
	{ value: 85, color: combineRgb(255, 40, 40), gradient: false },
]

const meter = (
	valueVar: string,
	stops: typeof METER_STOPS,
	multiColour: boolean,
	min = 0,
	max = 100,
	// Slider look: a slim track with a filled bar, no thumb.
	slider = false,
) => ({
	type: 'gauge' as const,
	id: 'meter',
	opacity: 100,
	x: METER.x,
	y: METER.y,
	width: METER.width,
	height: METER.height,
	orientation: 'horizontal' as const,
	min,
	max,
	value: expr(valueVar),
	fillEnabled: true,
	roundedEnds: true,
	trackStyle: 'dimmed' as const,
	multiColour,
	markerEnabled: false,
	trackWidth: slider ? 38 : 100,
	fillWidth: slider ? 38 : 100,
	stops,
})

const subLabel = (text: string, targetPx: number) => ({
	type: 'text' as const,
	id: 'speaker',
	opacity: 100,
	x: 0,
	y: SUB_LABEL.y,
	width: 100,
	height: SUB_LABEL.height,
	text: plain(text),
	fontsize: Math.round((targetPx * 1.2 * 100) / ((72 * SUB_LABEL.height) / 100)),
	fontsizeAllowShrink: true,
	color: WHITE,
	halign: 'center' as const,
	valign: 'center' as const,
})

const label = (text: string, bounds: { y: number; height: number }) => ({
	type: 'text' as const,
	id: 'label',
	opacity: 100,
	x: 0,
	y: bounds.y,
	width: 100,
	height: bounds.height,
	text: plain(text),
	// fontsize is a % of the element height; solve it for a 20px result.
	fontsize: Math.round((20 * 1.2 * 100) / ((72 * bounds.height) / 100)),
	fontsizeAllowShrink: true,
	color: WHITE,
	halign: 'center' as const,
	valign: 'center' as const,
})

export function UpdatePresetDefinitions(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions<SpaceCommzTypes> = {}
	const talkIds: string[] = []
	const listenIds: string[] = []
	const volumeIds: string[] = []

	self.pls.forEach((_pl: any, index: number) => {
		const plNumber = index + 1
		const nameVar = `$(SpaceCommz:pl_${plNumber}_name)`
		const volumeVar = `$(SpaceCommz:pl_${plNumber}_volume)`

		const talkId = 'talkPL' + index
		talkIds.push(talkId)
		presets[talkId] = {
			type: 'layered',
			name: 'Talk Channel ' + plNumber,
			elements: [
				background(combineRgb(35, 27, 60)),
				label(nameVar, LABEL_WITH_SUB),
				subLabel(`${'$'}(SpaceCommz:pl_${plNumber}_speaker)`, 14),
			],
			steps: [
				{
					down: [{ actionId: 'talkPlByIndex', options: { index: plNumber, mode: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'talkState',
					options: { index: plNumber },
					// Layered presets override a named element's property rather
					// than restyling the whole button.
					styleOverrides: [{ elementId: 'background', elementProperty: 'color', override: combineRgb(141, 108, 239) }],
				},
			],
		}

		// Listen keeps its speaking meter, but as a horizontal gauge along the
		// bottom so it matches the volume button rather than the old side bar.
		const listenId = 'listenPL' + index
		listenIds.push(listenId)
		presets[listenId] = {
			type: 'layered',
			name: 'Listen ' + plNumber,
			elements: [
				background(combineRgb(5, 40, 18)),
				label(nameVar, LABEL_WITH_METER),
				meter(`${'$'}(SpaceCommz:pl_${plNumber}_level)`, METER_STOPS, true),
			],
			steps: [
				{
					down: [{ actionId: 'listenPlByIndex', options: { index: plNumber, mode: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'listenState',
					options: { index: plNumber },
					styleOverrides: [{ elementId: 'background', elementProperty: 'color', override: combineRgb(22, 162, 73) }],
				},
			],
		}

		// Layered: label on top, native gauge underneath, driven straight from
		// the volume variable so it needs no feedback to stay current.
		const volumeId = 'volumePL' + index
		volumeIds.push(volumeId)
		presets[volumeId] = {
			type: 'layered',
			name: 'Volume ' + plNumber,
			elements: [
				background(combineRgb(6, 33, 51)),
				{
					type: 'text',
					opacity: 100,
					id: 'label',
					x: 0,
					y: 3,
					width: 100,
					height: 34,
					text: plain(nameVar),
					fontsize: 98,
					fontsizeAllowShrink: true,
					color: combineRgb(255, 255, 255),
					halign: 'center',
					valign: 'center',
				},
				{
					type: 'text',
					opacity: 100,
					id: 'value',
					x: 0,
					y: 38,
					width: 100,
					height: 34,
					text: plain(volumeVar),
					fontsize: 98,
					fontsizeAllowShrink: true,
					color: combineRgb(255, 255, 255),
					halign: 'center',
					valign: 'center',
				},
				meter(volumeVar, VOLUME_STOPS, false, VOLUME_MIN, VOLUME_MAX, true),
			],
			steps: [
				{
					down: [{ actionId: 'volumeUpPlByIndex', options: { index: plNumber, step: 5 } }],
					up: [],
					rotate_left: [{ actionId: 'volumeDownPlByIndex', options: { index: plNumber, step: 5 } }],
					rotate_right: [{ actionId: 'volumeUpPlByIndex', options: { index: plNumber, step: 5 } }],
				},
			],
			feedbacks: [],
		}
	})

	presets['mute'] = {
		type: 'layered',
		name: 'Mute',
		elements: [background(combineRgb(0, 0, 0)), label('Mute', LABEL_ONLY)],
		steps: [{ down: [{ actionId: 'mute', options: { mode: 'toggle' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'muteState',
				options: {},
				styleOverrides: [{ elementId: 'background', elementProperty: 'color', override: combineRgb(255, 0, 0) }],
			},
		],
	}

	// 2.x takes an explicit section structure instead of a `category` per preset.
	const structure: CompanionPresetSection<SpaceCommzTypes>[] = [
		{ id: 'talk', name: 'Talk Channels', definitions: talkIds },
		{ id: 'listen', name: 'Listen Channels', definitions: listenIds },
		{ id: 'volume', name: 'Volume', definitions: volumeIds },
		{ id: 'control', name: 'Control', definitions: ['mute'] },
	]

	self.setPresetDefinitions(structure, presets)
}

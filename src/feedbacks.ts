import { combineRgb } from '@companion-module/base'
import { graphics } from 'companion-module-utils'
import type { ModuleInstance } from './main.js'
import { indexInput } from './inputFields.js'

// 2.x expects imageBuffer as a base64-encoded pixel buffer with its format
// declared, rather than the raw Uint8Array that 1.x accepted.
const RGBA = { pixelFormat: 'RGBA' as const }
function toBase64(buffer: Uint8Array): string {
	return Buffer.from(buffer).toString('base64')
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		talkState: {
			name: 'PL Talk State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(141, 108, 239),
				color: combineRgb(255, 255, 255),
			},
			options: [indexInput],
			callback: (feedback) => {
				const index = feedback.options.index - 1
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
			affectedProperties: ['bgcolor', 'color', 'imageBuffer'],
			options: [indexInput],
			callback: (feedback) => {
				const index = feedback.options.index - 1
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
						imageBuffer: toBase64(
							graphics.bar({
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
						),
						imageBufferEncoding: RGBA,
					}
				}
				return {
					bgcolor: combineRgb(5, 40, 18),
					color: combineRgb(255, 255, 255),
				}
			},
		},
		volumeLevel: {
			name: 'PL Volume Level',
			type: 'advanced',
			affectedProperties: ['size', 'imageBuffer'],
			options: [indexInput],
			callback: (feedback) => {
				const index = feedback.options.index - 1
				if (!self.pls[index]) {
					if (index >= 0) {
						self.log('debug', `volumeLevel: PL index ${index + 1} out of range (have ${self.pls.length})`)
					}
					return {}
				}
				return {
					// This feedback is the overriding style layer on the button, so the
					// preset's base size is ignored. Set it here to force it to stick.
					size: 20,
					imageBuffer: toBase64(
						graphics.bar({
							width: feedback.image!.width,
							height: feedback.image!.height,
							colors: [
								{
									size: 100,
									color: combineRgb(0, 183, 255),
									background: combineRgb(0, 183, 255),
									backgroundOpacity: 64,
								},
							],
							barLength: feedback.image!.width - 10,
							barWidth: 5,
							value: self.getPlVolume(index),
							type: 'horizontal',
							offsetX: 5,
							offsetY: feedback.image!.height - 8,
							opacity: 255,
						}),
					),
					imageBufferEncoding: RGBA,
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

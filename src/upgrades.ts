import type {
	CompanionMigrationFeedback,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	// v1.1.0: listenState changed from boolean to advanced feedback
	function (
		_context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig>,
	): CompanionStaticUpgradeResult<ModuleConfig> {
		const updatedFeedbacks: CompanionMigrationFeedback[] = []

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'listenState') {
				// Boolean feedbacks store style separately; advanced feedbacks don't use it.
				// Clear the style so Companion doesn't try to apply it as a boolean feedback.
				feedback.style = undefined
				updatedFeedbacks.push(feedback)
			}
		}

		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks,
		}
	},
]

import { z } from 'zod'
import { FlowContext } from '@motiadev/core'

export const config = {
	type: 'event' as const,
	name: 'HandlePeriodicJob',
	description: 'Handles the periodic job event',
	subscribes: ['cron-ticked'],
	emits: [],
	flows: ['cron-example'],
	input: z.object({
		timestamp: z.number()
	})
}

export const handler = async (input: z.infer<typeof config.input>, { logger }: FlowContext) => {
	logger.info('Periodic job executed', { timestamp: input.timestamp })
}
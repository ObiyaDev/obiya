import { z } from 'zod'

export const config = {
	type: 'cron' as const,
	name: 'PeriodicJob',
	description: 'Runs every 10 minutes and emits a timestamp',
	cron: '0/10 * * * *', // run every 10 minutes
	emits: ['cron-ticked'],
	flows: ['cron-example']
}

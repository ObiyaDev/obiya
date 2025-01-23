import { FlowContext } from '@motiadev/core'

export const config = {
  type: 'cron' as const,
  name: 'PeriodicJob',
  description: 'Runs every minute and emits a timestamp',
  cron: '* * * * *', // run every minutes
  emits: ['cron-ticked'],
  flows: ['cron-example']
}

export const handler = async ({ emit }: FlowContext) => {
  await emit({
    type: 'cron-ticked',
    data: {
      timestamp: Date.now(),
      message: 'Cron job executed'
    }
  })
}

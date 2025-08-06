import { CronConfig, Handlers } from 'motia'

export const config: CronConfig = {
  type: 'cron' as const,
  name: 'StateAuditJob',
  description: 'Runs every minute and emits a timestamp',
  cron: '*/5 * * * *', // run every hour at minute 0
  emits: ['state-audit-error'],
  flows: ['basic-tutorial'],
}

export const handler: Handlers['StateAuditJob'] = async ({ state, emit }) => {
  const stateValue = await state.getGroup('test')

  if (!Array.isArray(stateValue)) {
    await emit({
      topic: 'state-audit-error',
      data: { message: 'State value is not an array' },
    })

    return
  }

  for (const item of stateValue) {
    if (typeof item !== 'string') {
      await emit({
        topic: 'state-audit-error',
        data: { message: 'State value is not a string' },
      })
    }
  }
}

import { z } from 'zod'
import { EventConfig, StepHandler } from '@motiadev/core'
import { ParallelMergeStep } from './parallelMerge.types'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: EventConfig<Input> = {
  type: 'event',
  name: 'stepB',
  description: 'Hello from Step B',
  subscribes: ['pms.start'],
  emits: ['pms.stepB.done'],
  input: inputSchema,
  flows: ['parallel-merge'],
}

export const handler: StepHandler<typeof config> = async (_, { emit, traceId, state, logger }) => {
  logger.info('[stepB] received pms.start')

  const partialResultB: ParallelMergeStep = {
    msg: 'Hello from Step B',
    timestamp: Date.now(),
  }

  logger.info('[stepB] setting state')
  await state.set<ParallelMergeStep>(traceId, 'stepB', partialResultB)
  logger.info('[stepB] state set')

  await emit({
    type: 'pms.stepB.done',
    data: partialResultB,
  })
}

import { Express } from 'express'
import { z } from 'zod'
import { LockedData } from './locked-data'
import { FlowsStream } from './streams/flows-stream'
import { generateFlow } from './helper/flows-helper'

export const flowsEndpoint = (lockedData: LockedData, app: Express) => {
  const flowsStream = lockedData.createStream(
    {
      filePath: '__motia.flows',
      hidden: true,
      config: {
        name: '__motia.flows',
        schema: z.object({ id: z.string(), name: z.string(), steps: z.any(), edges: z.any() }),
        baseConfig: { storageType: 'custom', factory: () => new FlowsStream(lockedData) },
      },
    },
    { disableTypeCreation: true },
  )()

  lockedData.on('flow-created', (flowId) => {
    const flow = lockedData.flows[flowId]
    const response = generateFlow(flowId, flow.steps)
    flowsStream.set('default', flowId, response)
  })

  lockedData.on('flow-updated', (flowId) => {
    const flow = lockedData.flows[flowId]
    const response = generateFlow(flowId, flow.steps)
    flowsStream.set('default', flowId, response)
  })

  lockedData.on('flow-removed', (flowId) => flowsStream.delete('default', flowId))

  app.get('/flows/:id', async (req, res) => {
    const flowId = req.params.id
    const flow = lockedData.flows[flowId]

    if (!flow) {
      res.status(404).send({ error: 'Flow not found' })
    } else {
      res.status(200).send(generateFlow(flowId, flow.steps))
    }
  })
}

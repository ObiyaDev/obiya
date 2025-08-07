import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'ProcessFoodOrder',
  description:
    'basic-tutorial event step, this example shows how to consume an event from a topic and persist data in state',
  /**
   * The flows this step belongs to, will be available in Workbench
   */
  flows: ['basic-tutorial'],

  /**
   * This step subscribes to the event `process-food-order` to
   * be processed asynchronously.
   */
  subscribes: ['process-food-order'],

  /**
   * It ultimately emits an event to `new-order-notification` topic.
   */
  emits: ['new-order-notification'],

  /**
   * Definition of the expected input
   */
  input: z.object({ id: z.string(), quantity: z.number(), petId: z.number() }),
}

export const handler: Handlers['ProcessFoodOrder'] = async (input, { traceId, logger, state, emit }) => {
  /**
   * Avoid usage of console.log, use logger instead
   */
  logger.info('Step 02 – Process food order', { input })

  const order = await fetch('https://petstore.swagger.io/v2/store/order', {
    method: 'POST',
    body: JSON.stringify({
      id: input.id,
      quantity: input.quantity,
      petId: input.petId,
      shipDate: new Date().toISOString(),
      status: 'placed',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json())

  /**
   * Persist content on state to be used by other steps
   * or in other workflows later
   */
  await state.set<string>('orders', order.id, order)

  /**
   * Emit events to the topics to process separately
   * on another step
   */
  await emit({
    topic: 'new-order-notification',
    data: { order_id: order.id },
  })
}

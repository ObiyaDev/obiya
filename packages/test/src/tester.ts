import { createServer, createStateAdapter, Event, Logger } from '@motiadev/core'
import { generateLockedData } from 'motia'
import request from 'supertest'
import { createEventManager } from './event-manager'
import { CapturedEvent, MotiaTester } from './types'

export const createMotiaTester = (): MotiaTester => {
  const eventManager = createEventManager()
  const logger = new Logger()

  const promise = (async () => {
    const lockedData = await generateLockedData(process.cwd(), 'memory', 'disabled')
    const state = createStateAdapter({ adapter: 'memory' })
    const { server, close } = createServer(lockedData, eventManager, state, { isVerbose: false })

    return { server, eventManager, state, close }
  })()

  return {
    logger,
    waitEvents: async () => {
      const { eventManager } = await promise
      await eventManager.waitEvents()
    },
    post: async (path, options) => {
      const { server } = await promise
      return request(server).post(path).send(options.body)
    },
    get: async (path, options) => {
      const { server } = await promise
      return request(server).get(path).send(options.body)
    },
    emit: async (event) => {
      return eventManager.emit(event)
    },
    watch: async <TData>(event: string) => {
      const events: CapturedEvent<TData>[] = []

      eventManager.subscribe({
        event,
        filePath: '$watcher',
        handlerName: '$watcher',
        handler: async (event: Event<TData>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { logger, tracer, ...rest } = event
          events.push(rest)
        },
      })

      return {
        getCapturedEvents: () => events,
        getLastCapturedEvent: () => events[events.length - 1],
        getCapturedEvent: (index) => events[index],
      }
    },
    sleep: async (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    close: async () => promise.then(({ close }) => close()),
  }
}

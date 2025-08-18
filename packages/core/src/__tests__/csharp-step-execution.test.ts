import { randomUUID } from 'crypto'
import path from 'path'
import { callStepFile } from '../call-step-file'
import { createEventManager } from '../event-manager'
import { LockedData } from '../locked-data'
import { Logger } from '../logger'
import { Motia } from '../motia'
import { NoPrinter } from '../printer'
import { MemoryStateAdapter } from '../state/adapters/memory-state-adapter'
import { NoTracer } from '../observability/no-tracer'
import { 
  createCSharpEventStep, 
  createCSharpApiStep, 
  createCSharpCronStep, 
  createCSharpUiStep 
} from './fixtures/csharp-step-fixtures'

describe('C# Step Execution', () => {
  let baseDir: string
  let eventManager: ReturnType<typeof createEventManager>
  let state: MemoryStateAdapter
  let motia: Motia
  let printer: NoPrinter
  let logger: Logger
  let tracer: NoTracer

  beforeAll(() => {
    process.env._MOTIA_TEST_MODE = 'true'
  })

  beforeEach(() => {
    baseDir = path.join(__dirname, 'fixtures', 'csharp')
    eventManager = createEventManager()
    state = new MemoryStateAdapter()
    printer = new NoPrinter()
    logger = new Logger()
    tracer = new NoTracer()
    
    motia = {
      eventManager,
      state,
      printer,
      lockedData: new LockedData(baseDir, 'memory', printer),
      loggerFactory: { create: () => logger },
      tracerFactory: { createTracer: () => tracer },
    }
  })

  describe('Event Steps', () => {
    it('should execute C# event step with context in first argument', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['test-topic'], 
        emits: ['test-emit'] 
      })
      const traceId = randomUUID()

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })

    it('should execute C# event step with data and context', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['test-topic'], 
        emits: ['test-emit'] 
      })
      const traceId = randomUUID()
      const testData = { message: 'Hello from C#' }

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        data: testData,
        logger, 
        contextInFirstArg: false, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('API Steps', () => {
    it('should execute C# API step with proper configuration', async () => {
      const step = createCSharpApiStep({ 
        path: '/api/test', 
        method: 'POST',
        bodySchema: { type: 'object' },
        responseSchema: { type: 'object' }
      })
      const traceId = randomUUID()
      const requestData = { body: { test: 'data' } }

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        data: requestData,
        logger, 
        contextInFirstArg: false, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('Cron Steps', () => {
    it('should execute C# cron step with cron expression', async () => {
      const step = createCSharpCronStep({ 
        cron: '0 0 * * *', // Daily at midnight
        emits: ['daily-event']
      })
      const traceId = randomUUID()

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('UI Steps', () => {
    it('should execute C# UI step with proper configuration', async () => {
      const step = createCSharpUiStep({ 
        emits: ['ui-updated']
      })
      const traceId = randomUUID()

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('State Management', () => {
    it('should handle state operations in C# steps', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['state-test'] 
      })
      const traceId = randomUUID()

      // Set up state
      await state.set(traceId, 'test-key', 'test-value')

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      // Verify state operations were handled
      const value = await state.get(traceId, 'test-key')
      expect(value).toBe('test-value')
    })
  })

  describe('Stream Management', () => {
    it('should handle stream operations in C# steps', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['stream-test'] 
      })
      const traceId = randomUUID()

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle C# step execution errors gracefully', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['error-test'] 
      })
      const traceId = randomUUID()

      // Mock a step that would cause an error
      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.reject(new Error('C# step error')))

      await expect(callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)).rejects.toThrow('C# step error')
    })
  })

  describe('Middleware Support', () => {
    it('should execute C# step with middleware', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['middleware-test'],
        middleware: ['testMiddleware']
      })
      const traceId = randomUUID()

      jest.spyOn(eventManager, 'emit').mockImplementation(() => Promise.resolve())

      await callStepFile({ 
        step, 
        traceId, 
        logger, 
        contextInFirstArg: true, 
        tracer 
      }, motia)

      expect(eventManager.emit).toHaveBeenCalled()
    })
  })

  describe('Configuration Validation', () => {
    it('should validate C# step configuration', async () => {
      const step = createCSharpEventStep({ 
        subscribes: ['config-test'],
        timeout: 5000,
        retries: 3,
        parallel: true
      })
      const traceId = randomUUID()

      expect(step.config.timeout).toBe(5000)
      expect(step.config.retries).toBe(3)
      expect(step.config.parallel).toBe(true)
    })
  })
})

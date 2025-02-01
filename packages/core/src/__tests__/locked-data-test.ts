import { LockedData } from '../locked-data'
import { createApiStep, createCronStep, createEventStep, createNoopStep } from './fixtures/step-fixtures'

describe('LockedData', () => {
  describe('step creation', () => {
    it('should add steps to activeSteps when created', () => {
      const lockedData = new LockedData('/test/dir')
      const step = createApiStep()
      lockedData.onStepCreate(step)

      expect(lockedData.activeSteps).toHaveLength(1)
      expect(lockedData.activeSteps).toEqual([step])
    })

    it('should add steps to devSteps when virtualEmits is present', () => {
      const lockedData = new LockedData('/test/dir')
      const step = createNoopStep()

      lockedData.onStepCreate(step)

      expect(lockedData.devSteps).toHaveLength(1)
      expect(lockedData.activeSteps).toHaveLength(0)
      expect(lockedData.devSteps).toEqual([step])
    })

    it('should create flows when they do not exist', () => {
      const lockedData = new LockedData('/test/dir')
      const step = createApiStep({ name: 'Test 1', flows: ['flow1', 'flow2'] })

      lockedData.onStepCreate(step)

      expect(Object.keys(lockedData.flows)).toHaveLength(2)
      expect(lockedData.flows['flow1'].steps).toContain(step)
      expect(lockedData.flows['flow2'].steps).toContain(step)
    })
  })

  describe('step filtering', () => {
    let lockedData: LockedData

    const apiStep = createApiStep()
    const eventStep = createEventStep()
    const cronStep = createCronStep()

    beforeAll(() => {
      lockedData = new LockedData('/test/dir')
      lockedData.onStepCreate(apiStep)
      lockedData.onStepCreate(eventStep)
      lockedData.onStepCreate(cronStep)
    })

    it('should filter api steps correctly', () => {
      const apiSteps = lockedData.apiSteps()
      expect(apiSteps).toHaveLength(1)
      expect(apiSteps).toEqual([apiStep])
    })

    it('should filter event steps correctly', () => {
      const eventSteps = lockedData.eventSteps()
      expect(eventSteps).toHaveLength(1)
      expect(eventSteps).toEqual([eventStep])
    })

    it('should filter cron steps correctly', () => {
      const cronSteps = lockedData.cronSteps()
      expect(cronSteps).toHaveLength(1)
      expect(cronSteps).toEqual([cronStep])
    })
  })

  describe('step changes', () => {
    it('should handle flow changes correctly', () => {
      const lockedData = new LockedData('/test/dir')
      const oldStep = createApiStep({ flows: ['flow-1', 'flow-2'] })
      lockedData.onStepCreate(oldStep)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1', 'flow-2'])

      const newStep = createApiStep({ ...oldStep, flows: ['flow-2', 'flow-3'] })
      lockedData.onStepChange(oldStep, newStep)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-2', 'flow-3'])

      expect(lockedData.flows['flow-1']).toBeUndefined()
      expect(lockedData.flows['flow-2'].steps).toContainEqual(newStep)
      expect(lockedData.flows['flow-3'].steps).toContainEqual(newStep)
    })

    it('should handle type changes correctly', () => {
      const lockedData = new LockedData('/test/dir')
      const oldStep = createApiStep({}, '/test/dir/steps/flow-1/step.ts')
      lockedData.onStepCreate(oldStep)

      const newStep = createEventStep({}, '/test/dir/steps/flow-1/step.ts')
      lockedData.onStepChange(oldStep, newStep)

      expect(lockedData.apiSteps()).toHaveLength(0)
      expect(lockedData.eventSteps()).toHaveLength(1)
    })
  })

  describe('step deletion', () => {
    it('should remove steps from activeSteps and flows', () => {
      const lockedData = new LockedData('/test/dir')
      const step = createApiStep({ flows: ['flow-1'] })

      lockedData.onStepCreate(step)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])

      lockedData.onStepDelete(step)

      expect(lockedData.activeSteps).toHaveLength(0)
      expect(lockedData.flows['flow-1']).toBeUndefined()
      expect(Object.keys(lockedData.flows)).toHaveLength(0)
    })

    it('should remove steps from devSteps', () => {
      const lockedData = new LockedData('/test/dir')
      const step = createNoopStep()

      lockedData.onStepCreate(step)
      expect(lockedData.devSteps).toHaveLength(1)

      lockedData.onStepDelete(step)
      expect(lockedData.devSteps).toHaveLength(0)
    })

    it('should keep flows with remaining steps', () => {
      const lockedData = new LockedData('/test/dir')

      const step1 = createApiStep({ flows: ['flow-1'] })
      const step2 = createEventStep({ flows: ['flow-1'] })

      lockedData.onStepCreate(step1)
      lockedData.onStepCreate(step2)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])

      lockedData.onStepDelete(step1)

      expect(Object.keys(lockedData.flows)).toEqual(['flow-1'])
    })
  })
})

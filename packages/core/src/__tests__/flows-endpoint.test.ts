import { mockFlowSteps } from '../../test/fixtures/mocked-flow-steps'
import { generateFlowsList } from '../flows-endpoint'
import { LockedData } from '../locked-data'

describe('generateFlowsList', () => {
  it('should generate a list of flows with steps', () => {
    const lockedData = new LockedData(process.cwd())
    mockFlowSteps.forEach((step) => lockedData.onStepCreate(step))

    const result = generateFlowsList(lockedData)

    expect(result.map(({ id }) => id)).toEqual(['motia-server'])
    expect(result.map(({ steps }) => steps.map((step) => step.name)).flat()).toEqual([
      'Start Event',
      'Processor',
      'Finalizer',
    ])
  })
})

import { ZodObject } from 'zod'
import { ApiRouteConfig, CronConfig, EventConfig, Flow, Step } from './types'
import { isApiStep, isCronStep, isEventStep } from './guards'

export class LockedData {
  public flows: Record<string, Flow>
  public activeSteps: Step[]
  public devSteps: Step[]

  private stepsMap: Record<string, Step>

  constructor(public baseDir: string) {
    this.flows = {}
    this.activeSteps = []
    this.devSteps = []
    this.stepsMap = {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventSteps(): Step<EventConfig<ZodObject<any>>>[] {
    return this.activeSteps.filter(isEventStep)
  }

  apiSteps(): Step<ApiRouteConfig>[] {
    return this.activeSteps.filter(isApiStep)
  }

  cronSteps(): Step<CronConfig>[] {
    return this.activeSteps.filter(isCronStep)
  }

  onStepChange(oldStep: Step, newStep: Step): void {
    if (oldStep.config.type !== newStep.config.type) {
      this.activeSteps = this.activeSteps.filter((s) => s.filePath !== oldStep.filePath)
      this.devSteps = this.devSteps.filter((s) => s.filePath !== oldStep.filePath)

      if (newStep.config.virtualEmits) {
        this.devSteps.push(newStep)
      } else {
        this.activeSteps.push(newStep)
      }
    }

    const savedStep = this.stepsMap[newStep.filePath]
    const addedFlows = newStep.config.flows.filter((flowName) => !oldStep.config.flows.includes(flowName))
    const removedFlows = oldStep.config.flows.filter((flowName) => !newStep.config.flows.includes(flowName))

    for (const flowName of addedFlows) {
      if (!this.flows[flowName]) {
        this.flows[flowName] = { name: flowName, description: '', steps: [] }
      }
      this.flows[flowName].steps.push(savedStep)
    }

    for (const flowName of removedFlows) {
      const flowSteps = this.flows[flowName].steps
      this.flows[flowName].steps = flowSteps.filter(({ filePath }) => filePath !== newStep.filePath)

      if (this.flows[flowName].steps.length === 0) {
        delete this.flows[flowName]
      }
    }

    savedStep.config = newStep.config
  }

  onStepCreate(step: Step): void {
    this.stepsMap[step.filePath] = step

    if (step.config.virtualEmits) {
      this.devSteps.push(step)
    } else {
      this.activeSteps.push(step)
    }

    for (const flowName of step.config.flows) {
      if (!this.flows[flowName]) {
        this.flows[flowName] = { name: flowName, description: '', steps: [] }
      }
      this.flows[flowName].steps.push(step)
    }
  }

  onStepDelete(step: Step): void {
    // Remove step from active and dev steps
    this.activeSteps = this.activeSteps.filter(({ filePath }) => filePath !== step.filePath)
    this.devSteps = this.devSteps.filter(({ filePath }) => filePath !== step.filePath)

    delete this.stepsMap[step.filePath]

    for (const flowName of step.config.flows) {
      const stepFlows = this.flows[flowName]?.steps

      if (stepFlows) {
        this.flows[flowName].steps = stepFlows.filter(({ filePath }) => filePath !== step.filePath)
      }

      if (this.flows[flowName].steps.length === 0) {
        delete this.flows[flowName]
      }
    }
  }
}

import {
  isApiStep,
  LockedData,
  MotiaServer,
  MotiaEventManager,
  isEventStep,
  isCronStep,
  CronManager,
} from '@motiadev/core'
import { Step } from '@motiadev/core'
import { Watcher } from './watcher'
import path from 'path'

export const createDevWatchers = (
  lockedData: LockedData,
  server: MotiaServer,
  eventHandler: MotiaEventManager,
  cronManager: CronManager,
) => {
  const stepDir = path.join(process.cwd(), 'steps')
  const watcher = new Watcher(stepDir, lockedData)

  watcher.onStepChange((oldStep: Step, newStep: Step) => {
    console.log(`Step ${oldStep.config.name} changed to ${newStep.config.name}`)

    if (isApiStep(oldStep)) server.removeRoute(oldStep)
    if (isApiStep(newStep)) server.addRoute(newStep)

    if (isCronStep(oldStep)) cronManager.removeCronJob(oldStep)
    if (isCronStep(newStep)) cronManager.createCronJob(newStep)

    if (isEventStep(oldStep)) eventHandler.removeHandler(oldStep)
    if (isEventStep(newStep)) eventHandler.createHandler(newStep)

    lockedData.onStepChange(oldStep, newStep)

    return lockedData
  })

  watcher.onStepCreate((step: Step) => {
    console.log(`Step ${step.config.name} created`)

    if (isApiStep(step)) server.addRoute(step)
    if (isEventStep(step)) eventHandler.createHandler(step)
    if (isCronStep(step)) cronManager.createCronJob(step)

    lockedData.onStepCreate(step)
  })

  watcher.onStepDelete((step: Step) => {
    console.log(`Step ${step.config.name} deleted`)

    if (isApiStep(step)) server.removeRoute(step)
    if (isEventStep(step)) eventHandler.removeHandler(step)
    if (isCronStep(step)) cronManager.removeCronJob(step)

    lockedData.onStepDelete(step)
  })

  return watcher
}

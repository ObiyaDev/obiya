import path from 'path'
import { getPythonConfig } from './python/get-python-config'
import { FlowStep } from './config.types'
import { LockFile } from '../wistro.types'
import { globalLogger } from './logger'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const parseFlowFolder = async (lockData: LockFile, nextFlows: FlowStep[]): Promise<FlowStep[]> => {
  const flowsFromLock = lockData.flows || {}
  let flows: FlowStep[] = [...nextFlows]

  globalLogger.debug('[Flows] Building flows from lock file', { version: lockData.version })

  for (const [_, flowData] of Object.entries(flowsFromLock)) {
    for (const { filePath: stepPath } of flowData.steps) {
      const isPython = stepPath.endsWith('.py')

      if (isPython) {
        globalLogger.debug('[Flows] Building Python flow from lock', { stepPath })
        const config = await getPythonConfig(stepPath)
        flows.push({ config, file: path.basename(stepPath), filePath: stepPath })
      } else {
        globalLogger.debug('[Flows] Building Node flow from lock', { stepPath })
        const module = require(stepPath)
        if (!module.config) {
          globalLogger.debug(`[Flows] Skipping step ${stepPath} as it does not have a valid config`)
          continue
        }
        const config = module.config
        flows.push({ config, file: path.basename(stepPath), filePath: stepPath })
      }
    }
  }

  return flows
}

// Updated buildFlows to use lock file
export const buildFlows = async (lockData: LockFile): Promise<FlowStep[]> => {
  return parseFlowFolder(lockData, [])
}

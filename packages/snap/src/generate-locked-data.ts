import { LockedData, Step, getStepConfig, getStreamConfig } from '@motiadev/core'
import { NoPrinter, Printer } from '@motiadev/core/dist/src/printer'
import { randomUUID } from 'crypto'
import { globSync } from 'glob'
import path from 'path'

const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
// TODO: allow users to add more directories through config
const ignoredPaths = ['node_modules/**', '**/node_modules/**', 'python_modules/**', '**/python_modules/**']

export const getStepFiles = (projectDir: string): string[] => {
  const stepsDir = path.join(projectDir)
  return [
    ...globSync('**/*.step.{ts,js,py,rb}', { absolute: true, cwd: stepsDir, ignore: ignoredPaths }),
    ...globSync('**/*_step.{ts,js,py,rb}', { absolute: true, cwd: stepsDir, ignore: ignoredPaths }),
  ]
}

// Helper function to recursively collect flow data
export const collectFlows = async (projectDir: string, lockedData: LockedData): Promise<Step[]> => {
  const invalidSteps: Step[] = []
  const stepFiles = getStepFiles(projectDir)
  const streamFiles = [
    ...globSync(path.join(projectDir, '**/*.stream.{ts,js,py}'), { ignore: ignoredPaths }),
    ...globSync(path.join(projectDir, '**/*_stream.{ts,js,py}'), { ignore: ignoredPaths }),
  ]

  for (const filePath of stepFiles) {
    const config = await getStepConfig(filePath)

    if (!config) {
      console.warn(`No config found in step ${filePath}, step skipped`)
      continue
    }

    const result = lockedData.createStep({ filePath, version, config }, { disableTypeCreation: true })

    if (!result) {
      invalidSteps.push({ filePath, version, config })
    }
  }

  for (const filePath of streamFiles) {
    const config = await getStreamConfig(filePath)

    if (!config) {
      console.warn(`No config found in stream ${filePath}, stream skipped`)
      continue
    }

    lockedData.createStream({ filePath, config }, { disableTypeCreation: true })
  }

  return invalidSteps
}

export const generateLockedData = async (
  projectDir: string,
  streamAdapter: 'file' | 'memory' = 'file',
  printerType: 'disabled' | 'default' = 'default',
): Promise<LockedData> => {
  try {
    const printer = printerType === 'disabled' ? new NoPrinter() : new Printer(projectDir)
    /*
     * NOTE: right now for performance and simplicity let's enforce a folder,
     * but we might want to remove this and scan the entire current directory
     */
    const lockedData = new LockedData(projectDir, streamAdapter, printer)

    await collectFlows(projectDir, lockedData)
    lockedData.saveTypes()

    return lockedData
  } catch (error) {
    console.error(error)
    throw Error('Failed to parse the project, generating locked data step failed')
  }
}

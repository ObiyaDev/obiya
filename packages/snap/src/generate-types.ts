import { getStepConfig, getStreamConfig, LockedData, Printer } from '@motiadev/core'
import { randomUUID } from 'crypto'
import { globSync } from 'glob'

const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`

export const generateTypes = async (projectDir: string) => {
  // Scan the entire project directory for step and stream files, excluding common directories
  const ignorePatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/.turbo/**',
  ]

  const files = globSync('**/*.step.{ts,js,py,rb}', {
    absolute: true,
    cwd: projectDir,
    ignore: ignorePatterns,
  })
  const streamsFiles = globSync('**/*.stream.{ts,js,py,rb}', {
    absolute: true,
    cwd: projectDir,
    ignore: ignorePatterns,
  })
  const lockedData = new LockedData(projectDir, 'memory', new Printer(projectDir))

  for (const filePath of files) {
    const config = await getStepConfig(filePath)

    if (config) {
      lockedData.createStep({ filePath, version, config }, { disableTypeCreation: true })
    }
  }

  for (const filePath of streamsFiles) {
    const config = await getStreamConfig(filePath)

    if (config) {
      lockedData.createStream({ filePath, config }, { disableTypeCreation: true })
    }
  }

  lockedData.saveTypes()

  console.log('✨ Types created successfully')
}

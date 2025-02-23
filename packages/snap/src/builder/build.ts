import { Step, StepConfig } from '@motiadev/core'
import { LockedData } from '@motiadev/core/dist/src/locked-data'
import { NoPrinter } from '@motiadev/core/dist/src/printer'
import colors from 'colors'
import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { collectFlows } from '../generate-locked-data'
import { BuildPrinter } from './build-printer'

class Builder {
  public readonly printer: BuildPrinter
  public readonly distDir: string
  public readonly stepsConfig: Record<string, StepConfig>

  constructor(public readonly projectDir: string) {
    this.distDir = path.join(projectDir, 'dist')
    this.stepsConfig = {}
    this.printer = new BuildPrinter()
  }

  registerStep(relativeFilePath: string, step: Step) {
    this.stepsConfig[relativeFilePath] = step.config
  }
}

const buildNode = async (step: Step, builder: Builder) => {
  const relativeFilePath = step.filePath.replace(builder.projectDir, '')
  const outfile = path.join(builder.distDir, relativeFilePath.replace(/(.*)\.ts$/, '$1.js'))
  const outRelativeFilepath = relativeFilePath.replace(/(.*)\.ts$/, '$1.js')

  builder.registerStep(outRelativeFilepath, step)
  builder.printer.printStepBuilding(step)

  try {
    await esbuild.build({
      entryPoints: [step.filePath],
      bundle: true,
      sourcemap: true,
      outfile,
    })

    builder.printer.printStepBuilt(step)
  } catch (err) {
    builder.printer.printStepFailed(step, err as Error)
  }
}

export const build = async (): Promise<void> => {
  const projectDir = process.cwd()
  const builder = new Builder(projectDir)
  const stepsConfigPath = path.join(projectDir, 'dist', 'motia.steps.json')
  const lockedData = new LockedData(projectDir)
  const stepsConfig: Record<string, StepConfig> = {}
  const promises: Promise<unknown>[] = []

  const distDir = path.join(projectDir, 'dist')

  lockedData.printer = new NoPrinter(projectDir) // let's make it not print anything

  fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })

  lockedData.onStep('step-created', (step) => {
    if (step.config.type === 'noop') {
      return
    } else if (step.filePath.endsWith('.ts') || step.filePath.endsWith('.js')) {
      return promises.push(buildNode(step, builder))
    } else {
      return builder.printer.printStepSkipped(step, 'File not supported')
    }
  })

  await collectFlows(path.join(projectDir, 'steps'), lockedData)
  await Promise.all(promises)

  fs.writeFileSync(stepsConfigPath, JSON.stringify(stepsConfig, null, 2))

  console.log(colors.green('✓ [SUCCESS] '), 'Build completed')
}

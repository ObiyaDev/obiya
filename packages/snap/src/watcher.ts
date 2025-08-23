import chokidar, { FSWatcher } from 'chokidar'
import { randomUUID } from 'crypto'
import { getStepConfig, getStreamConfig, LockedData, Step } from '@motiadev/core'
import type { Stream } from '@motiadev/core/dist/src/types-stream'
import { devWatchIgnoredPaths } from './config/ignored-paths'
import { WatcherConfig, defaultWatcherConfig, getWatcherOptions } from './config/watcher-config'

type StepChangeHandler = (oldStep: Step, newStep: Step) => void
type StepCreateHandler = (step: Step) => void
type StepDeleteHandler = (step: Step) => void

type StreamChangeHandler = (oldStream: Stream, newStream: Stream) => void
type StreamCreateHandler = (stream: Stream) => void
type StreamDeleteHandler = (stream: Stream) => void

export class Watcher {
  private watcher?: FSWatcher
  private stepChangeHandler?: StepChangeHandler
  private stepCreateHandler?: StepCreateHandler
  private stepDeleteHandler?: StepDeleteHandler
  private streamChangeHandler?: StreamChangeHandler
  private streamCreateHandler?: StreamCreateHandler
  private streamDeleteHandler?: StreamDeleteHandler

  constructor(
    private readonly dir: string | string[],
    private lockedData: LockedData,
    private config: WatcherConfig = defaultWatcherConfig,
  ) {}

  onStepChange(handler: StepChangeHandler) {
    this.stepChangeHandler = handler
  }

  onStepCreate(handler: StepCreateHandler) {
    this.stepCreateHandler = handler
  }

  onStepDelete(handler: StepDeleteHandler) {
    this.stepDeleteHandler = handler
  }

  onStreamChange(handler: StreamChangeHandler) {
    this.streamChangeHandler = handler
  }

  onStreamCreate(handler: StreamCreateHandler) {
    this.streamCreateHandler = handler
  }

  onStreamDelete(handler: StreamDeleteHandler) {
    this.streamDeleteHandler = handler
  }

  private findStep(path: string): Step | undefined {
    return (
      this.lockedData.activeSteps.find((step) => step.filePath === path) ||
      this.lockedData.devSteps.find((step) => step.filePath === path)
    )
  }

  private async onStepFileAdd(path: string): Promise<void> {
    if (!this.stepCreateHandler) {
      console.warn(`No step create handler, step skipped`)
      return
    }

    const config = await getStepConfig(path).catch((err) => console.error(err))

    if (!config) {
      return
    }

    const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
    const step: Step = { filePath: path, version, config }

    this.stepCreateHandler?.(step)
  }

  private async onStepFileChange(path: string): Promise<void> {
    const config = await getStepConfig(path).catch((err) => {
      console.error(err)
    })

    const step = this.findStep(path)

    if (!step && !config) {
      return
    }

    // didn't have a step, but now we have a config
    if (!step && config) {
      const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
      const step: Step = { filePath: path, version, config }

      this.stepCreateHandler?.(step)
    }

    // had a step, and now we have a config
    if (step && config) {
      const newStep: Step = { ...step, config }
      this.stepChangeHandler?.(step, newStep)
    }

    // had a step, but no config
    if (step && !config) {
      this.stepDeleteHandler?.(step)
    }
  }

  private async onStepFileDelete(path: string): Promise<void> {
    const step = this.findStep(path)

    if (!step) {
      console.warn(`Step ${path} not found, step skipped`)
      return
    }

    this.stepDeleteHandler?.(step)
  }

  private async onStreamFileAdd(path: string): Promise<void> {
    const config = await getStreamConfig(path).catch((err) => console.error(err))

    if (!config) {
      return
    }

    this.streamCreateHandler?.({ filePath: path, config, factory: null as never })
  }

  private async onStreamFileChange(path: string): Promise<void> {
    const stream = this.lockedData.findStream(path)
    const config = await getStreamConfig(path).catch((err) => console.error(err))

    if (!stream && config) {
      this.streamCreateHandler?.({ filePath: path, config, factory: null as never })
    } else if (stream && config) {
      this.streamChangeHandler?.(stream, { filePath: path, config, factory: null as never })
    } else if (stream && !config) {
      this.streamDeleteHandler?.(stream)
    }
  }

  private async onStreamFileDelete(path: string): Promise<void> {
    const stream = this.lockedData.findStream(path)

    if (this.streamDeleteHandler && stream) {
      this.streamDeleteHandler(stream)
    }
  }

  private async onFileAdd(path: string): Promise<void> {
    if (this.isStepFile(path)) {
      this.onStepFileAdd(path)
    } else if (this.isStreamFile(path)) {
      this.onStreamFileAdd(path)
    }
  }

  private async onFileChange(path: string): Promise<void> {
    if (this.isStepFile(path)) {
      this.onStepFileChange(path)
    } else if (this.isStreamFile(path)) {
      this.onStreamFileChange(path)
    }
  }

  private async onFileDelete(path: string): Promise<void> {
    if (this.isStepFile(path)) {
      this.onStepFileDelete(path)
    } else if (this.isStreamFile(path)) {
      this.onStreamFileDelete(path)
    }
  }

  init() {
    const watcherOptions = getWatcherOptions(this.config, devWatchIgnoredPaths)

    this.watcher = chokidar
      .watch(this.dir, watcherOptions)
      .on('add', (path) => this.onFileAdd(path))
      .on('change', (path) => this.onFileChange(path))
      .on('unlink', (path) => this.onFileDelete(path))
      .on('error', (error: unknown) => {
        console.error('Watcher error:', error)
        if (error instanceof Error && error.message.includes('EMFILE')) {
          console.error('\n🚨 EMFILE Error: Too many open files!')
          console.error('\n💡 Quick fixes:')
          console.error('   1. Increase file descriptor limit: ulimit -n 65536')
          console.error('   2. Restart your terminal after running the above command')
          console.error('   3. For permanent fix, add to ~/.zshrc: echo "ulimit -n 65536" >> ~/.zshrc')
        }
      })
  }

  private isStepFile(path: string): boolean {
    return /[._]step\.[^.]+$/.test(path) && !/\.tsx$/.test(path)
  }

  private isStreamFile(path: string): boolean {
    return /[._]stream\.[^.]+$/.test(path) && !/\.tsx$/.test(path)
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
    }
  }
}

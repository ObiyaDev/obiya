import { Step, MotiaStream } from '@motiadev/core'
import { Stream } from '@motiadev/core/dist/src/types-stream'
import { BuildStepConfig } from '../../build/builder'
import { ValidationError } from '../../build/build-validation'
import { DeploymentListener, DeployData } from './listener.types'
import { DeploymentData, DeploymentStreamManager, BuildOutput, UploadOutput } from '../streams/deployment-stream'

export class StreamingDeploymentListener implements DeploymentListener {
  private errors: ValidationError[] = []
  private warnings: ValidationError[] = []
  private streamManager: DeploymentStreamManager

  constructor(
    private deploymentId: string,
    deploymentStream: MotiaStream<DeploymentData>,
  ) {
    this.streamManager = new DeploymentStreamManager(deploymentStream)
  }

  private getStepType(step: Step): 'event' | 'api' | 'cron' {
    if (step.config.type === 'api') return 'api'
    if (step.config.type === 'cron') return 'cron'
    return 'event'
  }

  private getLanguage(filePath: string): string {
    if (filePath.endsWith('.ts') || filePath.endsWith('.js')) return 'node'
    if (filePath.endsWith('.py')) return 'python'
    if (filePath.endsWith('.rb')) return 'ruby'
    return 'unknown'
  }

  private async updateStream(update: Partial<DeploymentData>) {
    const current = await this.streamManager.getDeployment(this.deploymentId)

    if (!current) {
      return
    }
    // Merge logs instead of replacing them
    const mergedUpdate: Partial<DeploymentData> = {
      ...update,
    }

    if (update.buildLogs) {
      mergedUpdate.buildLogs = [...current.buildLogs, ...update.buildLogs]
    }
    if (update.uploadLogs) {
      mergedUpdate.uploadLogs = [...current.uploadLogs, ...update.uploadLogs]
    }
    if (update.deployLogs) {
      mergedUpdate.deployLogs = [...current.deployLogs, ...update.deployLogs]
    }

    await this.streamManager.updateDeployment(this.deploymentId, mergedUpdate)
  }

  // DeploymentListener interface implementation
  getErrors(): ValidationError[] {
    return this.errors
  }

  // Build phase events
  onBuildStart(step: Step) {
    const message = `Building step: ${step.config.name}`
    const buildOutput: BuildOutput = {
      packagePath: step.filePath,
      language: this.getLanguage(step.filePath),
      status: 'building',
      type: this.getStepType(step),
    }

    this.streamManager.updateBuildOutput(this.deploymentId, buildOutput)
    this.updateStream({
      phase: 'build',
      status: 'building',
      message,
      buildLogs: [message],
      progress: 0,
    })
  }

  onBuildProgress(step: Step, message: string) {
    const logMessage = `${step.config.name}: ${message}`
    this.updateStream({
      message: logMessage,
      buildLogs: [logMessage],
      progress: 25,
    })
  }

  onBuildEnd(step: Step, size: number) {
    const message = `Built ${step.config.name} (${size} bytes)`
    const buildOutput: BuildOutput = {
      packagePath: step.filePath,
      language: this.getLanguage(step.filePath),
      status: 'built',
      type: this.getStepType(step),
      size,
    }

    this.streamManager.updateBuildOutput(this.deploymentId, buildOutput)
    this.updateStream({
      message,
      buildLogs: [message],
      progress: 50,
    })
  }

  onBuildError(step: Step, error: Error) {
    const message = `Error building ${step.config.name}: ${error.message}`
    const buildOutput: BuildOutput = {
      packagePath: step.filePath,
      language: this.getLanguage(step.filePath),
      status: 'error',
      type: this.getStepType(step),
      errorMessage: error.message,
    }

    this.streamManager.updateBuildOutput(this.deploymentId, buildOutput)
    this.updateStream({
      status: 'failed',
      message,
      buildLogs: [message],
      error: error.message,
    })
  }

  onBuildSkip(step: Step, reason: string) {
    const message = `Skipped ${step.config.name}: ${reason}`
    this.updateStream({
      message,
      buildLogs: [message],
      progress: 10,
    })
  }

  onStreamCreated(stream: Stream) {
    const message = `Created stream: ${stream.config.name}`
    this.updateStream({
      message,
      buildLogs: [message],
      progress: 20,
    })
  }

  onApiRouterBuilding(language: string) {
    const message = `Building API router for ${language}`
    this.updateStream({
      message,
      buildLogs: [message],
      progress: 60,
    })
  }

  onApiRouterBuilt(language: string, size: number) {
    const message = `Built API router for ${language} (${size} bytes)`
    this.updateStream({
      message,
      buildLogs: [message],
      progress: 80,
    })
  }

  onWarning(id: string, warning: string) {
    this.warnings.push({
      relativePath: id,
      message: warning,
      step: {} as ValidationError['step'],
    })
    this.updateStream({
      message: `Warning: ${warning}`,
      buildLogs: [`Warning: ${warning}`],
      progress: 10,
    })
  }

  onBuildWarning(warning: ValidationError) {
    this.warnings.push(warning)
    this.updateStream({
      message: `Build warning: ${warning.message}`,
      buildLogs: [`Build warning: ${warning.message}`],
      progress: 10,
    })
  }

  onBuildErrors(errors: ValidationError[]) {
    this.errors.push(...errors)
    const errorMessage = `Build failed with ${errors.length} errors`
    this.updateStream({
      status: 'failed',
      message: errorMessage,
      buildLogs: [errorMessage],
      error: errorMessage,
    })
  }

  // Upload phase events
  stepUploadStart(stepPath: string, step: BuildStepConfig) {
    const message = `Starting upload: ${step.config.name}`
    const uploadOutput: UploadOutput = {
      packagePath: stepPath,
      language: this.getLanguage(step.filePath),
      status: 'uploading',
      type: step.config.type as 'event' | 'api' | 'cron',
      progress: 0,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      phase: 'upload',
      status: 'uploading',
      message,
      uploadLogs: [message],
    })
  }

  stepUploadProgress(stepPath: string, step: BuildStepConfig, progress: number) {
    const message = `Uploading ${step.config.name}: ${progress}%`
    const uploadOutput: UploadOutput = {
      packagePath: stepPath,
      language: this.getLanguage(step.filePath),
      status: 'uploading',
      type: step.config.type as 'event' | 'api' | 'cron',
      progress,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      message,
      uploadLogs: [message],
      progress,
    })
  }

  stepUploadEnd(stepPath: string, step: BuildStepConfig) {
    const message = `Uploaded: ${step.config.name}`
    const uploadOutput: UploadOutput = {
      packagePath: stepPath,
      language: this.getLanguage(step.filePath),
      status: 'uploaded',
      type: step.config.type as 'event' | 'api' | 'cron',
      progress: 100,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      message,
      uploadLogs: [message],
      progress: 100,
    })
  }

  stepUploadError(stepPath: string, step: BuildStepConfig) {
    const message = `Upload failed: ${step.config.name}`
    const uploadOutput: UploadOutput = {
      packagePath: stepPath,
      language: this.getLanguage(step.filePath),
      status: 'error',
      type: step.config.type as 'event' | 'api' | 'cron',
      errorMessage: message,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      status: 'failed',
      message,
      uploadLogs: [message],
      error: message,
    })
  }

  routeUploadStart(path: string, language: string) {
    const message = `Starting upload: ${language} router`
    const uploadOutput: UploadOutput = {
      packagePath: path,
      language,
      status: 'uploading',
      type: 'api',
      progress: 0,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      message,
      uploadLogs: [message],
      progress: 50,
    })
  }

  routeUploadProgress(path: string, language: string, progress: number) {
    const message = `Uploading ${language} router: ${progress}%`
    const uploadOutput: UploadOutput = {
      packagePath: path,
      language,
      status: 'uploading',
      type: 'api',
      progress,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      message,
      uploadLogs: [message],
      progress,
    })
  }

  routeUploadEnd(path: string, language: string) {
    const message = `Uploaded: ${language} router`
    const uploadOutput: UploadOutput = {
      packagePath: path,
      language,
      status: 'uploaded',
      type: 'api',
      progress: 100,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      message,
      uploadLogs: [message],
      progress: 100,
    })
  }

  routeUploadError(path: string, language: string) {
    const message = `Upload failed: ${language} router`
    const uploadOutput: UploadOutput = {
      packagePath: path,
      language,
      status: 'error',
      type: 'api',
      errorMessage: message,
    }

    this.streamManager.updateUploadOutput(this.deploymentId, uploadOutput)
    this.updateStream({
      status: 'failed',
      message,
      uploadLogs: [message],
      error: message,
    })
  }

  // Deploy phase events
  onDeployStart() {
    const message = 'Deployment started'
    this.updateStream({
      phase: 'deploy',
      status: 'deploying',
      message,
      deployLogs: [message],
    })
  }

  onDeployProgress(data: DeployData) {
    const message = `Deployment status: ${data.status}`
    this.updateStream({
      message,
      deployLogs: [message],
      progress: 50,
    })
  }

  onDeployEnd(): void {
    this.streamManager.completeDeployment(this.deploymentId, true)
  }

  onDeployError(errorMessage: string) {
    this.streamManager.completeDeployment(this.deploymentId, false, errorMessage)
  }

  // Utility methods for phase management
  async startBuildPhase() {
    await this.updateStream({
      phase: 'build',
      status: 'building',
      message: 'Build phase started',
      buildLogs: ['Build phase started'],
    })
  }

  async completeBuildPhase() {
    await this.updateStream({
      message: 'Build phase completed',
      buildLogs: ['Build phase completed'],
      progress: 100,
    })
  }

  async startUploadPhase() {
    await this.updateStream({
      phase: 'upload',
      status: 'uploading',
      message: 'Upload phase started',
      uploadLogs: ['Upload phase started'],
      progress: 0,
    })
  }

  async completeUploadPhase() {
    await this.updateStream({
      message: 'Upload phase completed',
      uploadLogs: ['Upload phase completed'],
      progress: 100,
    })
  }

  async startDeployPhase() {
    await this.updateStream({
      phase: 'deploy',
      status: 'deploying',
      message: 'Deploy phase started',
      deployLogs: ['Deploy phase started'],
      progress: 0,
    })
  }
}

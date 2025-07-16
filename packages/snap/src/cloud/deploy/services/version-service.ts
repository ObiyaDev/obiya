import path from 'path'
import { VersionsClient } from '../../api'
import { VersionStartResponse } from '../../api/models/responses/version-responses'
import { CliContext } from '../../config-utils'
import { UploadResult } from '../types'
import { BuildStepsConfig, BuildStreamsConfig } from '../../build/builder'

export class VersionService {
  private readonly versionClient: VersionsClient

  constructor(private readonly context: CliContext) {
    this.versionClient = context.apiFactory.getVersionsClient()
  }

  async uploadConfiguration(
    environmentId: string,
    motiaVersion: string,
    version: string,
    stepsConfig: BuildStepsConfig,
    streamsConfig: BuildStreamsConfig,
  ): Promise<string> {
    this.context.log('upload-config', (message) => message.tag('progress').append('Uploading configuration...'))
    const versionId = await this.versionClient.uploadStepsConfig(
      environmentId,
      motiaVersion,
      version,
      stepsConfig,
      streamsConfig,
    )
    this.context.log('upload-config', (message) => message.tag('success').append('Configuration uploaded successfully'))
    this.context.log('deploy', (message) => message.tag('success').append(`Version started with ID: ${versionId}`))

    return versionId
  }

  async uploadProject(versionId: string, distDir: string, steps: BuildStepsConfig): Promise<UploadResult> {
    try {
      this.context.log('upload-zip', (message) => message.tag('progress').append('Uploading bundle...'))

      await Promise.all(
        Object.keys(steps).map((stepPath) => {
          const stepZipPath = path.join(distDir, stepPath)
          return this.versionClient.uploadZipFile(stepZipPath, versionId, stepPath)
        }),
      )

      this.context.log('upload-zip', (message) => message.tag('success').append('Uploaded bundle successfully'))

      return {
        success: true,
        bundlePath: distDir,
      }
    } catch (error) {
      this.context.log('upload-zip', (message) => message.tag('failed').append('Failed to upload bundle'))
      throw error
    }
  }

  async startVersion(versionId: string, envData?: Record<string, string>): Promise<VersionStartResponse> {
    this.context.log('deploy-progress', (message) => message.tag('progress').append('Finalizing version...'))
    return this.versionClient.startVersion(versionId, envData)
  }

  async getVersionStatus(versionId: string): Promise<{ status: string; errorMessage?: string; output?: string }> {
    return await this.versionClient.getVersionStatus(versionId)
  }

  async promoteVersion(args: { environmentId: string; versionName: string; projectId: string }): Promise<void> {
    const { environmentId, versionName, projectId } = args
    const environmentsClient = this.context.apiFactory.getEnvironmentsClient()
    const environment = await environmentsClient.getEnvironment(projectId, environmentId)

    this.context.log('promote-version', (message) =>
      message
        .tag('progress')
        .append('Promoting version')
        .append(versionName, 'dark')
        .append('to')
        .append(environment.name, 'dark'),
    )
    await this.versionClient.promoteVersion(environmentId, versionName)

    this.context.log('promote-version', (message) =>
      message
        .tag('success')
        .append('Version')
        .append(versionName, 'dark')
        .append('promoted successfully to')
        .append(environment.name, 'dark'),
    )
  }
}

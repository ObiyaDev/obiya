import { MotiaStream } from '@motiadev/core'

export type BuildOutput = {
  packagePath: string
  language: string
  status: 'building' | 'built' | 'error'
  size?: number // bytes (integer)
  type: 'event' | 'api' | 'cron'
  errorMessage?: string
}

export type UploadOutput = {
  packagePath: string
  language: string
  status: 'uploading' | 'uploaded' | 'error'
  size?: number // bytes (integer)
  progress?: number // 0-100 (integer)
  type: 'event' | 'api' | 'cron'
  errorMessage?: string
}

export interface DeploymentData {
  id: string
  status: 'idle' | 'building' | 'uploading' | 'deploying' | 'completed' | 'failed'
  phase: 'build' | 'upload' | 'deploy' | null
  progress: number
  message: string
  build: BuildOutput[]
  upload: UploadOutput[]
  buildLogs: string[]
  uploadLogs: string[]
  deployLogs: string[]
  error?: string
  startedAt?: number
  completedAt?: number
  metadata?: {
    totalSteps: number
    completedSteps: number
    environment?: string
  }
}

export const createDefaultDeploymentData = (deploymentId: string): DeploymentData => ({
  id: deploymentId,
  status: 'idle',
  phase: null,
  progress: 0,
  message: 'No deployment in progress',
  build: [],
  upload: [],
  buildLogs: [],
  uploadLogs: [],
  deployLogs: [],
  metadata: {
    totalSteps: 0,
    completedSteps: 0,
  },
})

export class DeploymentStreamManager {
  constructor(private stream: MotiaStream<DeploymentData>) {}

  async getDeployment(deploymentId: string): Promise<DeploymentData | null> {
    return await this.stream.get('deployments', deploymentId)
  }

  async updateDeployment(deploymentId: string, data: Partial<DeploymentData>): Promise<void> {
    const current = await this.getDeployment(deploymentId)
    if (!current) {
      // Create new deployment if it doesn't exist
      await this.stream.set('deployments', deploymentId, {
        ...createDefaultDeploymentData(deploymentId),
        ...data,
        id: deploymentId,
      })
    } else {
      const updated = {
        ...current,
        ...data,
        id: deploymentId,
        deploymentId,
      }
      await this.stream.set('deployments', deploymentId, updated)
    }
  }

  async startDeployment(deploymentToken: string, deploymentId: string): Promise<void> {
    await this.stream.set('deployments', deploymentId, {
      ...createDefaultDeploymentData(deploymentId),
      status: 'building',
      phase: 'build',
      startedAt: Date.now(),
      id: deploymentId,
      message: 'Starting deployment...',
    })
  }

  async completeDeployment(deploymentId: string, success: boolean, error?: string): Promise<void> {
    const current = await this.getDeployment(deploymentId)
    if (!current) return

    await this.stream.set('deployments', deploymentId, {
      ...current,
      status: success ? 'completed' : 'failed',
      phase: null,
      progress: 100,
      message: success ? 'Deployment completed successfully' : `Deployment failed: ${error}`,
      completedAt: Date.now(),
      error,
    })
  }

  async getAllDeployments(): Promise<DeploymentData[]> {
    return await this.stream.getGroup('deployments')
  }

  async updateBuildOutput(deploymentId: string, buildOutput: BuildOutput): Promise<void> {
    const current = await this.getDeployment(deploymentId)
    if (!current) return

    const existingIndex = current.build.findIndex((b) => b.packagePath === buildOutput.packagePath)
    const updatedBuild = [...current.build]

    if (existingIndex >= 0) {
      updatedBuild[existingIndex] = buildOutput
    } else {
      updatedBuild.push(buildOutput)
    }

    await this.updateDeployment(deploymentId, { build: updatedBuild })
  }

  async updateUploadOutput(deploymentId: string, uploadOutput: UploadOutput): Promise<void> {
    const current = await this.getDeployment(deploymentId)
    if (!current) return

    const existingIndex = current.upload.findIndex((u) => u.packagePath === uploadOutput.packagePath)
    const updatedUpload = [...current.upload]

    if (existingIndex >= 0) {
      updatedUpload[existingIndex] = uploadOutput
    } else {
      updatedUpload.push(uploadOutput)
    }

    await this.updateDeployment(deploymentId, { upload: updatedUpload })
  }
}

import { MotiaStream } from '@motiadev/core'

export interface DeploymentData {
  id: string // matches deploymentId
  status: 'idle' | 'building' | 'uploading' | 'deploying' | 'completed' | 'failed'
  phase: 'build' | 'upload' | 'deploy' | null
  progress: number
  message: string
  buildLogs: string[]
  uploadLogs: string[]
  deployLogs: string[]
  error?: string
  startedAt?: number
  completedAt?: number
  deploymentToken?: string
  deploymentId: string
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
  buildLogs: [],
  uploadLogs: [],
  deployLogs: [],
  deploymentId,
  metadata: {
    totalSteps: 0,
    completedSteps: 0
  }
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
        id: deploymentId
      })
    } else {
      const updated = {
        ...current,
        ...data,
        id: deploymentId,
        deploymentId
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
      deploymentToken,
      deploymentId,
      id: deploymentId,
      message: 'Starting deployment...'
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
      error
    })
  }

  async getAllDeployments(): Promise<DeploymentData[]> {
    return await this.stream.getGroup('deployments')
  }
}
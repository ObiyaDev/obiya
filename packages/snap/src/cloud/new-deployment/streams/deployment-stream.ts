import { MotiaStream } from '@motiadev/core'

export interface DeploymentData {
  id: string // sempre "current" para deploy único
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
  deploymentId?: string
  metadata?: {
    totalSteps: number
    completedSteps: number
    environment?: string
  }
}

export const createDefaultDeploymentData = (): DeploymentData => ({
  id: 'current',
  status: 'idle',
  phase: null,
  progress: 0,
  message: 'No deployment in progress',
  buildLogs: [],
  uploadLogs: [],
  deployLogs: [],
  metadata: {
    totalSteps: 0,
    completedSteps: 0
  }
})

export class DeploymentStreamManager {
  constructor(private stream: MotiaStream<DeploymentData>) {}

  async getCurrentDeployment(): Promise<DeploymentData> {
    const current = await this.stream.get('active', 'current')
    return current || createDefaultDeploymentData()
  }

  async updateDeployment(data: Partial<DeploymentData>): Promise<void> {
    const current = await this.getCurrentDeployment()
    const updated = {
      ...current,
      ...data,
      id: 'current' // sempre garantir que o ID seja "current"
    }
    await this.stream.set('active', 'current', updated)
  }

  async resetDeployment(): Promise<void> {
    await this.stream.set('active', 'current', createDefaultDeploymentData())
  }

  async startDeployment(deploymentToken: string, deploymentId: string): Promise<void> {
    await this.stream.set('active', 'current', {
      ...createDefaultDeploymentData(),
      status: 'building',
      phase: 'build',
      startedAt: Date.now(),
      deploymentToken,
      deploymentId,
      message: 'Starting deployment...'
    })
  }

  async completeDeployment(success: boolean, error?: string): Promise<void> {
    const current = await this.getCurrentDeployment()
    await this.stream.set('active', 'current', {
      ...current,
      status: success ? 'completed' : 'failed',
      phase: null,
      progress: 100,
      message: success ? 'Deployment completed successfully' : `Deployment failed: ${error}`,
      completedAt: Date.now(),
      error
    })
  }
}
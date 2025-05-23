import { spawn, ChildProcess } from 'child_process'
import { createCommunicationConfig, CommunicationType } from './communication-config'
import { BaseLogger } from '../logger'

export interface SimpleProcessManagerOptions {
  command: string
  args: string[]
  logger: BaseLogger
  context?: string
}

export class SimpleProcessManager<T = unknown> {
  private child?: ChildProcess
  private communicationType?: CommunicationType

  constructor(private options: SimpleProcessManagerOptions) {}

  async spawn(): Promise<ChildProcess> {
    const { command, args, logger, context = 'Process' } = this.options
    
    // Get communication configuration
    const commConfig = createCommunicationConfig(command)
    this.communicationType = commConfig.type
    
    logger.debug(`[${context}] Spawning process`, { 
      command, 
      args, 
      communicationType: this.communicationType 
    })

    // Spawn the process
    this.child = spawn(command, args, commConfig.spawnOptions)

    return this.child
  }

  onMessage(callback: (data: T) => void): void {
    if (!this.child) {
      throw new Error('Process not spawned yet. Call spawn() first.')
    }

    if (this.communicationType === 'rpc') {
      // For RPC mode, listen to stdout
      this.child.stdout?.on('data', (data) => {
        try {
          const rawMessage = data.toString().trim()
          const parsed = JSON.parse(rawMessage)
          this.options.logger.debug(`[${this.options.context}] Received RPC message`, { parsed })
          callback(parsed)
        } catch (error) {
          this.options.logger.error(`[${this.options.context}] Failed to parse RPC message`, { 
            error, 
            rawData: data.toString() 
          })
        }
      })
    } else {
      // For IPC mode, listen to messages
      this.child.on('message', (message: T) => {
        this.options.logger.debug(`[${this.options.context}] Received IPC message`, { message })
        callback(message)
      })
    }
  }

  onProcessClose(callback: (code: number | null) => void): void {
    if (!this.child) {
      throw new Error('Process not spawned yet. Call spawn() first.')
    }
    this.child.on('close', callback)
  }

  onProcessError(callback: (error: Error & { code?: string }) => void): void {
    if (!this.child) {
      throw new Error('Process not spawned yet. Call spawn() first.')
    }
    this.child.on('error', callback)
  }

  onStderr(callback: (data: Buffer) => void): void {
    if (!this.child) {
      throw new Error('Process not spawned yet. Call spawn() first.')
    }
    this.child.stderr?.on('data', callback)
  }

  kill(): void {
    if (this.child) {
      this.child.kill()
    }
  }

  close(): void {
    this.child = undefined
  }

  get process(): ChildProcess | undefined {
    return this.child
  }

  get commType(): CommunicationType | undefined {
    return this.communicationType
  }
} 
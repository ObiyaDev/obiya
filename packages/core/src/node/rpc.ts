/// <reference types="node" />
import crypto from 'crypto'
import readline from 'readline'

type RpcResponse = {
  type: 'rpc_response'
  id: string
  result: unknown
  error: unknown
}

export class RpcSender {
  private readonly pendingRequests: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { resolve: (result: any) => void; reject: (error: any) => void; method: string; args: any }
  > = {}

  private rl?: readline.Interface

  constructor(private readonly process: NodeJS.Process) {}

  async close(): Promise<void> {
    const outstandingRequests = Object.values(this.pendingRequests)

    if (outstandingRequests.length > 0) {
      console.error('Process ended while there are some promises outstanding')
      this.process.exit(1)
    }

    if (this.rl) {
      this.rl.close()
    }
  }

  send<T>(method: string, args: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID()
      this.pendingRequests[id] = { resolve, reject, method, args }

      const message = JSON.stringify({ type: 'rpc_request', id, method, args })
      console.log(message)
    })
  }

  sendNoWait(method: string, args: unknown) {
    const message = JSON.stringify({ type: 'rpc_request', method, args })
    console.log(message)
  }

  init() {
    // Create readline interface for stdin
    this.rl = readline.createInterface({
      input: this.process.stdin,
      crlfDelay: Infinity
    })

    this.rl.on('line', (line) => {
      try {
        const msg: RpcResponse = JSON.parse(line.trim())
        
        if (msg.type === 'rpc_response') {
          const { id, result, error } = msg
          const callbacks = this.pendingRequests[id]

          if (!callbacks) {
            return
          } else if (error) {
            callbacks.reject(error)
          } else {
            callbacks.resolve(result)
          }

          delete this.pendingRequests[id]
        }
      } catch (e) {
        console.error('Failed to parse RPC message:', e, 'Raw line:', line)
      }
    })

    this.rl.on('close', () => {
      // Handle stdin close
    })
  }
}

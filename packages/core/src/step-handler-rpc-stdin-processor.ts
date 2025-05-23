import { ChildProcess } from 'child_process'
import readline from 'readline'

type RpcHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>
export type RpcMessage = {
  type: 'rpc_request'
  id: string | undefined
  method: string
  args: unknown
}

export class RpcStdinProcessor {
  private handlers: Record<string, RpcHandler<any, any>> = {}
  private isClosed = false
  private rl?: readline.Interface

  constructor(private child: ChildProcess) {}

  handler<TInput, TOutput = unknown>(method: string, handler: RpcHandler<TInput, TOutput>) {
    this.handlers[method] = handler
  }

  async handle(method: string, input: unknown) {
    const handler = this.handlers[method]
    if (!handler) {
      throw new Error(`Handler for method ${method} not found`)
    }
    return handler(input)
  }

  private response(id: string | undefined, result: unknown, error: unknown) {
    if (id && !this.isClosed && this.child.stdin && !this.child.killed) {
      const responseMessage = { 
        type: 'rpc_response', 
        id, 
        result: error ? undefined : result,
        error: error ? String(error) : undefined
      }
      const messageStr = JSON.stringify(responseMessage)
      this.child.stdin.write(messageStr + '\n')
    }
  }

  async init() {
    if (this.child.stdout) {
      this.rl = readline.createInterface({
        input: this.child.stdout,
        crlfDelay: Infinity
      })

      this.rl.on('line', (line) => {
        try {
          const msg: RpcMessage = JSON.parse(line.trim())
          if (msg.type === 'rpc_request') {
            const { id, method, args } = msg
            this.handle(method, args)
              .then((result) => this.response(id, result, null))
              .catch((error) => this.response(id, null, error))
          }
        } catch (error) {
          console.error('Failed to parse RPC message:', error, 'Raw line:', line)
        }
      })

      this.rl.on('close', () => {
        this.isClosed = true
      })
    }

    this.child.on('exit', () => {
      this.isClosed = true
    })
    this.child.on('close', () => {
      this.isClosed = true
    })
  }

  close() {
    this.isClosed = true
    if (this.rl) {
      this.rl.close()
    }
  }
} 
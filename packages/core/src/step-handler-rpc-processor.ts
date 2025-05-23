import { ChildProcess } from 'child_process'
import readline from 'readline'

type RpcHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>
export type RpcMessage = {
  type: 'rpc_request'
  id: string | undefined
  method: string
  args: unknown
}

export class RpcProcessor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, RpcHandler<any, any>> = {}
  private isClosed = false
  private buffer = ''

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
      const responseMessage = JSON.stringify({ 
        type: 'rpc_response', 
        id, 
        result: error ? undefined : result,
        error: error ? String(error) : undefined
      })
      this.child.stdin.write(responseMessage + '\n')
    }
  }

  async init() {
    // Handle messages from child process stdout
    if (this.child.stdout) {
      const rl = readline.createInterface({
        input: this.child.stdout,
        crlfDelay: Infinity
      })

      rl.on('line', (line) => {
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

      rl.on('close', () => {
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
}

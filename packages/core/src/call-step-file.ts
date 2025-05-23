import { RpcProcessor } from './step-handler-rpc-processor'
import { RpcStdinProcessor } from './step-handler-rpc-stdin-processor'
import { Event, EventManager, InternalStateManager, Step } from './types'
import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import path from 'path'
import { isAllowedToEmit } from './utils'
import { BaseLogger } from './logger'
import { Printer } from './printer'

type StateGetInput = { traceId: string; key: string }
type StateSetInput = { traceId: string; key: string; value: unknown }
type StateDeleteInput = { traceId: string; key: string }
type StateClearInput = { traceId: string }

const getLanguageBasedRunner = (
  stepFilePath = '',
): {
  command: string
  runner: string
  args: string[]
} => {
  const isPython = stepFilePath.endsWith('.py')
  const isRuby = stepFilePath.endsWith('.rb')
  const isNode = stepFilePath.endsWith('.js') || stepFilePath.endsWith('.ts')

  if (isPython) {
    const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')
    return { runner: pythonRunner, command: 'python', args: [] }
  } else if (isRuby) {
    const rubyRunner = path.join(__dirname, 'ruby', 'ruby-runner.rb')
    return { runner: rubyRunner, command: 'ruby', args: [] }
  } else if (isNode) {
    if (process.env._MOTIA_TEST_MODE === 'true') {
      const nodeRunner = path.join(__dirname, 'node', 'node-runner.ts')
      return { runner: nodeRunner, command: 'node', args: ['-r', 'ts-node/register'] }
    }

    const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
    return { runner: nodeRunner, command: 'node', args: [] }
  }

  throw Error(`Unsupported file extension ${stepFilePath}`)
}

type CallStepFileOptions = {
  step: Step
  logger: BaseLogger
  eventManager: EventManager
  state: InternalStateManager
  traceId: string
  printer: Printer
  data?: any
  contextInFirstArg: boolean
}

export const callStepFile = <TData>(options: CallStepFileOptions): Promise<TData | undefined> => {
  const { step, printer, eventManager, state, traceId, data, contextInFirstArg } = options
  const logger = options.logger.child({ step: step.config.name })
  const flows = step.config.flows

  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ data, flows, traceId, contextInFirstArg })
    const { runner, command, args } = getLanguageBasedRunner(step.filePath)
    let result: TData | undefined

    // Decision logic: Python + Windows = RPC (stdin/stdout), everything else = IPC
    const shouldUseRpc = command === 'python' && process.platform === 'win32'

    const spawnOptions: SpawnOptions = {
      stdio: shouldUseRpc 
        ? ['pipe', 'pipe', 'pipe']  // RPC: stdin, stdout, stderr
        : [undefined, undefined, undefined, 'ipc'],  // IPC: includes IPC channel
    }

    const child: ChildProcess = spawn(command, [...args, runner, step.filePath, jsonData], spawnOptions)

    // Choose processor based on communication method
    const processor = shouldUseRpc 
      ? new RpcStdinProcessor(child)
      : new RpcProcessor(child)

    processor.handler<StateGetInput>('close', async () => child.kill())
    processor.handler<StateGetInput>('log', async (input: unknown) => logger.log(input))
    processor.handler<StateGetInput>('state.get', (input) => state.get(input.traceId, input.key))
    processor.handler<StateSetInput>('state.set', (input) => state.set(input.traceId, input.key, input.value))
    processor.handler<StateDeleteInput>('state.delete', (input) => state.delete(input.traceId, input.key))
    processor.handler<StateClearInput>('state.clear', (input) => state.clear(input.traceId))
    processor.handler<TData>('result', async (input) => {
      result = input
    })
    processor.handler<Event>('emit', async (input) => {
      if (!isAllowedToEmit(step, input.topic)) {
        return printer.printInvalidEmit(step, input.topic)
      }

      return eventManager.emit({ ...input, traceId, flows: step.config.flows, logger }, step.filePath)
    })

    processor.init()

    // For IPC mode, we might still want to capture stdout for logging
    if (!shouldUseRpc) {
      child.stdout?.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString())
          logger.log(message)
        } catch {
          logger.info(Buffer.from(data).toString())
        }
      })
    }

    child.stderr?.on('data', (data) => logger.error(Buffer.from(data).toString()))

    child.on('close', (code) => {
      processor.close()
      if (code !== 0 && code !== null) {
        reject(`Process exited with code ${code}`)
      } else {
        resolve(result)
      }
    })

    child.on('error', (error: { code?: string }) => {
      processor.close()
      if (error.code === 'ENOENT') {
        reject(`Executable ${command} not found`)
      } else {
        reject(error)
      }
    })
  })
}

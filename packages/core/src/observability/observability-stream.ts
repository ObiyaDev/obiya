import { Trace } from './types'
import { MemoryStreamAdapter } from '../streams/adapters/memory-stream-adapter'

export class ObservabilityStream extends MemoryStreamAdapter<Trace> {
}
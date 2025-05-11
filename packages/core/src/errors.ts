import { EventConfig, Step, CronConfig } from './types'

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorContext {
  stepName: string
  stepType: string
  traceId: string
  flows?: string[]
  inputData?: unknown
  category: ErrorCategory
  timestamp: string
  stack?: string
}

export class MotiaError extends Error {
  public readonly category: ErrorCategory
  public readonly context: ErrorContext

  constructor(message: string, category: ErrorCategory, context: ErrorContext) {
    super(message)
    this.name = 'MotiaError'
    this.category = category
    this.context = context
  }
}

export const createErrorContext = <T extends EventConfig | CronConfig>(
  step: Step<T>,
  traceId: string,
  inputData?: unknown,
  error?: Error,
): ErrorContext => ({
  stepName: step.config.name,
  stepType: step.config.type,
  traceId,
  flows: step.config.flows,
  inputData,
  category: determineErrorCategory(error),
  timestamp: new Date().toISOString(),
  stack: error?.stack,
})

const determineErrorCategory = (error?: Error): ErrorCategory => {
  if (!error) return ErrorCategory.UNKNOWN

  const message = error.message.toLowerCase()

  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategory.VALIDATION
  }
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return ErrorCategory.NETWORK
  }
  if (message.includes('business') || message.includes('domain')) {
    return ErrorCategory.BUSINESS_LOGIC
  }
  if (message.includes('system') || message.includes('internal')) {
    return ErrorCategory.SYSTEM
  }

  return ErrorCategory.UNKNOWN
}

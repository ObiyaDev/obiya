export class DeploymentError extends Error {
  public readonly code: string
  public readonly context?: Record<string, string>

  constructor(message: string, code: string, context?: Record<string, string>) {
    super(message)
    this.name = 'DeploymentError'
    this.code = code
    this.context = context
    Object.setPrototypeOf(this, DeploymentError.prototype)
  }
}

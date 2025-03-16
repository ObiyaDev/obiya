import { AxiosError } from 'axios'

export class DeploymentError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'DeploymentError';
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, DeploymentError.prototype);
  }
} 
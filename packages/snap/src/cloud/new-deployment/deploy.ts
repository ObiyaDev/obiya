import { Builder } from '../build/builder'
import { cloudApi } from './cloud-api'

export type DeployInput = {
  envVars: Record<string, string>
  deploymentToken: string
  builder: Builder
}

export const deploy = async ({ envVars, deploymentToken, builder }: DeployInput): Promise<void> => {
  await cloudApi.startDeployment({
    deploymentToken,
    envVars,
    steps: builder.stepsConfig,
    streams: builder.streamsConfig,
    routers: builder.routersConfig,
  })

  // add stream watcher
}

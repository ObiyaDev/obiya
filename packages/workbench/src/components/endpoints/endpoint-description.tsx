import { FC } from 'react'
import { EndpointResponseSchema } from './endpoint-response-schema'
import { ApiEndpoint } from '@/types/endpoint'

type Props = { endpoint: ApiEndpoint }

export const EndpointDescription: FC<Props> = ({ endpoint }) => {
  return (
    <div className="space-y-3">
      {endpoint.description && (
        <div className="rounded-lg border p-4 font-medium text-muted-foreground">{endpoint.description}</div>
      )}
      <EndpointResponseSchema
        items={Object.entries(endpoint?.responseSchema ?? {}).map(([status, schema]) => ({
          responseCode: status,
          bodySchema: schema,
        }))}
      />
    </div>
  )
}

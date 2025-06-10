import { useCallback, useEffect, useState } from 'react'
import { FlowConfigResponse, FlowResponse } from '@/views/flow/hooks/use-get-flow-state'
import { useStreamItem } from '@motiadev/stream-client-react'

export const useFetchFlows = (flowId: string) => {
  const { data: flow } = useStreamItem<FlowResponse>({
    streamName: '__motia.flows',
    groupId: 'default',
    id: flowId,
  })
  const [flowConfig, setFlowConfig] = useState<FlowConfigResponse | null>(null)

  const fetchConfigFlow = useCallback(async () => {
    try {
      const response = await fetch(`/flows/${flowId}/config`)
      setFlowConfig(await response.json())
    } catch (error) {
      console.error('Failed to fetch flow:', error)
      setFlowConfig(null)
    }
  }, [flowId])

  useEffect(() => {
    if (flowId) {
      fetchConfigFlow()
    }
  }, [fetchConfigFlow, flowId])

  return {
    flow,
    flowConfig,
  }
}

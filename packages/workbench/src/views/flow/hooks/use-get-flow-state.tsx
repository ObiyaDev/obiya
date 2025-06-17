import { Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { EdgeData, NodeData } from '../nodes/nodes.types'
import { ApiFlowNode } from '../nodes/api-flow-node'
import { NoopFlowNode } from '../nodes/noop-flow-node'
import { EventFlowNode } from '../nodes/event-flow-node'
import { CronNode } from '@/publicComponents/cron-node'
import isEqual from 'fast-deep-equal'
import { useSaveWorkflowConfig } from '@/views/flow/hooks/use-save-workflow-config'

type Emit = string | { topic: string; label?: string }

type FlowStep = {
  id: string
  name: string
  type: 'event' | 'api' | 'noop' | 'cron'
  description?: string
  subscribes?: string[]
  emits: Emit[]
  virtualEmits?: Emit[]
  action?: 'webhook'
  webhookUrl?: string
  language?: string
  nodeComponentPath?: string
  filePath?: string
}

export type FlowResponse = {
  id: string
  name: string
  steps: FlowStep[]
  edges: FlowEdge[]
  error?: string
}

export type FlowConfigResponse = {
  id: string
  config: {
    [stepName: string]: Position
  }
}

type FlowEdge = {
  id: string
  source: string
  target: string
  data: EdgeData
}

type Position = {
  x: number
  y: number
}

const getNodePosition = (flowConfig: FlowConfigResponse, stepName: string): Position => {
  const position = flowConfig?.config[stepName]
  return position || { x: 0, y: 0 }
}

type FlowState = {
  nodes: Node<NodeData>[]
  edges: Edge<EdgeData>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeTypes: Record<string, React.ComponentType<any>>
}

async function importFlow(flow: FlowResponse, flowConfig: FlowConfigResponse): Promise<FlowState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeTypes: Record<string, React.ComponentType<any>> = {
    event: EventFlowNode,
    api: ApiFlowNode,
    noop: NoopFlowNode,
    cron: CronNode,
  }

  // Load custom node components if they exist
  for (const step of flow.steps) {
    if (step.nodeComponentPath) {
      const module = await import(/* @vite-ignore */ `/@fs/${step.nodeComponentPath}`)
      nodeTypes[step.nodeComponentPath] = module.Node ?? module.default
    }
  }

  // Create nodes from steps
  const nodes: Node<NodeData>[] = flow.steps.map((step) => ({
    id: step.id,
    type: step.nodeComponentPath ? step.nodeComponentPath : step.type,
    filePath: step.filePath,
    position: step.filePath ? getNodePosition(flowConfig, step.filePath) : { x: 0, y: 0 },
    data: step,
    language: step.language,
  }))

  // Use the edges provided by the API, adding required ReactFlow properties
  const edges: Edge<EdgeData>[] = flow.edges.map((edge) => ({
    ...edge,
    type: 'base',
  }))

  return { nodes, edges, nodeTypes }
}

export const useGetFlowState = (flow: FlowResponse, flowConfig: FlowConfigResponse) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodeTypes, setNodeTypes] = useState<Record<string, React.ComponentType<any>>>()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([])
  const saveConfig = useSaveWorkflowConfig()
  const flowIdRef = useRef<string>('')
  const timeoutRef = useRef<any>(null)
  const importFlowTimeoutRef = useRef<any>(null)
  const flowConfigRef = useRef<any>(null)
  useEffect(() => {
    clearTimeout(importFlowTimeoutRef.current)
    if (!flow || flow.error || isEqual(flowConfigRef.current?.config, flowConfig.config)) return
    flowConfigRef.current = flowConfig
    flowIdRef.current = flow.id

    console.log({ flowConfig })

    console.log('importing flow')
    importFlow(flow, flowConfig).then(({ nodes, edges, nodeTypes }) => {
      setNodes(nodes)
      setEdges(edges)
      setNodeTypes(nodeTypes)
    })

    return () => clearTimeout(importFlowTimeoutRef.current)
  }, [flow, flowConfig, setNodes, setEdges, setNodeTypes])

  const saveFlowConfig = useCallback(
    (nodes: Node<NodeData>[]) => {
      const steps = nodes.reduce(
        (acc, node) => {
          if (node.data.filePath) {
            acc[node.data.filePath] = node.position
          }
          return acc
        },
        {} as FlowConfigResponse['config'],
      )
      const newConfig = { id: flowIdRef.current, config: steps }

      if (!isEqual(newConfig.config, flowConfig.config)) {
        flowConfigRef.current = newConfig
        return saveConfig(newConfig)
      }
    },
    [flowConfig],
  )

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      console.log('Saving nodes')
      await saveFlowConfig(nodes)
    }, 100)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [nodes])

  return { nodes, edges, onNodesChange, onEdgesChange, nodeTypes }
}

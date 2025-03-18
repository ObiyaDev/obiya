import fs from 'fs'
import path from 'path'
import { Flow, Step } from './types'
import { isApiStep, isCronStep, isEventStep, isNoopStep } from './guards'

// Pure function to ensure diagrams directory exists
const ensureDiagramsDirectory = (diagramsDir: string): void => {
  if (!fs.existsSync(diagramsDir)) {
    fs.mkdirSync(diagramsDir, { recursive: true })
  }
}

// Pure function to get node ID
const getNodeId = (step: Step): string => {
  // Create a valid mermaid node ID from the file path
  return step.filePath.replace(/[^a-zA-Z0-9]/g, '_')
}

// Pure function to get node label
const getNodeLabel = (step: Step): string => {
  // Get display name for node
  const displayName = step.config.name || path.basename(step.filePath, path.extname(step.filePath))

  // Add node type prefix to help distinguish types
  let prefix = ''
  if (isApiStep(step)) prefix = '🌐 '
  else if (isEventStep(step)) prefix = '⚡ '
  else if (isCronStep(step)) prefix = '⏰ '
  else if (isNoopStep(step)) prefix = '⚙️ '

  // Create a node label with the step name
  return `["${prefix}${displayName}"]`
}

// Pure function to get node style
const getNodeStyle = (step: Step): string => {
  // Apply style class based on step type
  if (isApiStep(step)) return ':::apiStyle'
  if (isEventStep(step)) return ':::eventStyle'
  if (isCronStep(step)) return ':::cronStyle'
  if (isNoopStep(step)) return ':::noopStyle'
  return ''
}

// Pure function to generate connections
const generateConnections = (
  emits: Array<string | { topic: string; label?: string }>,
  sourceStep: Step,
  steps: Step[],
  sourceId: string,
): string => {
  let connections = ''

  if (!emits || !Array.isArray(emits) || emits.length === 0) {
    return connections
  }

  emits.forEach((emit) => {
    const topic = typeof emit === 'string' ? emit : emit.topic
    const label = typeof emit === 'string' ? topic : emit.label || topic

    steps.forEach((targetStep) => {
      // Check for regular subscribes in event steps
      if (
        isEventStep(targetStep) &&
        targetStep.config.subscribes &&
        Array.isArray(targetStep.config.subscribes) &&
        targetStep.config.subscribes.includes(topic)
      ) {
        const targetId = getNodeId(targetStep)
        connections += `    ${sourceId} -->|${label}| ${targetId}\n`
      }
      // Check for virtual subscribes in noop steps
      else if (
        isNoopStep(targetStep) &&
        targetStep.config.virtualSubscribes &&
        Array.isArray(targetStep.config.virtualSubscribes) &&
        targetStep.config.virtualSubscribes.includes(topic)
      ) {
        const targetId = getNodeId(targetStep)
        connections += `    ${sourceId} -->|${label}| ${targetId}\n`
      }
      // Check if API steps have virtualSubscribes
      else if (
        isApiStep(targetStep) &&
        targetStep.config.virtualSubscribes &&
        Array.isArray(targetStep.config.virtualSubscribes) &&
        targetStep.config.virtualSubscribes.includes(topic)
      ) {
        const targetId = getNodeId(targetStep)
        connections += `    ${sourceId} -->|${label}| ${targetId}\n`
      }
    })
  })

  return connections
}

// Pure function to generate flow diagram
const generateFlowDiagram = (flowName: string, steps: Step[]): string => {
  // Start mermaid flowchart with top-down direction
  let diagram = `flowchart TD\n`

  // Add class definitions for styling with explicit text color
  diagram += `    classDef apiStyle fill:#f96,stroke:#333,stroke-width:2px,color:#fff\n`
  diagram += `    classDef eventStyle fill:#69f,stroke:#333,stroke-width:2px,color:#fff\n`
  diagram += `    classDef cronStyle fill:#9c6,stroke:#333,stroke-width:2px,color:#fff\n`
  diagram += `    classDef noopStyle fill:#3f3a50,stroke:#333,stroke-width:2px,color:#fff\n`

  // Check if we have any steps
  if (!steps || steps.length === 0) {
    return diagram + '    empty[No steps in this flow]'
  }

  // Create node definitions with proper format
  steps.forEach((step) => {
    const nodeId = getNodeId(step)
    const nodeLabel = getNodeLabel(step)
    const nodeStyle = getNodeStyle(step)
    diagram += `    ${nodeId}${nodeLabel}${nodeStyle}\n`
  })

  // Create connections between nodes
  let connectionsStr = ''

  steps.forEach((sourceStep) => {
    const sourceId = getNodeId(sourceStep)

    if (isApiStep(sourceStep)) {
      if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
        connectionsStr += generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
      }
      if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
        connectionsStr += generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
      }
    } else if (isEventStep(sourceStep)) {
      if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
        connectionsStr += generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
      }
      if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
        connectionsStr += generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
      }
    } else if (isCronStep(sourceStep)) {
      if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
        connectionsStr += generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
      }
      if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
        connectionsStr += generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
      }
    } else if (isNoopStep(sourceStep)) {
      if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
        connectionsStr += generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
      }
    }
  })

  // Add connections to the diagram
  diagram += connectionsStr

  return diagram
}

// Function to save a diagram to a file
const saveDiagram = (diagramsDir: string, flowName: string, diagram: string): void => {
  const filePath = path.join(diagramsDir, `${flowName}.mmd`)
  fs.writeFileSync(filePath, diagram)
}

// Function to remove a diagram file
const removeDiagram = (diagramsDir: string, flowName: string): void => {
  const filePath = path.join(diagramsDir, `${flowName}.mmd`)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

// Function to generate and save a diagram
const generateAndSaveDiagram = (diagramsDir: string, flowName: string, flow: Flow): void => {
  const diagram = generateFlowDiagram(flowName, flow.steps)
  saveDiagram(diagramsDir, flowName, diagram)
}

// Main exported function that creates the mermaid generator
export const createMermaidGenerator = (baseDir: string) => {
  const diagramsDir = path.join(baseDir, '.mermaid')
  ensureDiagramsDirectory(diagramsDir)

  // Event handlers
  const handleFlowCreated = (flowName: string, flow: Flow): void => {
    generateAndSaveDiagram(diagramsDir, flowName, flow)
  }

  const handleFlowUpdated = (flowName: string, flow: Flow): void => {
    generateAndSaveDiagram(diagramsDir, flowName, flow)
  }

  const handleFlowRemoved = (flowName: string): void => {
    removeDiagram(diagramsDir, flowName)
  }

  // Initialize function to hook into LockedData events
  const initialize = (lockedData: any): void => {
    // Hook into flow events
    lockedData.on('flow-created', (flowName: string) => {
      handleFlowCreated(flowName, lockedData.flows[flowName])
    })

    lockedData.on('flow-updated', (flowName: string) => {
      handleFlowUpdated(flowName, lockedData.flows[flowName])
    })

    lockedData.on('flow-removed', (flowName: string) => {
      handleFlowRemoved(flowName)
    })

    // Generate diagrams for all existing flows
    if (lockedData.flows && typeof lockedData.flows === 'object') {
      Object.entries(lockedData.flows).forEach(([flowName, flow]) => {
        generateAndSaveDiagram(diagramsDir, flowName, flow as Flow)
      })
    }
  }

  // Return the public API
  return {
    initialize,
  }
}

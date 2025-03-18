import fs from 'fs'
import path from 'path'
import { Flow, Step } from './types'
import { isApiStep, isCronStep, isEventStep, isNoopStep } from './guards'

/**
 * MermaidGenerator class for generating mermaid diagrams from flows
 */
export class MermaidGenerator {
  private diagramsDir: string

  /**
   * Create a new MermaidGenerator
   * @param baseDir Base directory of the project
   */
  constructor(private readonly baseDir: string) {
    this.diagramsDir = path.join(baseDir, 'steps', 'mermaid')
    this.ensureDiagramsDirectory()
  }

  /**
   * Initialize the generator by hooking into LockedData events
   * @param lockedData LockedData instance
   */
  initialize(lockedData: any): void {
    console.log('[MermaidGenerator] Initializing with locked data:', Object.keys(lockedData))
    console.log('[MermaidGenerator] Flows:', Object.keys(lockedData.flows || {}))

    // Hook into flow events
    lockedData.on('flow-created', (flowName: string) => {
      console.log(`[MermaidGenerator] Flow created event: ${flowName}`)
      this.handleFlowCreated(flowName, lockedData.flows[flowName])
    })

    lockedData.on('flow-updated', (flowName: string) => {
      console.log(`[MermaidGenerator] Flow updated event: ${flowName}`)
      this.handleFlowUpdated(flowName, lockedData.flows[flowName])
    })

    lockedData.on('flow-removed', (flowName: string) => {
      console.log(`[MermaidGenerator] Flow removed event: ${flowName}`)
      this.handleFlowRemoved(flowName)
    })

    // Generate diagrams for all existing flows
    console.log('[MermaidGenerator] Generating diagrams for existing flows')
    if (lockedData.flows && typeof lockedData.flows === 'object') {
      Object.entries(lockedData.flows).forEach(([flowName, flow]) => {
        console.log(`[MermaidGenerator] Generating diagram for flow: ${flowName}`)
        this.generateAndSaveDiagram(flowName, flow as Flow)
      })
    } else {
      console.log('[MermaidGenerator] No flows found in locked data')
    }
  }

  /**
   * Ensure the diagrams directory exists
   */
  private ensureDiagramsDirectory(): void {
    console.log(`[MermaidGenerator] Ensuring diagrams directory exists: ${this.diagramsDir}`)
    if (!fs.existsSync(this.diagramsDir)) {
      console.log(`[MermaidGenerator] Creating diagrams directory: ${this.diagramsDir}`)
      fs.mkdirSync(this.diagramsDir, { recursive: true })
    } else {
      console.log(`[MermaidGenerator] Diagrams directory already exists: ${this.diagramsDir}`)
    }
  }

  /**
   * Handle flow created event
   * @param flowName Name of the flow
   * @param flow Flow data
   */
  private handleFlowCreated(flowName: string, flow: Flow): void {
    console.log(`[MermaidGenerator] Flow created: ${flowName}`)
    this.generateAndSaveDiagram(flowName, flow)
  }

  /**
   * Handle flow updated event
   * @param flowName Name of the flow
   * @param flow Flow data
   */
  private handleFlowUpdated(flowName: string, flow: Flow): void {
    console.log(`[MermaidGenerator] Flow updated: ${flowName}`)
    this.generateAndSaveDiagram(flowName, flow)
  }

  /**
   * Handle flow removed event
   * @param flowName Name of the flow
   */
  private handleFlowRemoved(flowName: string): void {
    console.log(`[MermaidGenerator] Flow removed: ${flowName}`)
    this.removeDiagram(flowName)
  }

  /**
   * Generate and save a mermaid diagram for a flow
   * @param flowName Name of the flow
   * @param flow Flow data
   */
  private generateAndSaveDiagram(flowName: string, flow: Flow): void {
    const diagram = this.generateFlowDiagram(flowName, flow.steps)
    this.saveDiagram(flowName, diagram)
  }

  /**
   * Save a mermaid diagram to a file
   * @param flowName Name of the flow
   * @param diagram Mermaid diagram content
   */
  private saveDiagram(flowName: string, diagram: string): void {
    const filePath = path.join(this.diagramsDir, `${flowName}.mmd`)
    fs.writeFileSync(filePath, diagram)
    console.log(`[MermaidGenerator] Saved diagram for ${flowName} to ${filePath}`)
  }

  /**
   * Remove a mermaid diagram file
   * @param flowName Name of the flow
   */
  private removeDiagram(flowName: string): void {
    const filePath = path.join(this.diagramsDir, `${flowName}.mmd`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`[MermaidGenerator] Removed diagram for ${flowName}`)
    }
  }

  /**
   * Generate a mermaid flowchart diagram for a flow
   * @param flowName Name of the flow
   * @param steps Steps in the flow
   * @returns Mermaid diagram content
   */
  private generateFlowDiagram(flowName: string, steps: Step[]): string {
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
      const nodeId = this.getNodeId(step)
      const nodeLabel = this.getNodeLabel(step)
      const nodeStyle = this.getNodeStyle(step)
      diagram += `    ${nodeId}${nodeLabel}${nodeStyle}\n`
    })

    // Create connections between nodes
    let connectionsStr = ''

    // Create connections between nodes
    steps.forEach((sourceStep) => {
      const sourceId = this.getNodeId(sourceStep)

      if (isApiStep(sourceStep)) {
        if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
          connectionsStr += this.generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
        }
        if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
          connectionsStr += this.generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
        }
      } else if (isEventStep(sourceStep)) {
        if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
          connectionsStr += this.generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
        }
        if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
          connectionsStr += this.generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
        }
      } else if (isCronStep(sourceStep)) {
        if (sourceStep.config.emits && Array.isArray(sourceStep.config.emits)) {
          connectionsStr += this.generateConnections(sourceStep.config.emits, sourceStep, steps, sourceId)
        }
        if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
          connectionsStr += this.generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
        }
      } else if (isNoopStep(sourceStep)) {
        if (sourceStep.config.virtualEmits && Array.isArray(sourceStep.config.virtualEmits)) {
          connectionsStr += this.generateConnections(sourceStep.config.virtualEmits, sourceStep, steps, sourceId)
        }
      }
    })

    // Add connections to the diagram
    diagram += connectionsStr

    return diagram
  }

  /**
   * Generate connections between nodes
   * @param emits Emits from the source step
   * @param sourceStep Source step
   * @param steps All steps in the flow
   * @param sourceId Source node ID
   * @returns Connections string
   */
  private generateConnections(
    emits: Array<string | { topic: string; label?: string }>,
    sourceStep: Step,
    steps: Step[],
    sourceId: string,
  ): string {
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
          const targetId = this.getNodeId(targetStep)
          connections += `    ${sourceId} -->|${label}| ${targetId}\n`
        }
        // Check for virtual subscribes in noop steps
        else if (
          isNoopStep(targetStep) &&
          targetStep.config.virtualSubscribes &&
          Array.isArray(targetStep.config.virtualSubscribes) &&
          targetStep.config.virtualSubscribes.includes(topic)
        ) {
          const targetId = this.getNodeId(targetStep)
          connections += `    ${sourceId} -->|${label}| ${targetId}\n`
        }
        // Check if API steps have virtualSubscribes
        else if (
          isApiStep(targetStep) &&
          targetStep.config.virtualSubscribes &&
          Array.isArray(targetStep.config.virtualSubscribes) &&
          targetStep.config.virtualSubscribes.includes(topic)
        ) {
          const targetId = this.getNodeId(targetStep)
          connections += `    ${sourceId} -->|${label}| ${targetId}\n`
        }
      })
    })

    return connections
  }

  /**
   * Get a node ID for a step
   * @param step Step
   * @returns Node ID
   */
  private getNodeId(step: Step): string {
    // Create a valid mermaid node ID from the file path
    return step.filePath.replace(/[^a-zA-Z0-9]/g, '_')
  }

  /**
   * Get a node label for a step
   * @param step Step
   * @returns Node label
   */
  private getNodeLabel(step: Step): string {
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

  /**
   * Get a node style for a step
   * @param step Step
   * @returns Node style
   */
  private getNodeStyle(step: Step): string {
    // Apply style class based on step type
    if (isApiStep(step)) return ':::apiStyle'
    if (isEventStep(step)) return ':::eventStyle'
    if (isCronStep(step)) return ':::cronStyle'
    if (isNoopStep(step)) return ':::noopStyle'
    return ''
  }
}

import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const tracingSteps: TutorialStep[] = [
  {
    elementXpath: `//button[@data-testid="traces-link"]`,
    segmentId,
    title: 'Tracing',
    description: `Great! You've trigger your first flow, now let's take a look at our example flow's behavior using Workbench observability tools.<br/><br/>Let's start with Tracing, in this section you will be able to see all of your flow's executions grouped by a trace id.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="traces-link"]`,
    waitForSelector: `(//div[@data-testid="trace-id"])[1]`,
    useKeyDownEventOnClickBeforeNext: true,
  },
  {
    elementXpath: `(//div[@data-testid="trace-id"])[1]/../../..`,
    segmentId,
    title: 'Tracing Tool',
    description: `Trace id's are auto generated and injected throughout the execution of all steps in your flow. Clicking on a trace item from this list will allow you to dive deeper into your flow's behavior.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `(//div[@data-testid="trace-id"])[1]`,
    waitForSelector: `//div[@data-testid="trace-details"]`,
  },
  {
    elementXpath: `//div[@data-testid="trace-details"]`,
    segmentId,
    title: 'Trace Timeline',
    description: `This section will show you your flow's behavior, you will see a list of steps executed and their sequencing over a timeline.`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//div[@data-testid="trace-timeline-item"])[1]`,
    segmentId,
    title: 'Trace Timeline Segment',
    description: `The timeline will show you the time it took to execute your step, you can click on any segment in the timeline and dive even deeper into that specific step's execution logs. Go ahead and click this segment.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `(//div[@data-testid="trace-timeline-item"])[1]`,
    waitForSelector: `//div[@id="app-sidebar-container"]`,
  },
  {
    elementXpath: `//div[@id="app-sidebar-container"]`,
    segmentId,
    title: 'Trace Details',
    description: `This is the trace details view, this will allow you to look deeper into the logs raised for the selected step's segment in the flow execution timeline. This is a light view of the logs, if you wish to look further into a log you will need to use the logs tool.`,
    id: uuidv4(),
  },
]

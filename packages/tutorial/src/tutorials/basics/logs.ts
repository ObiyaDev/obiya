import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const logsSteps: TutorialStep[] = [
  {
    elementXpath: `//button[@data-testid="logs-link"]`,
    segmentId,
    title: 'Logs',
    description: `Let's take a look at your flow's execution logs, click on this tab to take a look at your execution logs.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="logs-link"]`,
    waitForSelector: `//div[@data-testid="logs-container"]`,
    useKeyDownEventOnClickBeforeNext: true,
  },
  {
    elementXpath: `//div[@data-testid="logs-container"]`,
    segmentId,
    title: 'Logs Tool',
    description: `This is your logs tool, from here you will be able to see all of your execution logs and the context/data you provide with your logs.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//div[@data-testid="logs-search-container"]`,
    segmentId,
    title: 'Logs Search',
    description: `As you develop your flows and test them, your logs will grow over time. This is when the search bar comes handy. Using the search bar you can narrow down your log search.`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//td[starts-with(@data-testid, 'trace')])[1]`,
    segmentId,
    title: 'Logs Search',
    description: `Your log results will have their respective trace id's in the third column, these trace id values are linked to update your search, by clicking a log trace id column you will narrow down your search to only show logs from that trace.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `(//td[starts-with(@data-testid, 'trace')])[1]`,
  },
  {
    elementXpath: `//div[@data-testid="logs-search-container"]`,
    segmentId,
    title: 'Logs Tool',
    description: `By clicking the trace id, your search is updated to match the trace id and now you can see all the results filtered by the selected trace id.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//div[@id="app-sidebar-container"]`,
    segmentId,
    title: 'Logs Tool',
    description: `Given that you clicked an element inside the log row, this will open the log details view. In here you will be able to look at your log details (log level, timestamp, step name, flow name, and trace id), along with any additional context you've provided in your log call.`,
    id: uuidv4(),
  },
]

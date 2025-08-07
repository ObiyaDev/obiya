import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const cronStepSteps: TutorialStep[] = [
  {
    elementXpath: `//div[@data-testid="node-stateauditjob"]`,
    segmentId,
    title: 'Cron Step',
    description: `Let's do a recap of what you've learned, thus far you've become familiar with three Motia primitives, the API, event, and NOOP steps. You've also started to learn how to navigate around Workbench.  Let's wrap up Motia's primitives with the last one, the CRON step. Let's take a deeper look at its definition.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="open-code-preview-button-stateauditjob"]`,
    waitForSelector: `(//span[contains(text(), 'cron')])[2]`,
  },
  {
    elementXpath: `(//span[contains(text(), 'cron')])[2]`,
    segmentId,
    title: 'Cron Schedule',
    description: `CRON steps are similar to the other primitives, they are composed by a configuration object and a handler. Their config has a distinct attribute, the cron attribute (if you are not familiar with cron schedules click here to learn more), this is were you cron schedule is defined. For this example we will run this step every 5 minutes. Let's take a look at the handler definition.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "handler")]`,
    segmentId,
    title: 'Cron Step Handler',
    description: `The CRON step handler only receives one argument, which is the Motia context, if you recall the Motia context gives you access to utilities to emit topics, log, manage state, and your trace id. In this CRON step example we are auditing values from a specific group in state and emitting errors when encountered.`,
    id: uuidv4(),
  },
]

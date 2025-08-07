import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const noopSteps: TutorialStep[] = [
  {
    elementXpath: `//div[@data-testid="node-externalrequest"]`,
    segmentId,
    title: 'NOOP Step',
    description: `Now that we've looked at an event step, let's define a NOOP step in order to simulate a webhook linked to the API step we reviewed previously.<br/><br/> NOOP steps are used to model behavior from external processes, webhooks,  or human in the loop (HIL) activities. These can also be used to also test your flows from the flow visualization tool in Workbench.<br/><br/> 💡 You can override a step's laout by creating a UI step, read more here (link to docs).`,
    id: uuidv4(),
  },
  {
    elementXpath: `//button[@data-testid="open-code-preview-button-externalrequest"]`,
    segmentId,
    title: 'Code Preview',
    description: `Clicking on this icon will allow you to visualize the source code for a given step.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="open-code-preview-button-externalrequest"]`,
    waitForSelector: `//span[contains(text(), "config")]/..`,
  },
  {
    elementXpath: `.view-lines`,
    segmentId,
    title: 'NOOP Step Definition',
    description: `NOOP steps are simple, they are only composed by a configuration object. Similar to other step primitives they need to declare a type, flow, name, and a description. The attributes specific to a NOOP step are virtualEmits and virtualSubscribes, these are similar to emits and subscribes with the exception that they are not handled internally by Motia, their definitions are simply for visualization purposes to indicate how they connect with other steps. virtualEmits  i.e.: /some-api-step-path`,
    id: uuidv4(),
  },
]

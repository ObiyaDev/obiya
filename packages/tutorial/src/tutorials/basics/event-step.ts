import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const eventSteps: TutorialStep[] = [
  {
    elementXpath: `//div[@data-testid="node-processfoodorder"]`,
    segmentId,
    title: 'Event Step',
    description: `Now that we have an entry point in our flow, let's focus on subscribing to a topic and performing a specific task. For this we will look at the event step. Event steps are essential for the event driven architecture. These steps are zip tied and can only be triggered internally, by emitting a topic.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//button[@data-testid="open-code-preview-button-processfoodorder"]`,
    segmentId,
    title: 'Code Preview',
    description: `Let's dive deeper into the anatomy of an event step. Open the code visualization tool.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="open-code-preview-button-processfoodorder"]`,
    waitForSelector: `//span[contains(text(), "config")]/..`,
  },
  {
    elementXpath: `(//span[contains(text(), 'input')])[2]/..`,
    segmentId,
    title: 'Event Step Input',
    description: `Event steps have a specic attribute in their config, the input attribute, which declares the shape of the data provided for the topic it subscribes to. The input is defined as a zod schema, think of the input as a contract  definition for other steps that emit the topics that you subscribe to. Multiple steps can subscribe to the same topic, but their input schema must be the same.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "handler")]`,
    segmentId,
    title: 'Event Step Handler',
    description: `Let's take a look at an event step handler. The handler will seem familiar to the API step handler we looked at previously. But notice that the first argument holds the data provided for the topic or topics your step subscribes to. The first argument will match the shape of your input schema defined in your step's config.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "fetch")]/..`,
    segmentId,
    title: 'Third Party Request',
    description: `Inside your event step handler, you can perform any action, for example performing a third party http request sending values from the input data, storing the result of the request in state, and lastly emitting another topic to trigger another step or steps in your flow.`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//span[contains(text(), 'state')])[4]/..`,
    segmentId,
    title: 'Storing Data in State',
    description: `Let's take a closer look at storing data in state, by now you are familiar with emitting and subscribing, but another core feature from Motia's ecosystem is state management. Out of the box Motia provides a file based storage, but you can customize this by configuring a storage adapter (link to docs) to in-memory or redis. In this example we are setting the result of a third party http request in state, scoped to the traceId associated with the execution of a given flow. We recommend you check out our best practices for state management (link to docs).`,
    id: uuidv4(),
  },
]

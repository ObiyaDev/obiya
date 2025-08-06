import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const apiSteps: TutorialStep[] = [
  {
    elementXpath: `//div[contains(text(), 'ApiTrigger')]`,
    segmentId,
    title: 'API Step',
    description: `Let's evaluate the step that will allow you to receive traffic from external applications, API steps will allow you to expose an HTTP endpoint for external traffic.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//button[@data-testid="open-code-preview-button-apitrigger"]`,
    segmentId,
    title: 'API Step',
    description: `Clicking on this icon will allow you to visualize the source code for a given step.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="open-code-preview-button-apitrigger"]`,
    waitForSelector: `//span[contains(text(), "config")]`,
  },
  {
    elementXpath: `//span[contains(text(), "config")]`,
    segmentId,
    title: 'API Step',
    description: `All steps are defined by two main components, the config and the handler, disregarding of the programming language. Let's start with the config, the common config attributes are type, name, description, and flows. The type attribute is important since it defines the type of step, the flows attribute will associate your step with a given flow or set of flows, the name and description attributes will provide context in the visualization and observability tools.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "path")]`,
    segmentId,
    title: 'API Step',
    description: `For an API step there are specific configuration attributes, such as the http endpoint path, the http method to access the endpoint, the shape of its request body, and the definition of the response payload. Both the request body and response payload are defined by zod schemas.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "emits")]`,
    segmentId,
    title: 'API Step',
    description: `In order to connect your step with other steps you will use the emits, subscribes or virtualSubscribes. These are core configurations from Motia's event driven architecture. Through the emits attribute, you can specify a list of topics that your step emits for others to subscribe, the same is applied to the subscribes/virtualSubscribes attributes, but instead of emitting, your step will be executed when those topics are broadcasted.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), "handler")]`,
    segmentId,
    title: 'API Step',
    description: `Now that we've covered how to declare a step, let's dive into the handler. Handlers are essential for the execution of your step. For API steps, the handler will receive the request object as the first argument, followed by a second argument that provides access to the logger, event emitter, state manager, and trace id. We will covere these in depth further down the tutorial.`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//span[contains(text(), "Handlers")])[2]`,
    segmentId,
    title: 'API Step',
    description: `If you are using typescript for your steps, Motia will generate type definitions based on your step's config definition when you are running your project in dev mode (run "motia dev" in your terminal).`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//span[contains(text(), 'logger')])[3]`,
    segmentId,
    title: 'API Step',
    description: `We recommend using the provided logger in order to guarantee observability through Motia's Workbench. You can use logger similar to console.log for js or print for python, but with enhanced utilities, such as being able to provide additional context. Motia will take care of the rest to provide the best experience to visualize your logs and tie them through tracing.`,
    id: uuidv4(),
  },
  {
    elementXpath: `(//span[contains(text(), 'emit')])[2]`,
    segmentId,
    title: 'API Step',
    description: `Let's emit an event for other steps to consume, using the "emit" variable you can stream topics by providing a topic name (needs to be in the list of emits from your step's config), along with the data you wish to emit. Given that this is an API step let's emit part of the request body. You can access the request body through the first argument which is the request object. You can also access other data from the request such as headers.`,
    id: uuidv4(),
  },
  {
    elementXpath: `//span[contains(text(), 'return')]`,
    segmentId,
    title: 'API Step',
    description: `Now let's wrap our API step and return a response. You simply need to return an object that complies with the response schema definition from your step config.`,
    id: uuidv4(),
  },
]

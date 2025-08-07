import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

const segmentId = 'basic'

export const endpointsSteps: TutorialStep[] = [
  {
    elementXpath: `//button[@data-testid="endpoints-link"]`,
    segmentId,
    title: 'Endpoints',
    description: `Now that we've looked at the Motia primitives, let's take a look at the endpoints section in Workbench. All of your API steps declare http endpoints that can be tested from the endpoints section in Workbench.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="endpoints-link"]`,
    useKeyDownEventOnClickBeforeNext: true,
    waitForSelector: `//div[@data-testid="endpoint-POST-/basic-tutorial"]`,
  },
  {
    elementXpath: `//div[@data-testid="endpoint-POST-/basic-tutorial"]`,
    segmentId,
    title: 'Endpoints Tool',
    description: `This section will display all of the endpoints declared in your API steps. It will list the http method, the url path, and the description declared in the step configuration.<br/><br/> Clicking on the endpoint will open the tool to test the endpoint.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//div[@data-testid="endpoint-POST-/basic-tutorial"]`,
    waitForSelector: `//div[@id="app-sidebar-container"]`,
  },
  {
    elementXpath: `//div[@id="app-sidebar-container"]`,
    segmentId,
    title: 'API Endpoint Docs',
    description: `This section will display a documentation of your API endpoint in the <i>Details</i> tab. In the <b>Call</b> tab you will be presented with a form to test the endpoint.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="endpoint-call-tab"]`,
    useKeyDownEventOnClickBeforeNext: true,
    waitForSelector: `//div[@data-testid="endpoint-body-panel"]`,
  },
  {
    elementXpath: `//div[@data-testid="endpoint-body-panel"]`,
    segmentId,
    title: 'API Endpoint Test',
    description: `This form will allow your to validate your API steps by simulating a request. Thanks to the <b>bodySchema</b> attribute from the API step config you are automatically provided with a sample request payload.`,
    id: uuidv4(),
    runScriptBeforeNext: () => {
      if (monaco) {
        monaco.editor.getEditors()[0].setValue(
          JSON.stringify({
            pet: {
              name: 'Jack',
              photoUrl: 'https://images.dog.ceo/breeds/pug/n02110958_13560.jpg',
            },
            foodOrder: {
              id: '1',
              quantity: 0,
            },
          }),
        )
      }
    },
  },
  {
    elementXpath: `//button[@data-testid="endpoint-play-button"]`,
    segmentId,
    title: 'API Endpoint Test',
    description: `Once you've filled the request payload, you can click on the <b>Play</b> button to simulate a request to your API step.`,
    id: uuidv4(),
    clickSelectorBeforeNext: `//button[@data-testid="endpoint-play-button"]`,
    waitForSelector: `//div[@data-testid="endpoint-response-container"]`,
  },
  {
    elementXpath: `//div[@data-testid="endpoint-response-container"]`,
    segmentId,
    title: 'Test Result',
    description: `Once your request has been processed, you will see the response from your API step here.`,
    id: uuidv4(),
  },
]

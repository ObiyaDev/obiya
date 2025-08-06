import { TutorialConfig, TutorialStep } from './types/tutorial'
import driver from './driver'
import { tutorials } from './tutorials'
import { closeTutorial } from './close'
import { Driver } from 'driver.js'

export const startTutorial = (config?: TutorialConfig) => {
  // if (window.localStorage.getItem('motia-tutorial-skipped')) {
  //   return
  // }

  const tutorialId = config?.tutorialId ?? 'basic'

  if (config?.initialSegmentId) {
    // TODO: jump to segment
    return
  }

  if (config?.initialStepId) {
    // TODO: jump to step
    return
  }

  let tutorialDriver: Driver | undefined

  console.log('Starting tutorial', { tutorialId })

  tutorialDriver = driver({
    showProgress: true,
    // NOTE: we map the internal step definitions into the Driver.js structure in order to avoid injecting dependencies from the UI into the step definitions
    steps: tutorials[tutorialId].steps.map((step: TutorialStep) => ({
      element: step.elementXpath.match('//')
        ? () => {
            const result = document.evaluate(
              step.elementXpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            )
            return result.singleNodeValue as Element
          }
        : step.elementXpath,
      popover: {
        title: step.title,
        description: step.description,
        position: step.position,
        onNextClick: () => {
          console.log('Moving to next step', { tutorialId, step })

          if (step.clickSelectorBeforeNext) {
            const element = document.evaluate(
              step.clickSelectorBeforeNext,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            )

            if (element.singleNodeValue) {
              ;(element.singleNodeValue as HTMLElement).click()
            }
          }

          if (step.waitForSelector) {
            // add logic to wait for an element to be present, with a max timeout of 60 seconds
            let timeout = 60
            let interval = setInterval(() => {
              const element = document.evaluate(
                step.waitForSelector!,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null,
              )

              if (element.singleNodeValue) {
                tutorialDriver?.moveNext()
                clearInterval(interval)
              }

              timeout--

              if (timeout === 0) {
                console.error('Timeout waiting for element', step.waitForSelector)
                tutorialDriver?.moveNext()
                clearInterval(interval)
              }
            }, 1000)

            return
          }

          tutorialDriver?.moveNext()
        },
      },
    })),
    onDestroyed: () => closeTutorial(true),
  })

  tutorialDriver.drive()
}

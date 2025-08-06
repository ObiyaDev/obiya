export type TutorialStep = {
  id: string
  title: string
  description?: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  elementXpath: string
  segmentId: string
  clickSelectorBeforeNext?: string
  waitForSelector?: string
}

export type Tutorial = {
  id: string
  title: string
  description?: string
  steps: TutorialStep[]
}

export type TutorialConfig = {
  tutorialId?: 'basic' // | add more tutorial id's in here
  initialSegmentId?: string
  initialStepId?: string
}

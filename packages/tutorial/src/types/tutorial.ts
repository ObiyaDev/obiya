export type TutorialStep = {
  id: string
  title: string
  description?: string
  position?: 'left' | 'right' | 'top' | 'bottom'
  elementXpath: string
  segmentId: string
  clickSelectorBeforeNext?: string
  waitForSelector?: string
  runScriptBeforeNext?: () => void
  runScriptBeforePrev?: () => void
  useKeyDownEventOnClickBeforeNext?: boolean
  requiredSelectorOnPrev?: string
  clickRequireSelectorMissingOnPrev?: string
  runScriptOnRequiredSelectorOnPrevFound?: () => void
}

export type Tutorial = {
  id: string
  title: string
  description?: string
  steps: TutorialStep[]
}

export type TutorialConfig = {
  tutorialId?: 'basic' // | add more tutorial id's in here
  segmentId?: string
  initialStepIndex?: number
  resetSkipState?: boolean
}

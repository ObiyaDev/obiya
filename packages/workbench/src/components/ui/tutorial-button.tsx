import { MotiaTutorial, TutorialConfig } from '@motiadev/tutorial'
import { Button } from '@motiadev/ui'
import { Book } from 'lucide-react'

export const TutorialButton: React.FC = () => {
  const onButtonClick = () => {
    const tutorialStepIndex = new URLSearchParams(window.location.search).get('tutorialStepIndex')
    const config: TutorialConfig = {
      resetSkipState: true,
    }
    if (tutorialStepIndex) {
      config.initialStepIndex = Number(tutorialStepIndex)
    }
    MotiaTutorial.start(config)
  }

  return (
    <Button variant="accent" size="sm" onClick={onButtonClick}>
      <Book className="h-4 w-4" />
      <span>Tutorial</span>
    </Button>
  )
}

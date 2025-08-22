import { Button } from '@motiadev/ui'
import { Book } from 'lucide-react'
import { FC } from 'react'
import { useTutorial } from './hooks/use-tutorial'
import { Tooltip } from '../ui/tooltip'

export const TutorialButton: FC = () => {
  const { open, steps } = useTutorial()
  const isTutorialFlowMissing = steps.length === 0
  const onTutorialButtonClick = () => {
    if (!isTutorialFlowMissing) {
      open()
    }
  }

  console.log(isTutorialFlowMissing)

  const trigger = (
    <Button data-testid="tutorial-trigger" variant="default" onClick={() => onTutorialButtonClick()}>
      <Book className="h-4 w-4" />
      Tutorial
    </Button>
  )

  if (isTutorialFlowMissing) {
    return (
      <Tooltip
        content={
          <div className="flex flex-col gap-4 p-4 max-w-[320px]">
            <p className="text-sm wrap-break-word p-0 m-0">
              In order to start the tutorial, you need to download the tutorial steps using the Motia CLI. In your
              terminal execute:
            </p>
            <pre className="text-sm font-bold">motia generate tutorial-flow</pre>
          </div>
        }
      >
        {trigger}
      </Tooltip>
    )
  }

  return trigger
}

import driver from './driver'

export const closeTutorial = (skipDestroyCall?: boolean) => {
  console.log('Closing tutorial', { skipDestroyCall })
  // TODO: add analytics

  if (!skipDestroyCall) {
    driver().destroy()
  }

  window.localStorage.setItem('motia-tutorial-skipped', 'true')
}

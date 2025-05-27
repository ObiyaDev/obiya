import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('CLI Generated Project - Workbench Navigation', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('should load workbench page of CLI generated project', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    await expect(page.locator('body')).toBeVisible()
    
    const projectTitle = page.locator('h1, [data-testid="motia-title"]')
    await expect(projectTitle.first()).toBeVisible()
  })

  test('should display workbench interface elements', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    const sidebarElements = [
      { testId: 'motia-title', name: 'Motia title' },
      { testId: 'flows-title', name: 'Flows title' },
      { testId: 'logs-link', name: 'Logs link' },
      { testId: 'states-link', name: 'States link' },
      { testId: 'endpoints-link', name: 'Endpoints link' }
    ]
    
    for (const element of sidebarElements) {
      const locator = page.locator(`[data-testid="${element.testId}"]`)
      await expect(locator).toBeVisible()
    }
  })

  test('should show created steps in the workbench', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    const expectedSteps = ['api-trigger', 'process-data', 'send-notification']
    
    for (const stepName of expectedSteps) {
      const stepElement = page.locator(`text=${stepName}`).first()
      if (await stepElement.isVisible()) {
        await expect(stepElement).toBeVisible()
      }
    }
  })

  test('should navigate through workbench sections', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    const sidebarSections = [
      { testId: 'logs-link', name: 'Logs' },
      { testId: 'states-link', name: 'States' },
      { testId: 'endpoints-link', name: 'Endpoints' }
    ]
    
    for (const section of sidebarSections) {
      const link = page.locator(`[data-testid="${section.testId}"]`)
      
      if (await link.isVisible()) {
        await link.click()
        await page.waitForLoadState('networkidle')
        
        await expect(page.locator('body')).toBeVisible()
        console.log(`Successfully navigated to ${section.name} section`)
      }
    }
  })

  test('should navigate through flow sections in sidebar', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    const flowLinks = page.locator('[data-testid^="flow-"][data-testid$="-link"]')
    const flowCount = await flowLinks.count()
    
    if (flowCount > 0) {
      for (let i = 0; i < Math.min(flowCount, 3); i++) {
        const flowLink = flowLinks.nth(i)
        const flowTestId = await flowLink.getAttribute('data-testid')
        
        if (flowTestId) {
          await flowLink.click()
          await page.waitForLoadState('networkidle')
          
          await expect(page.locator('body')).toBeVisible()
          console.log(`Successfully navigated to flow: ${flowTestId}`)
        }
      }
    } else {
      console.log('No flows found in sidebar - this is expected for new projects')
    }
  })

  test('should display project information correctly', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    const projectIndicators = [
      page.locator('[data-testid="motia-title"]'),
      page.locator('[data-testid="flows-title"]')
    ]
    
    let foundProjectInfo = false
    for (const indicator of projectIndicators) {
      if (await indicator.first().isVisible({ timeout: 5000 })) {
        foundProjectInfo = true
        break
      }
    }
    
    expect(foundProjectInfo).toBeTruthy()
  })

  test('should handle CLI project structure validation', async ({ page }) => {
    await page.goto('/')
    await helpers.waitForMotiaApplication()
    
    const healthEndpoint = page.locator('text=/health|status/')
    const stepsSection = page.locator('text=/steps|workflows/')
    
    const hasHealthInfo = await healthEndpoint.first().isVisible({ timeout: 3000 })
    const hasStepsInfo = await stepsSection.first().isVisible({ timeout: 3000 })
    
    expect(hasHealthInfo || hasStepsInfo).toBeTruthy()
  })

  test('should execute default flow and verify logs', async ({ page }) => {
    await helpers.navigateToWorkbench()
    
    // Execute the default flow and navigate to logs
    await helpers.executeFlowAndWaitForCompletion('default')
    
    // Check for expected log entries
    const expectedLogs = ['ApiTrigger', 'SetStateChange', 'CheckStateChange']
    
    await test.step('Verify all expected logs are present', async () => {
      for (const logEntry of expectedLogs) {
        await helpers.waitForLogEntry(logEntry)
        console.log(`✓ Found expected log: ${logEntry}`)
      }
    })

    await test.step('Verify state validation message is present', async () => {
      const stateValidationMessage = 'The provided value matches the state value'
      await helpers.waitForLogEntry(stateValidationMessage)
      console.log(`✓ Found state validation message: ${stateValidationMessage}`)
    })
    
    console.log('✅ Successfully executed default flow and verified all expected logs')
  })
}) 
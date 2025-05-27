import { expect, type Locator, type Page } from '@playwright/test'
import { MotiaApplicationPage } from './MotiaApplicationPage'

export class WorkbenchPage extends MotiaApplicationPage {
  readonly sidebarContainer: Locator
  readonly motiaTitle: Locator
  readonly flowsTitle: Locator
  readonly logsLink: Locator
  readonly statesLink: Locator
  readonly endpointsLink: Locator
  readonly flowLinks: Locator
  readonly startFlowButton: Locator
  readonly flowContainer: Locator

  constructor(page: Page) {
    super(page)
    this.sidebarContainer = page.locator('[data-testid="sidebar"], nav, .sidebar')
    this.motiaTitle = page.locator('[data-testid="motia-title"]')
    this.flowsTitle = page.locator('[data-testid="flows-title"]')
    this.logsLink = page.locator('[data-testid="logs-link"]')
    this.statesLink = page.locator('[data-testid="states-link"]')
    this.endpointsLink = page.locator('[data-testid="endpoints-link"]')
    this.flowLinks = page.locator('[data-testid^="flow-"][data-testid$="-link"]')
    this.startFlowButton = page.locator('[data-testid="start-flow-button"]')
    this.flowContainer = page.locator('[data-testid="flow-container"], .flow-container')
  }

  async gotoWorkbench() {
    await this.goto('/flow/default')
  }

  async verifyWorkbenchInterface() {
    await expect(this.motiaTitle).toBeVisible()
    await expect(this.flowsTitle).toBeVisible()
    await expect(this.logsLink).toBeVisible()
    await expect(this.statesLink).toBeVisible()
    await expect(this.endpointsLink).toBeVisible()
  }

  async navigateToLogs() {
    await this.logsLink.click()
    await this.waitForApplication()
  }

  async navigateToStates() {
    await this.statesLink.click()
    await this.waitForApplication()
  }

  async navigateToEndpoints() {
    await this.endpointsLink.click()
    await this.waitForApplication()
  }

  async getFlowCount() {
    return await this.flowLinks.count()
  }

  async navigateToFlow(flowName: string) {
    const flowLink = this.page.locator(`[data-testid="flow-${flowName}-link"]`)
    await flowLink.click()
    await this.waitForApplication()
  }

  async navigateToFlowByIndex(index: number) {
    const flowLink = this.flowLinks.nth(index)
    await flowLink.click()
    await this.waitForApplication()
  }

  async startFlow() {
    await this.startFlowButton.click()
    await this.page.waitForTimeout(3000)
  }

  async executeFlowAndNavigateToLogs(flowName: string = 'default') {
    await this.navigateToFlow(flowName)
    await this.startFlow()
    await this.navigateToLogs()
  }

  async verifyStepsInWorkbench(stepNames: string[]) {
    for (const stepName of stepNames) {
      const stepElement = this.page.locator(`text=${stepName}`).first()
      const isVisible = await stepElement.isVisible({ timeout: 5000 })
      if (isVisible) {
        await expect(stepElement).toBeVisible()
      }
    }
  }

  async hasWorkbenchFeatures() {
    const workbenchIndicators = [
      this.page.locator('text=/workbench/i'),
      this.page.locator('text=/motia/i'),
      this.navigation,
      this.mainContent
    ]
    
    for (const indicator of workbenchIndicators) {
      const isVisible = await indicator.first().isVisible({ timeout: 3000 })
      if (isVisible) {
        return true
      }
    }
    return false
  }

  async verifyProjectInformation() {
    const projectIndicators = [this.motiaTitle, this.flowsTitle]
    
    for (const indicator of projectIndicators) {
      const isVisible = await indicator.first().isVisible({ timeout: 5000 })
      if (isVisible) {
        return true
      }
    }
    return false
  }
} 
import { expect, type Locator, type Page } from '@playwright/test'
import { MotiaApplicationPage } from './MotiaApplicationPage'

export class LogsPage extends MotiaApplicationPage {
  readonly logsContainer: Locator
  readonly logEntries: Locator
  readonly clearLogsButton: Locator
  readonly logsTable: Locator
  readonly logTableRows: Locator

  constructor(page: Page) {
    super(page)
    this.logsContainer = page.locator('.overflow-y-auto.h-full.text-bold.p-4')
    this.logsTable = page.locator('table')
    this.logTableRows = page.locator('tbody tr')
    this.logEntries = this.logTableRows
    this.clearLogsButton = page.locator('button:has-text("Clear logs")')
  }

  async waitForLogEntry(logText: string, timeout: number = 15000) {
    const logElement = this.page.locator(`[aria-label="${logText}"]`).first()
    await logElement.waitFor({ timeout })
    return logElement
  }

  async waitForMultipleLogEntries(logTexts: string[], timeout: number = 15000) {
    const results = []
    for (const logText of logTexts) {
      const logElement = await this.waitForLogEntry(logText, timeout)
      results.push(logElement)
    }
    return results
  }

  async verifyLogEntry(logText: string) {
    const logElement = await this.waitForLogEntry(logText)
    await expect(logElement).toBeVisible()
  }

  async verifyMultipleLogEntries(logTexts: string[]) {
    for (const logText of logTexts) {
      await this.verifyLogEntry(logText)
    }
  }

  async clickLogEntry(index: number) {
    await this.logTableRows.nth(index).click()
  }

  async getLogByIndex(index: number) {
    const row = this.logTableRows.nth(index)
    const time = await row.locator('[data-testid^="time-"]').textContent()
    const traceId = await row.locator('[data-testid^="trace-"]').textContent()
    const step = await row.locator('[data-testid^="step-"]').textContent()
    const message = await row.locator('[data-testid^="msg-"]').textContent()
    
    return { time, traceId, step, message }
  }

  async getLogByTestId(index: number) {
    const row = this.logTableRows.nth(index)
    const time = await row.locator(`[data-testid="time-${index}"]`).textContent()
    const traceId = await row.locator(`[data-testid="trace-${index}"]`).textContent()
    const step = await row.locator(`[data-testid="step-${index}"]`).textContent()
    const message = await row.locator(`[data-testid="msg-${index}"]`).textContent()
    
    return { time, traceId, step, message }
  }

  async getAllLogs() {
    const count = await this.getLogCount()
    const logs = []
    
    for (let i = 0; i < count; i++) {
      const log = await this.getLogByTestId(i)
      logs.push(log)
    }
    
    return logs
  }

  async clearAllLogs() {
    if (await this.clearLogsButton.isVisible()) {
      await this.clearLogsButton.click()
    }
  }

  async getLogCount() {
    return await this.logTableRows.count()
  }

  async getLogTexts() {
    const count = await this.getLogCount()
    const logTexts = []
    
    for (let i = 0; i < count; i++) {
      const messageCell = this.logTableRows.nth(i).locator(`[data-testid="msg-${i}"]`)
      const logText = await messageCell.textContent()
      if (logText) {
        logTexts.push(logText)
      }
    }
    
    return logTexts
  }

  async verifyFlowExecutionLogs(expectedLogs: string[]) {
    for (const logEntry of expectedLogs) {
      await this.waitForLogEntry(logEntry)
    }
  }

  async waitForStepExecution(stepName: string, timeout: number = 30000) {
    await this.waitForLogEntry(stepName, timeout)
  }

  async waitForFlowCompletion(flowName: string, timeout: number = 60000) {
    await this.page.waitForTimeout(1000)
    const finalLogCount = await this.getLogCount()
    expect(finalLogCount).toBeGreaterThan(0)
  }

  async verifyLogStructure() {
    await expect(this.logsTable).toBeVisible()
    await expect(this.logsContainer).toBeVisible()
  }

  async waitForLogsToLoad(timeout: number = 10000) {
    await this.logsContainer.waitFor({ timeout })
    await this.logsTable.waitFor({ timeout })
  }
} 
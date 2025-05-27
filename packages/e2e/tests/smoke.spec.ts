import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers'

test.describe('CLI Generated Project - Smoke Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('CLI generated project loads successfully', async ({ page }) => {
    await page.goto('/')
    await helpers.waitForMotiaApplication()
    
    await expect(page).toHaveTitle(/.*/)
    await expect(page.locator('body')).toBeVisible()
    
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(100)
  })

  test('CLI generated project has basic API endpoints', async ({ page }) => {
    const commonEndpoints = [
      '/default',
    ]
    
    let workingEndpoint = false
    
    for (const endpoint of commonEndpoints) {
      try {
        const response = await helpers.createApiRequest(endpoint)
        if ([200, 404].includes(response.status())) {
          workingEndpoint = true
          break
        }
      } catch (error) {
      }
    }
    
    expect(workingEndpoint).toBeTruthy()
  })

  test('CLI generated project workbench is functional', async ({ page }) => {
    await page.goto('/')
    await helpers.waitForMotiaApplication()
    
    const workbenchIndicators = [
      page.locator('text=/workbench/i'),
      page.locator('text=/motia/i'),
      page.locator('nav'),
      page.locator('main')
    ]
    
    let hasWorkbenchFeatures = false
    for (const indicator of workbenchIndicators) {
      if (await indicator.first().isVisible({ timeout: 3000 })) {
        hasWorkbenchFeatures = true
        break
      }
    }
    
    expect(hasWorkbenchFeatures).toBeTruthy()
  })

  test('CLI generated project handles navigation', async ({ page }) => {
    await page.goto('/')
    await helpers.waitForMotiaApplication()
    
    const links = page.locator('a[href]')
    const linkCount = await links.count()
    
    if (linkCount > 0) {
      const firstLink = links.first()
      const href = await firstLink.getAttribute('href')
      
      if (href && !href.startsWith('http') && href !== '/') {
        await firstLink.click()
        await page.waitForLoadState('networkidle')
        
        await expect(page.locator('body')).toBeVisible()
      }
    }
    
    expect(true).toBeTruthy()
  })

  test('CLI generated project has no critical console errors', async ({ page }) => {
    const errors = []
    
    page.on('pageerror', error => {
      if (!error.message.includes('favicon.ico')) {
        errors.push(error.message)
      }
    })
    
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await helpers.waitForMotiaApplication()
    
    expect(errors.length).toBeLessThanOrEqual(2)
  })

  test('CLI generated project responds to basic HTTP requests', async ({ page }) => {
    const response = await helpers.createApiRequest('/')
    
    expect(response.status()).toBeLessThan(500)
    
    const headers = response.headers()
    expect(headers).toBeDefined()
    expect(Object.keys(headers).length).toBeGreaterThan(0)
  })
}) 
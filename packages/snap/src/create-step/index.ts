import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs'
import colors from 'colors'

/**
 * Define the available step types, languages, and HTTP methods
 */
const STEP_TYPES = ['api', 'event', 'cron', 'noop'] as const
const LANGUAGES = ['typescript', 'javascript', 'python', 'ruby'] as const
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const

type StepType = typeof STEP_TYPES[number]
type Language = typeof LANGUAGES[number]
type HttpMethod = typeof HTTP_METHODS[number]

interface StepAnswers {
  // Basic info
  name: string
  language: Language
  type: StepType
  description?: string

  // API specific
  method?: HttpMethod
  path?: string

  // Event specific
  subscriptions?: string[]

  // Cron specific
  cronExpression?: string

  // Noop specific
  virtualEmits?: string[]
  virtualSubscribes?: string[]

  // Common
  emits: string[]
  flows: string[]
  createOverride: boolean
}

/**
 * Main function to gather all step configuration through interactive prompts
 */
async function getStepAnswers(): Promise<StepAnswers> {
  console.log('\n📝 ', colors.bold('Create a new Motia step\n'))

  // Basic information prompts
  const basicInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Step name:',
      validate: (input: string) => {
        if (input.length === 0) return 'Name is required'
        if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(input)) {
          return 'Name must start with a letter and contain only letters, numbers, hyphens, and underscores'
        }
        return true
      }
    },
    {
      type: 'list',
      name: 'language',
      message: 'Select language:',
      choices: LANGUAGES.map(lang => ({
        name: lang.charAt(0).toUpperCase() + lang.slice(1),
        value: lang
      }))
    },
    {
      type: 'list',
      name: 'type',
      message: 'Select step type:',
      choices: STEP_TYPES.map(type => ({
        name: type.toUpperCase(),
        value: type
      }))
    }
  ])

  let answers = { ...basicInfo }

  // Type-specific configuration prompts
  if (answers.type === 'api') {
    const apiConfig = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'HTTP method:',
        choices: HTTP_METHODS
      },
      {
        type: 'input',
        name: 'path',
        message: 'API path (e.g. /api/users):',
        validate: (input: string) => {
          if (!input.startsWith('/')) return 'Path must start with /'
          return true
        }
      }
    ])
    answers = { ...answers, ...apiConfig }
  }
  else if (answers.type === 'event') {
    const eventConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'subscriptions',
        message: 'Event subscriptions (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
      }
    ])
    answers = { ...answers, ...eventConfig }
  }
  else if (answers.type === 'cron') {
    const cronConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'cronExpression',
        message: 'Cron expression:',
        validate: (input: string) => {
          if (!input) return 'Cron expression is required'
          const parts = input.split(' ')
          if (parts.length !== 5) return 'Invalid cron expression format'
          return true
        }
      }
    ])
    answers = { ...answers, ...cronConfig }
  }
  else if (answers.type === 'noop') {
    const noopConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'virtualEmits',
        message: 'Virtual emits (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
      },
      {
        type: 'input',
        name: 'virtualSubscribes',
        message: 'Virtual subscribes (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
      }
    ])
    answers = { ...answers, ...noopConfig }
  }

  // Common configuration prompts
  const commonConfig = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Step description:'
    },
    {
      type: 'input',
      name: 'flows',
      message: 'Flow names (comma-separated):',
      filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean),
      validate: (input: string[]) => {
        if (input.length === 0) return 'At least one flow is required'
        return true
      }
    },
    {
      type: 'input',
      name: 'emits',
      message: 'Events to emit (comma-separated):',
      filter: (input: string) => input.split(',').map(s => s.trim()).filter(Boolean)
    },
    {
      type: 'confirm',
      name: 'createOverride',
      message: 'Create UI component override?',
      default: false
    }
  ])

  return { ...answers, ...commonConfig } as StepAnswers
}

/**
 * Gets the appropriate file extension based on the selected language
 */
function getFileExtension(language: Language): string {
  const extensions: Record<Language, string> = {
    typescript: '.ts',
    javascript: '.js',
    python: '.py',
    ruby: '.rb'
  }
  return extensions[language]
}

import { generateTemplate } from './templates'
import { generateOverride } from './templates/override'

/**
 * Main function to handle step creation
 */
export async function createStep() {
  try {
    const answers = await getStepAnswers()

    // Create steps directory if it doesn't exist
    const stepDir = path.join(process.cwd(), 'steps')
    if (!fs.existsSync(stepDir)) {
      fs.mkdirSync(stepDir, { recursive: true })
    }

    // Create step file
    const extension = getFileExtension(answers.language)
    const stepPath = path.join(stepDir, `${answers.name}.step${extension}`)

    // Check if file already exists
    if (fs.existsSync(stepPath)) {
      console.error(colors.red(`\n❌ Error: Step file already exists at ${stepPath}`))
      process.exit(1)
    }

    // Generate and write step file
    const stepContent = await generateTemplate(answers)
    fs.writeFileSync(stepPath, stepContent)
    console.log(colors.green(`\n✨ Created step file at ${stepPath}`))

    // Create UI override if requested
    if (answers.createOverride) {
      const componentDir = path.join(process.cwd(), 'components', 'steps')
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true })
      }

      const overridePath = path.join(componentDir, `${answers.name}.tsx`)
      const overrideContent = await generateOverride(answers)
      fs.writeFileSync(overridePath, overrideContent)
      console.log(colors.green(`✨ Created UI override at ${overridePath}`))
    }

    console.log(colors.bold('\n🎉 Step creation complete!'))
  } catch (error) {
    console.error(colors.red('\n❌ Error creating step:'), error)
    process.exit(1)
  }
}
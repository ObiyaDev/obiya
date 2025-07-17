import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: '^on.*' },
    docs: {
      description: {
        component: 'A badge component used to display status, counts, or labels with various visual styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'info', 'success', 'error'],
      description: 'The visual style of the badge.',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply to the badge.',
    },
    children: {
      control: { type: 'text' },
      description: 'The content of the badge.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
}

export const WithCounts: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Badge variant="default">5</Badge>
      <Badge variant="info">12</Badge>
      <Badge variant="success">99+</Badge>
      <Badge variant="error">3</Badge>
    </div>
  ),
}

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-1">
        <Badge variant="error">●</Badge>
        <span className="text-sm">Offline</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="success">●</Badge>
        <span className="text-sm">Online</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="info">●</Badge>
        <span className="text-sm">Pending</span>
      </div>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">All Badge Variants</h3>
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">With Numbers</h3>
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant="default">1</Badge>
          <Badge variant="info">12</Badge>
          <Badge variant="success">5</Badge>
          <Badge variant="error">99+</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Capitalized Text (Info & Error)</h3>
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant="info">processing</Badge>
          <Badge variant="error">failed</Badge>
          <Badge variant="success">completed</Badge>
          <Badge variant="default">pending</Badge>
        </div>
      </div>
    </div>
  ),
}

export const UseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div>
        <h3 className="text-sm font-semibold mb-3">Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Messages</span>
            <Badge variant="default">3</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Alerts</span>
            <Badge variant="error">1</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Updates</span>
            <Badge variant="info">5</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Completed</span>
            <Badge variant="success">2</Badge>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Status Labels</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">Active</Badge>
            <span>Service is running</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">processing</Badge>
            <span>Task in progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="error">failed</Badge>
            <span>Operation failed</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Draft</Badge>
            <span>Not published</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Priority Levels</h3>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="error">High</Badge>
          <Badge variant="info">Medium</Badge>
          <Badge variant="success">Low</Badge>
          <Badge variant="default">None</Badge>
        </div>
      </div>
    </div>
  ),
}

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Accessible Status Indicators</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="error" aria-label="Error status">●</Badge>
            <span>Server Status</span>
            <span className="sr-only">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" aria-label="5 unread notifications">5</Badge>
            <span>Notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" aria-label="System healthy">✓</Badge>
            <span>System Health</span>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const DarkModeExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Dark Mode Styling</h3>
        <p className="text-sm text-gray-600 mb-3">
          The badges automatically adapt to dark mode with appropriate colors.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="info">Info (with accent colors)</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </div>
    </div>
  ),
} 
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="flows" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="flows">Flows</TabsTrigger>
        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
      </TabsList>
      <TabsContent value="flows">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-medium">Motia Hub receives update</h4>
            <p className="text-sm text-muted-foreground mt-1">Motia Hub receives update</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="endpoints">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-medium">API Endpoints</h4>
            <p className="text-sm text-muted-foreground mt-1">Manage your API endpoints here</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

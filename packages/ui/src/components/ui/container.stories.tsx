import type { Meta, StoryObj } from '@storybook/react'
import { UserRound, Bell, Settings } from 'lucide-react'
import { Container, ContainerContent, ContainerHeader } from './container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Container> = {
  title: 'ui/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: (args) => (
    <Container {...args}>
      <ContainerHeader>
        <h4>Container Header</h4>
      </ContainerHeader>
      <ContainerContent>
        <p>Container content</p>
      </ContainerContent>
    </Container>
  ),
}

const TabsContainer = () => (
  <Container>
    <Tabs defaultValue="account" className="h-full flex flex-col">
      <ContainerHeader variant="tabs">
        <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger value="account">
            <UserRound /> Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings />
            Settings
          </TabsTrigger>
        </TabsList>
      </ContainerHeader>
      <ContainerContent>
        <TabsContent value="account">
          <h3 className="font-bold text-lg mb-4">Account</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
            erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
          </p>
        </TabsContent>
        <TabsContent value="notifications">
          <h3 className="font-bold text-lg mb-4">Notifications</h3>
          <p>
            Curabitur sit amet magna quam. Praesent in libero vel turpis pellentesque egestas sit amet vel nunc. Nunc
            consectetur, justo sed laoreet ullamcorper, ipsum enim fringilla lectus, eu egestas lectus ex et nibh.
          </p>
        </TabsContent>
        <TabsContent value="settings">
          <h3 className="font-bold text-lg mb-4">Settings</h3>
          <p>
            Aenean et est a dui semper facilisis. Pellentesque ac tortor vel nunc lacinia consectetu. Proin laoreet,
            nulla quis feugiat imperdiet, sapien est faucibus ante, vitae tristique eros ex eget turpis.
          </p>
        </TabsContent>
      </ContainerContent>
    </Tabs>
  </Container>
)

export const WithTabs: Story = {
  render: () => <TabsContainer />,
}

export const WithTabsLightAndDark: Story = {
  render: () => (
    <div className="flex gap-8 justify-center">
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Light Theme</h3>
        <div className="space-y-4 w-full">
          <TabsContainer />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-lg dark">
        <h3 className="text-lg font-semibold text-white">Dark Theme</h3>
        <div className="space-y-4 w-full">
          <TabsContainer />
        </div>
      </div>
    </div>
  ),
}

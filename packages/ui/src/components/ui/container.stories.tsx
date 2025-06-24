import type { Meta, StoryObj } from '@storybook/react'
import { UserRound, Bell, Settings, ArrowLeft, RefreshCw, GitBranch, Globe, Activity, FileText, Database, Zap, ChevronDown } from 'lucide-react'
import { Container, ContainerContent, ContainerHeader } from './container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Button } from './button'

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

const DefaultContainer = () => (
  <Container className="w-[400px]">
    <ContainerHeader className={'gap-2'}>
      <ArrowLeft className="w-4 h-4" />
      <h4>Container Header</h4>
      <div className="flex-1"></div>
      <RefreshCw className="w-4 h-4" />
    </ContainerHeader>
    <ContainerContent>
      <p>
        Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam in dui mauris Vivamus hendrerit arcu sed erat
        molestie posuere sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Donec convallis lectus a urna
        semper rhoncus Nullam quis neque libero Class aptent taciti sociosqu ad litora torquent per conubia nostra, per
        inceptos himenaeos. Nullam quis neque libero Class aptent taciti sociosqu ad litora torquent per conubia nostra,
        per inceptos himenaeos. Nullam quis neque libero Class aptent taciti sociosqu ad litora torquent per conubia
        nostra, per inceptos himenaeos.
      </p>
    </ContainerContent>
  </Container>
)

export const Default: Story = {
  render: (args) => <DefaultContainer {...args} />,
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
export const LightAndDark: Story = {
  render: () => (
    <div className="flex gap-8 justify-center">
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Light Theme</h3>
        <div className="space-y-4 w-full">
          <DefaultContainer />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-lg dark">
        <h3 className="text-lg font-semibold text-white">Dark Theme</h3>
        <div className="space-y-4 w-full">
          <DefaultContainer />
        </div>
      </div>
    </div>
  ),
}

const WorkbenchLayoutComponent = () => (
  <div className="w-full h-full flex flex-col gap-1 bg-black dark">
    <Container className="flex-1">
      <Tabs defaultValue="flows" className="h-full flex flex-col">
        <ContainerHeader variant="tabs">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger value="flows">
              <GitBranch className="w-4 h-4" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="endpoints">
              <Globe className="w-4 h-4" />
              Endpoints
            </TabsTrigger>
          </TabsList>

          <div className="flex-1"></div>
          <Button variant="ghost" size="icon" className="rounded-full mr-2">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </ContainerHeader>
        <ContainerContent className="bg-black flex-1">
          <TabsContent value="flows" className="h-full">
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-black border border-gray-700 rounded-lg p-4 w-64">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Motia Hub receives update</span>
                  </div>
                  <div className="text-xs text-gray-500">Motia Hub receives update</div>
                </div>
                <div className="w-px h-12 bg-blue-500"></div>
                <div className="bg-black border border-gray-700 rounded-lg p-4 w-64">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Motia Hub receives update</span>
                  </div>
                  <div className="text-xs text-gray-500">Motia Hub receives update</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="endpoints" className="h-full">
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Endpoints configuration panel</p>
            </div>
          </TabsContent>
        </ContainerContent>
      </Tabs>
    </Container>

    <Container className="flex-1">
      <Tabs defaultValue="logs" className="h-full flex flex-col">
        <ContainerHeader variant="tabs">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger value="tracing">
              <Activity className="w-4 h-4" />
              Tracing
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="states">
              <Database className="w-4 h-4" />
              States
            </TabsTrigger>
            <TabsTrigger value="streams">
              <Zap className="w-4 h-4" />
              Streams
            </TabsTrigger>
          </TabsList>

          <div className="flex-1"></div>
          <Button variant="ghost" size="icon" className="rounded-full mr-2">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </ContainerHeader>
        <ContainerContent className="bg-black flex-1 h-full">
          <TabsContent value="tracing" className="h-full">
            <div className="text-gray-400 p-4">Tracing data will appear here</div>
          </TabsContent>
          <TabsContent value="logs" className="h-full">
            <div className="font-mono text-sm">
              {[
                { time: "Jan 01, 16:20:20.000", id: "U7WFZ-113568", task: "Content writing function result" },
                { time: "Jan 01, 12:15:29.000", id: "WWWWW-44...", task: "SEO optimization task completion" },
                { time: "Jan 01, 12:15:30.000", id: "COMP-4456...", task: "User feedback analysis" },
                { time: "Jan 01, 14:15:55.000", id: "E2SDF-6678901", task: "Social media campaign planning" },
                { time: "Jan 01, 16:55:30.000", id: "G4UJL-8890123", task: "Website UX improvements" },
                { time: "Jan 01, 15:45:25.000", id: "I6WNM-1012345", task: "Product launch planning" },
                { time: "Jan 01, 09:05:00.000", id: "K8YGR-32345...", task: "Customer onboarding process" },
                { time: "Jan 01, 14:22:00.000", id: "MOATS-54567...", task: "Content calendar creation" },
                { time: "Jan 01, 13:50:30.000", id: "O2CVG-76789...", task: "Brand strategy meeting" },
                { time: "Jan 01, 10:50:40.000", id: "Q4EXY-98901...", task: "Website performance review" },
                { time: "Jan 01, 11:10:45.000", id: "S6GHA-1012345", task: "Market trends analysis" },
                { time: "Jan 01, 12:34:56.444", id: "U8IKC-3234567", task: "Partnership outreach initiative" },
                { time: "Jan 01, 15:35:50.000", id: "U7WFZ-113568", task: "Content writing function result" },
              ].map((log, index) => (
                <div key={index} className="flex items-center space-x-4 text-gray-300 hover:bg-gray-800 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-400 w-32 flex-shrink-0">{log.time}</span>
                  <span className="text-gray-500 w-24 flex-shrink-0">{log.id}</span>
                  <span className="text-gray-300">{log.task}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="states" className="h-full">
            <div className="text-gray-400 p-4">States data will appear here</div>
          </TabsContent>
          <TabsContent value="streams" className="h-full">
            <div className="text-gray-400 p-4">Streams data will appear here</div>
          </TabsContent>
        </ContainerContent>
      </Tabs>
    </Container>
  </div>
)

export const WorkbenchLayout: Story = {
  render: () => <WorkbenchLayoutComponent />,
  parameters: {
    layout: 'fullscreen',
  },
}

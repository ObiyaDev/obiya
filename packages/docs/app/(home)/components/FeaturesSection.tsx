'use client';

import CodeEditor from '@/app/(home)/components/CodeEditor';
import FeatureCard from '@/app/(home)/components/FeatureCard';

export default function FeaturesSection() {
  const powerfulFlowsFeatures = [
    {
      title: "Composable Building Blocks",
      description: "Create complex workflows with simple reusable steps."
    },
    {
      title: "Shared Steps",
      description: "Reuse logic across multiple flows to stay DRY."
    },
    {
      title: "Flow Tags",
      description: "Organize flows for visualization in the Workbench."
    }
  ];

  const codeFirstFeatures = [
    {
      title: "Minimal Boilerplate",
      description: "No DSL, just code."
    },
    {
      title: "Seamless Imports",
      description: "Use any dependency with zero friction."
    },
    {
      title: "Straightforward Handlers",
      description: "Steps are normal functions."
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gt-walsheim">
          Powerful Flows, Simple Steps
        </h2>
        <p className="text-gray-300 mx-auto max-w-2xl text-lg mb-16 font-dm-mono">
          Effortlessly build AI-driven workflows. With a
          lightweight, developer-friendly framework, you
          can create intelligent automations using the
          dependencies you know and love.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          {/* Code Editor Card - Now 70% width (8/12) */}
          <main className="flex flex-col items-start rounded-lg lg:col-span-7">
            <CodeEditor height="320px" />
          </main>

          {/* Features Cards - Now 30% width (4/12) */}
          <div className="grid grid-cols-1 gap-8 lg:col-span-5">
            <FeatureCard 
              title="Powerful Flows, Simple Steps" 
              features={powerfulFlowsFeatures} 
            />
            <FeatureCard 
              title="Code-first" 
              features={codeFirstFeatures} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
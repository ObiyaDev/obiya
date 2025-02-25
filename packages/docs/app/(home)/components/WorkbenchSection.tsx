'use client';

import Image from 'next/image';
import FeatureItem from '@/app/(home)/components/FeatureItem';

export default function WorkbenchSection() {
  const workbenchFeatures = [
    {
      icon: "🔍",
      title: "Visual Flow Explorer",
      description: "View your code-defined workflows in an interactive UI"
    },
    {
      icon: "📊",
      title: "Live Logging",
      description: "See inputs, outputs, and errors in real time"
    },
    {
      icon: "🧩",
      title: "Custom UI Overrides",
      description: "Add interactive elements for demos or live data tweaks"
    },
    {
      icon: "✓",
      title: "Manual Triggers",
      description: "Quickly test individual steps or entire flows"
    },
    {
      icon: "🔄",
      title: "Hot Reload",
      description: "Changes reflect instantly. Change it. See it. Run it."
    },
    {
      icon: "⬇️",
      title: "Local First",
      description: "Develop on your own machine without sign in"
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-900 text-purple-300 text-sm font-mono mb-4">
            motia-workbench
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-gt-walsheim">
            Design Workflows Effortlessly
          </h2>
          <p className="text-gray-300 mx-auto max-w-2xl text-lg font-dm-mono">
            A modern workbench that makes it easy to create,
            test, and refine automation workflows. Visually
            build logic, integrate with your tools, and see
            real-time execution—all in one place.
          </p>
        </div>

        {/* Workbench Image */}
        <div className="relative rounded-xl overflow-hidden mb-16">
          <Image 
            src="/images/flow.png" 
            alt="Motia Workbench Interface" 
            width={1200} 
            height={600}
            className="w-full"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {workbenchFeatures.map((feature, index) => (
            <FeatureItem 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 
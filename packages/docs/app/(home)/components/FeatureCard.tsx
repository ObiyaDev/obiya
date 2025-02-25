interface Feature {
  title: string;
  description: string;
}

interface FeatureCardProps {
  title: string;
  features: Feature[];
}

export default function FeatureCard({ title, features }: FeatureCardProps) {
  return (
    <div className="bg-indigo-950 rounded-lg p-6 text-left shadow-xl">
      <h3 className="text-3xl font-bold text-white mb-4 font-gt-walsheim">
        {title}
      </h3>

      {features.map((feature, index) => (
        <div key={index}>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-1 font-gt-walsheim">
              {feature.title}
            </h4>
            <p className="text-purple-200 text-sm font-dm-mono">
              {feature.description}
            </p>
          </div>
          
          {/* Dotted Separator (except after the last item) */}
          {index < features.length - 1 && (
            <div className="border-b border-dotted border-purple-600 mb-4"></div>
          )}
        </div>
      ))}
    </div>
  );
} 
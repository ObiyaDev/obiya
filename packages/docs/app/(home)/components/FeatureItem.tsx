interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex flex-col">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-200 text-sm font-mono">{description}</p>
    </div>
  );
} 
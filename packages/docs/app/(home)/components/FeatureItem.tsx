import Image from "next/image";
import Typography from "@/components/Typography";

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureItem({ icon, title, description, className = "" }: FeatureItemProps) {
  return (
    <div className={`flex flex-row items-start gap-4 ${className}`}>
      <div className="mb-4 mt-2">
        <Image 
          src={icon} 
          alt={title} 
          width={24} 
          height={24} 
          className="opacity-80"
        />
      </div>
      <div>
        <Typography 
          variant="title" 
          as="h3" 
          className="text-2xl text-purple-200 mb-2 text-left"
        >
          {title}
        </Typography>
        <Typography 
          variant="description" 
          as="p" 
          className="text-purple-200/60 text-sm text-left"
        >
          {description}
        </Typography>
      </div>
    </div>
  );
} 
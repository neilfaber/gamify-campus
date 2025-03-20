
import { cn } from "@/lib/utils";
import { CustomButton } from "./ui/custom-button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  linkTo: string;
  linkText: string;
  position?: "left" | "right";
  className?: string;
}

const FeatureCard = ({
  title,
  description,
  icon,
  image,
  linkTo,
  linkText,
  position = "left",
  className,
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-campus-neutral-200 bg-white shadow-sm p-1",
      className
    )}>
      <div className="flex flex-col md:flex-row">
        {/* Content */}
        <div className={cn(
          "flex-1 p-6 md:p-8 flex flex-col justify-center",
          position === "right" && "md:order-2"
        )}>
          <div className="p-2.5 rounded-lg bg-campus-blue-light w-fit mb-4">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-campus-neutral-900 mb-3">{title}</h3>
          <p className="text-campus-neutral-600 mb-6">{description}</p>
          <div>
            <Link to={linkTo}>
              <CustomButton 
                variant="outline" 
                iconRight={<ArrowRight className="h-4 w-4" />}
              >
                {linkText}
              </CustomButton>
            </Link>
          </div>
        </div>
        
        {/* Image */}
        {image && (
          <div className={cn(
            "flex-1 md:max-w-[50%]",
            position === "right" && "md:order-1"
          )}>
            <div className="h-48 md:h-full overflow-hidden">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;

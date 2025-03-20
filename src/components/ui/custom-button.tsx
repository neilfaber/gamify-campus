
import React from "react";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, iconLeft, iconRight, children, ...props }, ref) => {
    const variants = {
      primary: "bg-campus-blue hover:bg-campus-blue-dark text-white shadow-sm hover:shadow",
      secondary: "bg-campus-blue-light text-campus-blue hover:bg-campus-blue hover:text-white",
      outline: "border border-campus-neutral-300 bg-transparent hover:bg-campus-neutral-100 text-campus-neutral-700",
      ghost: "bg-transparent hover:bg-campus-neutral-100 text-campus-neutral-700",
      link: "bg-transparent underline-offset-4 hover:underline text-campus-blue p-0 h-auto"
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 rounded-md",
      lg: "h-12 px-6 text-lg rounded-md"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        <span className={isLoading ? "opacity-0" : "flex items-center"}>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </span>
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton };

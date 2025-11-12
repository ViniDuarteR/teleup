import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gamingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "btn-gaming hover:scale-105 active:scale-95",
        secondary: "btn-secondary-gaming hover:scale-105 active:scale-95",
        outline: "border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary hover:scale-105",
        ghost: "text-primary hover:bg-primary/10 hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground hover:scale-105",
        xp: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-300 hover:to-yellow-500 hover:scale-105 shadow-lg",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 hover:scale-105 shadow-lg",
        warning: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 hover:scale-105 shadow-lg",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
      glow: {
        none: "",
        subtle: "shadow-md",
        medium: "shadow-lg shadow-primary/25",
        strong: "shadow-xl shadow-primary/50 pulse-glow",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      glow: "medium",
    },
  }
);

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gamingButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? "button" : "button";
    
    return (
      <Comp 
        className={cn(gamingButtonVariants({ variant, size, glow, className }))} 
        ref={ref} 
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </Comp>
    );
  }
);

GamingButton.displayName = "GamingButton";

export { GamingButton };
export type { GamingButtonProps };

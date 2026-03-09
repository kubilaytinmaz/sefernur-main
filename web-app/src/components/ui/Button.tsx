import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        outline:
          "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        link: "text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        xl: "px-10 py-5 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        data-as-child={asChild ? "true" : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-brand-500 text-black hover:bg-brand-400 shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)]": variant === "default",
          "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20": variant === "destructive",
          "border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-50 backdrop-blur-sm": variant === "outline",
          "hover:bg-white/5 hover:text-zinc-50": variant === "ghost",
          "bg-zinc-800 text-zinc-50 hover:bg-zinc-700": variant === "secondary",
          "underline-offset-4 hover:underline text-brand-500": variant === "link",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-8 rounded-md px-3 text-xs": size === "sm",
          "h-12 rounded-xl px-8 text-base": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };

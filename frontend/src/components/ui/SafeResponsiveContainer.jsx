import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

export function SafeResponsiveContainer({ children, className, height, minHeight, style, ...props }) {
  const hostRef = useRef(null);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const updateSize = () => {
      const rect = host.getBoundingClientRect();
      setCanRender(rect.width > 0 && rect.height > 0);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  const resolvedHeight = typeof height === "number" ? `${height}px` : height;
  const resolvedMinHeight = typeof minHeight === "number" ? `${minHeight}px` : minHeight;

  return (
    <div
      ref={hostRef}
      className={cn("min-w-0 w-full", className)}
      style={{ height: resolvedHeight, minHeight: resolvedMinHeight, ...style }}
    >
      {canRender && (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} {...props}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}

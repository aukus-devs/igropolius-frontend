import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "../icons";

type CollapsibleContextType = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextType>({
  isCollapsed: false,
  toggleCollapse: () => { },
});

function CollapsibleTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { isCollapsed, toggleCollapse } = useContext(CollapsibleContext);

  return (
    <Button
      variant="outline"
      className={cn("flex-row justify-between p-[5px] bg-card/70 rounded-[8px] backdrop-blur-[1.5rem] border-none", className)}
      onClick={toggleCollapse}
    >
      {children}
      <div
        className="rounded-md py-[3px] px-[13px] h-auto items-center font-semibold border-none font-wide-black text-xs text-muted-foreground [&_svg:not([class*='size-'])]:size-[19px] bg-white/[0.08]"
      >
        {!isCollapsed ? <ChevronUp /> : <ChevronDown />}
      </div>
    </Button>
  )
}

function CollapsibleContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isCollapsed } = useContext(CollapsibleContext);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const minCollapsedHeight = 6;

  useEffect(() => {
    if (contentRef.current) {
      // hack to prevent "justify-content: end" affecting height calculation
      contentRef.current.style.display = 'block';
      setHeight(!isCollapsed ? contentRef.current.scrollHeight : minCollapsedHeight);
      contentRef.current.style.display = 'flex';
    }
  }, [isCollapsed]);

  return (
    <div
      ref={contentRef}
      style={{ height }}
      className={cn("flex flex-col justify-end space-y-[5px] z-[-1] transition-[opacity,scale,height] duration-300 overflow-hidden mx-auto group-data-[collapsed=true]:opacity-50 group-data-[collapsed=true]:pointer-events-none group-data-[collapsed=true]:scale-x-95 w-full hover:overflow-visible", className)}
    >
      {children}
    </div>
  );
}

function Collapsible({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <CollapsibleContext.Provider value={{ isCollapsed, toggleCollapse }}>
      <div className="group relative" data-collapsed={isCollapsed}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
}

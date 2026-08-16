import React from "react";
import { ComponentType } from "../../types/circuit";
import { WokwiGraphic } from "./WokwiGraphic";

interface ComponentThumbnailProps {
  idType: ComponentType;
  properties?: Record<string, any>;
  className?: string;
}

export const ComponentThumbnail: React.FC<ComponentThumbnailProps> = ({
  idType,
  properties,
  className = "w-full h-20",
}) => {
  const props = (properties || {}) as Record<string, any>;

  return (
    <div
      className={`flex items-center justify-center p-1.5 bg-[#090d16] rounded-md border border-slate-700/60 overflow-hidden relative group/thumb ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center transform scale-90 transition-transform duration-200 group-hover/thumb:scale-100">
        <WokwiGraphic
          idType={idType}
          properties={props}
          className="w-full h-full max-h-[70px]"
        />
      </div>
    </div>
  );
};

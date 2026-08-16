import React, { useState } from "react";
import { ComponentType } from "../../types/circuit";
import { WOKWI_CATALOG, WokwiItemDefinition } from "../../services/wokwiCatalog";
import { ComponentThumbnail } from "./ComponentThumbnail";
import { Cpu, Plus, Search, Zap, Layers, Filter } from "lucide-react";

interface ComponentTrayProps {
  onAddComponent: (type: ComponentType, props: Record<string, any>) => void;
}

export const ComponentTray: React.FC<ComponentTrayProps> = ({ onAddComponent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Tools", "Power", "Cameras", "Boards", "Displays", "Outputs", "Sensors", "Switches", "Passives"];

  // Filter items by category and search term
  const filteredItems = WOKWI_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wokwiTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, item: WokwiItemDefinition) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: item.idType,
        properties: item.defaultProps,
        title: item.title,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-3">
      {/* Top Header with Title, Search and Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-inner">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Wokwi Hardware Elements Catalog
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {WOKWI_CATALOG.length} Parts Available
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Select or drag official Wokwi hardware components onto the interactive breadboard canvas.
            </p>
          </div>
        </div>

        {/* Search Bar + Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center min-w-[160px] sm:min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-well text-xs font-mono text-slate-200 placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 glass-well p-1 rounded-lg overflow-x-auto max-w-full">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? WOKWI_CATALOG.length
                  : WOKWI_CATALOG.filter((w) => w.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedCategory === cat
                      ? "glass-tab-active text-white ring-1 ring-blue-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[9px] opacity-70`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Component Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-8 text-center bg-[#0f172a]/50 rounded-lg border border-dashed border-slate-700 text-slate-400 text-xs font-mono">
          No hardware components matching "{searchQuery}". Try a different search term or category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredItems.map((item, idx) => (
            <div
              key={`${item.wokwiTag}-${item.idType}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => onAddComponent(item.idType, item.defaultProps)}
              className="glass-card group relative rounded-lg p-2.5 flex flex-col justify-between transition cursor-grab active:cursor-grabbing hover:-translate-y-0.5 duration-150"
              title="Click to add to canvas or drag directly"
            >
              {/* Top Category Indicator & Feature Badge */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full border border-slate-700 shadow-inner"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              </div>

              {/* Hardware Component Picture Preview */}
              <div className="my-1.5">
                <ComponentThumbnail
                  idType={item.idType}
                  properties={item.defaultProps}
                  className="w-full h-[76px]"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5 my-1">
                <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition truncate">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  {item.description}
                </div>
              </div>

              {/* Pin Count & + Add Button */}
              <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500">
                  {item.pins.length} {item.pins.length === 1 ? "pin" : "pins"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddComponent(item.idType, item.defaultProps);
                  }}
                  className="glass-btn px-2 py-0.5 rounded text-blue-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-mono font-semibold"
                  title="Add to canvas"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Wiring Instructions Footnote */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 glass-well px-3 py-1.5 rounded-lg">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong className="text-slate-200">Interactive Wiring:</strong> Click any component pin to start a jumper wire, then click a target pin to plug!
          </span>
        </div>
        <span className="text-slate-500 hidden sm:inline font-mono">
          Showing {filteredItems.length} of {WOKWI_CATALOG.length} elements
        </span>
      </div>
    </div>
  );
};

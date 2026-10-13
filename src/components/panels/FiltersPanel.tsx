import React from 'react';
import { PresetFilterId } from '../../types/editor';
import { FILTER_PRESETS } from '../../utils/imageProcess';

interface FiltersPanelProps {
  activeFilter: PresetFilterId;
  onSelectFilter: (filterId: PresetFilterId) => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="p-4 space-y-3 text-xs select-none">
      <label className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
        Filter Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {FILTER_PRESETS.map((filter) => {
          const isSelected = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-zinc-800 border-white/[0.25] text-white shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <div className="font-medium text-xs leading-tight">{filter.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {filter.id === 'normal'
                  ? 'Natural tones'
                  : filter.id === 'vivid'
                  ? 'High vibrancy'
                  : filter.id === 'mono'
                  ? 'Monochrome'
                  : filter.id === 'vintage'
                  ? 'Warm 70s'
                  : filter.id === 'slate'
                  ? 'Cool blue'
                  : filter.id === 'cyber'
                  ? 'High contrast'
                  : filter.id === 'warm'
                  ? 'Golden sunset'
                  : filter.id === 'matte'
                  ? 'Muted film'
                  : 'Cinematic'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

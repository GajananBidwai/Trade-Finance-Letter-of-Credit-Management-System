import { useState } from 'react';

export const UserFilters = () => {
  const [activeFilter, setActiveFilter] = useState('All Users');
  const filters = ['All Users', 'Trade Officers', 'Compliance', 'Admins'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-label-md transition-colors ${
              activeFilter === filter 
                ? 'bg-primary text-on-primary' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_alt</span>
          <select className="bg-surface-container-high border-none rounded-xl pl-10 pr-8 py-2 font-body-md text-on-surface appearance-none focus:ring-1 focus:ring-primary/40 outline-none">
            <option>Status: All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/20"></div>
        <p className="text-on-surface-variant font-label-md">Showing 1-10 of 1,284</p>
      </div>
    </div>
  );
};

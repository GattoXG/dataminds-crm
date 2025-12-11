import React from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface ProductsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

export const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  showInactive,
  setShowInactive,
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
        />
      </div>

      {/* Show Inactive Toggle */}
      <button
        onClick={() => setShowInactive(!showInactive)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
          showInactive
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-400'
            : 'bg-white dark:bg-dark-card border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
      >
        {showInactive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        <span className="font-medium">
          {showInactive ? 'Mostrando inativos' : 'Apenas ativos'}
        </span>
      </button>
    </div>
  );
};

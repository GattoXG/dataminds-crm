import React from 'react';
import { Plus, Grid, List as ListIcon } from 'lucide-react';

interface ProductsHeaderProps {
  onNewProduct: () => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({ onNewProduct }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
            Produtos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Gerencie seu catálogo de produtos e serviços
          </p>
        </div>

        <button
          onClick={onNewProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20 font-medium"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>
    </div>
  );
};

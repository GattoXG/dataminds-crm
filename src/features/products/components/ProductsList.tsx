import React from 'react';
import { Product } from '@/types';
import { Edit2, Trash2, Power } from 'lucide-react';

interface ProductsListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-white/10">
        <p className="text-slate-500 dark:text-slate-400">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div
          key={product.id}
          className={`glass rounded-xl p-6 border transition-all hover:shadow-lg ${
            product.active
              ? 'border-slate-200 dark:border-white/10'
              : 'border-slate-300 dark:border-white/20 opacity-60'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {product.name}
              </h3>
              {product.sku && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                  SKU: {product.sku}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleActive(product.id, product.active || false)}
                className={`p-2 rounded-lg transition-colors ${
                  product.active
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
                title={product.active ? 'Desativar' : 'Ativar'}
              >
                <Power size={18} />
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(product.price)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors font-medium"
            >
              <Edit2 size={16} />
              Editar
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { useProductsController } from './hooks/useProductsController';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsFilters } from './components/ProductsFilters';
import { ProductsList } from './components/ProductsList';
import { ProductFormModal } from './components/ProductFormModal';
import { PageLoader } from '@/components/PageLoader';

export const ProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    handleNewProduct,
    handleEditProduct,
    handleSubmit,
    handleDeleteProduct,
    handleToggleActive,
  } = useProductsController();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <ProductsHeader onNewProduct={handleNewProduct} />
      
      <ProductsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
      />

      <ProductsList
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onToggleActive={handleToggleActive}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
      />
    </div>
  );
};

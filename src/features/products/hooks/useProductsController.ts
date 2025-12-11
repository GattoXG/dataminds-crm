import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductActive } from '@/lib/query/hooks';
import { ProductInsert } from '@/lib/supabase/products';
import { Product } from '@/types';
import { useToast } from '@/context/ToastContext';

export function useProductsController() {
  const { addToast } = useToast();
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: products = [], isLoading } = useProducts(showInactive);

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();

  // Filtered products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: ProductInsert) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          updates: data,
        });
        addToast('Produto atualizado com sucesso!', 'success');
      } else {
        await createProduct.mutateAsync(data);
        addToast('Produto criado com sucesso!', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      addToast(
        editingProduct ? 'Erro ao atualizar produto' : 'Erro ao criar produto',
        'error'
      );
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await deleteProduct.mutateAsync(id);
      addToast('Produto excluído com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao excluir produto', 'error');
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, active: !active });
      addToast(
        active ? 'Produto desativado' : 'Produto ativado',
        'success'
      );
    } catch (error) {
      addToast('Erro ao alterar status do produto', 'error');
      console.error('Error toggling product:', error);
    }
  };

  return {
    products: filteredProducts,
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
  };
}

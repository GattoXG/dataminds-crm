import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService, ProductInsert } from '@/lib/supabase/products';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '../index';

// ============================================
// QUERIES
// ============================================

export function useProducts(includeInactive = false) {
  return useQuery({
    queryKey: includeInactive ? queryKeys.products.allIncludingInactive : queryKeys.products.all,
    queryFn: async () => {
      const { data, error } = includeInactive
        ? await productsService.getAllIncludingInactive()
        : await productsService.getAll();

      if (error) throw error;
      return data || [];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await productsService.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      if (!profile?.company_id) {
        throw new Error('Usuário não tem empresa associada');
      }

      const { data, error } = await productsService.create(product, profile.company_id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductInsert> }) => {
      const { data, error } = await productsService.update(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(data.id) });
      }
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await productsService.delete(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useToggleProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await productsService.toggleActive(id, active);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      if (data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(data.id) });
      }
    },
  });
}

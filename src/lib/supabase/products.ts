import { supabase } from './client';
import { Product } from '@/types';
import { sanitizeUUID } from './utils';

export interface ProductInsert {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  active?: boolean;
}

export const productsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name');

    return { data: data as Product[] | null, error };
  },

  async getAllIncludingInactive() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    return { data: data as Product[] | null, error };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Product | null, error };
  },

  async create(product: ProductInsert, companyId: string) {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          ...product,
          company_id: sanitizeUUID(companyId),
        },
      ])
      .select()
      .single();

    return { data: data as Product | null, error };
  },

  async update(id: string, updates: Partial<ProductInsert>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return { data: data as Product | null, error };
  },

  async delete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    return { error };
  },

  async toggleActive(id: string, active: boolean) {
    return this.update(id, { active });
  },
};

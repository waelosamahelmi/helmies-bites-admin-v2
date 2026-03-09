import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useTenant } from "@/lib/tenant-context";

// Helper functions
function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Database error');
}

function formatSupabaseResponse(data: any) {
  return data;
}

// Get all categories
export function useSupabaseCategories() {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["supabase-categories", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      console.log('📂 Fetching categories from Supabase...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', tenantId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch categories:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Categories fetched successfully:', data?.length || 0, 'categories');
      return formatSupabaseResponse(data) || [];
    },
    enabled: !!user && !!tenantId,
  });
}

// Get all menu items
export function useSupabaseMenuItems(categoryId?: number) {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: categoryId ? ["supabase-menu-items", tenantId, categoryId] : ["supabase-menu-items", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      console.log('🍽️ Fetching menu items from Supabase...', categoryId ? `Category: ${categoryId}` : 'All items');
      
      let query = supabase
        .from('menu_items')
        .select(`*, categories (*)`)
        .eq('restaurant_id', tenantId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch menu items:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Menu items fetched successfully:', data?.length || 0, 'items');
      return formatSupabaseResponse(data) || [];
    },
    enabled: !!user && !!tenantId,
  });
}

// Get all toppings
export function useSupabaseToppings(category?: string) {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: category ? ["supabase-toppings", tenantId, category] : ["supabase-toppings", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from('toppings')
        .select('*')
        .eq('restaurant_id', tenantId)
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch toppings:', error);
        handleSupabaseError(error);
      }

      return formatSupabaseResponse(data) || [];
    },
    enabled: !!user && !!tenantId,
  });
}

// Create menu item
export function useSupabaseCreateMenuItem() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (itemData: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      console.log('🍽️ Creating menu item in Supabase:', itemData);
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ ...itemData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create menu item:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Menu item created successfully:', data?.id);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-menu-items"] });
    },
  });
}

// Update menu item
export function useSupabaseUpdateMenuItem() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      console.log('🍽️ Updating menu item in Supabase:', id, updateData);
      
      const { data, error } = await supabase
        .from('menu_items')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update menu item:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Menu item updated successfully:', data?.id);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-menu-items"] });
    },
  });
}

// Delete menu item
export function useSupabaseDeleteMenuItem() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', tenantId);

      if (error) {
        console.error('❌ Failed to delete menu item:', error);
        handleSupabaseError(error);
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-menu-items"] });
    },
  });
}

// Create category
export function useSupabaseCreateCategory() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (categoryData: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create category:', error);
        handleSupabaseError(error);
      }

      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-categories"] });
    },
  });
}

// Update category
export function useSupabaseUpdateCategory() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update category:', error);
        handleSupabaseError(error);
      }

      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-categories"] });
    },
  });
}

// Delete category
export function useSupabaseDeleteCategory() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', tenantId);

      if (error) {
        console.error('❌ Failed to delete category:', error);
        handleSupabaseError(error);
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-categories"] });
    },
  });
}

// Create topping
export function useSupabaseCreateTopping() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (toppingData: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('toppings')
        .insert([{ ...toppingData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-toppings"] });
    },
  });
}

// Update topping
export function useSupabaseUpdateTopping() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('toppings')
        .update(updateData)
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-toppings"] });
    },
  });
}

// Delete topping
export function useSupabaseDeleteTopping() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { error } = await supabase
        .from('toppings')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', tenantId);

      if (error) handleSupabaseError(error);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-toppings"] });
    },
  });
}

// Get branches (alias for product-management-modal)
export function useSupabaseBranches() {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["supabase-branches", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('restaurant_id', tenantId)
        .order('name', { ascending: true });

      if (error) handleSupabaseError(error);
      return formatSupabaseResponse(data) || [];
    },
    enabled: !!user && !!tenantId,
  });
}

// Create branch
export function useSupabaseCreateBranch() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (branchData: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('branches')
        .insert([{ ...branchData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-branches"] });
    },
  });
}

// Update branch
export function useSupabaseUpdateBranch() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('branches')
        .update(updateData)
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-branches"] });
    },
  });
}

// Delete branch
export function useSupabaseDeleteBranch() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', tenantId);

      if (error) handleSupabaseError(error);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-branches"] });
    },
  });
}

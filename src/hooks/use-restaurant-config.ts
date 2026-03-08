import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useTenant } from "@/lib/tenant-context";

export interface RestaurantConfig {
  id: number;
  tenant_id?: string;
  name: string;
  name_en?: string;
  name_sv?: string;
  tagline?: string;
  tagline_en?: string;
  tagline_sv?: string;
  description?: string;
  description_en?: string;
  description_sv?: string;
  phone?: string;
  email?: string;
  address?: any;
  theme?: any;
  logo?: any;
  hero?: any;
  heroVideo?: any;
  services?: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get active restaurant config
export function useRestaurantConfig() {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["restaurant-config", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      
      return data as RestaurantConfig | null;
    },
    enabled: !!user && !!tenantId,
  });
}

// Update restaurant config
export function useUpdateRestaurantConfig() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('restaurant_config')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-config"] });
    },
  });
}

// Create restaurant config (for new tenants)
export function useCreateRestaurantConfig() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (configData: Partial<RestaurantConfig>) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      // Deactivate existing configs first
      await supabase
        .from('restaurant_config')
        .update({ is_active: false })
        .eq('tenant_id', tenantId);

      const { data, error } = await supabase
        .from('restaurant_config')
        .insert([{ ...configData, tenant_id: tenantId, is_active: true }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-config"] });
    },
  });
}

// Activate specific restaurant config
export function useActivateRestaurantConfig() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      // Deactivate all configs first
      await supabase
        .from('restaurant_config')
        .update({ is_active: false })
        .eq('tenant_id', tenantId);

      // Activate the selected one
      const { data, error } = await supabase
        .from('restaurant_config')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-config"] });
    },
  });
}

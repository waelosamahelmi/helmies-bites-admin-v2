import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useTenant } from "@/lib/tenant-context";

export interface RestaurantSettings {
  id: number;
  tenant_id?: string;
  is_open: boolean;
  is_busy: boolean;
  opening_hours?: string;
  pickup_hours?: string;
  delivery_hours?: string;
  lunch_buffet_hours?: string;
  min_order_amount?: number;
  delivery_fee?: number;
  free_delivery_threshold?: number;
  estimated_pickup_time?: number;
  estimated_delivery_time?: number;
  max_delivery_distance?: number;
  // Stripe settings (snake_case)
  stripe_enabled?: boolean;
  stripe_test_mode?: boolean;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
  stripe_connect_account_id?: string;
  stripe_account_email?: string;
  stripe_account_country?: string;
  stripe_payment_methods_config?: any;
  // Payment settings
  payment_methods?: any[];
  online_payment_service_fee?: number;
  online_payment_service_fee_type?: string;
  // Other settings
  special_message?: string;
  special_message_en?: string;
  receipt_format?: string;
  direct_print_enabled?: boolean;
  default_printer_id?: string;
  printer_auto_reconnect?: boolean;
  printer_tab_sticky?: boolean;
  monthly_report_email?: string;
  monthly_report_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  // Allow dynamic access
  [key: string]: any;
}

// Get restaurant settings
export function useRestaurantSettings() {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["restaurant-settings", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      
      return data as RestaurantSettings | null;
    },
    enabled: !!user && !!tenantId,
  });
}

// Update restaurant settings
export function useUpdateRestaurantSettings() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
    },
  });
}

// Toggle open/closed status
export function useToggleRestaurantOpen() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, is_open }: { id: number; is_open: boolean }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .update({ is_open, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
    },
  });
}

// Toggle busy status
export function useToggleRestaurantBusy() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, is_busy }: { id: number; is_busy: boolean }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .update({ is_busy, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
    },
  });
}

// Create restaurant settings (for new tenants)
export function useCreateRestaurantSettings() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (settingsData: Partial<RestaurantSettings>) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .insert([{ 
          ...settingsData, 
          tenant_id: tenantId,
          is_open: settingsData.is_open ?? true,
          is_busy: settingsData.is_busy ?? false,
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useTenant } from "@/lib/tenant-context";

// Helper to handle Supabase errors
function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Database error');
}

// Helper to format response
function formatSupabaseResponse(data: any) {
  return data;
}

// Get all orders (filtered by tenant)
export function useSupabaseOrders() {
  const { user, userBranch, loading } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["supabase-orders", tenantId, userBranch],
    queryFn: async () => {
      if (!tenantId) {
        console.log('⏸️ No tenant selected, skipping order fetch');
        return [];
      }

      console.log('📦 Fetching orders from Supabase...', { tenantId, userBranch, loading });
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('restaurant_id', tenantId); // Tenant filter
      
      // Filter by user's branch if they have one assigned
      if (userBranch !== null && userBranch !== undefined) {
        query = query.eq('branch_id', userBranch);
        console.log('🏢 Filtering orders for branch:', userBranch);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch orders:', error);
        handleSupabaseError(error);
      }

      // Filter out online payment orders that are not paid
      const filteredData = data?.filter(order => {
        if (order.payment_method === 'online' || order.payment_method === 'stripe') {
          return order.payment_status === 'paid';
        }
        return true;
      });

      console.log('✅ Orders fetched successfully:', data?.length || 0, 'total,', filteredData?.length || 0, 'after filter');
      return formatSupabaseResponse(filteredData) || [];
    },
    enabled: !!user && !!tenantId && !loading,
    refetchInterval: 30000,
  });
}

// Get single order by ID
export function useSupabaseOrder(id: number) {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["supabase-order", tenantId, id],
    queryFn: async () => {
      if (!tenantId) return null;
      
      console.log('📦 Fetching order from Supabase:', id);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .single();

      if (error) {
        console.error('❌ Failed to fetch order:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Order fetched successfully:', data?.id);
      return formatSupabaseResponse(data);
    },
    enabled: !!user && !!tenantId && !!id,
  });
}

// Create new order
export function useSupabaseCreateOrder() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (orderData: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      console.log('📦 Creating order in Supabase:', orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...orderData, tenant_id: tenantId }])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create order:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Order created successfully:', data?.id);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-orders"] });
    },
  });
}

// Update order status
export function useSupabaseUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, status, ...additionalFields }: { id: number; status: string; [key: string]: any }) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      console.log('📦 Updating order status in Supabase:', id, '->', status, additionalFields);

      const updateData: any = { status, updated_at: new Date().toISOString() };
      Object.assign(updateData, additionalFields);

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .eq('restaurant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update order status:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Order status updated successfully:', data?.id, data?.status);
      return formatSupabaseResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-orders"] });
    },
  });
}

// Delete order
export function useSupabaseDeleteOrder() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!tenantId) throw new Error('No tenant selected');
      
      console.log('📦 Deleting order from Supabase:', id);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', tenantId);

      if (error) {
        console.error('❌ Failed to delete order:', error);
        handleSupabaseError(error);
      }

      console.log('✅ Order deleted successfully:', id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-orders"] });
    },
  });
}

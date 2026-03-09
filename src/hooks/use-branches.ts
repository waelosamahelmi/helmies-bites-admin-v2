import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { useSupabaseAuth } from "@/lib/supabase-auth-context";
import { useTenant } from "@/lib/tenant-context";

// Get all branches
export function useBranches() {
  const { user } = useSupabaseAuth();
  const { tenantId } = useTenant();
  
  return useQuery({
    queryKey: ["branches", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('restaurant_id', tenantId)
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user && !!tenantId,
  });
}

// Create branch
export function useCreateBranch() {
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

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

// Update branch
export function useUpdateBranch() {
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

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

// Delete branch
export function useDeleteBranch() {
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

      if (error) throw new Error(error.message);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

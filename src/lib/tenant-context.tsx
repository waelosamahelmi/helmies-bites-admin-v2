import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase-client';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  subscription_tier: 'starter' | 'pro' | 'enterprise';
  features: {
    cashOnDelivery: boolean;
    aiAssistant: boolean;
    delivery: boolean;
    pickup: boolean;
    lunch: boolean;
    multiBranch: boolean;
  };
  helmies_fee_percentage: number;
  monthly_fee: number;
  metadata?: Record<string, any>;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
  setTenantId: (id: string) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get tenant from URL subdomain or localStorage
  const detectTenant = async () => {
    try {
      // Check localStorage first
      const storedTenantId = localStorage.getItem('helmies_tenant_id');
      if (storedTenantId) {
        setTenantIdState(storedTenantId);
        return storedTenantId;
      }

      // Try to detect from subdomain
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // Skip main domains
      if (['localhost', 'helmiesbites', 'admin', 'www', '127'].includes(subdomain)) {
        return null;
      }

      // Look up tenant by slug
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', subdomain)
        .single();

      if (tenantData && !tenantError) {
        localStorage.setItem('helmies_tenant_id', tenantData.id);
        setTenantIdState(tenantData.id);
        return tenantData.id;
      }

      return null;
    } catch (err) {
      console.error('Error detecting tenant:', err);
      return null;
    }
  };

  const fetchTenant = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setTenant(data);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const setTenantId = (id: string) => {
    localStorage.setItem('helmies_tenant_id', id);
    setTenantIdState(id);
    fetchTenant(id);
  };

  const refreshTenant = async () => {
    if (tenantId) {
      await fetchTenant(tenantId);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const id = await detectTenant();
      if (id) {
        await fetchTenant(id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch tenant when ID changes
  useEffect(() => {
    if (tenantId) {
      fetchTenant(tenantId);
    }
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{
      tenant,
      tenantId,
      loading,
      error,
      setTenantId,
      refreshTenant,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Hook to get tenant-scoped Supabase queries
export function useTenantQuery() {
  const { tenantId } = useTenant();

  return {
    tenantId,
    // Helper to add tenant filter to queries
    withTenant: <T extends Record<string, any>>(data: T): T & { tenant_id: string } => {
      if (!tenantId) throw new Error('No tenant selected');
      return { ...data, tenant_id: tenantId };
    },
    // Helper to filter query by tenant
    filterByTenant: (query: any) => {
      if (!tenantId) throw new Error('No tenant selected');
      return query.eq('tenant_id', tenantId);
    },
  };
}

export default TenantContext;

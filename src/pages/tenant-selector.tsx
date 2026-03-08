import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, ChevronRight } from "lucide-react";
import { supabase } from '@/lib/supabase-client';
import { useTenant } from '@/lib/tenant-context';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  status: string;
  subscription_tier: string;
  created_at: string;
}

export default function TenantSelector() {
  const [, setLocation] = useLocation();
  const { setTenantId } = useTenant();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('name');

        if (error) throw error;
        setTenants(data || []);
      } catch (err) {
        console.error('Error fetching tenants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const selectTenant = (tenant: Tenant) => {
    setTenantId(tenant.id);
    setLocation('/admin');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Helmies Bites Admin</h1>
          <p className="text-gray-600">Select a restaurant to manage</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Tenant List */}
        <div className="grid gap-4">
          {filteredTenants.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {search ? 'No restaurants found matching your search' : 'No restaurants available'}
              </CardContent>
            </Card>
          ) : (
            filteredTenants.map((tenant) => (
              <Card 
                key={tenant.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => selectTenant(tenant)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{tenant.name}</h3>
                        <Badge variant="outline" className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                        <Badge className={getTierColor(tenant.subscription_tier)}>
                          {tenant.subscription_tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{tenant.slug}.helmiesbites.com</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{tenants.length}</div>
              <div className="text-sm text-gray-500">Total Restaurants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {tenants.filter(t => t.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tenants.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

// Helper to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Database error');
}

// Helper to format response (for camelCase conversion if needed)
export function formatSupabaseResponse(data: any) {
  return data;
}

// Convert camelCase to snake_case
export function convertCamelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertCamelToSnake);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = convertCamelToSnake(obj[key]);
    return acc;
  }, {} as any);
}

// Helmies Bites Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkolgazzeszfzucyqsoo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb2xnYXp6ZXN6Znp1Y3lxc29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTUxNTcsImV4cCI6MjA4NzE5MTE1N30.PhSPpbR_PuZrC5llWhMbZMPqriXNv7Bw_XLqgAKiof4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application': 'helmies-bites-admin',
    },
  },
});

// Helper to get tenant-scoped client
export function getTenantClient(tenantId: string) {
  return {
    // Categories
    categories: () => supabase.from('categories').select('*').eq('tenant_id', tenantId),
    createCategory: (data: any) => supabase.from('categories').insert({ ...data, tenant_id: tenantId }),
    updateCategory: (id: number, data: any) => supabase.from('categories').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteCategory: (id: number) => supabase.from('categories').delete().eq('id', id).eq('tenant_id', tenantId),

    // Menu Items
    menuItems: () => supabase.from('menu_items').select('*, categories(*)').eq('tenant_id', tenantId),
    createMenuItem: (data: any) => supabase.from('menu_items').insert({ ...data, tenant_id: tenantId }),
    updateMenuItem: (id: number, data: any) => supabase.from('menu_items').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteMenuItem: (id: number) => supabase.from('menu_items').delete().eq('id', id).eq('tenant_id', tenantId),

    // Branches
    branches: () => supabase.from('branches').select('*').eq('tenant_id', tenantId),
    createBranch: (data: any) => supabase.from('branches').insert({ ...data, tenant_id: tenantId }),
    updateBranch: (id: number, data: any) => supabase.from('branches').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteBranch: (id: number) => supabase.from('branches').delete().eq('id', id).eq('tenant_id', tenantId),

    // Orders
    orders: () => supabase.from('orders').select('*, branches(*)').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    createOrder: (data: any) => supabase.from('orders').insert({ ...data, tenant_id: tenantId }),
    updateOrder: (id: number, data: any) => supabase.from('orders').update(data).eq('id', id).eq('tenant_id', tenantId),

    // Customers
    customers: () => supabase.from('customers').select('*').eq('tenant_id', tenantId),
    createCustomer: (data: any) => supabase.from('customers').insert({ ...data, tenant_id: tenantId }),
    updateCustomer: (id: number, data: any) => supabase.from('customers').update(data).eq('id', id).eq('tenant_id', tenantId),

    // Restaurant Config
    restaurantConfig: () => supabase.from('restaurant_config').select('*').eq('tenant_id', tenantId).eq('is_active', true).single(),
    updateRestaurantConfig: (id: number, data: any) => supabase.from('restaurant_config').update(data).eq('id', id).eq('tenant_id', tenantId),

    // Restaurant Settings
    restaurantSettings: () => supabase.from('restaurant_settings').select('*').eq('tenant_id', tenantId).single(),
    updateRestaurantSettings: (id: number, data: any) => supabase.from('restaurant_settings').update(data).eq('id', id).eq('tenant_id', tenantId),

    // Promotions
    promotions: () => supabase.from('promotions').select('*').eq('tenant_id', tenantId),
    createPromotion: (data: any) => supabase.from('promotions').insert({ ...data, tenant_id: tenantId }),
    updatePromotion: (id: string, data: any) => supabase.from('promotions').update(data).eq('id', id).eq('tenant_id', tenantId),
    deletePromotion: (id: string) => supabase.from('promotions').delete().eq('id', id).eq('tenant_id', tenantId),

    // Loyalty
    loyaltyRewards: () => supabase.from('loyalty_rewards').select('*').eq('tenant_id', tenantId),
    createLoyaltyReward: (data: any) => supabase.from('loyalty_rewards').insert({ ...data, tenant_id: tenantId }),
    updateLoyaltyReward: (id: string, data: any) => supabase.from('loyalty_rewards').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteLoyaltyReward: (id: string) => supabase.from('loyalty_rewards').delete().eq('id', id).eq('tenant_id', tenantId),

    // Blacklist
    blacklist: () => supabase.from('blacklist').select('*').eq('tenant_id', tenantId),
    createBlacklistEntry: (data: any) => supabase.from('blacklist').insert({ ...data, tenant_id: tenantId }),
    deleteBlacklistEntry: (id: string) => supabase.from('blacklist').delete().eq('id', id).eq('tenant_id', tenantId),

    // Users (staff)
    users: () => supabase.from('users').select('*').eq('tenant_id', tenantId),
    createUser: (data: any) => supabase.from('users').insert({ ...data, tenant_id: tenantId }),
    updateUser: (id: number, data: any) => supabase.from('users').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteUser: (id: number) => supabase.from('users').delete().eq('id', id).eq('tenant_id', tenantId),

    // Topping Groups
    toppingGroups: () => supabase.from('topping_groups').select('*, toppings(*)').eq('tenant_id', tenantId),
    createToppingGroup: (data: any) => supabase.from('topping_groups').insert({ ...data, tenant_id: tenantId }),
    updateToppingGroup: (id: number, data: any) => supabase.from('topping_groups').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteToppingGroup: (id: number) => supabase.from('topping_groups').delete().eq('id', id).eq('tenant_id', tenantId),

    // Toppings
    toppings: () => supabase.from('toppings').select('*').eq('tenant_id', tenantId),
    createTopping: (data: any) => supabase.from('toppings').insert({ ...data, tenant_id: tenantId }),
    updateTopping: (id: number, data: any) => supabase.from('toppings').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteTopping: (id: number) => supabase.from('toppings').delete().eq('id', id).eq('tenant_id', tenantId),

    // Lounas (Lunch)
    lounasMenus: () => supabase.from('lounas_menus').select('*').eq('tenant_id', tenantId),
    createLounasMenu: (data: any) => supabase.from('lounas_menus').insert({ ...data, tenant_id: tenantId }),
    updateLounasMenu: (id: number, data: any) => supabase.from('lounas_menus').update(data).eq('id', id).eq('tenant_id', tenantId),
    deleteLounasMenu: (id: number) => supabase.from('lounas_menus').delete().eq('id', id).eq('tenant_id', tenantId),

    lounasSettings: () => supabase.from('lounas_settings').select('*').eq('tenant_id', tenantId).single(),
    updateLounasSettings: (id: number, data: any) => supabase.from('lounas_settings').update(data).eq('id', id).eq('tenant_id', tenantId),
  };
}

export default supabase;

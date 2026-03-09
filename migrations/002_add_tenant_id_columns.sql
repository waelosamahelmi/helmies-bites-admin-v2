-- Add tenant_id to all tables for multi-tenancy

-- Restaurant Config
ALTER TABLE restaurant_config ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_restaurant_config_tenant ON restaurant_config(tenant_id);

-- Restaurant Settings  
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_tenant ON restaurant_settings(tenant_id);

-- Categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- Menu Items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);

-- Toppings
ALTER TABLE toppings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_toppings_tenant ON toppings(tenant_id);

-- Topping Groups
ALTER TABLE topping_groups ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_topping_groups_tenant ON topping_groups(tenant_id);

-- Branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);

-- Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);

-- Customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

-- Printers
ALTER TABLE printers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_printers_tenant ON printers(tenant_id);

-- Users (admin users per tenant)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

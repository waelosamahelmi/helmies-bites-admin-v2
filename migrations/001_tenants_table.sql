-- Tenants Table
-- Multi-tenant support for Helmies Bites

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  
  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
  
  -- Features (JSON)
  features JSONB DEFAULT '{
    "cashOnDelivery": true,
    "aiAssistant": false,
    "delivery": true,
    "pickup": true,
    "lunch": false,
    "multiBranch": false
  }'::jsonb,
  
  -- Billing
  helmies_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
  monthly_fee DECIMAL(10,2) DEFAULT 0.00,
  
  -- Stripe Connect (tenant's own Stripe account)
  stripe_account_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  
  -- Contact
  owner_email VARCHAR(255),
  owner_phone VARCHAR(50),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded_at TIMESTAMPTZ,
  
  -- Wizard session (for onboarding)
  wizard_session_id UUID
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

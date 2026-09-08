-- ==============================================================================
-- NearDrop Migration: PayTR Orders & Payments Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY, -- merchant_oid (ND_...)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('pro', 'ultra', 'enterprise')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TL',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    paytr_token TEXT,
    error_message TEXT,
    raw_callback JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user order lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on payments" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

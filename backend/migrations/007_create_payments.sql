CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    reference_id TEXT,
    funds_locked BOOLEAN NOT NULL DEFAULT false,
    ready_for_release BOOLEAN NOT NULL DEFAULT false,
    released BOOLEAN NOT NULL DEFAULT false,
    refund_pending BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id)
);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);

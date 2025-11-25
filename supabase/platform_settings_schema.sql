-- Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    auto_approve_withdrawals BOOLEAN DEFAULT FALSE,
    min_withdrawal_amount DECIMAL(10, 2) DEFAULT 25.00,
    max_withdrawal_amount DECIMAL(10, 2) DEFAULT 10000.00,
    withdrawal_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT
);

-- Insert default settings
INSERT INTO platform_settings (id, auto_approve_withdrawals, min_withdrawal_amount, max_withdrawal_amount)
VALUES ('default', FALSE, 25.00, 10000.00)
ON CONFLICT (id) DO NOTHING;

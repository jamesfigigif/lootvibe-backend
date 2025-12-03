/**
 * WithdrawalLimits - Enforces withdrawal limits per user
 *
 * Features:
 * - Daily and monthly withdrawal limits
 * - VIP tier-based limits
 * - Automatic limit resets
 * - Limit override for special cases
 * - Comprehensive tracking and reporting
 */
class WithdrawalLimits {
    constructor(supabase, options = {}) {
        this.supabase = supabase;

        // Default limits (USD)
        this.defaultLimits = {
            daily: options.dailyLimit || 10000,      // $10,000
            monthly: options.monthlyLimit || 100000   // $100,000
        };

        // VIP tier multipliers
        this.vipMultipliers = {
            'bronze': 1.5,    // 1.5x limits
            'silver': 2.0,    // 2x limits
            'gold': 3.0,      // 3x limits
            'platinum': 5.0,  // 5x limits
            'diamond': 10.0   // 10x limits
        };

        console.log('💳 WithdrawalLimits initialized');
        console.log(`   Default Daily Limit: $${this.defaultLimits.daily.toLocaleString()}`);
        console.log(`   Default Monthly Limit: $${this.defaultLimits.monthly.toLocaleString()}`);
    }

    /**
     * Check if user can withdraw specified amount
     */
    async checkWithdrawalLimit(userId, amount) {
        try {
            // Get or create user limits
            const limits = await this.getUserLimits(userId);

            // Check daily limit
            if (limits.daily_withdrawn + amount > limits.daily_limit) {
                const remaining = Math.max(0, limits.daily_limit - limits.daily_withdrawn);
                return {
                    allowed: false,
                    reason: 'DAILY_LIMIT_EXCEEDED',
                    message: `Daily withdrawal limit exceeded. Limit: $${limits.daily_limit}, Already withdrawn: $${limits.daily_withdrawn}, Remaining: $${remaining.toFixed(2)}`,
                    limit: limits.daily_limit,
                    withdrawn: limits.daily_withdrawn,
                    remaining,
                    resetTime: this.getNextDailyReset()
                };
            }

            // Check monthly limit
            if (limits.monthly_withdrawn + amount > limits.monthly_limit) {
                const remaining = Math.max(0, limits.monthly_limit - limits.monthly_withdrawn);
                return {
                    allowed: false,
                    reason: 'MONTHLY_LIMIT_EXCEEDED',
                    message: `Monthly withdrawal limit exceeded. Limit: $${limits.monthly_limit}, Already withdrawn: $${limits.monthly_withdrawn}, Remaining: $${remaining.toFixed(2)}`,
                    limit: limits.monthly_limit,
                    withdrawn: limits.monthly_withdrawn,
                    remaining,
                    resetTime: this.getNextMonthlyReset()
                };
            }

            // All checks passed
            return {
                allowed: true,
                dailyRemaining: limits.daily_limit - limits.daily_withdrawn - amount,
                monthlyRemaining: limits.monthly_limit - limits.monthly_withdrawn - amount
            };

        } catch (err) {
            console.error('Error checking withdrawal limits:', err);
            // Fail closed - deny withdrawal if we can't check limits
            return {
                allowed: false,
                reason: 'SYSTEM_ERROR',
                message: 'Unable to verify withdrawal limits. Please try again later.'
            };
        }
    }

    /**
     * Record a withdrawal against user's limits
     */
    async recordWithdrawal(userId, amount) {
        try {
            const limits = await this.getUserLimits(userId);

            // Update withdrawn amounts
            const { error } = await this.supabase
                .from('withdrawal_limits')
                .update({
                    daily_withdrawn: limits.daily_withdrawn + amount,
                    monthly_withdrawn: limits.monthly_withdrawn + amount,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error recording withdrawal:', error);
                return false;
            }

            console.log(`📝 Recorded $${amount} withdrawal for user ${userId}`);
            return true;

        } catch (err) {
            console.error('Error recording withdrawal:', err);
            return false;
        }
    }

    /**
     * Refund a withdrawal (if cancelled/failed)
     */
    async refundWithdrawal(userId, amount) {
        try {
            const limits = await this.getUserLimits(userId);

            // Decrease withdrawn amounts
            const { error } = await this.supabase
                .from('withdrawal_limits')
                .update({
                    daily_withdrawn: Math.max(0, limits.daily_withdrawn - amount),
                    monthly_withdrawn: Math.max(0, limits.monthly_withdrawn - amount),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error refunding withdrawal:', error);
                return false;
            }

            console.log(`💸 Refunded $${amount} to withdrawal limits for user ${userId}`);
            return true;

        } catch (err) {
            console.error('Error refunding withdrawal:', err);
            return false;
        }
    }

    /**
     * Get user's current limits
     */
    async getUserLimits(userId) {
        try {
            // Try to fetch existing limits
            const { data, error } = await this.supabase
                .from('withdrawal_limits')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (data) {
                // Check if limits need reset
                const needsReset = await this.checkAndResetLimits(data);
                if (needsReset) {
                    return await this.getUserLimits(userId); // Fetch again after reset
                }
                return data;
            }

            // No limits found, create default
            return await this.createDefaultLimits(userId);

        } catch (err) {
            console.error('Error fetching user limits:', err);
            // Return default limits if we can't fetch from DB
            return this.getDefaultLimitsObject(userId);
        }
    }

    /**
     * Create default limits for new user
     */
    async createDefaultLimits(userId) {
        try {
            // Get user's VIP tier
            const vipTier = await this.getUserVIPTier(userId);
            const multiplier = this.vipMultipliers[vipTier] || 1.0;

            const limits = {
                user_id: userId,
                daily_limit: this.defaultLimits.daily * multiplier,
                monthly_limit: this.defaultLimits.monthly * multiplier,
                daily_withdrawn: 0,
                monthly_withdrawn: 0,
                last_daily_reset: new Date().toISOString(),
                last_monthly_reset: new Date().toISOString(),
                vip_tier: vipTier
            };

            const { data, error } = await this.supabase
                .from('withdrawal_limits')
                .insert(limits)
                .select()
                .single();

            if (error) {
                console.error('Error creating limits:', error);
                return this.getDefaultLimitsObject(userId);
            }

            console.log(`✨ Created withdrawal limits for user ${userId} (${vipTier} tier)`);
            return data;

        } catch (err) {
            console.error('Error creating default limits:', err);
            return this.getDefaultLimitsObject(userId);
        }
    }

    /**
     * Check if limits need reset and reset if necessary
     */
    async checkAndResetLimits(limits) {
        const now = new Date();
        let needsUpdate = false;
        const updates = {};

        // Check daily reset (if it's a new day)
        const lastDailyReset = new Date(limits.last_daily_reset);
        if (!this.isSameDay(now, lastDailyReset)) {
            updates.daily_withdrawn = 0;
            updates.last_daily_reset = now.toISOString();
            needsUpdate = true;
            console.log(`🔄 Resetting daily withdrawal limit for user ${limits.user_id}`);
        }

        // Check monthly reset (if it's a new month)
        const lastMonthlyReset = new Date(limits.last_monthly_reset);
        if (!this.isSameMonth(now, lastMonthlyReset)) {
            updates.monthly_withdrawn = 0;
            updates.last_monthly_reset = now.toISOString();
            needsUpdate = true;
            console.log(`🔄 Resetting monthly withdrawal limit for user ${limits.user_id}`);
        }

        // Perform update if needed
        if (needsUpdate) {
            await this.supabase
                .from('withdrawal_limits')
                .update(updates)
                .eq('user_id', limits.user_id);
        }

        return needsUpdate;
    }

    /**
     * Check if two dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getUTCFullYear() === date2.getUTCFullYear() &&
               date1.getUTCMonth() === date2.getUTCMonth() &&
               date1.getUTCDate() === date2.getUTCDate();
    }

    /**
     * Check if two dates are in the same month
     */
    isSameMonth(date1, date2) {
        return date1.getUTCFullYear() === date2.getUTCFullYear() &&
               date1.getUTCMonth() === date2.getUTCMonth();
    }

    /**
     * Get user's VIP tier
     */
    async getUserVIPTier(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('vip_tier')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return null;
            }

            return data.vip_tier || null;

        } catch (err) {
            return null;
        }
    }

    /**
     * Get default limits object (fallback)
     */
    getDefaultLimitsObject(userId) {
        return {
            user_id: userId,
            daily_limit: this.defaultLimits.daily,
            monthly_limit: this.defaultLimits.monthly,
            daily_withdrawn: 0,
            monthly_withdrawn: 0,
            last_daily_reset: new Date().toISOString(),
            last_monthly_reset: new Date().toISOString(),
            vip_tier: null
        };
    }

    /**
     * Get time until next daily reset
     */
    getNextDailyReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        return tomorrow.toISOString();
    }

    /**
     * Get time until next monthly reset
     */
    getNextMonthlyReset() {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
        nextMonth.setUTCDate(1);
        nextMonth.setUTCHours(0, 0, 0, 0);
        return nextMonth.toISOString();
    }

    /**
     * Update user's VIP tier and recalculate limits
     */
    async updateVIPTier(userId, newTier) {
        try {
            const multiplier = this.vipMultipliers[newTier] || 1.0;

            const { error } = await this.supabase
                .from('withdrawal_limits')
                .update({
                    daily_limit: this.defaultLimits.daily * multiplier,
                    monthly_limit: this.defaultLimits.monthly * multiplier,
                    vip_tier: newTier,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating VIP tier:', error);
                return false;
            }

            console.log(`⭐ Updated VIP tier for user ${userId} to ${newTier}`);
            return true;

        } catch (err) {
            console.error('Error updating VIP tier:', err);
            return false;
        }
    }

    /**
     * Override limits for a specific user (admin function)
     */
    async setCustomLimits(userId, dailyLimit, monthlyLimit) {
        try {
            const { error } = await this.supabase
                .from('withdrawal_limits')
                .upsert({
                    user_id: userId,
                    daily_limit: dailyLimit,
                    monthly_limit: monthlyLimit,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error setting custom limits:', error);
                return false;
            }

            console.log(`🔧 Set custom limits for user ${userId}: Daily=$${dailyLimit}, Monthly=$${monthlyLimit}`);
            return true;

        } catch (err) {
            console.error('Error setting custom limits:', err);
            return false;
        }
    }

    /**
     * Get limits summary for admin dashboard
     */
    async getLimitsSummary(userId) {
        const limits = await this.getUserLimits(userId);

        return {
            userId: limits.user_id,
            vipTier: limits.vip_tier || 'standard',
            daily: {
                limit: limits.daily_limit,
                withdrawn: limits.daily_withdrawn,
                remaining: Math.max(0, limits.daily_limit - limits.daily_withdrawn),
                percentage: (limits.daily_withdrawn / limits.daily_limit * 100).toFixed(1)
            },
            monthly: {
                limit: limits.monthly_limit,
                withdrawn: limits.monthly_withdrawn,
                remaining: Math.max(0, limits.monthly_limit - limits.monthly_withdrawn),
                percentage: (limits.monthly_withdrawn / limits.monthly_limit * 100).toFixed(1)
            },
            resetTimes: {
                daily: this.getNextDailyReset(),
                monthly: this.getNextMonthlyReset()
            }
        };
    }
}

module.exports = WithdrawalLimits;

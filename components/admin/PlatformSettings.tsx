import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Shield, DollarSign, Bitcoin, AlertTriangle } from 'lucide-react';

interface PlatformSettingsProps {
    token: string;
}

export const PlatformSettings: React.FC<PlatformSettingsProps> = ({ token }) => {
    const [settings, setSettings] = useState({
        min_btc_deposit: '0.0001',
        min_eth_deposit: '0.01',
        btc_confirmations: '3',
        eth_confirmations: '12',
        platform_fee: '5',
        maintenance_mode: false,
        kyc_required: false,
        auto_approve_withdrawals: false,
        max_withdrawal: '10000',
        support_email: 'support@lootvibe.com'
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage('');

            // Save settings logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
                <p className="text-slate-400">Configure platform parameters and limits</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('success')
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                {/* Crypto Settings */}
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Bitcoin className="w-6 h-6 text-orange-400" />
                        <h2 className="text-xl font-bold text-white">Cryptocurrency Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Minimum BTC Deposit
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={settings.min_btc_deposit}
                                onChange={(e) => setSettings({ ...settings, min_btc_deposit: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Minimum ETH Deposit
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.min_eth_deposit}
                                onChange={(e) => setSettings({ ...settings, min_eth_deposit: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                BTC Required Confirmations
                            </label>
                            <input
                                type="number"
                                value={settings.btc_confirmations}
                                onChange={(e) => setSettings({ ...settings, btc_confirmations: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                ETH Required Confirmations
                            </label>
                            <input
                                type="number"
                                value={settings.eth_confirmations}
                                onChange={(e) => setSettings({ ...settings, eth_confirmations: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="w-6 h-6 text-green-400" />
                        <h2 className="text-xl font-bold text-white">Financial Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Platform Fee (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.platform_fee}
                                onChange={(e) => setSettings({ ...settings, platform_fee: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Max Withdrawal ($)
                            </label>
                            <input
                                type="number"
                                value={settings.max_withdrawal}
                                onChange={(e) => setSettings({ ...settings, max_withdrawal: e.target.value })}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Security & Compliance */}
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Security & Compliance</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.kyc_required}
                                onChange={(e) => setSettings({ ...settings, kyc_required: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10"
                            />
                            <div>
                                <div className="text-white font-bold">Require KYC Verification</div>
                                <div className="text-sm text-slate-400">Users must verify identity before deposits</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.auto_approve_withdrawals}
                                onChange={(e) => setSettings({ ...settings, auto_approve_withdrawals: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10"
                            />
                            <div>
                                <div className="text-white font-bold">Auto-Approve Withdrawals</div>
                                <div className="text-sm text-slate-400">Automatically approve withdrawal requests without manual review</div>
                            </div>
                        </label>
                        {settings.auto_approve_withdrawals && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ Warning: Auto-approved withdrawals will be processed immediately without admin review.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-xl font-bold text-white">Maintenance Mode</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenance_mode}
                                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10"
                            />
                            <div>
                                <div className="text-white font-bold">Enable Maintenance Mode</div>
                                <div className="text-sm text-slate-400">Platform will be inaccessible to users</div>
                            </div>
                        </label>
                        {settings.maintenance_mode && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ Warning: Enabling maintenance mode will prevent users from accessing the platform.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* General */}
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <SettingsIcon className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">General</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Support Email
                        </label>
                        <input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                            className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

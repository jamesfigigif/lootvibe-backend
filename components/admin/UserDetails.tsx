import React, { useState, useEffect } from 'react';
import { X, DollarSign, Package, TruckIcon, ArrowLeft, Edit, Ban, UserCheck } from 'lucide-react';

interface UserDetailsProps {
    userId: string;
    token: string;
    onBack: () => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ userId, token, onBack }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBalanceAdjust, setShowBalanceAdjust] = useState(false);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBalanceAdjustment = async () => {
        if (!adjustAmount || !adjustReason) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/balance`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(adjustAmount),
                    reason: adjustReason
                })
            });

            if (response.ok) {
                setShowBalanceAdjust(false);
                setAdjustAmount('');
                setAdjustReason('');
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Error adjusting balance:', error);
        }
    };

    const handleBanToggle = async () => {
        const isBanning = !user.user.banned;

        if (isBanning && !banReason) {
            return; // Require reason for banning
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/ban`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    banned: isBanning,
                    reason: isBanning ? banReason : undefined
                })
            });

            if (response.ok) {
                setShowBanModal(false);
                setBanReason('');
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Error toggling ban status:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="text-slate-400">Loading user details...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8">
                <div className="text-slate-400">User not found</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-[#131b2e] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white mb-1">{user.user.username}</h1>
                            {user.user.banned && (
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg">
                                    BANNED
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 font-mono text-sm">{user.user.id}</p>
                        {user.user.banned && user.user.banned_reason && (
                            <p className="text-red-400 text-sm mt-1">
                                Reason: {user.user.banned_reason}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => user.user.banned ? handleBanToggle() : setShowBanModal(true)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                        user.user.banned
                            ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                    }`}
                >
                    {user.user.banned ? (
                        <>
                            <UserCheck className="w-4 h-4" />
                            Unban User
                        </>
                    ) : (
                        <>
                            <Ban className="w-4 h-4" />
                            Ban User
                        </>
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <button
                            onClick={() => setShowBalanceAdjust(true)}
                            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">${parseFloat(user.user.balance).toFixed(2)}</div>
                    <div className="text-sm text-slate-400">Balance</div>
                </div>

                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{user.inventory?.length || 0}</div>
                    <div className="text-sm text-slate-400">Inventory Items</div>
                </div>

                <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                        <TruckIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{user.shipments?.length || 0}</div>
                    <div className="text-sm text-slate-400">Shipments</div>
                </div>
            </div>

            {/* Balance Adjustment Modal */}
            {showBalanceAdjust && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#131b2e] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Adjust Balance</h2>
                            <button
                                onClick={() => setShowBalanceAdjust(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Amount (use negative to deduct)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="100.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Reason
                                </label>
                                <textarea
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="Reason for adjustment..."
                                />
                            </div>

                            <button
                                onClick={handleBalanceAdjustment}
                                disabled={!adjustAmount || !adjustReason}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            {showBanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#131b2e] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Ban User</h2>
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">
                                    This will prevent the user from accessing the platform. Please provide a reason for the ban.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Reason for Ban
                                </label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="e.g., Violation of terms of service, fraudulent activity..."
                                />
                            </div>

                            <button
                                onClick={handleBanToggle}
                                disabled={!banReason}
                                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Ban User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
                <div className="space-y-3">
                    {user.transactions?.slice(0, 10).map((tx: any) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0b0f19] rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-white">{tx.description}</div>
                                <div className="text-xs text-slate-400">
                                    {new Date(tx.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <div className={`font-bold ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </div>
                        </div>
                    )) || <div className="text-slate-400 text-center py-4">No transactions</div>}
                </div>
            </div>
        </div>
    );
};

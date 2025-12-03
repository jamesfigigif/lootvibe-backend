import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, Users, DollarSign, Package, TrendingUp, Shield, Settings, FileText, LogOut, Search, Ban, CheckCircle, XCircle, Eye, Edit, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const { user: clerkUser, isLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'deposits' | 'shipments' | 'withdrawals' | 'transactions' | 'logs' | 'settings'>('dashboard');

    // Data states
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [shipments, setShipments] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        checkAdminStatus();
    }, [isLoaded, clerkUser]);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, activeTab]);

    const checkAdminStatus = async () => {
        if (!isLoaded) return;

        if (!clerkUser) {
            setLoading(false);
            return;
        }

        try {
            // Check if user has admin role in public.users table
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', clerkUser.id)
                .single();

            if (error) {
                console.error('Error checking admin status:', error);
                // If column doesn't exist, this will error. We'll handle that.
                if (error.message?.includes('column "role" does not exist')) {
                    setError('Database schema out of date. Please run the admin migration.');
                }
                setLoading(false);
                return;
            }

            if (data?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (err) {
            console.error('Admin check error:', err);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setError(null);

            switch (activeTab) {
                case 'dashboard':
                    await fetchDashboardStats();
                    break;
                case 'users':
                    const { data: usersData, error: usersError } = await supabase
                        .from('users')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (usersError) throw usersError;
                    setUsers(usersData || []);
                    break;
                case 'deposits':
                    const { data: depositsData, error: depositsError } = await supabase
                        .from('transactions')
                        .select('*, users(username)')
                        .eq('type', 'DEPOSIT')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (depositsError) throw depositsError;
                    setDeposits(depositsData || []);
                    break;
                case 'shipments':
                    const { data: shipmentsData, error: shipmentsError } = await supabase
                        .from('shipments')
                        .select('*, users(username)')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (shipmentsError) throw shipmentsError;
                    setShipments(shipmentsData || []);
                    break;
                case 'withdrawals':
                    const { data: withdrawalsData, error: withdrawalsError } = await supabase
                        .from('transactions')
                        .select('*, users(username)')
                        .eq('type', 'WITHDRAWAL')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (withdrawalsError) throw withdrawalsError;
                    setWithdrawals(withdrawalsData || []);
                    break;
                case 'transactions':
                    const { data: txData, error: txError } = await supabase
                        .from('transactions')
                        .select('*, users(username)')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (txError) throw txError;
                    setTransactions(txData || []);
                    break;
            }
        } catch (err: any) {
            console.error('Fetch data error:', err);
            setError(err.message || 'Failed to fetch data');
        }
    };

    const fetchDashboardStats = async () => {
        // Parallelize these queries for speed
        const [
            { count: userCount },
            { count: boxCount },
            { count: battleCount },
            { data: revenueData }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('boxes').select('*', { count: 'exact', head: true }),
            supabase.from('battles').select('*', { count: 'exact', head: true }),
            supabase.from('transactions').select('amount').eq('type', 'DEPOSIT')
        ]);

        const totalRevenue = revenueData?.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0) || 0;

        setStats({
            users: { total: userCount || 0 },
            boxes: { total: boxCount || 0 },
            battles: { total: battleCount || 0 },
            revenue: { allTime: totalRevenue }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] text-white p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Verifying admin privileges...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0b0f19] text-white p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-[#131b2e] rounded-2xl border border-white/5 p-8 text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                    <p className="text-slate-400 mb-6">You do not have permission to view this area.</p>

                    {error && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-left">
                            <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span>System Notice</span>
                            </div>
                            <p className="text-yellow-200/80 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="text-xs text-slate-500 mb-4">
                        User ID: {clerkUser?.id}
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-white">
            {/* Header */}
            <div className="bg-[#131b2e] border-b border-white/5 p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Shield className="w-6 h-6 text-purple-500" />
                            Admin Panel
                        </h1>
                        <p className="text-slate-400 text-sm">Logged in as {clerkUser?.fullName || clerkUser?.username}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                        { id: 'users', label: 'Users', icon: Users },
                        { id: 'deposits', label: 'Deposits', icon: DollarSign },
                        { id: 'shipments', label: 'Shipments', icon: Package },
                        { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign },
                        { id: 'transactions', label: 'Transactions', icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-[#131b2e] text-slate-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-[#131b2e] rounded-xl border border-white/5 p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400">
                            {error}
                        </div>
                    )}

                    {activeTab === 'dashboard' && stats && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Dashboard Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#0b0f19] rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Total Users</p>
                                    <p className="text-2xl font-bold">{stats.users?.total || 0}</p>
                                </div>
                                <div className="bg-[#0b0f19] rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-400">${(stats.revenue?.allTime || 0).toFixed(2)}</p>
                                </div>
                                <div className="bg-[#0b0f19] rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Total Boxes</p>
                                    <p className="text-2xl font-bold">{stats.boxes?.total || 0}</p>
                                </div>
                                <div className="bg-[#0b0f19] rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Total Battles</p>
                                    <p className="text-2xl font-bold">{stats.battles?.total || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">Recent Users</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-3 text-slate-400">ID</th>
                                            <th className="text-left p-3 text-slate-400">Username</th>
                                            <th className="text-left p-3 text-slate-400">Balance</th>
                                            <th className="text-left p-3 text-slate-400">Role</th>
                                            <th className="text-left p-3 text-slate-400">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-white/5">
                                                <td className="p-3 font-mono text-xs">{user.id.substring(0, 8)}...</td>
                                                <td className="p-3">{user.username}</td>
                                                <td className="p-3">${parseFloat(user.balance || 0).toFixed(2)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-400 text-sm">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Other tabs can be implemented similarly using the fetched data */}
                    {(activeTab === 'deposits' || activeTab === 'withdrawals' || activeTab === 'transactions') && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-3 text-slate-400">ID</th>
                                            <th className="text-left p-3 text-slate-400">User</th>
                                            <th className="text-left p-3 text-slate-400">Amount</th>
                                            <th className="text-left p-3 text-slate-400">Type</th>
                                            <th className="text-left p-3 text-slate-400">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeTab === 'deposits' ? deposits : activeTab === 'withdrawals' ? withdrawals : transactions).map((item) => (
                                            <tr key={item.id} className="border-b border-white/5">
                                                <td className="p-3 font-mono text-xs">{item.id.substring(0, 8)}...</td>
                                                <td className="p-3 text-sm">{item.users?.username || item.user_id.substring(0, 8)}</td>
                                                <td className="p-3 font-bold">${parseFloat(item.amount || 0).toFixed(2)}</td>
                                                <td className="p-3 text-sm text-slate-400">{item.type}</td>
                                                <td className="p-3 text-slate-400 text-sm">
                                                    {new Date(item.created_at || item.timestamp).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

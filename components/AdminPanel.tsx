import React, { useState, useEffect } from 'react';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserManagement } from './admin/UserManagement';
import { UserDetails } from './admin/UserDetails';
import { ActivityLogs } from './admin/ActivityLogs';
import { BoxManagement } from './admin/BoxManagement';
import { BoxForm } from './admin/BoxForm';
import { BoxStats } from './admin/BoxStats';
import { DepositManagement } from './admin/DepositManagement';
import { ShipmentManagement } from './admin/ShipmentManagement';
import { Analytics } from './admin/Analytics';
import { PlatformSettings } from './admin/PlatformSettings';
import { TransactionMonitoring } from './admin/TransactionMonitoring';
import { TwoFactorAuth } from './admin/TwoFactorAuth';
import { AdminUserManagement } from './admin/AdminUserManagement';
import { Home, Users, Package, TruckIcon, Settings, LogOut, Shield, FileText, Box, BarChart3, Coins, Receipt, Key, UserCog } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminUser, setAdminUser] = useState<any>(null);
    const [token, setToken] = useState<string>('');
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
    const [stats, setStats] = useState({
        userCount: 0,
        pendingDeposits: 0,
        pendingShipments: 0,
        todayRevenue: 0
    });

    const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

    // Check for existing session
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminUser');

        if (storedToken && storedAdmin) {
            setToken(storedToken);
            setAdminUser(JSON.parse(storedAdmin));
            setIsAuthenticated(true);
        }
    }, []);

    // Fetch stats when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchStats();
        }
    }, [isAuthenticated, token]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogin = (newToken: string, admin: any) => {
        setToken(newToken);
        setAdminUser(admin);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken('');
        setAdminUser(null);
        setIsAuthenticated(false);
        setCurrentPage('dashboard');
    };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#131b2e] border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-white">Admin Panel</div>
                            <div className="text-xs text-slate-400">LootVibe</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setCurrentPage('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'dashboard'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'users'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Users</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('deposits')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'deposits'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">Deposits</span>
                        {stats.pendingDeposits > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {stats.pendingDeposits}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setCurrentPage('shipments')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'shipments'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <TruckIcon className="w-5 h-5" />
                        <span className="font-medium">Shipments</span>
                        {stats.pendingShipments > 0 && (
                            <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {stats.pendingShipments}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setCurrentPage('boxes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'boxes' || currentPage === 'box-create' || currentPage === 'box-edit' || currentPage === 'box-stats'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Box className="w-5 h-5" />
                        <span className="font-medium">Boxes</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('transactions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'transactions'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Receipt className="w-5 h-5" />
                        <span className="font-medium">Transactions</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'analytics'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Analytics</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('logs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'logs'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Activity Logs</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('admins')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'admins'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <UserCog className="w-5 h-5" />
                        <span className="font-medium">Admin Users</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('2fa')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === '2fa'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Key className="w-5 h-5" />
                        <span className="font-medium">2FA Settings</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'settings'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </button>
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{adminUser?.email?.[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{adminUser?.email}</div>
                            <div className="text-xs text-slate-400">{adminUser?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {currentPage === 'dashboard' && (
                    <AdminDashboard stats={stats} onNavigate={setCurrentPage} />
                )}
                {currentPage === 'users' && !selectedUserId && (
                    <UserManagement
                        token={token}
                        onViewUser={(userId) => {
                            setSelectedUserId(userId);
                            setCurrentPage('user-details');
                        }}
                    />
                )}
                {currentPage === 'user-details' && selectedUserId && (
                    <UserDetails
                        userId={selectedUserId}
                        token={token}
                        onBack={() => {
                            setSelectedUserId(null);
                            setCurrentPage('users');
                        }}
                    />
                )}
                {currentPage === 'deposits' && (
                    <DepositManagement token={token} />
                )}
                {currentPage === 'shipments' && (
                    <ShipmentManagement token={token} />
                )}
                {currentPage === 'boxes' && (
                    <BoxManagement
                        token={token}
                        onCreateBox={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('box-create');
                        }}
                        onEditBox={(boxId) => {
                            setSelectedBoxId(boxId);
                            setCurrentPage('box-edit');
                        }}
                        onViewStats={(boxId) => {
                            setSelectedBoxId(boxId);
                            setCurrentPage('box-stats');
                        }}
                    />
                )}
                {currentPage === 'box-create' && (
                    <BoxForm
                        token={token}
                        onBack={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('boxes');
                        }}
                        onSuccess={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('boxes');
                        }}
                    />
                )}
                {currentPage === 'box-edit' && selectedBoxId && (
                    <BoxForm
                        token={token}
                        boxId={selectedBoxId}
                        onBack={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('boxes');
                        }}
                        onSuccess={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('boxes');
                        }}
                    />
                )}
                {currentPage === 'box-stats' && selectedBoxId && (
                    <BoxStats
                        token={token}
                        boxId={selectedBoxId}
                        onBack={() => {
                            setSelectedBoxId(null);
                            setCurrentPage('boxes');
                        }}
                    />
                )}
                {currentPage === 'transactions' && (
                    <TransactionMonitoring token={token} />
                )}
                {currentPage === 'analytics' && (
                    <Analytics token={token} />
                )}
                {currentPage === 'logs' && (
                    <ActivityLogs token={token} />
                )}
                {currentPage === 'admins' && (
                    <AdminUserManagement token={token} />
                )}
                {currentPage === '2fa' && (
                    <TwoFactorAuth token={token} adminUser={adminUser} />
                )}
                {currentPage === 'settings' && (
                    <PlatformSettings token={token} />
                )}
            </div>
        </div>
    );
};

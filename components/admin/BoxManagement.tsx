import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, BarChart3, Eye, Power, Trash2, Filter, Package } from 'lucide-react';

interface Box {
    id: string;
    name: string;
    description: string;
    price: number;
    sale_price?: number;
    image: string;
    color: string;
    category: string;
    tags?: string[];
    items: any[];
    enabled: boolean;
    created_at: string;
}

interface BoxManagementProps {
    token: string;
    onCreateBox: () => void;
    onEditBox: (boxId: string) => void;
    onViewStats: (boxId: string) => void;
}

export const BoxManagement: React.FC<BoxManagementProps> = ({ token, onCreateBox, onEditBox, onViewStats }) => {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [enabledFilter, setEnabledFilter] = useState<string>('');

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    const categories = ['ALL', 'STREETWEAR', 'TECH', 'POKEMON', 'GIFT_CARDS', 'GAME_CODES', 'FOOD', 'SUBSCRIPTIONS', 'CRYPTO'];

    useEffect(() => {
        fetchBoxes();
    }, [page, search, categoryFilter, enabledFilter]);

    const fetchBoxes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search
            });

            if (categoryFilter) params.append('category', categoryFilter);
            if (enabledFilter) params.append('enabled', enabledFilter);

            const response = await fetch(`${BACKEND_URL}/api/admin/boxes?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBoxes(data.boxes);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching boxes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEnabled = async (boxId: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/boxes/${boxId}/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchBoxes();
            }
        } catch (error) {
            console.error('Error toggling box:', error);
        }
    };

    const handleDeleteBox = async (boxId: string, boxName: string) => {
        if (!confirm(`Are you sure you want to delete "${boxName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/boxes/${boxId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchBoxes();
            }
        } catch (error) {
            console.error('Error deleting box:', error);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Box Management</h1>
                    <p className="text-slate-400">Create and manage loot boxes</p>
                </div>
                <button
                    onClick={onCreateBox}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create Box
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-[#131b2e] border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-bold text-white">Search & Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by name or ID..."
                            className="w-full bg-[#0b0f19] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={enabledFilter}
                            onChange={(e) => {
                                setEnabledFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-[#0b0f19] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="true">Enabled Only</option>
                            <option value="false">Disabled Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Boxes Grid */}
            <div className="bg-[#131b2e] border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        Loading boxes...
                    </div>
                ) : boxes.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No boxes found</p>
                        <button
                            onClick={onCreateBox}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Create Your First Box
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className={`bg-[#0b0f19] border rounded-xl overflow-hidden transition-all ${
                                    box.enabled ? 'border-white/10 hover:border-purple-500/50' : 'border-red-500/30 opacity-60'
                                }`}
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Box Image */}
                                    <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${box.color} flex items-center justify-center flex-shrink-0`}>
                                        {box.image ? (
                                            <img src={box.image} alt={box.name} className="w-16 h-16 object-contain" />
                                        ) : (
                                            <Package className="w-12 h-12 text-white" />
                                        )}
                                    </div>

                                    {/* Box Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-white truncate">{box.name}</h3>
                                                <p className="text-sm text-slate-400 truncate">{box.description || 'No description'}</p>
                                            </div>
                                            {!box.enabled && (
                                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                    DISABLED
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 mb-3 text-sm">
                                            <div>
                                                <span className="text-slate-400">Price: </span>
                                                <span className="text-white font-bold">
                                                    ${box.price.toFixed(2)}
                                                    {box.sale_price && (
                                                        <span className="ml-2 text-green-400">${box.sale_price.toFixed(2)}</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Items: </span>
                                                <span className="text-white font-bold">{box.items?.length || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                                                {box.category}
                                            </span>
                                            {box.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t border-white/10 p-3 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onViewStats(box.id)}
                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                        title="View Statistics"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEditBox(box.id)}
                                        className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                                        title="Edit Box"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleEnabled(box.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            box.enabled
                                                ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                                : 'bg-slate-600/20 hover:bg-slate-600/30 text-slate-400'
                                        }`}
                                        title={box.enabled ? 'Disable Box' : 'Enable Box'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBox(box.id, box.name)}
                                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                        title="Delete Box"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-[#0b0f19] border border-white/10 rounded-lg text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-[#0b0f19] border border-white/10 rounded-lg text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

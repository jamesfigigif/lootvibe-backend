import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Gift, TrendingUp, BarChart3, CreditCard, Copy, CheckCircle2, Shield, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { User, AffiliateStats } from '../types';
import { getAffiliateStats, generateAffiliateCode, claimAffiliateEarnings } from '../services/affiliateService';

interface AffiliatesPageProps {
    user: User | null;
    onBack: () => void;
}

const TIERS = [
    { name: 'BRONZE', rate: '2%', color: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/20', min: 0 },
    { name: 'SILVER', rate: '3%', color: 'text-slate-300', bg: 'bg-slate-400', border: 'border-slate-400/20', min: 1000 },
    { name: 'GOLD', rate: '4%', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/20', min: 5000 },
    { name: 'PLATINUM', rate: '5%', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/20', min: 25000 },
    { name: 'DIAMOND', rate: '7%', color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/20', min: 100000 },
    { name: 'LEGEND', rate: '10%', color: 'text-red-500', bg: 'bg-red-600', border: 'border-red-600/20', min: 500000 },
];

export const AffiliatesPage: React.FC<AffiliatesPageProps> = ({ user, onBack }) => {
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            loadStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadStats = async () => {
        if (!user) return;
        try {
            const data = await getAffiliateStats(user.id);
            setStats(data);
        } catch (error) {
            console.error('Failed to load affiliate stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        if (!user) return;
        setGenerating(true);
        try {
            await generateAffiliateCode(user.id);
            await loadStats();
        } catch (error) {
            console.error('Failed to generate code:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleClaimEarnings = async () => {
        if (!user || !stats || stats.unclaimedEarnings <= 0) return;
        setClaiming(true);
        try {
            await claimAffiliateEarnings(user.id);
            await loadStats();
            // Show success message or toast here
        } catch (error) {
            console.error('Failed to claim earnings:', error);
        } finally {
            setClaiming(false);
        }
    };

    const copyLink = () => {
        if (!stats?.code) return;
        const link = `lootlegend.com/r/${stats.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f19] text-white">

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-white/5 pt-32 pb-24">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[#0d121f]">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
                                <DollarSign className="w-3 h-3" /> Partner Program
                            </div>

                            <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.9] mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                                EARN <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">PASSIVE</span> <br />
                                INCOME
                            </h1>

                            <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                                The most rewarding affiliate system in gaming.
                                Refer friends, earn up to <span className="text-white font-bold">10% commission</span> on every wager, plus <span className="text-emerald-400 font-bold">$5 bonus</span> for every referral who deposits $25+.
                            </p>

                            {user ? (
                                stats?.code ? (
                                    <div className="bg-[#131b2e] rounded-2xl p-2 border border-white/10 flex items-center max-w-md shadow-[0_0_40px_rgba(168,85,247,0.15)] animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                                        <div className="bg-[#0b0f19] px-6 py-4 rounded-xl text-slate-400 font-mono text-sm flex-1 truncate border border-white/5">
                                            lootlegend.com/r/<span className="text-white font-bold">{stats.code}</span>
                                        </div>
                                        <button
                                            onClick={copyLink}
                                            className="ml-2 bg-white hover:bg-slate-200 text-black px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                                        >
                                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'COPIED' : 'COPY'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleGenerateCode}
                                        disabled={generating}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-900/50 transition-all flex items-center gap-2"
                                    >
                                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                        ACTIVATE AFFILIATE ACCOUNT
                                    </button>
                                )
                            ) : (
                                <div className="bg-[#131b2e] p-4 rounded-xl border border-white/10 inline-block text-slate-400 text-sm">
                                    Please sign in to access your affiliate dashboard.
                                </div>
                            )}
                        </div>

                        <div className="relative animate-in zoom-in duration-1000 delay-200">
                            {/* 3D Card Effect */}
                            <div className="relative z-10 bg-gradient-to-br from-[#1a2336] to-[#0b0f19] rounded-[2rem] p-1 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]">
                                <div className="bg-[#131b2e]/50 backdrop-blur rounded-[1.8rem] p-8 md:p-10 border border-white/5">
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Unclaimed Earnings</div>
                                            <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                                                ${stats?.unclaimedEarnings.toFixed(2) || '0.00'}
                                                {stats && stats.unclaimedEarnings > 0 && (
                                                    <span className="text-emerald-500 text-sm bg-emerald-500/10 px-2 py-1 rounded animate-pulse">Ready to claim</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Users className="w-4 h-4" /></div>
                                                <span className="font-bold text-slate-300">Active Referrals</span>
                                            </div>
                                            <span className="font-mono font-bold">{stats?.referralCount || 0}</span>
                                        </div>
                                        <div className="w-full h-px bg-white/5"></div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500"><Crown className="w-4 h-4" /></div>
                                                <span className="font-bold text-slate-300">Current Tier</span>
                                            </div>
                                            <span className={`font-bold ${stats?.currentTier?.color || 'text-orange-400'}`}>
                                                {stats?.currentTier?.name || 'BRONZE'}
                                            </span>
                                        </div>
                                        <div className="w-full h-px bg-white/5"></div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Zap className="w-4 h-4" /></div>
                                                <span className="font-bold text-slate-300">Wager Volume</span>
                                            </div>
                                            <span className="font-mono font-bold">${stats?.totalWagerVolume.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClaimEarnings}
                                        disabled={claiming || !stats || stats.unclaimedEarnings <= 0}
                                        className={`
                                              w-full mt-10 py-4 rounded-xl font-bold shadow-lg transition-all
                                              ${!stats || stats.unclaimedEarnings <= 0
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:-translate-y-1'}
                                          `}
                                    >
                                        {claiming ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'CLAIM EARNINGS'}
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-5 -left-5 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tier System */}
            <div className="bg-[#0b0f19] py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold mb-4">COMMISSION TIERS</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Level up your affiliate rank by increasing your referral wager volume. Higher tiers unlock exclusive perks and personal loans.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {TIERS.map((tier, i) => {
                            const isActive = stats?.currentTier?.name === tier.name;
                            return (
                                <div key={tier.name} className={`
                                    group relative bg-[#131b2e] rounded-xl border p-6 flex flex-col items-center justify-center overflow-hidden transition-all hover:-translate-y-2
                                    ${isActive ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-white/5 hover:border-white/20'}
                                `}>
                                    <div className={`absolute top-0 inset-x-0 h-1 ${tier.bg}`}></div>
                                    <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${tier.color}/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                                    <div className={`mb-4 w-12 h-12 rounded-full ${tier.bg} bg-opacity-10 flex items-center justify-center border ${tier.border} group-hover:scale-110 transition-transform`}>
                                        <Shield className={`w-6 h-6 ${tier.color}`} />
                                    </div>

                                    <div className={`font-display font-bold text-xl mb-1 ${tier.color}`}>{tier.name}</div>
                                    <div className="text-3xl font-bold text-white mb-2">{tier.rate}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Commission</div>
                                    <div className="text-[10px] text-slate-600 font-mono">${tier.min.toLocaleString()}+ Vol</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-[#0d121f] py-20 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-xl hover:shadow-2xl transition-all">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Advanced Analytics</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Track every click, sign-up, and wager in real-time. Our dashboard gives you the data you need to optimize your campaigns.
                            </p>
                        </div>

                        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 relative z-10">
                                <Gift className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Referral Bonuses</h3>
                            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
                                Your friends get a <span className="text-white font-bold">5% Deposit Bonus</span> when using your code, ensuring high conversion rates.
                            </p>
                        </div>

                        <div className="bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 relative z-10">
                                <CreditCard className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-2 relative z-10">
                                Instant Loans
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">New</span>
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm relative z-10 mb-4">
                                Need liquidity for a promotion? Borrow up to <span className="text-white font-bold">800 credits</span> against future earnings instantly.
                            </p>
                            <button className="text-emerald-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 relative z-10">
                                View Requirements <Zap className="w-3 h-3" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};
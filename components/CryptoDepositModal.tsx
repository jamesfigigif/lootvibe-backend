import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface CryptoDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currency: 'BTC' | 'ETH';
}

export const CryptoDepositModal: React.FC<CryptoDepositModalProps> = ({ isOpen, onClose, userId, currency }) => {
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [depositId, setDepositId] = useState<string | null>(null);
    const [depositStatus, setDepositStatus] = useState<any>(null);

    const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';

    // Generate deposit address
    useEffect(() => {
        if (isOpen && userId) {
            generateAddress();
        }
    }, [isOpen, userId, currency]);

    // Poll for deposit status
    useEffect(() => {
        if (!depositId) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/deposits/status/${depositId}`);
                const data = await response.json();
                setDepositStatus(data);

                // Stop polling if credited
                if (data.status === 'CREDITED') {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error checking deposit status:', error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [depositId]);

    const generateAddress = async () => {
        try {
            setLoading(true);
            console.log('Generating address for:', { userId, currency });

            const response = await fetch(`${BACKEND_URL}/api/deposits/generate-address`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, currency })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate address');
            }

            setAddress(data.address);
        } catch (error) {
            console.error('Error generating address:', error);
            alert(`Failed to generate deposit address: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getExplorerUrl = (txHash: string) => {
        if (currency === 'BTC') {
            return `https://blockchair.com/bitcoin/transaction/${txHash}`;
        } else {
            return `https://etherscan.io/tx/${txHash}`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="relative bg-[#0b0f19] rounded-3xl w-full max-w-lg overflow-hidden border border-white/10">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Deposit {currency}
                    </h2>
                    <p className="text-sm text-slate-400">
                        Send {currency} to the address below
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                            <p className="text-slate-400">Generating deposit address...</p>
                        </div>
                    ) : (
                        <>
                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-2xl">
                                    <QRCodeCanvas value={address} size={200} />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                                    {currency} Address
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[#131b2e] border border-white/10 rounded-lg p-3 font-mono text-sm text-white break-all">
                                        {address}
                                    </div>
                                    <button
                                        onClick={copyAddress}
                                        className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <h3 className="text-sm font-bold text-yellow-400 mb-2">⚠️ Important</h3>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    <li>• Send only {currency} to this address</li>
                                    <li>• Minimum deposit: {currency === 'BTC' ? '0.0001 BTC' : '0.01 ETH'}</li>
                                    <li>• Confirmations required: {currency === 'BTC' ? '3' : '12'}</li>
                                    <li>• Funds will be credited automatically</li>
                                </ul>
                            </div>

                            {/* Deposit Status */}
                            {depositStatus && (
                                <div className="bg-[#131b2e] border border-white/10 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-white">Deposit Status</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${depositStatus.status === 'CREDITED' ? 'bg-green-500/20 text-green-400' :
                                            depositStatus.status === 'CONFIRMING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {depositStatus.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-xs text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="text-white font-mono">{depositStatus.amount} {currency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Confirmations:</span>
                                            <span className="text-white font-mono">
                                                {depositStatus.confirmations}/{depositStatus.requiredConfirmations}
                                            </span>
                                        </div>
                                        {depositStatus.txHash && (
                                            <a
                                                href={getExplorerUrl(depositStatus.txHash)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                View on Explorer <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

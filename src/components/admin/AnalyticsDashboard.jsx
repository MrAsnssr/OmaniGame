import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Clock, TrendingUp, ShoppingBag, Smartphone, Globe, Calendar, RefreshCw, Download, Search, Ban, ShieldCheck, Coins } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { banIP, unbanIP, getBannedIPs, giveDirhams } from '../../services/analyticsService';
import Button from '../Button';

export default function AnalyticsDashboard({ onBack }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [bannedIPs, setBannedIPs] = useState([]);
    const [banningIP, setBanningIP] = useState(null);
    const [toppingUp, setToppingUp] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        totalSessions: 0,
        totalTimeSpent: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        mobileUsers: 0,
        desktopUsers: 0
    });

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const usersSnap = await getDocs(usersRef);

            const today = new Date().toISOString().split('T')[0];
            let totalSessions = 0;
            let totalTimeSpent = 0;
            let totalPurchases = 0;
            let totalRevenue = 0;
            let activeToday = 0;
            let mobileUsers = 0;
            let desktopUsers = 0;

            const usersData = usersSnap.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };

                // Aggregate stats
                totalSessions += data.sessionCount || 0;
                totalTimeSpent += data.totalTimeSpentSeconds || 0;
                totalPurchases += data.totalPurchases || 0;
                totalRevenue += data.totalSpent || 0;

                if (data.lastSeenDate === today) activeToday++;
                if (data.device?.deviceType === 'mobile') mobileUsers++;
                if (data.device?.deviceType === 'desktop') desktopUsers++;

                return data;
            });

            // Sort by last seen
            usersData.sort((a, b) => {
                const dateA = a.lastSeenAt ? new Date(a.lastSeenAt) : new Date(0);
                const dateB = b.lastSeenAt ? new Date(b.lastSeenAt) : new Date(0);
                return dateB - dateA;
            });

            setUsers(usersData);
            setStats({
                totalUsers: usersData.length,
                activeToday,
                totalSessions,
                totalTimeSpent,
                totalPurchases,
                totalRevenue,
                mobileUsers,
                desktopUsers
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
        setLoading(false);
    };

    const loadBannedIPs = async () => {
        const banned = await getBannedIPs();
        setBannedIPs(banned);
    };

    useEffect(() => {
        loadAnalytics();
        loadBannedIPs();
    }, []);

    const formatTime = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'لم يزر بعد';
        return new Date(isoString).toLocaleDateString('ar-OM', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'IP', 'Sessions', 'Time Spent', 'Last Seen', 'Device', 'Browser', 'OS', 'Purchases', 'Spent'];
        const rows = users.map(u => [
            u.id,
            u.displayName || '',
            u.email || '',
            u.lastIP || '',
            u.sessionCount || 0,
            u.totalTimeSpentSeconds || 0,
            u.lastSeenAt || '',
            u.device?.deviceType || '',
            u.device?.browser || '',
            u.device?.os || '',
            u.totalPurchases || 0,
            u.totalSpent || 0
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredUsers = users.filter(u => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (u.displayName?.toLowerCase().includes(term)) ||
            (u.email?.toLowerCase().includes(term)) ||
            (u.id?.toLowerCase().includes(term)) ||
            (u.lastIP?.includes(term))
        );
    });

    const isIPBanned = (ip) => {
        if (!ip) return false;
        return bannedIPs.some(b => b.ip === ip);
    };

    const handleBanIP = async (ip, e) => {
        e.stopPropagation();
        if (!ip) return;
        const reason = prompt('سبب الحظر (اختياري):') || 'No reason';
        setBanningIP(ip);
        await banIP(ip, reason);
        await loadBannedIPs();
        setBanningIP(null);
    };

    const handleUnbanIP = async (ip, e) => {
        e.stopPropagation();
        if (!ip) return;
        setBanningIP(ip);
        await unbanIP(ip);
        await loadBannedIPs();
        setBanningIP(null);
    };

    const handleTopUp = async (userId, e) => {
        e.stopPropagation();
        if (!userId) return;
        const amountStr = prompt('كم درهم تريد إضافته؟');
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('الرجاء إدخال رقم صحيح');
            return;
        }
        const reason = prompt('سبب الإضافة (اختياري):') || 'Admin top-up';
        setToppingUp(userId);
        const result = await giveDirhams(userId, amount, reason);
        if (result.success) {
            alert(`تم إضافة ${amount} درهم بنجاح!\nالرصيد الجديد: ${result.newBalance}`);
            await loadAnalytics(); // Refresh to show new balance
        } else {
            alert('حدث خطأ أثناء الإضافة');
        }
        setToppingUp(null);
    };

    return (
        <div className="flex flex-col h-full p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-sand hover:bg-wood-light/80 transition-colors shadow-md"
                >
                    <ArrowRight size={20} />
                </button>
                <h2 className="text-2xl font-black text-white engraved-text flex-1">📊 Analytics Dashboard</h2>
                <Button onClick={loadAnalytics} disabled={loading} className="px-4">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </Button>
                <Button onClick={exportToCSV} className="px-4">
                    <Download size={18} />
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-wood-dark/50 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sand/60 text-sm mb-1">
                        <Users size={16} /> Total Users
                    </div>
                    <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-wood-dark/50 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sand/60 text-sm mb-1">
                        <TrendingUp size={16} /> Active Today
                    </div>
                    <p className="text-2xl font-black text-green-400">{stats.activeToday}</p>
                </div>
                <div className="bg-wood-dark/50 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sand/60 text-sm mb-1">
                        <Clock size={16} /> Total Time
                    </div>
                    <p className="text-2xl font-black text-white">{formatTime(stats.totalTimeSpent)}</p>
                </div>
                <div className="bg-wood-dark/50 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sand/60 text-sm mb-1">
                        <ShoppingBag size={16} /> Revenue
                    </div>
                    <p className="text-2xl font-black text-[#FFD700]">{stats.totalRevenue} 💰</p>
                </div>
            </div>

            {/* Device breakdown */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-wood-dark/50 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <Smartphone className="text-primary" size={24} />
                    <div>
                        <p className="text-sand/60 text-xs">Mobile</p>
                        <p className="text-white font-bold">{stats.mobileUsers}</p>
                    </div>
                </div>
                <div className="flex-1 bg-wood-dark/50 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <Globe className="text-primary" size={24} />
                    <div>
                        <p className="text-sand/60 text-xs">Desktop</p>
                        <p className="text-white font-bold">{stats.desktopUsers}</p>
                    </div>
                </div>
                <div className="flex-1 bg-wood-dark/50 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <Calendar className="text-primary" size={24} />
                    <div>
                        <p className="text-sand/60 text-xs">Sessions</p>
                        <p className="text-white font-bold">{stats.totalSessions}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sand/40" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 bg-wood-dark/50 border border-white/10 rounded-xl text-white placeholder-sand/30 outline-none focus:border-primary"
                />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                    <div className="text-center py-8 text-sand/50">جاري التحميل...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-sand/50">لا يوجد مستخدمين</div>
                ) : (
                    filteredUsers.map(user => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-wood-dark/50 border rounded-xl p-4 cursor-pointer transition-all ${selectedUser?.id === user.id ? 'border-primary' : 'border-white/10 hover:border-white/20'
                                }`}
                            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {(user.displayName || 'U')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-white truncate">{user.displayName || 'مجهول'}</p>
                                        {user.shortId && (
                                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded">
                                                #{user.shortId}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sand/50 text-xs truncate">{user.email || user.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#FFD700] text-sm font-bold">{user.dirhams || 0} 💰</p>
                                    <p className="text-sand/40 text-xs">{user.sessionCount || 0} sessions</p>
                                </div>
                                <button
                                    onClick={(e) => handleTopUp(user.id, e)}
                                    disabled={toppingUp === user.id}
                                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                    title="إضافة دراهم"
                                >
                                    <Coins size={18} />
                                </button>
                            </div>

                            {/* Expanded details */}
                            {selectedUser?.id === user.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                                >
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-sand/50">First Seen</p>
                                            <p className="text-white">{formatDate(user.firstSeenAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Last Seen</p>
                                            <p className="text-white">{formatDate(user.lastSeenAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Device</p>
                                            <p className="text-white">{user.device?.deviceType || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Browser</p>
                                            <p className="text-white">{user.device?.browser || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">OS</p>
                                            <p className="text-white">{user.device?.os || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Screen</p>
                                            <p className="text-white">
                                                {user.device?.screen ? `${user.device.screen.width}x${user.device.screen.height}` : 'Unknown'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Timezone</p>
                                            <p className="text-white">{user.device?.timezone || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Language</p>
                                            <p className="text-white">{user.device?.language || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Connection</p>
                                            <p className="text-white">{user.device?.connectionType || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Purchases</p>
                                            <p className="text-white">{user.totalPurchases || 0} ({user.totalSpent || 0} spent)</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">MP Games</p>
                                            <p className="text-white">{user.totalMultiplayerGames || 0} ({user.multiplayerWins || 0} wins)</p>
                                        </div>
                                        <div>
                                            <p className="text-sand/50">Referrer</p>
                                            <p className="text-white truncate">{user.firstReferrer || 'direct'}</p>
                                        </div>
                                    </div>

                                    {/* Geolocation Section */}
                                    {user.geo && (
                                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-3">
                                            <p className="text-blue-300 text-xs font-bold mb-2">📍 الموقع الجغرافي</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div>
                                                    <p className="text-sand/50 text-xs">Country</p>
                                                    <p className="text-white">{user.geo.country || 'Unknown'} {user.geo.countryCode && `(${user.geo.countryCode})`}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">City</p>
                                                    <p className="text-white">{user.geo.city || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">ISP</p>
                                                    <p className="text-white truncate">{user.geo.isp || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">VPN</p>
                                                    <p className={user.geo.isVPN ? 'text-yellow-400' : 'text-green-400'}>
                                                        {user.geo.isVPN ? '⚠️ Possible VPN' : '✅ No VPN'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Game Stats Section */}
                                    {(user.totalQuestionsAnswered > 0 || user.gamesCompleted > 0) && (
                                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-3">
                                            <p className="text-green-300 text-xs font-bold mb-2">🎮 إحصائيات اللعب</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div>
                                                    <p className="text-sand/50 text-xs">Questions</p>
                                                    <p className="text-white">{user.totalQuestionsAnswered || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Correct</p>
                                                    <p className="text-green-400">{user.correctAnswers || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Wrong</p>
                                                    <p className="text-red-400">{user.wrongAnswers || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Accuracy</p>
                                                    <p className="text-white">
                                                        {user.totalQuestionsAnswered > 0
                                                            ? ((user.correctAnswers || 0) / user.totalQuestionsAnswered * 100).toFixed(1) + '%'
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Games</p>
                                                    <p className="text-white">{user.gamesCompleted || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Total Score</p>
                                                    <p className="text-[#FFD700]">{user.totalScore || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Best Score</p>
                                                    <p className="text-[#FFD700]">{user.bestScore || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Wins</p>
                                                    <p className="text-primary">{user.wins || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Performance Section */}
                                    {user.performance && (
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-3">
                                            <p className="text-orange-300 text-xs font-bold mb-2">⚡ الأداء</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div>
                                                    <p className="text-sand/50 text-xs">Page Load</p>
                                                    <p className="text-white">{user.performance.pageLoadTime ? `${user.performance.pageLoadTime}ms` : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">First Paint</p>
                                                    <p className="text-white">{user.performance.firstPaint ? `${Math.round(user.performance.firstPaint)}ms` : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Network</p>
                                                    <p className="text-white">{user.performance.effectiveType || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sand/50 text-xs">Latency</p>
                                                    <p className="text-white">{user.performance.rtt ? `${user.performance.rtt}ms` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rage Clicks */}
                                    {user.featureUsage?.rageClick > 0 && (
                                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                                            <p className="text-red-400 text-sm">
                                                😤 <span className="font-bold">{user.featureUsage.rageClick}</span> rage clicks detected
                                            </p>
                                        </div>
                                    )}

                                    {/* IP Address Section */}
                                    {user.lastIP && (
                                        <div className="bg-wood-dark/60 border border-white/10 rounded-xl p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sand/50 text-xs">IP Address</p>
                                                    <p className="text-white font-mono">{user.lastIP}</p>
                                                    {user.knownIPs?.length > 1 && (
                                                        <p className="text-sand/40 text-xs mt-1">
                                                            +{user.knownIPs.length - 1} أخرى
                                                        </p>
                                                    )}
                                                </div>
                                                {isIPBanned(user.lastIP) ? (
                                                    <button
                                                        onClick={(e) => handleUnbanIP(user.lastIP, e)}
                                                        disabled={banningIP === user.lastIP}
                                                        className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        <ShieldCheck size={16} />
                                                        {banningIP === user.lastIP ? '...' : 'إلغاء الحظر'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleBanIP(user.lastIP, e)}
                                                        disabled={banningIP === user.lastIP}
                                                        className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        <Ban size={16} />
                                                        {banningIP === user.lastIP ? '...' : 'حظر IP'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Page Views */}
                                    {user.pageViews && Object.keys(user.pageViews).length > 0 && (
                                        <div>
                                            <p className="text-sand/50 mb-2">Page Views</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(user.pageViews).map(([page, count]) => (
                                                    <span key={page} className="px-2 py-1 bg-wood-dark/60 rounded text-xs text-sand">
                                                        {page}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Feature Usage */}
                                    {user.featureUsage && Object.keys(user.featureUsage).length > 0 && (
                                        <div>
                                            <p className="text-sand/50 mb-2">Feature Usage</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(user.featureUsage).map(([feature, count]) => (
                                                    <span key={feature} className="px-2 py-1 bg-primary/20 rounded text-xs text-primary">
                                                        {feature}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

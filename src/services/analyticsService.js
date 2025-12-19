// Analytics service for tracking user activity and collecting data
import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, arrayUnion, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';

// Fetch user's IP address using a free API
let cachedIP = null;
export async function getIPAddress() {
    if (cachedIP) return cachedIP;
    try {
        // Try multiple IP services for reliability
        const services = [
            'https://api.ipify.org?format=json',
            'https://api.my-ip.io/v2/ip.json',
            'https://ipapi.co/json/'
        ];

        for (const url of services) {
            try {
                const res = await fetch(url, { timeout: 5000 });
                if (res.ok) {
                    const data = await res.json();
                    cachedIP = data.ip || data.origin || null;
                    if (cachedIP) return cachedIP;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching IP:', error);
        return null;
    }
}

// Check if an IP is banned
export async function checkIPBan(ip) {
    if (!ip) return { banned: false };
    try {
        const bansRef = collection(db, 'bannedIPs');
        const q = query(bansRef, where('ip', '==', ip));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const banData = snap.docs[0].data();
            return { banned: true, reason: banData.reason, bannedAt: banData.bannedAt };
        }
        return { banned: false };
    } catch (error) {
        console.error('Error checking IP ban:', error);
        return { banned: false };
    }
}

// Ban an IP address
export async function banIP(ip, reason = 'No reason provided', bannedBy = 'admin') {
    if (!ip) return { success: false, error: 'No IP provided' };
    try {
        const bansRef = collection(db, 'bannedIPs');
        await addDoc(bansRef, {
            ip,
            reason,
            bannedBy,
            bannedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error banning IP:', error);
        return { success: false, error };
    }
}

// Unban an IP address
export async function unbanIP(ip) {
    if (!ip) return { success: false, error: 'No IP provided' };
    try {
        const bansRef = collection(db, 'bannedIPs');
        const q = query(bansRef, where('ip', '==', ip));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, 'bannedIPs', docSnap.id));
        }
        return { success: true };
    } catch (error) {
        console.error('Error unbanning IP:', error);
        return { success: false, error };
    }
}

// Get all banned IPs
export async function getBannedIPs() {
    try {
        const bansRef = collection(db, 'bannedIPs');
        const snap = await getDocs(bansRef);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error getting banned IPs:', error);
        return [];
    }
}

// Collect device and browser information
export function getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const languages = navigator.languages ? [...navigator.languages] : [language];
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const colorDepth = window.screen.colorDepth;
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const cookiesEnabled = navigator.cookieEnabled;
    const doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOffset = new Date().getTimezoneOffset();
    const online = navigator.onLine;
    const connectionType = navigator.connection?.effectiveType || 'unknown';
    const memory = navigator.deviceMemory || 'unknown';
    const cores = navigator.hardwareConcurrency || 'unknown';

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    const isDesktop = !isMobile && !isTablet;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
        userAgent: ua,
        platform,
        language,
        languages,
        screen: {
            width: screenWidth,
            height: screenHeight,
            windowWidth,
            windowHeight,
            pixelRatio,
            colorDepth
        },
        deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
        browser,
        os,
        touchSupport,
        cookiesEnabled,
        doNotTrack,
        timezone,
        timezoneOffset,
        online,
        connectionType,
        memory,
        cores
    };
}

// Get referrer and entry point
export function getTrafficSource() {
    return {
        referrer: document.referrer || 'direct',
        entryUrl: window.location.href,
        pathname: window.location.pathname,
        searchParams: Object.fromEntries(new URLSearchParams(window.location.search))
    };
}

// Track user session
export async function trackUserSession(userId, displayName, email) {
    if (!userId) return;

    const now = new Date();
    const deviceInfo = getDeviceInfo();
    const trafficSource = getTrafficSource();

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const existingData = userSnap.exists() ? userSnap.data() : {};

        // Get IP address
        const ipAddress = await getIPAddress();

        // Session data
        const sessionData = {
            displayName: displayName || existingData.displayName || null,
            email: email || existingData.email || null,

            // IP Address
            lastIP: ipAddress,
            ...(existingData.firstIP ? {} : { firstIP: ipAddress }),
            knownIPs: ipAddress ? arrayUnion(ipAddress) : existingData.knownIPs || [],

            // Last seen
            lastSeenAt: now.toISOString(),
            lastSeenDate: now.toISOString().split('T')[0],

            // Session count
            sessionCount: increment(1),

            // Device info (latest)
            device: deviceInfo,

            // First seen (only set once)
            ...(existingData.firstSeenAt ? {} : {
                firstSeenAt: now.toISOString(),
                firstReferrer: trafficSource.referrer,
                firstEntryUrl: trafficSource.entryUrl
            }),

            // Traffic source for this session
            lastReferrer: trafficSource.referrer,
            lastEntryUrl: trafficSource.entryUrl,

            // Analytics metadata
            analyticsVersion: 2,
            updatedAt: now.toISOString()
        };

        await setDoc(userRef, sessionData, { merge: true });

        // Also track session in a subcollection for history
        const sessionRef = doc(db, 'users', userId, 'sessions', `${now.getTime()}`);
        await setDoc(sessionRef, {
            startedAt: now.toISOString(),
            device: deviceInfo,
            trafficSource,
            userAgent: deviceInfo.userAgent,
            ip: ipAddress
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking session:', error);
        return { success: false, error };
    }
}

// Track game play
export async function trackGamePlay(userId, gameData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalGamesPlayed: increment(1),
            lastGamePlayedAt: now.toISOString(),
            updatedAt: now.toISOString()
        });

        // Store game session in subcollection
        const gameRef = doc(db, 'users', userId, 'games', `${now.getTime()}`);
        await setDoc(gameRef, {
            ...gameData,
            playedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking game:', error);
        return { success: false, error };
    }
}

// Track multiplayer game
export async function trackMultiplayerGame(userId, gameData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalMultiplayerGames: increment(1),
            lastMultiplayerGameAt: now.toISOString(),
            ...(gameData.won ? { multiplayerWins: increment(1) } : {}),
            updatedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking multiplayer game:', error);
        return { success: false, error };
    }
}

// Track page views
export async function trackPageView(userId, pageName) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            [`pageViews.${pageName}`]: increment(1),
            lastPageVisited: pageName,
            lastActiveAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking page view:', error);
        return { success: false, error };
    }
}

// Track purchases
export async function trackPurchase(userId, purchaseData) {
    if (!userId) return;

    const now = new Date();

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalPurchases: increment(1),
            totalSpent: increment(purchaseData.price || 0),
            lastPurchaseAt: now.toISOString(),
            purchaseHistory: arrayUnion({
                ...purchaseData,
                purchasedAt: now.toISOString()
            }),
            updatedAt: now.toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking purchase:', error);
        return { success: false, error };
    }
}

// Track time spent (call on page unload or periodically)
export async function trackTimeSpent(userId, seconds) {
    if (!userId || !seconds) return;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            totalTimeSpentSeconds: increment(seconds),
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking time spent:', error);
        return { success: false, error };
    }
}

// Track errors/crashes
export async function trackError(userId, errorData) {
    const now = new Date();

    try {
        // Store in global errors collection (even for non-logged-in users)
        const errorRef = doc(db, 'errors', `${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`);
        await setDoc(errorRef, {
            userId: userId || 'anonymous',
            ...errorData,
            device: getDeviceInfo(),
            occurredAt: now.toISOString(),
            url: window.location.href
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking error:', error);
        return { success: false, error };
    }
}

// Track feature usage
export async function trackFeatureUsage(userId, featureName) {
    if (!userId) return;

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            [`featureUsage.${featureName}`]: increment(1),
            lastActiveAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking feature usage:', error);
        return { success: false, error };
    }
}

// Export all analytics functions
export default {
    getDeviceInfo,
    getTrafficSource,
    getIPAddress,
    checkIPBan,
    banIP,
    unbanIP,
    getBannedIPs,
    trackUserSession,
    trackGamePlay,
    trackMultiplayerGame,
    trackPageView,
    trackPurchase,
    trackTimeSpent,
    trackError,
    trackFeatureUsage
};

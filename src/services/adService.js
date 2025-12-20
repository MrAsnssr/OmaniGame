// Ad Service for Google Ads integration
// Users watch ads and earn 300 dirhams per ad

import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

// ========== TOGGLE THIS TO ENABLE ADS ==========
export const ADS_ENABLED = false; // Set to true when AdSense is approved
// ================================================

const AD_REWARD = 300; // Dirhams per ad watched

// Track if ads are initialized
let adsInitialized = false;
let adInstance = null;

// Initialize Google AdSense (for web)
export function initAds() {
    if (adsInitialized) return;

    // Check if adsbygoogle is loaded
    if (typeof window !== 'undefined' && window.adsbygoogle) {
        adsInitialized = true;
        console.log('Google Ads initialized');
    }
}

// Show a rewarded ad and return promise
export async function showRewardedAd(userId) {
    return new Promise((resolve, reject) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'ad-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: rgba(0,0,0,0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        `;

        overlay.innerHTML = `
            <div style="text-align:center;color:white;padding:20px;">
                <div style="font-size:60px;margin-bottom:20px;">📺</div>
                <p style="font-size:24px;font-weight:bold;margin-bottom:10px;">جاري تحميل الإعلان...</p>
                <p style="font-size:14px;color:#888;">انتظر قليلاً للحصول على المكافأة</p>
                <div style="margin-top:30px;">
                    <div style="width:200px;height:6px;background:#333;border-radius:3px;overflow:hidden;">
                        <div id="ad-progress" style="width:0%;height:100%;background:linear-gradient(90deg,#22c55e,#10b981);transition:width 0.1s;"></div>
                    </div>
                </div>
                <p id="ad-countdown" style="font-size:18px;color:#22c55e;margin-top:20px;font-weight:bold;">3</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate progress bar and countdown
        let progress = 0;
        let countdown = 3;
        const progressBar = overlay.querySelector('#ad-progress');
        const countdownEl = overlay.querySelector('#ad-countdown');

        const interval = setInterval(() => {
            progress += 3.33; // 3 seconds total
            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

            const newCountdown = Math.ceil((100 - progress) / 33.3);
            if (newCountdown !== countdown && countdownEl) {
                countdown = newCountdown;
                countdownEl.textContent = Math.max(0, countdown);
            }
        }, 100);

        // After 3 seconds, show success and give reward
        setTimeout(() => {
            clearInterval(interval);

            overlay.innerHTML = `
                <div style="text-align:center;color:white;padding:20px;">
                    <div style="font-size:80px;margin-bottom:20px;">🎉</div>
                    <p style="font-size:28px;font-weight:bold;color:#22c55e;">+${AD_REWARD} درهم!</p>
                    <p style="font-size:16px;color:#888;margin-top:10px;">تمت إضافة المكافأة</p>
                </div>
            `;

            // Remove after showing success
            setTimeout(() => {
                overlay.remove();
                resolve({ success: true, reward: AD_REWARD });
            }, 1500);

        }, 3000);
    });
}

// Record ad watch in Firestore
export async function recordAdWatch(userId, reward) {
    if (!userId) return;

    try {
        const userRef = doc(db, 'users', userId);

        // Update user's dirhams and ad stats
        await updateDoc(userRef, {
            dirhams: increment(reward),
            totalAdsWatched: increment(1),
            totalAdEarnings: increment(reward),
            lastAdWatchedAt: new Date().toISOString()
        });

        // Log the ad watch
        const adLogRef = doc(db, 'users', userId, 'adWatches', `${Date.now()}`);
        await setDoc(adLogRef, {
            reward,
            watchedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Error recording ad watch:', error);
        return { success: false, error };
    }
}

// Get user's ad stats
export async function getAdStats(userId) {
    if (!userId) return null;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                totalAdsWatched: data.totalAdsWatched || 0,
                totalAdEarnings: data.totalAdEarnings || 0,
                lastAdWatchedAt: data.lastAdWatchedAt || null
            };
        }
        return { totalAdsWatched: 0, totalAdEarnings: 0, lastAdWatchedAt: null };
    } catch (error) {
        console.error('Error getting ad stats:', error);
        return null;
    }
}

export { AD_REWARD };

export default {
    initAds,
    showRewardedAd,
    recordAdWatch,
    getAdStats,
    AD_REWARD
};

// Ad Service for Google Ads integration
// Users watch ads and earn 300 dirhams per ad

import { db } from './firebase';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

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
        // For development/testing - simulate ad watch
        if (!window.adsbygoogle || process.env.NODE_ENV === 'development') {
            console.log('Simulating ad watch (dev mode)');
            // Simulate ad viewing time
            setTimeout(() => {
                resolve({ success: true, reward: AD_REWARD });
            }, 2000); // 2 second simulated ad
            return;
        }

        // For production - show actual ad
        try {
            // Create ad container if not exists
            let adContainer = document.getElementById('rewarded-ad-container');
            if (!adContainer) {
                adContainer = document.createElement('div');
                adContainer.id = 'rewarded-ad-container';
                adContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;';
                document.body.appendChild(adContainer);
            }

            // Show ad overlay
            adContainer.innerHTML = `
                <div style="text-align:center;color:white;">
                    <p style="font-size:24px;margin-bottom:20px;">📺 جاري تحميل الإعلان...</p>
                    <ins class="adsbygoogle"
                        style="display:block;width:300px;height:250px;"
                        data-ad-client="ca-pub-XXXXXXXXXX"
                        data-ad-slot="XXXXXXXXXX"
                        data-ad-format="auto"></ins>
                    <button id="close-ad-btn" style="margin-top:20px;padding:15px 40px;background:#22c55e;color:white;border:none;border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;display:none;">
                        ✅ احصل على ${AD_REWARD} درهم
                    </button>
                </div>
            `;

            // Push the ad
            (window.adsbygoogle = window.adsbygoogle || []).push({});

            // Show close button after 5 seconds (simulating ad view)
            setTimeout(() => {
                const closeBtn = document.getElementById('close-ad-btn');
                if (closeBtn) {
                    closeBtn.style.display = 'block';
                    closeBtn.onclick = () => {
                        adContainer.remove();
                        resolve({ success: true, reward: AD_REWARD });
                    };
                }
            }, 5000);

        } catch (error) {
            console.error('Error showing ad:', error);
            reject({ success: false, error });
        }
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

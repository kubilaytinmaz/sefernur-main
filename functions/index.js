const functions = require('firebase-functions'); // still used for logger
const { setGlobalOptions } = require('firebase-functions');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize admin SDK once
try { admin.initializeApp(); } catch (_) { /* already initialized */ }

// Global options (cost control)
setGlobalOptions({ maxInstances: 10, region: 'europe-west1' });

const db = admin.firestore();
const messaging = admin.messaging();

// Uber integration config (set in functions env)
const UBER_CLIENT_ID = process.env.UBER_CLIENT_ID || '';
const UBER_CLIENT_SECRET = process.env.UBER_CLIENT_SECRET || '';
const UBER_REDIRECT_URI = process.env.UBER_REDIRECT_URI || '';
const UBER_OAUTH_SCOPES = process.env.UBER_OAUTH_SCOPES || 'request profile offline_access';

/**
 * notifications collection document shape (reference):
 * {
 *   userId: string,
 *   title: string,
 *   message: string,
 *   type: string,          // e.g. campaign_created, review_published
 *   relatedCollection: string, // e.g. campaigns
 *   relatedId: string,     // source document id
 *   data: { ... },         // optional extra payload
 *   read: false,           // unread by default
 *   createdAt: ISO string,
 * }
 */

// Utility: chunk an array
function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function fanOutToAllUsers(buildNotification) {
    // Attempt to only fetch token related lightweight fields
    const usersSnap = await db.collection('users')
        .select('fcmToken', 'fcmTokens', 'notificationTokens', 'tokens', 'fullName')
        .get();
    if (usersSnap.empty) return { written: 0, pushed: 0 };
    const createdAt = new Date().toISOString();
    let written = 0;
    let pushed = 0;
    const userDocs = usersSnap.docs;
    for (const group of chunk(userDocs, 400)) { // a bit lower to allow parallel writes
        const batch = db.batch();
        const multicastBatches = [];
        group.forEach(doc => {
            const uId = doc.id;
            const notif = buildNotification(uId, doc.data() || {});
            if (!notif) return;
            const notifRef = db.collection('notifications').doc();
            batch.set(notifRef, {
                userId: uId,
                read: false,
                createdAt,
                ...notif,
            });
            written++;
            // Collect tokens for push (best-effort)
            const tokens = extractTokens(doc.data());
            if (tokens.length) {
                multicastBatches.push({ tokens, payload: notif });
            }
        });
        await batch.commit();
        // Send pushes after commit
        for (const mb of multicastBatches) {
            pushed += await sendPushTokens(mb.tokens, mb.payload.title, mb.payload.message, {
                type: mb.payload.type,
                relatedCollection: mb.payload.relatedCollection,
                relatedId: mb.payload.relatedId,
            });
        }
    }
    return { written, pushed };
}

function extractTokens(userData) {
    if (!userData) return [];
    const out = new Set();
    if (typeof userData.fcmToken === 'string') out.add(userData.fcmToken);
    if (Array.isArray(userData.fcmTokens)) userData.fcmTokens.forEach(t => typeof t === 'string' && out.add(t));
    if (Array.isArray(userData.notificationTokens)) userData.notificationTokens.forEach(t => typeof t === 'string' && out.add(t));
    // flexible nested tokens field
    if (userData.tokens) {
        if (Array.isArray(userData.tokens)) userData.tokens.forEach(t => typeof t === 'string' && out.add(t));
        if (typeof userData.tokens === 'object') {
            Object.values(userData.tokens).forEach(v => {
                if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(x => typeof x === 'string' && out.add(x));
            });
        }
    }
    return Array.from(out).filter(Boolean);
}

async function sendPushTokens(tokens, title, body, data) {
    if (!tokens.length) return 0;
    // Split into 500 sized chunks per FCM limit
    let success = 0;
    for (const tChunk of chunk(tokens, 500)) {
        try {
            const resp = await messaging.sendEachForMulticast({
                tokens: tChunk,
                notification: { title, body },
                data: Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v)])),
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default' } } },
            });
            success += resp.successCount || 0;
        } catch (e) {
            functions.logger.error('FCM multicast error', e);
        }
    }
    return success;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Content creation notification configurations
const contentConfigs = {
    campaigns: {
        type: 'campaign_created',
        title: doc => 'Yeni Kampanya',
        message: doc => `${doc.title || 'Yeni bir kampanya'} başladı. Fırsatı kaçırmayın!`,
    },
    places: {
        type: 'place_created',
        title: doc => 'Yeni Mekan',
        message: doc => `${doc.title || 'Yeni bir mekan'} eklendi. Keşfetmeye hazır mısın?`,
    },
    blogs: {
        type: 'blog_created',
        title: doc => 'Yeni Blog Yazısı',
        message: doc => `${doc.title || 'Yeni bir yazı'} yayında. Hemen oku!`,
    },
    hotels: {
        type: 'hotel_created',
        title: doc => 'Yeni Otel',
        message: doc => `${doc.name || 'Yeni bir otel'} eklendi. Umre seyahatinizi planlayın.`,
    },
    tours: {
        type: 'tour_created',
        title: doc => 'Yeni Tur',
        message: doc => `${doc.title || 'Yeni bir tur'} yayınlandı. Detaylara göz at!`,
    },
    cars: {
        type: 'car_created',
        title: doc => 'Yeni Araç',
        message: doc => `${[doc.brand, doc.model].filter(Boolean).join(' ') || 'Yeni araç'} kiralamaya hazır.`,
    },
    guides: {
        type: 'guide_created',
        title: doc => 'Yeni Rehber',
        message: doc => `${doc.name || 'Yeni bir rehber'} hizmete hazır. İncele!`,
    },
    transfers: {
        type: 'transfer_created',
        title: doc => 'Yeni Transfer Seçeneği',
        message: doc => `${doc.vehicleType || 'Transfer'} rotası eklendi. Seyahatinizi kolaylaştırın.`,
    },
};

// Dynamically create onCreate triggers for content collections
const REGION = 'europe-west1';

Object.entries(contentConfigs).forEach(([collection, cfg]) => {
    exports[`on${capitalize(collection)}Created`] = onDocumentCreated({ region: REGION }, `${collection}/{id}`, async (event) => {
        const snap = event.data;
        if (!snap) return;
        const data = snap.data() || {};
        const relatedId = event.params.id;
        const title = cfg.title(data);
        const message = cfg.message(data);
        const res = await fanOutToAllUsers(userId => ({
            title,
            message,
            type: cfg.type,
            relatedCollection: collection,
            relatedId,
            data: { id: relatedId },
        }));
        functions.logger.log(`Content notify ${collection}/${relatedId} -> notifications written=${res.written} pushed=${res.pushed}`);
        return true;
    });
});

// Review status update (published / rejected)
exports.onReviewStatusChange = onDocumentUpdated({ region: REGION }, 'reviews/{id}', async (event) => {
    const before = event.data?.before?.data() || {};
    const after = event.data?.after?.data() || {};
    if (before.status === after.status) return false;
    if (!['published', 'rejected'].includes(after.status)) return false;
    const userId = after.userId;
    if (!userId) return false;
    const createdAt = new Date().toISOString();
    const status = after.status;
    const title = status === 'published' ? 'İncelemeniz onaylandı' : 'İncelemeniz reddedildi';
    const message = status === 'published'
        ? 'İncelemeniz yayınlandı. Teşekkür ederiz.'
        : 'İncelemeniz uygun bulunmadı.';
    const notif = {
        userId,
        title,
        message,
        type: `review_${status}`,
        relatedCollection: 'reviews',
        relatedId: event.params.id,
        data: { status },
        read: false,
        createdAt,
    };
    await db.collection('notifications').add(notif);
    // push
    const userDoc = await db.collection('users').doc(userId).get();
    const tokens = extractTokens(userDoc.data());
    await sendPushTokens(tokens, title, message, { type: notif.type, relatedId: event.params.id });
    return true;
});

// Visa application status change
exports.onVisaApplicationStatusChange = onDocumentUpdated({ region: REGION }, 'visaApplications/{id}', async (event) => {
    const before = event.data?.before?.data() || {};
    const after = event.data?.after?.data() || {};
    if (before.status === after.status) return false;
    const userId = after.userId;
    if (!userId) return false;
    const status = after.status || 'updated';
    const titles = {
        received: 'Vize Başvurunuz Alındı',
        processing: 'Vize Başvurunuz İşleniyor',
        completed: 'Vize Başvurunuz Tamamlandı',
        rejected: 'Vize Başvurunuz Reddedildi',
    };
    const messages = {
        received: 'Başvurunuz alındı, kısa sürede işleme alınacak.',
        processing: 'Başvurunuz şu anda inceleniyor.',
        completed: 'Başvurunuz başarıyla tamamlandı.',
        rejected: 'Başvurunuz maalesef reddedildi.',
    };
    const createdAt = new Date().toISOString();
    const notif = {
        userId,
        title: titles[status] || 'Vize Başvuru Güncellemesi',
        message: messages[status] || 'Başvuru durumunuz güncellendi.',
        type: `visa_${status}`,
        relatedCollection: 'visaApplications',
        relatedId: event.params.id,
        data: { status },
        read: false,
        createdAt,
    };
    await db.collection('notifications').add(notif);
    const userDoc = await db.collection('users').doc(userId).get();
    const tokens = extractTokens(userDoc.data());
    await sendPushTokens(tokens, notif.title, notif.message, { type: notif.type, relatedId: event.params.id });
    return true;
});

// Reservation status change
exports.onReservationStatusChange = onDocumentUpdated({ region: REGION }, 'reservations/{id}', async (event) => {
    const before = event.data?.before?.data() || {};
    const after = event.data?.after?.data() || {};
    if (before.status === after.status) return false;
    const userId = after.userId;
    if (!userId) return false;
    const status = after.status || 'updated';
    const titles = {
        pending: 'Rezervasyon Alındı',
        confirmed: 'Rezervasyon Onaylandı',
        cancelled: 'Rezervasyon İptal Edildi',
        completed: 'Rezervasyon Tamamlandı',
    };
    const messages = {
        pending: 'Rezervasyonunuz alındı, onay bekleniyor.',
        confirmed: 'Rezervasyonunuz onaylandı. İyi yolculuklar!',
        cancelled: 'Rezervasyonunuz iptal edildi.',
        completed: 'Rezervasyonunuz tamamlandı. Teşekkür ederiz.',
    };
    const createdAt = new Date().toISOString();
    const notif = {
        userId,
        title: titles[status] || 'Rezervasyon Güncellemesi',
        message: messages[status] || 'Rezervasyon durumunuz güncellendi.',
        type: `reservation_${status}`,
        relatedCollection: 'reservations',
        relatedId: event.params.id,
        data: { status, type: after.type, itemId: after.itemId },
        read: false,
        createdAt,
    };
    await db.collection('notifications').add(notif);
    const userDoc = await db.collection('users').doc(userId).get();
    const tokens = extractTokens(userDoc.data());
    await sendPushTokens(tokens, notif.title, notif.message, { type: notif.type, relatedId: event.params.id });
    return true;
});

// Comprehensive user account deletion (callable function)
// Deletes user from Auth, removes user document, and cleans up all user-created data
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
    // Must be authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = context.auth.uid;
    functions.logger.log(`Starting account deletion for user: ${uid}`);

    try {
        let deleted = {
            auth: false,
            userDoc: false,
            notifications: 0,
            reservations: 0,
            reviews: 0,
            visaApplications: 0,
            referrals: 0,
            referralEarnings: 0,
            referralWithdrawals: 0,
            favorites: 0,
        };

        // 1. Delete from collections where userId is direct field
        const collections = [
            { name: 'notifications', field: 'userId' },
            { name: 'reservations', field: 'userId' },
            { name: 'reviews', field: 'userId' },
            { name: 'visaApplications', field: 'userId' },
            { name: 'referralEarnings', field: 'userId' },
            { name: 'referralWithdrawals', field: 'userId' },
        ];

        for (const col of collections) {
            const snapshot = await db.collection(col.name).where(col.field, '==', uid).get();
            if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                deleted[col.name] = snapshot.size;
                functions.logger.log(`Deleted ${snapshot.size} documents from ${col.name}`);
            }
        }

        // 2. Delete referrals where user is inviter OR invitee
        const referralsInviter = await db.collection('referrals').where('inviterId', '==', uid).get();
        const referralsInvitee = await db.collection('referrals').where('inviteeId', '==', uid).get();
        const allReferrals = [...referralsInviter.docs, ...referralsInvitee.docs];
        if (allReferrals.length > 0) {
            const batch = db.batch();
            allReferrals.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            deleted.referrals = allReferrals.length;
            functions.logger.log(`Deleted ${allReferrals.length} referral documents`);
        }

        // 3. Delete favorites subcollection (users/{uid}/favorites)
        const favoritesSnap = await db.collection('users').doc(uid).collection('favorites').get();
        if (!favoritesSnap.empty) {
            const batch = db.batch();
            favoritesSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            deleted.favorites = favoritesSnap.size;
            functions.logger.log(`Deleted ${favoritesSnap.size} favorites`);
        }

        // 4. Delete chats where user is participant (optional - adjust based on your chat structure)
        // If you have a chat collection, add similar logic here

        // 5. Delete user document from Firestore
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
            await userDocRef.delete();
            deleted.userDoc = true;
            functions.logger.log(`Deleted user document: ${uid}`);
        }

        // 6. Delete user from Firebase Authentication (must be last)
        try {
            await admin.auth().deleteUser(uid);
            deleted.auth = true;
            functions.logger.log(`Deleted user from Auth: ${uid}`);
        } catch (authError) {
            functions.logger.error(`Failed to delete user from Auth: ${uid}`, authError);
            // Continue even if auth deletion fails - user can't access anymore
        }

        functions.logger.log(`Account deletion completed for user: ${uid}`, deleted);
        return {
            success: true,
            message: 'Hesabınız başarıyla silindi',
            deleted,
        };
    } catch (error) {
        functions.logger.error(`Account deletion failed for user: ${uid}`, error);
        throw new functions.https.HttpsError('internal', 'Hesap silme işlemi başarısız oldu', error.message);
    }
});

// ============================================================
// UBER INTEGRATION (OAUTH + ESTIMATES + RIDE REQUEST)
// ============================================================

function uberIntegrationRef(uid) {
    return db.collection('users').doc(uid).collection('integrations').doc('uber');
}

async function readUberIntegration(uid) {
    const snap = await uberIntegrationRef(uid).get();
    if (!snap.exists) return null;
    return snap.data() || null;
}

async function persistUberIntegration(uid, payload) {
    await uberIntegrationRef(uid).set({
        ...payload,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}

async function exchangeUberToken(params) {
    const body = new URLSearchParams(params);
    const response = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        functions.logger.error('Uber token exchange failed', json);
        throw new Error('Uber token exchange failed');
    }
    return json;
}

async function getValidUberUserAccessToken(uid) {
    const integration = await readUberIntegration(uid);
    if (!integration || !integration.accessToken) return null;

    const now = Date.now();
    const expiresAt = Number(integration.expiresAt || 0);
    const isStillValid = expiresAt > now + 60 * 1000;

    if (isStillValid) {
        return integration.accessToken;
    }

    if (!integration.refreshToken) {
        return null;
    }

    if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET) {
        functions.logger.warn('Uber OAuth client credentials are missing for refresh flow');
        return null;
    }

    const refreshed = await exchangeUberToken({
        grant_type: 'refresh_token',
        client_id: UBER_CLIENT_ID,
        client_secret: UBER_CLIENT_SECRET,
        refresh_token: integration.refreshToken,
    });

    const nextExpiresAt = Date.now() + (Number(refreshed.expires_in || 0) * 1000);
    await persistUberIntegration(uid, {
        accessToken: refreshed.access_token || '',
        refreshToken: refreshed.refresh_token || integration.refreshToken,
        expiresAt: nextExpiresAt,
        tokenType: refreshed.token_type || 'Bearer',
        scope: refreshed.scope || integration.scope || '',
    });

    return refreshed.access_token || null;
}

exports.uberAuthStatus = functions.https.onCall(async (_, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Uber bağlantısı için giriş gerekli');
    }

    const integration = await readUberIntegration(context.auth.uid);
    if (!integration || !integration.accessToken) {
        return { connected: false, hasRefreshToken: false };
    }

    return {
        connected: true,
        hasRefreshToken: Boolean(integration.refreshToken),
    };
});

exports.uberGetAuthUrl = functions.https.onCall(async (_, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Uber bağlantısı için giriş gerekli');
    }

    if (!UBER_CLIENT_ID || !UBER_REDIRECT_URI) {
        throw new functions.https.HttpsError('failed-precondition', 'UBER_CLIENT_ID / UBER_REDIRECT_URI tanımlı değil');
    }

    const state = crypto.randomBytes(24).toString('hex');
    await db.collection('uberOauthStates').doc(state).set({
        uid: context.auth.uid,
        createdAt: Date.now(),
    });

    const params = new URLSearchParams({
        client_id: UBER_CLIENT_ID,
        response_type: 'code',
        scope: UBER_OAUTH_SCOPES,
        redirect_uri: UBER_REDIRECT_URI,
        state,
    });

    return {
        authUrl: `https://login.uber.com/oauth/v2/authorize?${params.toString()}`,
    };
});

exports.uberOAuthCallback = functions.https.onRequest(async (req, res) => {
    try {
        const state = (req.query.state || '').toString();
        const code = (req.query.code || '').toString();

        if (!state || !code) {
            return res.status(400).send('Eksik state/code parametresi');
        }

        const stateRef = db.collection('uberOauthStates').doc(state);
        const stateDoc = await stateRef.get();
        if (!stateDoc.exists) {
            return res.status(400).send('Geçersiz veya süresi dolmuş state');
        }

        const { uid } = stateDoc.data() || {};
        await stateRef.delete();

        if (!uid) {
            return res.status(400).send('Geçersiz state verisi');
        }

        if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET || !UBER_REDIRECT_URI) {
            return res.status(500).send('Uber OAuth sunucu ayarları eksik');
        }

        const token = await exchangeUberToken({
            grant_type: 'authorization_code',
            client_id: UBER_CLIENT_ID,
            client_secret: UBER_CLIENT_SECRET,
            redirect_uri: UBER_REDIRECT_URI,
            code,
        });

        const expiresAt = Date.now() + (Number(token.expires_in || 0) * 1000);

        await persistUberIntegration(uid, {
            accessToken: token.access_token || '',
            refreshToken: token.refresh_token || '',
            tokenType: token.token_type || 'Bearer',
            scope: token.scope || '',
            expiresAt,
        });

        return res.status(200).send(
            '<html><body style="font-family: Arial; padding: 24px;"><h2>Uber bağlantısı başarılı</h2><p>Uygulamaya geri dönebilirsiniz.</p></body></html>',
        );
    } catch (error) {
        functions.logger.error('uberOAuthCallback error', error);
        return res.status(500).send('Uber bağlantısı tamamlanamadı');
    }
});

exports.uberEstimate = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Uber tahmini için giriş gerekli');
    }

    const startLatitude = Number(data?.startLatitude);
    const startLongitude = Number(data?.startLongitude);
    const endLatitude = Number(data?.endLatitude);
    const endLongitude = Number(data?.endLongitude);

    if (
        Number.isNaN(startLatitude) ||
        Number.isNaN(startLongitude) ||
        Number.isNaN(endLatitude) ||
        Number.isNaN(endLongitude)
    ) {
        throw new functions.https.HttpsError('invalid-argument', 'Geçersiz koordinat');
    }

    const params = new URLSearchParams({
        start_latitude: String(startLatitude),
        start_longitude: String(startLongitude),
        end_latitude: String(endLatitude),
        end_longitude: String(endLongitude),
    });

    const bearer = await getValidUberUserAccessToken(context.auth.uid);
    if (!bearer) {
        throw new functions.https.HttpsError('failed-precondition', 'Uber hesabı bağlı değil');
    }

    const priceHeaders = {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
    };
    const timeHeaders = {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
    };

    try {
        const priceResp = await fetch(`https://api.uber.com/v1.2/estimates/price?${params.toString()}`, {
            method: 'GET',
            headers: priceHeaders,
        });

        if (!priceResp.ok) {
            const text = await priceResp.text();
            functions.logger.error('Uber estimate/price request failed', text);
            throw new functions.https.HttpsError('internal', 'Uber fiyat tahmini alınamadı');
        }

        const priceJson = await priceResp.json();
        const priceItems = Array.isArray(priceJson?.prices) ? priceJson.prices : [];

        let timeItems = [];
        const timeParams = new URLSearchParams({
            start_latitude: String(startLatitude),
            start_longitude: String(startLongitude),
        });
        const timeResp = await fetch(`https://api.uber.com/v1.2/estimates/time?${timeParams.toString()}`, {
            method: 'GET',
            headers: timeHeaders,
        });

        if (timeResp.ok) {
            const timeJson = await timeResp.json();
            timeItems = Array.isArray(timeJson?.times) ? timeJson.times : [];
        }

        const timeMap = new Map(timeItems.map((e) => [e.product_id, e]));

        const estimates = priceItems.map((item) => {
            const time = timeMap.get(item.product_id) || {};
            const fare = item.fare || {};
            return {
                productId: item.product_id || '',
                displayName: item.display_name || '-',
                localizedDisplayName: item.localized_display_name || item.display_name || '-',
                durationSeconds: item.duration ?? null,
                etaSeconds: time.estimate ?? null,
                lowEstimate: item.low_estimate ?? null,
                highEstimate: item.high_estimate ?? null,
                displayPrice: item.estimate ?? '-',
                currency: item.currency_code ?? 'SAR',
                fareId: fare.fare_id || item.fare_id || null,
            };
        });

        return {
            success: true,
            estimates,
        };
    } catch (error) {
        functions.logger.error('uberEstimate error', error);
        throw new functions.https.HttpsError('internal', 'Uber tahmini alınamadı');
    }
});

exports.uberRequestRide = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Araç çağırmak için giriş gerekli');
    }

    const startLatitude = Number(data?.startLatitude);
    const startLongitude = Number(data?.startLongitude);
    const endLatitude = Number(data?.endLatitude);
    const endLongitude = Number(data?.endLongitude);
    const pickupName = (data?.pickupName || 'Pickup').toString();
    const dropoffName = (data?.dropoffName || 'Dropoff').toString();
    const productId = (data?.productId || '').toString();
    const fareId = (data?.fareId || '').toString();

    if (
        Number.isNaN(startLatitude) ||
        Number.isNaN(startLongitude) ||
        Number.isNaN(endLatitude) ||
        Number.isNaN(endLongitude)
    ) {
        throw new functions.https.HttpsError('invalid-argument', 'Geçersiz koordinat');
    }

    if (!productId || !fareId) {
        throw new functions.https.HttpsError('invalid-argument', 'productId ve fareId zorunludur');
    }

    const token = await getValidUberUserAccessToken(context.auth.uid);
    if (!token) {
        throw new functions.https.HttpsError('failed-precondition', 'Uber hesabı bağlı değil');
    }

    const payload = {
        fare_id: fareId,
        product_id: productId,
        start_latitude: startLatitude,
        start_longitude: startLongitude,
        start_nickname: pickupName,
        end_latitude: endLatitude,
        end_longitude: endLongitude,
        end_nickname: dropoffName,
    };

    try {
        const response = await fetch('https://api.uber.com/v1.2/requests', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            functions.logger.error('Uber request ride failed', json);
            const message = json?.errors?.[0]?.title || json?.title || 'Uber araç talebi başarısız oldu';
            throw new functions.https.HttpsError('internal', message, json);
        }

        return {
            success: true,
            ride: {
                requestId: json.request_id || '',
                status: json.status || 'processing',
                etaMinutes: json.eta ?? null,
            },
        };
    } catch (error) {
        functions.logger.error('uberRequestRide error', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Uber araç çağrısı tamamlanamadı');
    }
});

// Reservation payment status update (callable)
// Client-side payment result pages call this to finalize reservation state safely on backend.
exports.setReservationPaymentStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'İşlem için giriş gerekli');
    }

    const uid = context.auth.uid;
    const paymentOrderId = (data?.paymentOrderId || '').toString().trim();
    const isSuccess = data?.isSuccess === true;
    const responseCode = (data?.responseCode || '').toString().trim();
    const bankMessage = (data?.bankMessage || '').toString().trim();

    if (!paymentOrderId) {
        throw new functions.https.HttpsError('invalid-argument', 'paymentOrderId zorunludur');
    }

    const reservationSnap = await db
        .collection('reservations')
        .where('userId', '==', uid)
        .where('paymentOrderId', '==', paymentOrderId)
        .limit(1)
        .get();

    if (reservationSnap.empty) {
        return {
            updated: false,
            message: 'Rezervasyon kaydı bulunamadı',
        };
    }

    const reservationRef = reservationSnap.docs[0].ref;
    await reservationRef.update({
        status: isSuccess ? 'confirmed' : 'cancelled',
        paymentStatus: isSuccess ? 'success' : 'failed',
        paymentResult: {
            responseCode,
            message: bankMessage,
            processedAt: new Date().toISOString(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
        updated: true,
        message: isSuccess ? 'Rezervasyon onaylandı' : 'Rezervasyon ödeme başarısızlığı ile güncellendi',
    };
});

// (Optional) HTTP test endpoint (disabled by default)
// exports.ping = functions.https.onRequest((req, res) => res.json({ok: true, time: new Date().toISOString()}));

// ─────────────────────────────────────────────────────────────────
// Consolidated HTTP API Function — WebBeds & KuveytTürk Payment
// Single Cloud Run service to stay within CPU quota
// Proxied from Firebase Hosting: /api/** → api function
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const { WEBBEDS_CONFIG } = require('./lib/webbeds-config');
const { buildSearchHotelsXML, buildSearchByIdsXML, buildGetRoomsXML, buildBlockRoomXML, buildBookingXML } = require('./lib/webbeds-xml-builder');
const { parseWebBedsXML, extractHotelsFromSearchResponse, extractRoomsFromResponse } = require('./lib/webbeds-xml-parser');
const { getKuveytTurkConfig, getKuveytTurkConfigFromRC, isKuveytTurkConfigReady, build3DPaymentXml, build3DApprovalXml, parseAuthResponse, parseProvisionResponse } = require('./lib/kuveytturk');

const V4_HEADERS = { 'Content-Type': 'text/xml; charset=utf-8', 'Accept': 'text/xml', 'Accept-Encoding': 'gzip, deflate' };
const BATCH_SIZE = 50;

async function fetchHotelDetails(hotelIds, checkIn, checkOut, currency) {
    const detailMap = new Map();
    const batches = [];
    for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) batches.push(hotelIds.slice(i, i + BATCH_SIZE));
    const results = await Promise.allSettled(
        batches.map(async (batch) => {
            const xml = buildSearchByIdsXML({ hotelIds: batch, checkIn, checkOut, currency });
            const resp = await axios.post(WEBBEDS_CONFIG.baseUrl, xml, { headers: V4_HEADERS, timeout: 30000 });
            return resp.data;
        }),
    );
    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        try {
            const parsed = parseWebBedsXML(result.value);
            const hotels = extractHotelsFromSearchResponse(parsed);
            for (const hotel of hotels) {
                const id = String(hotel['@_HotelId'] || '');
                if (id) detailMap.set(id, hotel);
            }
        } catch { /* ignore */ }
    }
    return detailMap;
}

// ── Route handlers ──

async function handleWebbedsSearch(req, res) {
    const { cityCode, checkIn, checkOut, rooms, nationality = 5, currency = 520 } = req.body;
    if (!cityCode || !checkIn || !checkOut || !rooms || rooms.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const xmlRequest = buildSearchHotelsXML({ cityCode, checkIn, checkOut, rooms, nationality, currency });
    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, { headers: V4_HEADERS, timeout: 60000 });
    const parsedData = parseWebBedsXML(response.data);
    const pricedHotels = extractHotelsFromSearchResponse(parsedData);
    console.log('[WebBeds Search] Phase 1 — priced hotels:', pricedHotels.length);
    if (pricedHotels.length === 0) return res.json({ success: true, data: [], count: 0 });

    const hotelIds = pricedHotels.map((h) => String(h['@_HotelId'] || '')).filter(Boolean);
    const detailMap = await fetchHotelDetails(hotelIds, checkIn, checkOut, currency);
    console.log('[WebBeds Search] Phase 2 — detail records:', detailMap.size);
    const mergedHotels = pricedHotels.map((priced) => {
        const id = String(priced['@_HotelId'] || '');
        const detail = detailMap.get(id);
        if (!detail) return priced;
        return { ...detail, ...priced, '@_HotelName': detail['@_HotelName'] || priced['@_HotelName'], '@_Address': detail['@_Address'] || priced['@_Address'], '@_Image': detail['@_Image'] || priced['@_Image'], '@_Stars': detail['@_Stars'] || priced['@_Stars'], '@_CityName': detail['@_CityName'] || priced['@_CityName'] };
    });
    res.json({ success: true, data: mergedHotels, count: mergedHotels.length });
}

async function handleWebbedsRooms(req, res) {
    const { hotelId, checkIn, checkOut, rooms, nationality = 5, currency = 520 } = req.body;
    if (!hotelId || !checkIn || !checkOut || !rooms || rooms.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const xmlRequest = buildGetRoomsXML({ hotelId, checkIn, checkOut, rooms, nationality, currency });
    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, { headers: V4_HEADERS, timeout: 60000 });
    const parsedData = parseWebBedsXML(response.data);
    const roomsData = extractRoomsFromResponse(parsedData);
    console.log(`[rooms API] hotelId=${hotelId}, found ${roomsData.length} room options`);
    res.json({ success: true, data: roomsData, count: roomsData.length });
}

async function handleWebbedsBlock(req, res) {
    const { hotelId, checkIn, checkOut, rooms, roomTypeCode, selectedRateBasis, allocationDetails, nationality = 5, currency = 520 } = req.body;
    if (!hotelId || !checkIn || !checkOut || !roomTypeCode || !allocationDetails) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const xmlRequest = buildBlockRoomXML({
        hotelId, checkIn, checkOut,
        rooms: rooms || [{ adults: 2, children: 0, childAges: [] }],
        roomTypeCode, selectedRateBasis: selectedRateBasis || '0', allocationDetails, nationality, currency,
    });
    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, { headers: V4_HEADERS, timeout: 60000 });
    const parsedData = parseWebBedsXML(response.data);
    res.json({ success: true, data: parsedData });
}

async function handleWebbedsBooking(req, res) {
    const { hotelId, checkIn, checkOut, currency = 520, customerReference, roomTypeCode, selectedRateBasis, allocationDetails, adults = 2, childrenAges = [], leadPassenger } = req.body;
    if (!hotelId || !checkIn || !checkOut || !roomTypeCode || !allocationDetails || !leadPassenger) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const salutationMap = { Mr: 1, Mrs: 2, Ms: 3, Miss: 4 };
    const salutation = salutationMap[leadPassenger.title] || 1;
    const xmlRequest = buildBookingXML({
        hotelId, checkIn, checkOut, currency,
        customerReference: customerReference || `SEFWEB-${Date.now()}`,
        roomTypeCode, selectedRateBasis: selectedRateBasis || '0', allocationDetails,
        adultsCode: adults, actualAdults: adults, childrenAges,
        leadPassenger: { salutation, firstName: leadPassenger.firstName, lastName: leadPassenger.lastName },
    });
    const response = await axios.post(WEBBEDS_CONFIG.baseUrl, xmlRequest, { headers: V4_HEADERS, timeout: 60000 });
    const parsedData = parseWebBedsXML(response.data);
    res.json({ success: true, data: parsedData });
}

async function handlePaymentInitiate(req, res) {
    const { merchantOrderId, amount, currency, identityTaxNumber, email, phoneNumber, card } = req.body;
    if (!merchantOrderId || !amount || !currency || !identityTaxNumber || !card) {
        return res.status(400).json({ error: 'Eksik ödeme alanları' });
    }
    // Remote Config'den oku (mobil ile aynı key'ler)
    const config = await getKuveytTurkConfigFromRC(admin.app());
    if (!isKuveytTurkConfigReady(config)) {
        return res.status(500).json({ error: 'KuveytTürk yapılandırması eksik' });
    }
    const siteUrl = process.env.APP_URL || 'https://sefernur-app.web.app';
    // Web'de callback her zaman Cloud Function endpoint'ine yönlenmeli
    // (RC'deki okUrl/failUrl mobil deep link'ler, web için kullanılmaz)
    const callbackUrl = `${siteUrl}/api/payment/kuveytturk/callback`;
    const okUrl = callbackUrl;
    const failUrl = callbackUrl;
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const xmlRequest = build3DPaymentXml(config, {
        merchantOrderId, amount, currency, identityTaxNumber, email, phoneNumber, card, clientIp, okUrl, failUrl,
    });
    const response = await axios.post(`${config.baseUrl}/ThreeDModelPayGate`, xmlRequest, {
        headers: { 'Content-Type': 'application/xml' }, responseType: 'text', timeout: 60000,
    });
    res.json({ success: true, paymentHtml: response.data, orderId: merchantOrderId });
}

async function handlePaymentCallback(req, res) {
    const siteUrl = process.env.APP_URL || 'https://sefernur-app.web.app';

    // Handle GET requests (invalid callback)
    if (req.method === 'GET') {
        return res.redirect(`${siteUrl}/payment/kuveytturk/result?status=failed&message=Ge%C3%A7ersiz+%C3%B6deme+callback+iste%C4%9Fi&responseCode=INVALID_CALLBACK`);
    }

    try {
        const authResponseRaw = (req.body && req.body.AuthenticationResponse) || '';
        if (!authResponseRaw) {
            return res.redirect(`${siteUrl}/payment/kuveytturk/result?status=failed&message=AuthenticationResponse+bulunamad%C4%B1&responseCode=AUTH_MISSING`);
        }
        const auth = parseAuthResponse(authResponseRaw);
        const merchantOrderId = auth.merchantOrderId || '';
        if (auth.responseCode !== '00' || !auth.md || !merchantOrderId || !auth.amount) {
            const url = new URL(`${siteUrl}/payment/kuveytturk/result`);
            url.searchParams.set('status', 'failed');
            if (merchantOrderId) url.searchParams.set('orderId', merchantOrderId);
            url.searchParams.set('message', auth.responseMessage || '3D doğrulama başarısız');
            url.searchParams.set('responseCode', auth.responseCode || 'AUTH_FAILED');
            return res.redirect(url.toString());
        }
        // Remote Config'den oku (mobil ile aynı key'ler)
        const config = await getKuveytTurkConfigFromRC(admin.app());
        if (!isKuveytTurkConfigReady(config)) {
            const url = new URL(`${siteUrl}/payment/kuveytturk/result`);
            url.searchParams.set('status', 'failed');
            url.searchParams.set('message', 'KuveytTürk yapılandırması eksik');
            url.searchParams.set('responseCode', 'CONFIG_ERROR');
            return res.redirect(url.toString());
        }
        const xmlRequest = build3DApprovalXml(config, merchantOrderId, auth.amount, auth.md);
        const provisionResp = await axios.post(`${config.baseUrl}/ThreeDModelProvisionGate`, xmlRequest, {
            headers: { 'Content-Type': 'application/xml' }, responseType: 'text', timeout: 60000,
        });
        const provisionResult = parseProvisionResponse(provisionResp.data);
        const url = new URL(`${siteUrl}/payment/kuveytturk/result`);
        if (provisionResult.success) {
            url.searchParams.set('status', 'success');
            url.searchParams.set('orderId', merchantOrderId);
            url.searchParams.set('message', 'Ödeme başarıyla tamamlandı');
            url.searchParams.set('responseCode', provisionResult.responseCode);
        } else {
            url.searchParams.set('status', 'failed');
            url.searchParams.set('orderId', merchantOrderId);
            url.searchParams.set('message', provisionResult.responseMessage || 'Provizyon başarısız');
            url.searchParams.set('responseCode', provisionResult.responseCode);
        }
        res.redirect(url.toString());
    } catch (error) {
        console.error('[payment callback] error:', error);
        const url = new URL(`${siteUrl}/payment/kuveytturk/result`);
        url.searchParams.set('status', 'failed');
        url.searchParams.set('message', 'Ödeme callback işlemi başarısız');
        url.searchParams.set('responseCode', 'CALLBACK_ERROR');
        res.redirect(url.toString());
    }
}

// ── Single consolidated API function ──
const ROUTES = {
    '/api/webbeds/search': handleWebbedsSearch,
    '/api/webbeds/rooms': handleWebbedsRooms,
    '/api/webbeds/block': handleWebbedsBlock,
    '/api/webbeds/booking': handleWebbedsBooking,
    '/api/payment/kuveytturk/initiate': handlePaymentInitiate,
    '/api/payment/kuveytturk/callback': handlePaymentCallback,
};

exports.api = onRequest({ region: 'europe-west1', timeoutSeconds: 120, memory: '512MiB' }, async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

    // Route by path
    const path = req.path.replace(/\/+$/, '') || '/'; // normalize trailing slash
    const handler = ROUTES[path];
    if (!handler) {
        return res.status(404).json({ error: 'Not found', path });
    }
    try {
        await handler(req, res);
    } catch (error) {
        console.error(`[api ${path}] error:`, error);
        res.status(500).json({ error: 'Internal server error', message: error.message || 'Unknown error' });
    }
});

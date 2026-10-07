/**
 * DIEUDONNÉ CARE - Authentication & RBAC Engine
 */

let currentUserProfile = null;

const ROLE_PERMISSIONS = {
    ADMIN: ['*'],
    CENTER: ['manage_own_center', 'create_child', 'create_widow', 'submit_report'],
    DONOR: ['make_donation', 'sponsor_child', 'view_public_profiles', 'view_own_donations'],
    PARTNER: ['view_impact_reports', 'co_finance_project'],
    BENEFICIARY: ['view_own_support_status']
};

function hasPermission(permission) {
    if (!currentUserProfile) return false;
    const permissions = ROLE_PERMISSIONS[currentUserProfile.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
}

async function registerUser(email, password, fullName, role, country, city) {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        const profileData = {
            uid: uid,
            email: email,
            fullName: fullName,
            role: role,
            country: country,
            city: city,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'ACTIVE'
        };

        await db.collection('users').doc(uid).set(profileData);
        currentUserProfile = profileData;
        onAuthStateChangedHandler(currentUserProfile);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const doc = await db.collection('users').doc(userCredential.user.uid).get();
        if (doc.exists) {
            currentUserProfile = doc.data();
            onAuthStateChangedHandler(currentUserProfile);
            return { success: true };
        } else {
            throw new Error("Profil utilisateur introuvable.");
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logoutUser() {
    await firebase.auth().signOut();
    currentUserProfile = null;
    onAuthStateChangedHandler(null);
}

function initAuthListener() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                currentUserProfile = doc.data();
                onAuthStateChangedHandler(currentUserProfile);
            }
        } else {
            currentUserProfile = null;
            onAuthStateChangedHandler(null);
        }
    });
}

function onAuthStateChangedHandler(profile) {
    const userDisplay = document.getElementById('user-display');
    const authBtn = document.getElementById('auth-btn');
    const adminTab = document.getElementById('tab-admin');

    if (profile) {
        userDisplay.classList.remove('hidden');
        userDisplay.innerText = `${profile.fullName} (${t('role_' + profile.role.toLowerCase())})`;
        authBtn.innerText = t('btn_logout');
        authBtn.onclick = logoutUser;

        if (profile.role === 'ADMIN' || profile.role === 'CENTER') {
            adminTab.classList.remove('hidden');
        } else {
            adminTab.classList.add('hidden');
        }
    } else {
        userDisplay.classList.add('hidden');
        userDisplay.innerText = '';
        authBtn.innerText = t('btn_login');
        authBtn.onclick = () => openAuthModal();
        adminTab.classList.add('hidden');
    }
}

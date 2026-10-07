/**
 * DIEUDONNÉ CARE - Business Logic, Management & Donations
 */

const CURRENCY_RATES = { USD: 1, CDF: 2850, UGX: 3700, KES: 130, RWF: 1300 };

// Initialisation des données réelles du premier centre (Bukavu, RDC)
async function seedInitialDataIfEmpty() {
    const centerRef = db.collection('centers').doc('centre-dieudonne-bukavu');
    const doc = await centerRef.get();

    if (!doc.exists) {
        await centerRef.set({
            id: 'centre-dieudonne-bukavu',
            name: 'CENTRE DIEUDONNÉ',
            country: 'RDC',
            city: 'Bukavu',
            childrenCount: 10,
            widowsCount: 5,
            totalBeneficiaries: 15,
            status: 'ACTIVE',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 10 Enfants initiaux
        for (let i = 1; i <= 10; i++) {
            const childId = `CHILD-BUK-${String(i).padStart(3, '0')}`;
            await db.collection('children').doc(childId).set({
                id: childId,
                centerId: 'centre-dieudonne-bukavu',
                publicCode: `ENF-BUK-${String(i).padStart(3, '0')}`,
                realName: `Enfant Protégé ${i}`,
                age: 6 + (i % 8),
                gradeLevel: `${i}ème Année Primaire`,
                healthStatus: 'Bonne santé générale',
                needs: 'Fournitures, Uniforme, Frais de scolarité',
                isSponsored: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // 5 Veuves initiales
        const projects = [
            "Atelier de Couture & Création",
            "Commerce d'Alimentation Générale",
            "Unité de Production Artisanale",
            "Boulangerie Locale Aînée",
            "Projet d'Élevage Volailles"
        ];

        for (let i = 1; i <= 5; i++) {
            const widowId = `WIDOW-BUK-${String(i).padStart(3, '0')}`;
            await db.collection('widows').doc(widowId).set({
                id: widowId,
                centerId: 'centre-dieudonne-bukavu',
                publicCode: `VEU-BUK-${String(i).padStart(3, '0')}`,
                skill: projects[i - 1],
                targetBudget: 300 + (i * 50),
                currentFunded: 0,
                status: 'IN_PROGRESS',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

// Chargement des Enfants
async function fetchChildrenList() {
    try {
        const snapshot = await db.collection('children').get();
        const children = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!currentUserProfile || (currentUserProfile.role !== 'ADMIN' && currentUserProfile.role !== 'CENTER')) {
                delete data.realName;
            }
            children.push(data);
        });
        renderChildrenGrid(children);
    } catch (e) { console.error(e); }
}

function renderChildrenGrid(children) {
    const container = document.getElementById('children-grid-container');
    if (!container) return;

    container.innerHTML = children.map(c => `
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
                <div class="flex justify-between items-center">
                    <span class="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">${c.publicCode}</span>
                    <span class="${c.isSponsored ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'} text-[11px] font-bold px-2 py-0.5 rounded-full">
                        ${c.isSponsored ? 'Parrainé' : 'En attente'}
                    </span>
                </div>
                <h3 class="font-bold text-slate-900 text-lg mt-2">${c.realName || 'Bénéficiaire (' + c.age + ' ans)'}</h3>
                <p class="text-xs text-slate-500">Niveau : ${c.gradeLevel}</p>
                <p class="text-xs text-slate-400 mt-1">📍 Centre DIEUDONNÉ (Bukavu)</p>
            </div>
            <button onclick="openDonateModal('CHILD', '${c.id}', 'Parrainer ${c.publicCode}')" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm">
                ❤️ Parrainer cet enfant
            </button>
        </div>
    `).join('');
}

// Chargement des Veuves
async function fetchWidowsList() {
    try {
        const snapshot = await db.collection('widows').get();
        const widows = [];
        snapshot.forEach(doc => widows.push(doc.data()));
        renderWidowsGrid(widows);
    } catch (e) { console.error(e); }
}

function renderWidowsGrid(widows) {
    const container = document.getElementById('widows-grid-container');
    if (!container) return;

    container.innerHTML = widows.map(w => {
        const target = w.targetBudget || 300;
        const current = w.currentFunded || 0;
        const percent = Math.min(100, Math.round((current / target) * 100));

        return `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div class="flex justify-between items-center">
                    <span class="bg-amber-50 text-amber-800 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-amber-200">${w.publicCode}</span>
                    <span class="text-xs font-bold text-slate-500">${percent}% financé</span>
                </div>
                <h3 class="font-bold text-slate-900 text-base">${w.skill}</h3>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div class="bg-amber-500 h-full" style="width: ${percent}%"></div>
                </div>
                <div class="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Reçu : $${current}</span>
                    <span>Cible : $${target}</span>
                </div>
                <button onclick="openDonateModal('WIDOW', '${w.id}', 'Financer ${w.publicCode}')" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm">
                    🤝 Soutenir ce projet
                </button>
            </div>
        `;
    }).join('');
}

// Enregistrement des dons
async function recordDonation(data) {
    try {
        const docRef = db.collection('donations').doc();
        const payload = {
            id: docRef.id,
            donorId: currentUserProfile ? currentUserProfile.uid : 'ANONYMOUS',
            targetType: data.targetType,
            targetId: data.targetId,
            amountUSD: parseFloat(data.amountUSD),
            currency: data.currency,
            amountLocal: parseFloat(data.amountUSD) * (CURRENCY_RATES[data.currency] || 1),
            paymentMethod: data.paymentMethod,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await docRef.set(payload);

        if (data.targetType === 'WIDOW') {
            await db.collection('widows').doc(data.targetId).update({
                currentFunded: firebase.firestore.FieldValue.increment(payload.amountUSD)
            });
        }

        alert(`Don de $${payload.amountUSD} USD (${payload.amountLocal} ${payload.currency}) enregistré ! Merci pour votre soutien.`);
        fetchWidowsList();
        loadAdminDashboardData();
    } catch (e) { alert(e.message); }
}

// Tableau de bord Admin
async function loadAdminDashboardData() {
    if (!currentUserProfile || (currentUserProfile.role !== 'ADMIN' && currentUserProfile.role !== 'CENTER')) return;

    const centers = await db.collection('centers').get();
    const children = await db.collection('children').get();
    const widows = await db.collection('widows').get();
    const donations = await db.collection('donations').get();

    document.getElementById('admin-stat-centers').innerText = centers.size;
    document.getElementById('admin-stat-children').innerText = children.size;
    document.getElementById('admin-stat-widows').innerText = widows.size;

    let total = 0;
    donations.forEach(d => total += (d.data().amountUSD || 0));
    document.getElementById('admin-stat-donations').innerText = `$${total.toLocaleString()}`;
}


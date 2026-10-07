/**
 * DIEUDONNÉ CARE - System I18N (Multilingual Engine)
 * Langues gérées : Français (fr), English (en), Swahili (sw)
 */

const translations = {
    fr: {
        appName: "DIEUDONNÉ CARE",
        slogan: "Ensemble pour une Afrique où chaque enfant peut grandir dans la dignité.",
        nav_home: "Accueil",
        nav_children: "Enfants",
        nav_widows: "Veuves",
        nav_projects: "Projets",
        nav_admin: "Administration",
        btn_login: "Connexion",
        btn_logout: "Déconnexion",
        btn_sponsor_child: "Parrainer un enfant",
        btn_support_widow: "Soutenir une veuve",
        btn_donate: "Faire un don",
        stat_children: "Enfants pris en charge",
        stat_widows: "Veuves accompagnées",
        stat_centers: "Centres actifs",
        stat_countries: "Pays couverts",
        role_admin: "Administrateur",
        role_donor: "Donateur",
        role_center: "Centre",
        role_partner: "Partenaire",
        role_beneficiary: "Bénéficiaire",
        center_default_title: "CENTRE DIEUDONNÉ",
        center_default_location: "Bukavu, RDC"
    },
    en: {
        appName: "DIEUDONNÉ CARE",
        slogan: "Together for an Africa where every child can grow with dignity.",
        nav_home: "Home",
        nav_children: "Children",
        nav_widows: "Widows",
        nav_projects: "Projects",
        nav_admin: "Administration",
        btn_login: "Login",
        btn_logout: "Logout",
        btn_sponsor_child: "Sponsor a child",
        btn_support_widow: "Support a widow",
        btn_donate: "Donate",
        stat_children: "Children supported",
        stat_widows: "Widows accompanied",
        stat_centers: "Active centers",
        stat_countries: "Countries covered",
        role_admin: "Administrator",
        role_donor: "Donor",
        role_center: "Center",
        role_partner: "Partner",
        role_beneficiary: "Beneficiary",
        center_default_title: "DIEUDONNÉ CENTER",
        center_default_location: "Bukavu, DRC"
    },
    sw: {
        appName: "DIEUDONNÉ CARE",
        slogan: "Pamoja kwa Afrika ambapo kila mtoto anaweza kukua kwa heshima.",
        nav_home: "Mwanzo",
        nav_children: "Watoto",
        nav_widows: "Wajane",
        nav_projects: "Miradi",
        nav_admin: "Usimamizi",
        btn_login: "Ingia",
        btn_logout: "Ondoka",
        btn_sponsor_child: "Mlee mtoto",
        btn_support_widow: "Msaidie mjane",
        btn_donate: "Toa msaada",
        stat_children: "Watoto wanaosaidiwa",
        stat_widows: "Wajane wanaosaidiwa",
        stat_centers: "Vituo vinavyofanya kazi",
        stat_countries: "Nchi zinazohusika",
        role_admin: "Msimamizi",
        role_donor: "Mfadhili",
        role_center: "Kituo",
        role_partner: "Mshirika",
        role_beneficiary: "Mfaidika",
        center_default_title: "KITUO CHA DIEUDONNÉ",
        center_default_location: "Bukavu, RDC"
    }
};

let currentLang = localStorage.getItem('app_lang') || 'fr';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateDOMTranslations();
}

function t(key) {
    return translations[currentLang][key] || translations['fr'][key] || key;
}

function updateDOMTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
            element.placeholder = t(key);
        } else {
            element.innerText = t(key);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDOMTranslations();
});

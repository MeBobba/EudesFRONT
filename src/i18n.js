// src/i18n.js
import { createI18n } from 'vue-i18n';

const messages = {
    en: {
        home: 'Home',
        community: 'Community',
        games: 'Games',
        staff: 'Staff',
        musics: 'Musics',
        news: 'News',
        searchPlaceholder: 'Search...',
        logout: 'Logout',
    },
    fr: {
        home: 'Accueil',
        community: 'Communauté',
        games: 'Jeux',
        staff: 'Équipe',
        musics: 'Musiques',
        news: 'Actualités',
        searchPlaceholder: 'Recherche...',
        logout: 'Déconnexion',
    },
    it: {
        home: 'Home',
        community: 'Comunità',
        games: 'Giochi',
        staff: 'Staff',
        musics: 'Musica',
        news: 'Notizie',
        searchPlaceholder: 'Cerca...',
        logout: 'Logout',
    },
};

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
    locale: savedLocale, // Langue par défaut
    fallbackLocale: 'en',
    messages,
});

export default i18n;

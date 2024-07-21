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
        terms: 'Terms',
        privacy: 'Privacy',
        loading: 'Loading...',
        nomoreposts: 'No more posts...',
        comment: 'Comment',
        comments: 'Comments',
    },
    fr: {
        home: 'Accueil',
        community: 'Communauté',
        games: 'Jeux',
        staff: 'Équipe',
        musics: 'Musiques',
        news: 'News',
        searchPlaceholder: 'Recherche...',
        logout: 'Déconnexion',
        terms: 'Conditions',
        privacy: 'Confidentialité',
        loading: 'Chargement...',
        nomoreposts: 'Pas d\'autre publication...',
        comment: 'Commenter',
        comments: 'Commentaires',
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
        terms:'Condizioni',
        privacy: 'Riservatezza',
        loading: 'Caricamento...',
        nomoreposts: 'Nessun altra publicazione...',
        comment: 'Rispondere',
        comments: 'Risposte',
    },
};

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
    locale: savedLocale, // Langue par défaut
    fallbackLocale: 'en',
    messages,
});

export default i18n;

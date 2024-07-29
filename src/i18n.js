// src/i18n.js
import { createI18n } from 'vue-i18n';

const messages = {
    "fr": {
        "home": "Home",
        "dashboard": "Accueil",
        "downloadapp": "Télécharger l'app",
        "community": "Communauté",
        "games": "Jeux",
        "staff": "Équipe",
        "musics": "Musiques",
        "news": "News",
        "searchPlaceholder": "Recherche...",
        "logout": "Déconnexion",
        "terms": "Conditions",
        "privacy": "Confidentialité",
        "loading": "Chargement...",
        "nomoreposts": "Pas d'autre publication...",
        "comment": "Commenter",
        "comments": "Commentaires",
        "credits": "Crédits",
        "pixels": "Pixels",
        "points": "Points",
        "settings": "Paramètres",
        "play": "Jouer",
        "uprogress": "Progression du chargement",
        "uploading": "Chargement de l'image de profil...",
        "close": "Fermer",
        "addcomment": "Ajouter un commentaire...",
        "logouterror": "Erreur de déconnexion:",
        "searchinguserserror": "Erreur dans la recherche des utilisateurs :",
        "oops": "Oups!",
        "uploadcoverimage": "Chargement de l'image de couverture...",
        "errorfetchinguser": "Erreur dans l'extraction du profil de l'utilisateur :",
        "erroruploadingcover": "Erreur de téléchargement de l'image de couverture :",
        "successcoverimage": "L'image de couverture a été chargée avec succès !",
        "errorresttingcoverimage": "Erreur de réinitialisation de l'image de couverture :",
        "erroruploadingprofile": "Erreur de téléchargement de l'image de profil :",
        "errorupdatingprofile": "Erreur de mise à jour de l'image de profil dans le profil :",
        "successprofileimage": "L'image du profil a été chargée avec succès !",
        "errorresttingprofileimage": "Erreur de réinitialisation de l'image de profil :",
        "edit": "Modifier",
        "delete": "Supprimer",
        "save": "Sauvegarder",
        "searchgifs": "Rechercher des GIFs",
        "whatsonyourmind": "Quoi de neuf ?",
        "invalidvideourl": "URL vidéo invalide",
        "removevideo": "Supprimer la vidéo",
        "public": "Public",
        "friends": "Amis",
        "post": "Publier",
        "shop": "Boutique",
        "previouspage": "Précédent",
        "nextpage": "Suivant",
        "changeimageheader": "Change Image Header",
        "shopping": {
            "welcome": "Bienvenue dans notre boutique",
            "home": "Accueil",
            "pixelconverter": "Convertisseur de Pixels",
            "lotto": "Loto",
            "buytokens": "Acheter des Jetons",
            "buybadges": "Acheter des Badges",
            "buyfurni": "Acheter des Meubles",
            "generatecredits": "Générer des Crédits",
            "generatecreditsdesc": "Si vous avez moins de 10k crédits, vous pouvez générer 10k crédits supplémentaires.",
            "yourwallet": "Votre Portefeuille",
            "errorgeneratecredits": "Erreur lors de la génération des crédits :",
            "enoughcredits": "Vous avez suffisamment de crédits.",
            "tenkcredits": "10k crédits ont été ajoutés à votre compte."
        },
        "gamespage": {
            "newgame": "Ajouter un Nouveau Jeu",
            "playgame": "Jouer",
            "deletegame": "Supprimer"
        },
        "lockscreen": {
            "title": "Compte Verrouillé",
            "unlock": "Déverrouiller",
            "warning": "Attention, le verrouillage de ta session se fera dans :",
            "seconds": "secondes"
        }
    },
    "it": {
        "home": "Home",
        "dashboard": "Home",
        "downloadapp": "Scarica l'app",
        "community": "Comunità",
        "games": "Giochi",
        "staff": "Staff",
        "musics": "Musica",
        "news": "Notizie",
        "searchPlaceholder": "Ricerca...",
        "logout": "Disconnetti",
        "terms": "Termini",
        "privacy": "Privacy",
        "loading": "Caricamento...",
        "nomoreposts": "Nessun altro post...",
        "comment": "Commenta",
        "comments": "Commenti",
        "credits": "Crediti",
        "pixels": "Pixel",
        "points": "Punti",
        "settings": "Impostazioni",
        "play": "Gioca",
        "uprogress": "Avanzamento del caricamento",
        "uploading": "Caricamento dell'immagine del profilo...",
        "close": "Chiudi",
        "addcomment": "Aggiungi un commento...",
        "logouterror": "Errore di disconnessione:",
        "searchinguserserror": "Errore nella ricerca degli utenti:",
        "oops": "Ops!",
        "uploadcoverimage": "Caricamento dell'immagine di copertina...",
        "errorfetchinguser": "Errore nel recupero del profilo utente:",
        "erroruploadingcover": "Errore nel caricamento dell'immagine di copertina:",
        "successcoverimage": "L'immagine di copertina è stata caricata con successo!",
        "errorresttingcoverimage": "Errore nel ripristino dell'immagine di copertina:",
        "erroruploadingprofile": "Errore nel caricamento dell'immagine del profilo:",
        "errorupdatingprofile": "Errore nell'aggiornamento dell'immagine del profilo:",
        "successprofileimage": "L'immagine del profilo è stata caricata con successo!",
        "errorresttingprofileimage": "Errore nel ripristino dell'immagine del profilo:",
        "edit": "Modifica",
        "delete": "Elimina",
        "save": "Salva",
        "searchgifs": "Cerca GIF",
        "whatsonyourmind": "Cosa c'è di nuovo?",
        "invalidvideourl": "URL video non valido",
        "removevideo": "Rimuovi video",
        "public": "Pubblico",
        "friends": "Amici",
        "post": "Pubblica",
        "shop": "Negozio",
        "previouspage": "Precedente",
        "nextpage": "Successivo",
        "changeimageheader": "Change Image Header",
        "shopping": {
            "welcome": "Benvenuto nella nostra boutique",
            "home": "Home",
            "pixelconverter": "Convertitore di Pixel",
            "lotto": "Lotto",
            "buytokens": "Compra Token",
            "buybadges": "Compra Badge",
            "buyfurni": "Compra Mobili",
            "generatecredits": "Genera Crediti",
            "generatecreditsdesc": "Se hai meno di 10k crediti, puoi generare 10k crediti in più.",
            "yourwallet": "Il tuo Portafoglio",
            "errorgeneratecredits": "Errore nella generazione dei crediti:",
            "enoughcredits": "Hai abbastanza crediti.",
            "tenkcredits": "10k crediti sono stati aggiunti al tuo account."
        },
        "gamespage": {
            "newgame": "Aggiungi Nuovo Gioco",
            "playgame": "Gioca",
            "deletegame": "Elimina"
        },
        "lockscreen": {
            "title": "Account Bloccato",
            "unlock": "Sblocca",
            "warning": "Si noti che la sessione verrà bloccata in :",
            "seconds": "secondi"
        }
    },
    "en": {
        "home": "Home",
        "dashboard": "Home",
        "downloadapp": "Download App",
        "community": "Community",
        "games": "Games",
        "staff": "Team",
        "musics": "Music",
        "news": "News",
        "searchPlaceholder": "Search...",
        "logout": "Logout",
        "terms": "Terms",
        "privacy": "Privacy",
        "loading": "Loading...",
        "nomoreposts": "No more posts...",
        "comment": "Comment",
        "comments": "Comments",
        "credits": "Credits",
        "pixels": "Pixels",
        "points": "Points",
        "settings": "Settings",
        "play": "Play",
        "uprogress": "Loading Progress",
        "uploading": "Uploading profile image...",
        "close": "Close",
        "addcomment": "Add a comment...",
        "logouterror": "Logout error:",
        "searchinguserserror": "Error searching users:",
        "oops": "Oops!",
        "uploadcoverimage": "Uploading cover image...",
        "errorfetchinguser": "Error fetching user profile:",
        "erroruploadingcover": "Error uploading cover image:",
        "successcoverimage": "Cover image uploaded successfully!",
        "errorresttingcoverimage": "Error resetting cover image:",
        "erroruploadingprofile": "Error uploading profile image:",
        "errorupdatingprofile": "Error updating profile image:",
        "successprofileimage": "Profile image uploaded successfully!",
        "errorresttingprofileimage": "Error resetting profile image:",
        "edit": "Edit",
        "delete": "Delete",
        "save": "Save",
        "searchgifs": "Search GIFs",
        "whatsonyourmind": "What's on your mind?",
        "invalidvideourl": "Invalid video URL",
        "removevideo": "Remove video",
        "public": "Public",
        "friends": "Friends",
        "post": "Post",
        "shop": "Shop",
        "previouspage": "Previous",
        "nextpage": "Next",
        "changeimageheader": "Change Image Header",
        "shopping": {
            "welcome": "Welcome to Our Shop",
            "home": "Home",
            "pixelconverter": "Pixel Converter",
            "lotto": "Lotto",
            "buytokens": "Buy Tokens",
            "buybadges": "Buy Badges",
            "buyfurni": "Buy Furniture",
            "generatecredits": "Generate Credits",
            "generatecreditsdesc": "If you have less than 10k credits, you can generate 10k more credits.",
            "yourwallet": "Your Wallet",
            "errorgeneratecredits": "Error generating credits:",
            "enoughcredits": "You have enough credits.",
            "tenkcredits": "10k credits have been added to your account."
        },
        "gamespage": {
            "newgame": "Add New Game",
            "playgame": "Play",
            "deletegame": "Delete"
        },
        "lockscreen": {
            "title": "Account Locked",
            "unlock": "Unlock",
            "warning": "Please note that your session will be locked in :",
            "seconds": "seconds"
        }
    }
};

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
    locale: savedLocale, // Langue par défaut
    fallbackLocale: 'en',
    messages,
});

export default i18n;

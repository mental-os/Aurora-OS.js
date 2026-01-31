import type { TranslationDict } from '@/i18n/types';

export const fr: TranslationDict = {
  "time": {
    "yesterday": "Hier"
  },
  "common": {
    "name": "Nom",
    "color": "Couleur",
    "cancel": "Annuler",
    "save": "Enregistrer"
  },
  "game": {
    "intro": {
      "initialize": "Initialiser le système",
      "clickToStart": "CLIQUEZ POUR COMMENCER",
      "skipHint": "ESC ou ESPACE pour passer"
    },
    "mainMenu": {
      "continue": {
        "label": "Continuer",
        "desc": {
          "canContinue": "Reprendre votre boucle précédente",
          "noData": "Aucune donnée de boucle trouvée"
        }
      },
      "newGame": {
        "label": "Nouvelle boucle",
        "desc": "Repartir à zéro (efface les données)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Configurer les paramètres globaux"
      },
      "exit": {
        "label": "Éteindre",
        "desc": "Terminer la session",
        "confirm": {
          "title": "Arrêt du Système",
          "message": "Êtes-vous sûr de vouloir éteindre le système ? Les progrès non sauvegardés peuvent être perdus.",
          "cancel": "Annuler",
          "confirm": "Éteindre"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Réglages BIOS",
      "hardwareAcceleration": "Accélération matérielle",
      "fullScreen": "Plein écran",
      "immersiveMode": "Mode immersif",
      "fullScreenEnter": "Entrer",
      "fullScreenExit": "Quitter",
      "softReset": "Réinitialisation douce",
      "softResetHint": "Recharger l’application",
      "softResetConfirm": "Réinitialisation douce : l’application sera rechargée tout en conservant vos données. Continuer ?",
      "factoryReset": "Réinitialisation complète",
      "factoryResetHint": "Effacer toutes les données",
      "factoryResetConfirm": "RÉINITIALISATION COMPLÈTE : cela effacera TOUTES les données, utilisateurs et fichiers. Cette action est irréversible. Êtes-vous sûr ?"
    },
    "footer": {
      "originalDistribution": "Distribution d’origine",
      "temperedDistribution": "Distribution altérée"
    }
  },
  "appDescriptions": {
    "finder": "Gestionnaire de fichiers",
    "browser": "Accéder au web",
    "mail": "Lire et écrire des emails",
    "appStore": "Télécharger et gérer des apps",
    "terminal": "Interface en ligne de commande",
    "systemSettings": "Configurer votre système",
    "notepad": "Éditer des fichiers texte",
    "messages": "Discuter avec des amis",
    "calendar": "Gérer votre agenda",
    "photos": "Afficher et gérer des photos",
    "music": "Écouter votre musique préférée",
    "devCenter": "Outils de développement"
  },
  "a11y": {
    "common": {
      "close": "Fermer",
      "open": "Ouvrir",
      "notAvailable": "N/A"
    },
    "sidebar": {
      "toggleSidebar": "Basculer la barre latérale"
    },
    "pagination": {
      "pagination": "Pagination",
      "goToPreviousPage": "Aller à la page précédente",
      "goToNextPage": "Aller à la page suivante",
      "previous": "Précédent",
      "next": "Suivant",
      "morePages": "Plus de pages"
    },
    "breadcrumb": {
      "breadcrumb": "Fil d’ariane",
      "more": "Plus"
    },
    "carousel": {
      "previousSlide": "Diapositive précédente",
      "nextSlide": "Diapositive suivante"
    }
  },
  "commandPalette": {
    "title": "Palette de commandes",
    "description": "Recherchez une commande à exécuter..."
  },
  "login": {
    "softReset": "Réinitialisation douce",
    "hardReset": "Réinitialisation complète",
    "hardResetConfirm": "Réinitialisation complète : toutes les données seront effacées. Continuer ?",
    "selectUser": "Sélectionner un utilisateur",
    "enterPasswordToUnlock": "Saisissez le mot de passe pour déverrouiller",
    "restoringPreviousSession": "Restauration de la session précédente",
    "passwordPlaceholder": "Mot de passe",
    "incorrectPassword": "Mot de passe incorrect",
    "hint": "Indice",
    "enterSystem": "Entrer dans le système",
    "switchAccount": "Changer de compte",
    "back": "Retour",
    "suspendToSwitch": "Suspendre la session pour changer ?",
    "cancel": "Annuler",
    "switchUser": "Changer d’utilisateur",
    "logOut": "Déconnexion",
    "logOutConfirm": "Déconnecter {{username}} ? Cela fermera toutes les fenêtres et supprimera les modifications non enregistrées.",
    "active": "Actif",
    "resume": "Reprendre",
    "sessionActive": "Session active"
  },
  "app": {
    "loadingKernel": "CHARGEMENT DU NOYAU..."
  },
  "menubar": {
    "menus": {
      "file": "Fichier",
      "shell": "Shell",
      "edit": "Édition",
      "format": "Format",
      "song": "Morceau",
      "view": "Affichage",
      "go": "Aller",
      "controls": "Contrôles",
      "window": "Fenêtre",
      "help": "Aide",
      "store": "Boutique",
      "history": "Historique",
      "bookmarks": "Favoris",
      "mailbox": "Boîte aux lettres",
      "message": "Message",
      "devCenter": "Centre DEV",
      "tools": "Outils",
      "image": "Image",
      "conversations": "Conversations"
    },
    "items": {
      "newWindow": "Nouvelle fenêtre",
      "newFolder": "Nouveau dossier",
      "open": "Ouvrir",
      "changeWallpaper": "Changer le fond d'écran",
      "closeWindow": "Fermer la fenêtre",
      "undo": "Annuler",
      "redo": "Rétablir",
      "cut": "Couper",
      "copy": "Copier",
      "paste": "Coller",
      "selectAll": "Tout sélectionner",
      "reload": "Recharger",
      "toggleFullscreen": "Plein écran",
      "minimize": "Réduire",
      "bringAllToFront": "Tout ramener au premier plan",
      "back": "Précédent",
      "forward": "Suivant",
      "enclosingFolder": "Dossier parent",
      "getInfo": "Lire les informations",
      "moveToTrash": "Mettre à la corbeille"
    },
    "help": {
      "appHelp": "Aide de {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Fonction non implémentée"
    },
    "system": {
      "aboutThisComputer": "À propos de cet ordinateur...",
      "systemSettings": "Réglages du système...",
      "appStore": "Boutique d’apps...",
      "lockScreen": "Verrouiller l’écran",
      "switchUser": "Changer d’utilisateur",
      "user": "Utilisateur",
      "logOutAs": "Déconnexion : {{username}}",
      "viewSystemInfo": "Voir les informations système",
      "viewSystemSettings": "Voir les réglages système",
      "returnToLoginWhile": "Retourner à l’écran de connexion en",
      "returnToUserSelectionWhile": "Retourner à la sélection d’utilisateur en",
      "keepingSession": "conservant la session",
      "clearingSession": "effaçant la session",
      "panic": "PANIC",
      "hardReset": "Réinitialisation complète",
      "warning": "Avertissement",
      "panicWarningBody": "Ceci réinitialisera {{productName}} aux paramètres d’usine. Pratique comme bouton panique en cas de problème.",
      "serverTime": "Heure du serveur (UTC)",
      "localTime": "Heure locale"
    },
    "app": {
      "aboutApp": "À propos de {{appName}}",
      "settings": "Réglages...",
      "quitApp": "Quitter {{appName}}"
    }
  },
  "notifications": {
    "title": "Notifications",
    "titles": {
      "permissionDenied": "Permission refusée"
    },
    "clearAll": "Tout effacer",
    "new": "Nouveau",
    "subtitles": {
      "appMissing": "APP Manquante",
      "permissionDenied": "Permission Refusée",
      "saved": "Enregistré",
      "deleted": "Supprimé",
      "moved": "Déplacé",
      "trash": "Corbeille",
      "failed": "Échoué",
      "ui": "Interface",
      "validation": "Validation",
      "success": "Succès",
      "error": "Erreur",
      "info": "Infos",
      "warning": "Avertissement",
      "fileError": "Erreur de fichier"
    },
    "empty": "Aucune notification",
    "clearApp": "Tout effacer de cette application",
    "messageFrom": "Message de {{sender}}"
  },
  "memory": {
    "title": "Mémoire",
    "used": "Utilisée",
    "pressure": "Pression",
    "appMemory": "Mémoire d’app",
    "wiredMemory": "Mémoire résidente",
    "processName": "Nom du processus",
    "memory": "Mémoire",
    "swapUsed": "Fichier d’échange",
    "systemWired": "Système Aurora",
    "activeSession": "Mémoire résidente (Session active)",
    "userSession": "Session : {{user}}",
    "backgroundSession": "Mémoire inactif (Arrière-plan)",
    "backgroundProcesses": "{{count}} processus en arrière-plan",
    "instances": "{{count}} instances",
    "type": {
      "mainWindow": "Fenêtre principale",
      "extraWindow": "Fenêtre supplémentaire",
      "extraTabs": "{{count}} onglets suppl."
    },
    "error": {
      "title": "Mémoire Insuffisante",
      "description": "Impossible d'ouvrir {{appName}}. Pas assez de mémoire RAM disponible."
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Rechercher des mises à jour...",
      "viewMyAccount": "Voir mon compte"
    },
    "categories": {
      "all": "Tout",
      "productivity": "Productivité",
      "media": "Médias",
      "utilities": "Utilitaires",
      "development": "Développement",
      "system": "Système"
    },
    "searchPlaceholder": "Rechercher des apps...",
    "empty": {
      "title": "Aucune app trouvée",
      "description": "Essayez d'ajuster votre recherche ou le filtre de catégorie pour trouver ce que vous cherchez."
    },
    "size": "Taille",
    "sizeUnknown": "Inconnue",
    "install": "Installer",
    "uninstall": "Désinstaller",
    "open": "Ouvrir",
    "cancel": "Annuler",
    "confirm": "Confirmer",
    "restore": "Restaurer",
    "checkFailed": "Check Failed",
    "checkFailedTitle": "Installation Check Failed",
    "restoreSuccess": "{{app}} restored successfully",
    "restoreError": "Failed to restore {{app}}",
    "restorePermissionDenied": "Admin privileges required to restore apps",
    "installingWarning": "Veuillez patienter pendant l'installation de l'application."
  },
  "browser": {
    "menu": {
      "newTab": "Nouvel onglet",
      "closeTab": "Fermer l’onglet"
    },
    "welcome": {
      "title": "Navigateur",
      "description": "Recherchez des informations ou saisissez une URL pour commencer à naviguer.",
      "searchPlaceholder": "Rechercher des sites web ou saisir une adresse...",
      "favorites": "Favoris",
      "recentActivity": "Activité récente"
    },
    "searchPlaceholder": "Rechercher ou saisir une adresse...",
    "error": {
      "pageNotFound": "Page non trouvée",
      "pageNotFoundDesc": "Le site web {{url}} n'a pas pu être trouvé.",
      "goHome": "Aller à l'accueil"
    }
  },
  "music": {
    "sidebar": {
      "library": "Bibliothèque",
      "songs": "Morceaux",
      "favorites": "Favoris",
      "recentlyPlayed": "Récemment écoutés"
    },
    "titles": {
      "songs": "Morceaux",
      "recentlyPlayed": "Récemment écoutés"
    },
    "actions": {
      "playAll": "Tout lire"
    },
    "empty": {
      "recent": {
        "title": "Aucun morceau récemment écouté",
        "description": "Vos morceaux récemment écoutés apparaîtront ici."
      },
      "library": {
        "title": "Aucun morceau trouvé",
        "description": "Aucun fichier audio n'a été trouvé dans votre dossier Musique.",
        "openFolder": "Ouvrir le dossier {{folder}}"
      }
    },
    "folders": {
      "music": "Musique",
      "home": "Accueil"
    },
    "player": {
      "notPlaying": "Aucune lecture",
      "selectSong": "Sélectionnez un morceau"
    },
    "metadata": {
      "unknownArtist": "Artiste inconnu",
      "unknownAlbum": "Album inconnu",
      "unknownTitle": "Titre inconnu"
    },
    "menu": {
      "newPlaylist": "Nouvelle playlist",
      "import": "Importer...",
      "closeWindow": "Fermer la fenêtre",
      "showInFinder": "Afficher dans Finder",
      "addToPlaylist": "Ajouter à la playlist",
      "play": "Lecture",
      "previousSong": "Morceau précédent",
      "nextSong": "Morceau suivant",
      "volumeUp": "Augmenter le volume",
      "volumeDown": "Diminuer le volume"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Nouvel onglet",
      "clearScrollback": "Effacer l'historique",
      "killProcess": "Tuer le processus"
    },
    "help": {
      "availableCommands": "Commandes disponibles :",
      "usage": "Utilisation",
      "appLaunchHelp": "Lancer des applications installées (ex. Finder)"
    },
    "commands": {
      "help": {
        "description": "Afficher ce message d’aide"
      },
      "ls": {
        "description": "Lister le contenu du répertoire",
        "usage": "ls [chemin]"
      },
      "cd": {
        "description": "Changer de répertoire",
        "usage": "cd <chemin>"
      },
      "pwd": {
        "description": "Afficher le répertoire courant"
      },
      "logout": {
        "description": "Déconnexion de la session actuelle"
      },
      "who": {
        "description": "Afficher qui est connecté"
      },
      "clear": {
        "description": "Effacer l’écran du terminal"
      },
      "cat": {
        "description": "Afficher le contenu du fichier",
        "usage": "cat <fichier>"
      },
      "mkdir": {
        "description": "Créer un répertoire",
        "usage": "mkdir <nom>"
      },
      "touch": {
        "description": "Créer un fichier ou mettre à jour l'horodatage",
        "usage": "touch <nom>"
      },
      "rm": {
        "description": "Supprimer un fichier ou un répertoire",
        "usage": "rm <nom>"
      },
      "cp": {
        "description": "Copier des fichiers",
        "usage": "cp <source> <destination>"
      },
      "mv": {
        "description": "Déplacer (renommer) des fichiers",
        "usage": "mv <source> <destination>"
      },
      "chmod": {
        "description": "Changer les modes de fichier (permissions)",
        "usage": "chmod <mode> <fichier>"
      },
      "chown": {
        "description": "Changer le propriétaire et le groupe du fichier",
        "usage": "chown <propriétaire>[:<groupe>] <fichier>"
      },
      "grep": {
        "description": "Imprimer les lignes correspondant à un motif",
        "usage": "grep <motif> <fichier>"
      },
      "find": {
        "description": "Rechercher des fichiers dans une hiérarchie de répertoires",
        "usage": "find [chemin] [-name motif]"
      },
      "echo": {
        "description": "Afficher une ligne de texte",
        "usage": "echo [texte]"
      },
      "date": {
        "description": "Imprimer la date et l'heure du système"
      },
      "uptime": {
        "description": "Indiquer depuis combien de temps le système fonctionne"
      },
      "whoami": {
        "description": "Imprimer l'utilisateur actuel"
      },
      "hostname": {
        "description": "Imprimer le nom d'hôte du système"
      },
      "reset": {
        "description": "Réinitialiser le système de fichiers aux valeurs par défaut"
      },
      "exit": {
        "description": "Quitter la session shell actuelle"
      },
      "su": {
        "description": "Changer d'ID utilisateur ou devenir superutilisateur",
        "usage": "su [utilisateur] [mot de passe]"
      },
      "sudo": {
        "description": "Exécuter une commande en tant qu'autre utilisateur",
        "usage": "sudo [options] [commande]"
      },
      "history": {
        "description": "Afficher l'historique des commandes du terminal",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} arrive bientôt",
    "descriptions": {
      "mail": "Gérez vos e-mails, contacts et événements de calendrier.",
      "calendar": "Planifiez des réunions, événements et rappels.",
      "default": "Cette application est en cours de développement."
    }
  },
  "filePicker": {
    "openFile": "Ouvrir le fichier",
    "openFileDescription": "Sélectionnez un fichier à ouvrir depuis le système de fichiers",
    "saveFile": "Enregistrer le fichier",
    "saveFileDescription": "Choisissez un emplacement et un nom pour enregistrer votre fichier",
    "emptyFolder": "Ce dossier est vide",
    "nameLabel": "Nom :",
    "untitledPlaceholder": "Sans titre",
    "toasts": {
      "permissionDenied": "Permission refusée : {{name}}"
    },
    "cancel": "Annuler",
    "open": "Ouvrir",
    "save": "Enregistrer"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "L’app Musique n’est pas installée. Installez-la depuis l’App Store.",
      "notepadNotInstalled": "L’app Notes n’est pas installée. Installez-la depuis l’App Store.",
      "photosNotInstalled": "L’app Photos n’est pas installée. Installez-la depuis l’App Store."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} éléments",
      "bytes": "{{count}} octets",
      "type": "Type",
      "owner": "Propriétaire",
      "permissions": "Permissions",
      "modified": "Modifié",
      "size": "Taille"
    },
    "sidebar": {
      "favorites": "Favoris",
      "system": "Système",
      "locations": "Emplacements"
    },
    "places": {
      "home": "Accueil",
      "desktop": "Bureau",
      "documents": "Documents",
      "downloads": "Téléchargements",
      "pictures": "Images",
      "music": "Musique",
      "trash": "Corbeille"
    },
    "actions": {
      "moveToTrash": "Mettre à la corbeille",
      "search": "Rechercher"
    },
    "toasts": {
      "permissionDenied": "Permission refusée : {{name}}",
      "musicNotInstalled": "L’app Musique n’est pas installée. Installez-la depuis l’App Store.",
      "notepadNotInstalled": "L’app Notes n’est pas installée. Installez-la depuis l’App Store.",
      "photosNotInstalled": "L’app Photos n’est pas installée. Installez-la depuis l’App Store.",
      "movedItem": "1 élément déplacé",
      "movedItems": "{{count}} éléments déplacés",
      "movedItemTo": "1 élément déplacé vers {{target}}",
      "movedItemsTo": "{{count}} éléments déplacés vers {{target}}",
      "movedItemToTrash": "1 élément déplacé vers la corbeille",
      "movedItemsToTrash": "{{count}} éléments déplacés vers la corbeille",
      "moveFailedInvalidData": "Déplacement impossible : données invalides",
      "failedToProcessDrop": "Impossible de traiter le dépôt",
      "couldNotGetInfo": "Impossible de récupérer les informations",
      "fileTypeNotSupported": "Le type de fichier '{{type}}' n'est pas pris en charge"
    },
    "search": {
      "noResultsTitle": "Aucun résultat trouvé",
      "noResultsDesc": "Aucun résultat trouvé pour \"{{query}}\"",
      "resultsTitle": "Résultats de recherche ({{count}})"
    },
    "emptyFolder": "Ce dossier est vide"
  },
  "messages": {
    "title": "Messages",
    "sidebar": {
      "conversationsTitle": "Conversations",
      "allMessages": "Tous les messages",
      "unread": "Non lus",
      "starred": "Favoris"
    },
    "search": {
      "placeholder": "Rechercher..."
    },
    "menu": {
      "newMessage": "Nouveau message"
    },
    "auth": {
      "welcomeBack": "Bon retour",
      "createAccount": "Créer un compte",
      "recoverAccount": "Récupérer le compte",
      "signInToContinue": "Connectez-vous pour continuer vers Messages",
      "joinSecureNetwork": "Rejoignez le réseau sécurisé",
      "enterRecoveryKey": "Entrez votre clé de récupération pour retrouver l'accès",
      "invalidCredentials": "Nom d'utilisateur ou mot de passe invalide",
      "credentialsRetrieved": "Identifiants récupérés",
      "password": "Mot de passe",
      "returnToLogin": "Retour à la connexion",
      "recoveryKey": "Clé de récupération",
      "username": "Nom d'utilisateur",
      "processing": "Traitement...",
      "signIn": "Se connecter",
      "create": "Créer",
      "recover": "Récupérer",
      "noAccount": "Pas de compte ? Créez-en un",
      "haveAccount": "Déjà un compte ? Connectez-vous",
      "forgotPassword": "Mot de passe oublié ?",
      "backToLogin": "Retour à la connexion",
      "accountCreated": "Compte créé !",
      "saveRecoveryKey": "Veuillez enregistrer votre clé de récupération. Vous en aurez besoin si jamais vous oubliez votre mot de passe.",
      "oneTimeShow": "C'est la seule fois qu'elle sera affichée.",
      "savedContinue": "C'est enregistré - Continuer",
      "copied": "Copié",
      "recoveryKeyCopied": "Clé de récupération copiée dans le presse-papiers",
      "failedCopy": "Échec de la copie de la clé",
      "error": "Erreur"
    },
    "ui": {
      "noConversations": "Aucune conversation",
      "noResults": "Aucun résultat trouvé",
      "noChatSelected": "Aucun chat sélectionné",
      "chooseConversation": "Choisissez une conversation ou commencez-en une nouvelle.",
      "startNewMessage": "Nouveau message",
      "online": "En ligne",
      "typeMessage": "Message à {{partner}}...",
      "unstar": "Retirer des favoris",
      "star": "Favori",
      "cantMessageSelf": "Vous ne pouvez pas vous envoyer de message (pour l'instant)",
      "userNotFound": "Utilisateur introuvable",
      "messageFailed": "Échec de l'envoi"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Bibliothèque",
      "albumsTitle": "Albums"
    },
    "library": {
      "allPhotos": "Toutes les photos",
      "favorites": "Favoris",
      "recent": "Récents",
      "userLibrary": "Bibliothèque de {{user}}"
    },
    "menu": {
      "slideshow": "Diaporama",
      "rotateClockwise": "Pivoter vers la droite",
      "rotateCounterClockwise": "Pivoter vers la gauche"
    },
    "empty": {
      "recent": {
        "title": "Aucune photo visionnée récemment",
        "description": "Vos photos récemment ouvertes apparaîtront ici."
      },
      "favorites": {
        "title": "Pas encore de favoris",
        "description": "Marquez des photos comme favorites pour les voir ici."
      },
      "library": {
        "title": "Aucune photo trouvée",
        "description": "Aucun fichier photo n’a été trouvé dans votre dossier Images.",
        "openFolder": "Ouvrir le dossier {{folder}}"
      },
      "noFolder": {
        "title": "Bibliothèque de {{user}} introuvable",
        "description": "Le dossier {{path}} n’a pas été trouvé pour cet utilisateur."
      },
      "openHome": "Ouvrir le dossier personnel"
    },
    "folders": {
      "pictures": "Images",
      "recent": "Récents",
      "misc": "Divers"
    }
  },
  "mail": {
    "login": {
      "title": "Courrier",
      "subtitle": "Connectez-vous à votre compte",
      "emailPlaceholder": "E-mail",
      "passwordPlaceholder": "Mot de passe",
      "signingIn": "Connexion en cours...",
      "signIn": "Se connecter",
      "signOut": "Se déconnecter",
      "createAccountInfo": "Créer un compte via un fournisseur de messagerie"
    },
    "menu": {
      "newMailbox": "Nouvelle boîte aux lettres",
      "onlineStatus": "Statut en ligne",
      "newMessage": "Nouveau message",
      "reply": "Répondre",
      "replyAll": "Répondre à tous",
      "forward": "Transférer"
    },
    "sidebar": {
      "mailboxes": "Boîtes aux lettres",
      "inbox": "Boîte de réception",
      "starred": "Suivis",
      "archived": "Archivés",
      "trash": "Corbeille"
    },
    "search": {
      "placeholder": "Rechercher des courriels..."
    },
    "empty": {
      "noEmails": "Aucun courriel",
      "noEmailsFound": "Aucun courriel trouvé",
      "selectEmail": "Sélectionnez un courriel à lire"
    },
    "actions": {
      "reply": "Répondre",
      "forward": "Transférer",
      "archive": "Archiver",
      "unarchive": "Désarchiver",
      "delete": "Supprimer",
      "restore": "Restaurer",
      "deleteForever": "Supprimer définitivement"
    },
    "time": {
      "minutesAgo": "il y a {{minutes}} min",
      "hoursAgo": "il y a {{hours}} h",
      "today": "Aujourd'hui",
      "yesterday": "Hier",
      "daysAgo": "il y a {{days}} j"
    },
    "attachments": {
      "count": "{{count}} pièce jointe",
      "count_plural": "{{count}} pièces jointes",
      "download": "Télécharger",
      "downloaded": "Téléchargé",
      "downloadedTo": "{{name}} téléchargé dans {{folder}}",
      "downloadFailed": "Échec du téléchargement",
      "downloadFailedMessage": "Échec du téléchargement de {{name}}"
    }
  },
  "notepad": {
    "untitled": "Sans titre",
    "untitledTab": "Sans titre {{index}}",
    "empty": {
      "title": "Bloc-notes",
      "description": "Créez un nouveau fichier ou ouvrez-en un existant pour commencer.",
      "newFile": "Nouveau fichier",
      "openFile": "Ouvrir un fichier"
    },
    "languages": {
      "markdown": "Markdown",
      "javascript": "JavaScript",
      "typescript": "TypeScript",
      "tsx": "TSX",
      "json": "JSON",
      "css": "CSS",
      "markup": "HTML",
      "bash": "Bash",
      "txt": "Texte brut"
    },
    "actions": {
      "openFile": "Ouvrir un fichier",
      "saveFile": "Enregistrer un fichier",
      "bold": "Gras",
      "italic": "Italique",
      "list": "Liste",
      "heading": "Titre"
    },
    "preview": {
      "edit": "Éditer",
      "preview": "Aperçu",
      "htmlPreviewTitle": "Aperçu HTML"
    },
    "status": {
      "chars": "{{count}} caractères",
      "lines": "Ligne {{count}}"
    },
    "contextSwitcher": {
      "title": "Cliquer pour changer de contexte",
      "searchPlaceholder": "Rechercher un langage...",
      "noLanguageFound": "Aucun langage trouvé."
    },
    "toasts": {
      "switchedTo": "Basculé vers {{language}}",
      "failedToReadFile": "Impossible de lire le fichier",
      "fileSaved": "Fichier enregistré",
      "failedToSaveFilePermissions": "Impossible d’enregistrer le fichier (vérifiez les permissions)",
      "saved": "Enregistré",
      "failedToSave": "Impossible d’enregistrer"
    },
    "dialog": {
      "unsaved": {
        "title": "Voulez-vous enregistrer les modifications ?",
        "description": "Vos modifications seront perdues si vous ne les enregistrez pas.",
        "dontSave": "Ne pas enregistrer",
        "cancel": "Annuler",
        "save": "Enregistrer"
      }
    },
    "menu": {
      "new": "Nouveau",
      "open": "Ouvrir...",
      "save": "Enregistrer",
      "closeTab": "Fermer l’onglet",
      "bold": "Gras",
      "italic": "Italique",
      "list": "Liste",
      "heading1": "Titre 1",
      "heading2": "Titre 2",
      "togglePreview": "Basculer l’aperçu",
      "zoomIn": "Agrandir",
      "zoomOut": "Rétrécir"
    }
  },
  "calendar": {
    "menu": {
      "day": "Jour",
      "week": "Semaine",
      "month": "Mois",
      "year": "Année"
    },
    "toolbar": {
      "today": "Aujourd’hui",
      "month": "Mois",
      "day": "Jour"
    },
    "sidebar": {
      "myCalendars": "Mes calendriers",
      "filterColors": "Filtrer les couleurs"
    },
    "actions": {
      "createEvent": "Créer un événement",
      "createCategory": "Créer une catégorie",
      "clear": "Effacer",
      "delete": "Supprimer",
      "cancel": "Annuler",
      "saveEvent": "Enregistrer l’événement"
    },
    "loadingEvents": "Chargement des événements...",
    "toasts": {
      "cannotDeleteSystemCategory": "Les catégories système ne peuvent pas être supprimées",
      "eventDeleted": "Événement supprimé",
      "eventSaved": "Événement enregistré",
      "requiredFields": "Veuillez remplir les champs requis"
    },
    "modal": {
      "newEvent": "Nouvel événement",
      "editEvent": "Modifier l’événement",
      "newEventDescription": "Planifiez un nouvel événement dans votre calendrier.",
      "editEventDescription": "Afficher ou modifier les détails de l’événement.",
      "fields": {
        "title": "Titre",
        "date": "Date",
        "time": "Heure",
        "duration": "Durée",
        "type": "Type",
        "location": "Lieu",
        "color": "Couleur",
        "notes": "Notes"
      },
      "placeholders": {
        "eventTitle": "Titre de l’événement",
        "pickDate": "Choisir une date",
        "searchTime": "Rechercher une heure...",
        "noTimeFound": "Aucune heure trouvée.",
        "selectDuration": "Choisir une durée",
        "searchDuration": "Rechercher une durée...",
        "noDurationFound": "Aucune durée trouvée.",
        "selectType": "Choisir un type",
        "searchType": "Rechercher un type...",
        "noTypeFound": "Aucun type trouvé.",
        "addLocation": "Ajouter un lieu",
        "addNotes": "Ajouter des notes..."
      },
      "durationMinutes": "{{minutes}} min",
      "minutesOption": "{{minutes}} minutes"
    },
    "categories": {
      "all": "Tous",
      "work": "Travail",
      "personal": "Personnel",
      "social": "Social",
      "events": "Événements",
      "family": "Famille"
    },
    "types": {
      "work": "Travail",
      "personal": "Personnel",
      "social": "Social",
      "events": "Événements",
      "family": "Famille",
      "other": "Autre"
    },
    "colors": {
      "blue": "Bleu",
      "green": "Vert",
      "red": "Rouge",
      "yellow": "Jaune",
      "purple": "Violet",
      "pink": "Rose",
      "orange": "Orange",
      "gray": "Gris"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Boucle démarrée",
        "location": "Turms",
        "notes": "Système de fichiers initial."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "Général",
      "dashboard": "Tableau de bord",
      "interfaceTitle": "Interface",
      "uiAndSounds": "UI et sons",
      "systemTitle": "Système",
      "storage": "Stockage",
      "fileSystem": "Système de fichiers",
      "appsTitle": "Apps",
      "performance": "Performance"
    },
    "dashboard": {
      "title": "Tableau de bord",
      "description": "Aperçu du système bientôt disponible."
    },
    "ui": {
      "title": "Inferface & Feedback",
      "notificationsTitle": "Notifications",
      "successToast": "Toast de succès",
      "warningToast": "Toast d’avertissement",
      "errorToast": "Toast d’erreur",
      "soundFeedback": "Retour sonore",
      "buttons": {
        "success": "Succès",
        "warning": "Attention",
        "error": "Erreur",
        "app": "Notification App",
        "open": "Ouvrir",
        "close": "Fermer",
        "click": "Clic",
        "hover": "Survoler"
      }
    },
    "storage": {
      "title": "Inspecteur de stockage",
      "import": "Importer",
      "export": "Exporter",
      "clear": "Effacer",
      "toastTitle": "Stockage",
      "exportSuccess": "Préférences exportées avec succès",
      "exportFail": "Échec de l’export des préférences",
      "importSuccess": "Préférences importées avec succès",
      "importFail": "Impossible de lire le fichier d’import",
      "clearConfirm": "Voulez-vous vraiment effacer TOUT le stockage local ? Cela réinitialisera les préférences d’utilisation, le thème et la position des fenêtres.",
      "clearSuccess": "Toutes les clés ont été effacées",
      "softMemory": "Mémoire douce (préférences)",
      "hardMemory": "Mémoire dure (système de fichiers)",
      "keysCount": "{{count}} clés",
      "localStorageKeys": "Clés du stockage local"
    },
    "filesystem": {
      "title": "Débogueur du système de fichiers"
    },
    "performance": {
      "title": "Moniteur de performance"
    },
    "menu": {
      "resetFilesystem": "Réinitialiser le système de fichiers",
      "runDiagnostics": "Lancer le diagnostic"
    },
    "messages": {
      "createValues": {
        "title": "Créer / Réinitialiser Compte",
        "username": "Nom d'utilisateur",
        "password": "Mot de passe",
        "button": "Créer un compte",
        "success": "Compte {{username}} créé"
      },
      "registry": {
        "title": "Registre des Comptes",
        "empty": "Aucun compte trouvé",
        "useInSender": "Utiliser comme expéditeur",
        "delete": "Supprimer le compte",
        "deleteConfirm": "Supprimer le compte {{username}} ? Cette action est irréversible.",
        "deleteSuccess": "Compte {{username}} supprimé"
      },
      "sendMessage": {
        "title": "Envoyer un message",
        "from": "Expéditeur (De)",
        "to": "Destinataire (À)",
        "selectAccount": "Sélectionner un compte...",
        "content": "Contenu",
        "placeholder": "Tapez un message...",
        "button": "Envoyer le message",
        "success": "Message envoyé"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Système",
      "general": "Général"
    },
    "sections": {
      "appearance": "Apparence",
      "performance": "Performance",
      "displays": "Écrans",
      "notifications": "Notifications",
      "network": "Réseau",
      "security": "Sécurité et confidentialité",
      "users": "Utilisateurs et groupes",
      "storage": "Stockage",
      "about": "À propos"
    },
    "appearance": {
      "title": "Apparence",
      "languageTitle": "Langue",
      "languageDescription": "Choisissez la langue d’affichage de l’interface",
      "languagePlaceholder": "Choisir une langue",
      "wallpaperTitle": "Fond d’écran",
      "wallpaperDescription": "Sélectionnez un arrière-plan pour votre bureau",
      "accentTitle": "Couleur d’accent",
      "accentDescription": "Choisissez une couleur d’accent pour personnaliser votre expérience",
      "presetColors": "Couleurs prédéfinies",
      "customColor": "Couleur personnalisée",
      "customColorHint": "Saisissez un code hex (ex. #3b82f6)",
      "preview": "Aperçu",
      "previewPrimary": "Primaire",
      "previewOutlined": "Contour",
      "themeModeTitle": "Mode de thème",
      "themeModeDescription": "Choisissez comment la couleur d’accent teinte les arrière-plans",
      "themeModeNeutralTitle": "Neutre",
      "themeModeNeutralDesc": "Gris naturels uniquement",
      "themeModeShadesTitle": "Nuances",
      "themeModeShadesDesc": "Teintes de la couleur d’accent",
      "themeModeContrastTitle": "Contraste",
      "themeModeContrastDesc": "Couleurs complémentaires",
      "themeTitle": "Thème",
      "themeDark": "Sombre",
      "themeLightSoon": "Clair (Bientôt)",
      "wallpaperActive": "Actif",
      "wallpaperUse": "Utiliser"
    },
    "performance": {
      "blurTitle": "Flou et transparence",
      "blurDescription": "Active l’effet de verre et la transparence des fenêtres",
      "reduceMotionTitle": "Réduire les animations",
      "reduceMotionDescription": "Désactive les animations pour de meilleures performances et l’accessibilité",
      "disableShadowsTitle": "Désactiver les ombres",
      "disableShadowsDescription": "Supprime les ombres des fenêtres pour améliorer les performances",
      "disableGradientsTitle": "Désactiver les dégradés",
      "disableGradientsDescription": "Utilise des couleurs unies à la place des dégradés pour les icônes",
      "gpuTitle": "Utiliser l'accélération graphique",
      "gpuDescription": "Utiliser l'accélération matérielle si disponible (redémarrage requis)"
    },
    "network": {
      "wifiTitle": "Wi-Fi",
      "wifiConnected": "Connecté à {{network}}",
      "wifiDisabled": "Wi-Fi désactivé",
      "bluetoothTitle": "Bluetooth",
      "bluetoothConnected": "Connecté à {{device}}",
      "bluetoothDisabled": "Bluetooth désactivé",
      "wifiNetworks": "Réseaux disponibles",
      "scanning": "Recherche en cours...",
      "enterPassword": "Entrer le mot de passe",
      "passwordPlaceholder": "Mot de passe",
      "connect": "Connecter",
      "disconnect": "Se déconnecter",
      "configurationMode": "Mode de configuration",
      "automatic": "Automatique (DHCP)",
      "manual": "Manuel",
      "autoConfigTitle": "Configuration automatique",
      "manualConfigTitle": "Configuration manuelle",
      "ipAddress": "Adresse IP",
      "subnetMask": "Masque de sous-réseau",
      "gateway": "Passerelle",
      "dns": "Serveur DNS",
      "validateConfig": "Valider la configuration",
      "invalidIP": "Adresse IP invalide",
      "invalidGateway": "Passerelle invalide",
      "invalidSubnetMask": "Masque de sous-réseau invalide",
      "invalidDNS": "Serveur DNS invalide",
      "gatewayNotInSubnet": "La passerelle n'est pas dans le même sous-réseau que l'adresse IP",
      "configSaved": "Configuration réseau enregistrée avec succès",
      "dhcpAttributionProgress": "Récupération d'une adresse IP via DHCP"
    },
    "placeholders": {
      "displaysTitle": "Paramètres d’affichage",
      "displaysDescription": "Résolution, mise à l’échelle et luminosité bientôt disponibles.",
      "notificationsTitle": "Notifications",
      "notificationsDescription": "Préférences du centre de notifications bientôt disponibles.",
      "networkTitle": "Réseau",
      "networkDescription": "Configuration Wi‑Fi et Bluetooth bientôt disponible.",
      "securityTitle": "Sécurité et confidentialité",
      "securityDescription": "Pare-feu, permissions et confidentialité bientôt disponibles.",
      "storageTitle": "Stockage",
      "storageDescription": "Analyse et gestion de l’espace disque bientôt disponibles."
    },
    "users": {
      "currentUsersTitle": "Utilisateurs actuels",
      "addUser": "Ajouter un utilisateur",
      "cancel": "Annuler",
      "editAction": "Éditer",
      "newUserDetails": "Détails du nouvel utilisateur",
      "usernamePlaceholder": "Nom d’utilisateur (ex. alice)",
      "fullNamePlaceholder": "Nom complet",
      "passwordOptionalPlaceholder": "Mot de passe (optionnel)",
      "passwordHintOptionalPlaceholder": "Indice de mot de passe (optionnel)",
      "createUser": "Créer l’utilisateur",
      "userExists": "L’utilisateur existe déjà",
      "currentBadge": "Actuel",
      "rootBadge": "Root",
      "adminBadge": "Admin",
      "confirmDeleteUser": "Voulez-vous vraiment supprimer {{username}} ?",
      "editForm": {
        "fullNameLabel": "Nom complet",
        "roleLabel": "Rôle",
        "administrator": "Administrateur",
        "newPasswordLabel": "Nouveau mot de passe (laisser vide pour conserver l’actuel)",
        "passwordHintLabel": "Indice de mot de passe",
        "saveChanges": "Enregistrer"
      }
    },
    "about": {
      "version": "Version",
      "framework": "Framework",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Environnement",
      "browserMode": "Mode navigateur",
      "developerMode": "Mode développeur",
      "developerModeDescription": "Active les outils avancés et les fonctions de débogage",
      "exposeRootUser": "Afficher l’utilisateur root",
      "exposeRootUserDescription": "Affiche l’utilisateur root sur l’écran de connexion",
      "memoryUsage": "Utilisation de la mémoire",
      "preferencesSoft": "Préférences (mémoire douce)",
      "filesystemHard": "Système de fichiers (mémoire dure)",
      "total": "Total"
    },
    "danger": {
      "title": "Zone de danger",
      "softResetTitle": "Réinitialisation douce",
      "softResetDescription": "Réinitialise les préférences, le thème, les icônes du bureau et l’état des apps. Vos fichiers et dossiers sont conservés.",
      "resetPreferences": "Réinitialiser les préférences",
      "confirmReset": "Confirmer",
      "hardResetTitle": "Réinitialisation complète",
      "hardResetDescription": "Efface toutes les données y compris les fichiers, dossiers et paramètres. Cette action est irréversible.",
      "hardResetWarning": "⚠️ Tous les fichiers et dossiers personnalisés seront supprimés définitivement",
      "factoryReset": "Réglages d’usine",
      "deleteEverything": "Oui, tout supprimer"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Bienvenue sur Aurora",
        "description": "Sélectionnez votre langue pour commencer"
      },
      "account": {
        "title": "Créer votre compte",
        "description": "Configurer le compte administrateur principal"
      },
      "theme": {
        "title": "Personnaliser",
        "description": "Faites-en le vôtre"
      },
      "finishing": {
        "title": "Configuration...",
        "description": "Application de la configuration"
      }
    },
    "account": {
      "fullName": "Nom complet",
      "fullNamePlaceholder": "Exemple : Jean Dupont",
      "username": "Nom d’utilisateur",
      "password": "Mot de passe",
      "passwordHint": "Indice de mot de passe (optionnel)",
      "passwordHintPlaceholder": "Exemple : Nom de votre premier animal"
    },
    "theme": {
      "mode": "Mode du thème",
      "accentColor": "Couleur d’accent",
      "darkMode": "Sombre (Neutre)",
      "lightMode": "Clair",
      "comingSoon": "Bientôt"
    },
    "finishing": {
      "title": "Vous êtes prêt !",
      "subtitle": "Aurora OS est prêt. Redirection vers l’écran de connexion..."
    },
    "search": {
      "placeholder": "Rechercher une langue...",
      "noResults": "Aucune langue trouvée"
    },
    "validation": {
      "requiredFields": "Veuillez remplir tous les champs requis",
      "passwordLength": "Le mot de passe doit contenir au moins 6 caractères",
      "userExists": "L’utilisateur existe déjà. Veuillez choisir un autre nom d’utilisateur.",
      "fullNameFormat": "Le nom complet ne doit contenir que des lettres, des espaces et des traits d’union",
      "usernameFormat": "Le nom d’utilisateur ne doit contenir que des lettres minuscules et des chiffres",
      "hintLength": "L’indice de mot de passe est trop long (max 50 caractères)",
      "hintSecurity": "L’indice de mot de passe ne peut pas contenir le mot de passe lui-même",
      "hintFormat": "L’indice de mot de passe contient des caractères non valides",
      "creationFailed": "Échec de la création du compte. Veuillez réessayer."
    },
    "buttons": {
      "next": "Suivant",
      "back": "Retour",
      "startUsing": "Commencer à utiliser Aurora"
    }
  },
  "battery": {
    "title": "Batterie",
    "charging": "En charge",
    "fullyCharged": "Complètement chargée",
    "remaining": "{{percentage}}% restant",
    "powerSource": "Source d'alimentation :",
    "powerSources": {
      "adapter": "Adaptateur secteur",
      "battery": "Batterie"
    },
    "condition": "État (Est.)",
    "metrics": {
      "health": "Santé",
      "cycles": "Cycles",
      "temp": "Temp",
      "voltage": "Tension"
    },
    "disclaimer": "Les métriques de santé et d'état de la batterie sont des estimations basées sur les capteurs système disponibles. Les valeurs réelles peuvent varier.",
    "showPercentage": "Afficher le pourcentage dans la barre des menus"
  },
  "audio": {
    "title": "Son",
    "muteAll": "Tout couper",
    "unmute": "Rétablir le son",
    "masterVolume": "Volume principal",
    "mixer": "Mélangeur",
    "categories": {
      "music": "Musique",
      "system": "Alertes système",
      "interface": "Interface",
      "feedback": "Retour de saisie",
      "ambiance": "Ambiance"
    },
    "mixerLabels": {
      "masterOutput": "Sortie Principale",
      "musicAppLevel": "Niveau Musique",
      "sfxInterface": "Effets & Interface",
      "backgroundLoop": "Boucle de Fond"
    }
  }
};

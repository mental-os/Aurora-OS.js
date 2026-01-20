import type { TranslationDict } from '@/i18n/types';

export const ro: TranslationDict = {
  "time": {
    "yesterday": "Ieri"
  },
  "common": {
    "name": "Nume",
    "color": "Culoare",
    "cancel": "Anulează",
    "save": "Salvează"
  },
  "game": {
    "intro": {
      "initialize": "Inițializare sistem",
      "clickToStart": "CLICK PENTRU START",
      "skipHint": "ESC sau SPAȚIU pentru sărituri"
    },
    "mainMenu": {
      "continue": {
        "label": "Continuă",
        "desc": {
          "canContinue": "Reia bucla anterioară",
          "noData": "Nu s-au găsit date despre buclă"
        }
      },
      "newGame": {
        "label": "Buclă Nouă",
        "desc": "Începe de la zero (Șterge datele)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Configurează parametrii globali"
      },
      "exit": {
        "label": "Închidere",
        "desc": "Termină sesiunea",
        "confirm": {
          "title": "Închidere Sistem",
          "message": "Sigur dorești să închizi sistemul? Progresul nesalvat poate fi pierdut.",
          "cancel": "Anulează",
          "confirm": "Închide"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Setări BIOS",
      "fullScreen": "Ecran Complet",
      "immersiveMode": "Mod Imersiv",
      "fullScreenEnter": "Intră",
      "fullScreenExit": "Ieși",
      "softReset": "Resetare Ușoară",
      "softResetHint": "Reîncarcă Aplicația",
      "softResetConfirm": "Resetare Ușoară: Aceasta va reîncărca aplicația, dar va păstra datele. Continui?",
      "factoryReset": "Resetare din Fabrică",
      "factoryResetHint": "Șterge Toate Datele",
      "factoryResetConfirm": "RESETARE DIN FABRICĂ: Aceasta va șterge TOATE datele, utilizatorii și fișierele. Nu se poate anula. Ești sigur?"
    },
    "footer": {
      "originalDistribution": "Distribuție Originală",
      "temperedDistribution": "Distribuție Modificată"
    }
  },
  "appDescriptions": {
    "finder": "Administrator de Fișiere",
    "browser": "Accesează web-ul",
    "mail": "Citește și scrie emailuri",
    "appStore": "Descarcă și gestionează aplicații",
    "terminal": "Interfață linie de comandă",
    "systemSettings": "Configurează sistemul",
    "notepad": "Editează fișiere text",
    "messages": "Discută cu prietenii",
    "calendar": "Gestionează programul tău",
    "photos": "Vizualizează și gestionează fotografii",
    "music": "Redă muzica ta preferată",
    "devCenter": "Unelte pentru Dezvoltatori"
  },
  "a11y": {
    "common": {
      "close": "Închide",
      "open": "Deschide",
      "notAvailable": "N/A"
    },
    "sidebar": {
      "toggleSidebar": "Comută Bara Laterală"
    },
    "pagination": {
      "pagination": "Paginare",
      "goToPreviousPage": "Mergi la pagina anterioară",
      "goToNextPage": "Mergi la pagina următoare",
      "previous": "Anterior",
      "next": "Următor",
      "morePages": "Mai multe pagini"
    },
    "breadcrumb": {
      "breadcrumb": "Firimituri",
      "more": "Mai mult"
    },
    "carousel": {
      "previousSlide": "Slide anterior",
      "nextSlide": "Slide următor"
    }
  },
  "commandPalette": {
    "title": "Paletă Comenzi",
    "description": "Caută o comandă de executat..."
  },
  "login": {
    "softReset": "Resetare Ușoară",
    "hardReset": "Resetare Totală",
    "hardResetConfirm": "Resetare Totală: Aceasta va șterge toate datele. Continui?",
    "selectUser": "Selectează Utilizator",
    "enterPasswordToUnlock": "Introdu parola pentru a debloca",
    "restoringPreviousSession": "Se restaurează sesiunea anterioară",
    "passwordPlaceholder": "Parolă",
    "incorrectPassword": "Parolă incorectă",
    "hint": "Indiciu",
    "enterSystem": "Intră în Sistem",
    "switchAccount": "Schimbă Contul",
    "back": "Înapoi",
    "suspendToSwitch": "Suspenzi sesiunea pentru a schimba?",
    "cancel": "Anulează",
    "switchUser": "Schimbă Utilizator",
    "logOut": "Deconectare",
    "logOutConfirm": "Deconectezi {{username}}? Aceasta va închide toate ferestrele și va renunța la modificările nesalvate.",
    "active": "Activ",
    "resume": "Reia",
    "sessionActive": "Sesiune Activă"
  },
  "app": {
    "loadingKernel": "SE ÎNCARCĂ KERNELUL..."
  },
  "menubar": {
    "menus": {
      "file": "Fișier",
      "shell": "Shell",
      "edit": "Editare",
      "format": "Format",
      "song": "Melodie",
      "view": "Vizualizare",
      "go": "Mergi",
      "controls": "Comenzi",
      "window": "Fereastră",
      "help": "Ajutor",
      "store": "Magazin",
      "history": "Istoric",
      "bookmarks": "Marcaje",
      "mailbox": "Cutie poștală",
      "message": "Mesaje",
      "devCenter": "Centru DEV",
      "tools": "Unelte",
      "image": "Imagine",
      "conversations": "Conversații"
    },
    "items": {
      "newWindow": "Fereastră Nouă",
      "newFolder": "Dosar Nou",
      "open": "Deschide",
      "changeWallpaper": "Schimbă imaginea de fundal",
      "closeWindow": "Închide fereastra",
      "undo": "Anulează",
      "redo": "Refă",
      "cut": "Taie",
      "copy": "Copiază",
      "paste": "Lipește",
      "selectAll": "Selectează Tot",
      "reload": "Reîncarcă",
      "toggleFullscreen": "Ecran Complet",
      "minimize": "Minimizează",
      "bringAllToFront": "Adu Tot în Față",
      "back": "Înapoi",
      "forward": "Înainte",
      "enclosingFolder": "Dosar Părinte",
      "getInfo": "Obține informații",
      "moveToTrash": "Mută la Coșul de gunoi"
    },
    "help": {
      "appHelp": "Ajutor {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Funcție neimplementată"
    },
    "system": {
      "aboutThisComputer": "Despre acest computer...",
      "systemSettings": "Setări Sistem...",
      "appStore": "Magazin Aplicații...",
      "lockScreen": "Blochează Ecran",
      "switchUser": "Schimbă Utilizator",
      "user": "Utilizator",
      "logOutAs": "Deconectare: {{username}}",
      "viewSystemInfo": "Vezi informații sistem",
      "viewSystemSettings": "Vezi setări sistem",
      "returnToLoginWhile": "Înapoi la ecranul de autentificare păstrând",
      "returnToUserSelectionWhile": "Înapoi la selecția utilizatorului păstrând",
      "keepingSession": "sesiunea activă",
      "clearingSession": "ștergând sesiunea",
      "panic": "PANICĂ",
      "hardReset": "Resetare Totală",
      "warning": "Avertisment",
      "panicWarningBody": "Aceasta va reseta {{productName}} la setările din fabrică. Bun ca buton de panică dacă ceva merge prost.",
      "serverTime": "Ora Serverului (UTC)",
      "localTime": "Ora Locală"
    },
    "app": {
      "aboutApp": "Despre {{appName}}",
      "settings": "Setări...",
      "quitApp": "Închide {{appName}}"
    }
  },
  "notifications": {
    "title": "Notificări",
    "titles": {
      "permissionDenied": "Permisiune refuzată"
    },
    "clearAll": "Șterge Tot",
    "new": "Nou",
    "subtitles": {
      "appMissing": "Aplicație lipsă",
      "permissionDenied": "Permisiune refuzată",
      "saved": "Salvat",
      "deleted": "Șters",
      "moved": "Mutat",
      "trash": "Coș de gunoi",
      "failed": "Eșuat",
      "ui": "Interfață",
      "validation": "Validare",
      "success": "Succes",
      "error": "Eroare",
      "info": "Informații",
      "warning": "Avertisment",
      "fileError": "Eroare fișier"
    },
    "empty": "Nu există notificări",
    "clearApp": "Șterge tot de la această aplicație"
  },
  "memory": {
    "title": "Memorie",
    "used": "Utilizată",
    "pressure": "Presiune",
    "appMemory": "Memorie Aplicații",
    "wiredMemory": "Memorie Rezidentă",
    "processName": "Nume Proces",
    "memory": "Memorie",
    "swapUsed": "Swap Utilizat",
    "systemWired": "Sistem Aurora",
    "activeSession": "Memorie Rezidentă (Sesiune Activă)",
    "userSession": "Sesiune: {{user}}",
    "backgroundSession": "Memorie Dormantă (Fundal)",
    "backgroundProcesses": "{{count}} Procese în Fundal",
    "instances": "{{count}} Instanțe",
    "type": {
      "mainWindow": "Fereastră Principală",
      "extraWindow": "Fereastră Extra",
      "extraTabs": "{{count}} Tab-uri Extra"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Verifică actualizări...",
      "viewMyAccount": "Vezi contul meu"
    },
    "categories": {
      "all": "Toate",
      "productivity": "Productivitate",
      "media": "Media",
      "utilities": "Utilitare",
      "development": "Dezvoltare",
      "system": "Sistem"
    },
    "searchPlaceholder": "Caută aplicații...",
    "empty": {
      "title": "Nicio aplicație găsită",
      "description": "Încearcă să ajustezi căutarea sau filtrele pentru a găsi ce cauți."
    },
    "size": "Mărime",
    "sizeUnknown": "Necunoscută",
    "install": "Instalează",
    "uninstall": "Dezinstalează",
    "open": "Deschide",
    "cancel": "Anulează",
    "confirm": "Confirmă",
    "restore": "Restaurează",
    "checkFailed": "Check Failed",
    "checkFailedTitle": "Installation Check Failed",
    "restoreSuccess": "{{app}} restored successfully",
    "restoreError": "Failed to restore {{app}}",
    "restorePermissionDenied": "Admin privileges required to restore apps",
    "installingWarning": "Vă rugăm să așteptați în timp ce aplicația se instalează."
  },
  "browser": {
    "menu": {
      "newTab": "Tab Nou",
      "closeTab": "Închide Tab"
    },
    "welcome": {
      "searchPlaceholder": "Caută site-uri web sau introdu o adresă...",
      "favorites": "Favorite",
      "recentActivity": "Activitate recentă"
    },
    "searchPlaceholder": "Caută sau introdu o adresă...",
    "error": {
      "pageNotFound": "Pagina nu a fost găsită",
      "pageNotFoundDesc": "Site-ul web {{url}} nu a putut fi găsit.",
      "goHome": "Mergi la pagina principală"
    }
  },
  "music": {
    "sidebar": {
      "library": "Bibliotecă",
      "songs": "Melodii",
      "favorites": "Favorite",
      "recentlyPlayed": "Redate Recent"
    },
    "titles": {
      "songs": "Melodii",
      "recentlyPlayed": "Redate Recent"
    },
    "actions": {
      "playAll": "Redă Tot"
    },
    "empty": {
      "recent": {
        "title": "Nicio melodie redată recent",
        "description": "Melodiile redate recent vor apărea aici."
      },
      "library": {
        "title": "Nicio melodie găsită",
        "description": "Nu s-au găsit fișiere muzicale în dosarul Muzică.",
        "openFolder": "Deschide dosarul {{folder}}"
      }
    },
    "folders": {
      "music": "Muzică",
      "home": "Acasă"
    },
    "player": {
      "notPlaying": "Nu redă",
      "selectSong": "Selectează o melodie"
    },
    "metadata": {
      "unknownArtist": "Artist Necunoscut",
      "unknownAlbum": "Album Necunoscut",
      "unknownTitle": "Titlu Necunoscut"
    },
    "menu": {
      "newPlaylist": "Listă Redare Nouă",
      "import": "Importă...",
      "closeWindow": "Închide Fereastra",
      "showInFinder": "Arată în Finder",
      "addToPlaylist": "Adaugă la Listă",
      "play": "Redă",
      "previousSong": "Melodia Anterioară",
      "nextSong": "Melodia Următoare",
      "volumeUp": "Volum Mai Tare",
      "volumeDown": "Volum Mai Încet"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Filă Nouă",
      "clearScrollback": "Șterge Istoricul",
      "killProcess": "Omoară procesul"
    },
    "help": {
      "availableCommands": "Comenzi disponibile:",
      "usage": "Utilizare",
      "appLaunchHelp": "Lansează aplicații instalate (ex. Finder)"
    },
    "commands": {
      "help": {
        "description": "Arată acest mesaj de ajutor"
      },
      "ls": {
        "description": "Listează conținutul directorului",
        "usage": "ls [cale]"
      },
      "cd": {
        "description": "Schimbă directorul",
        "usage": "cd <cale>"
      },
      "pwd": {
        "description": "Arată directorul curent"
      },
      "logout": {
        "description": "Deconectează sesiunea curentă"
      },
      "who": {
        "description": "Arată cine este conectat"
      },
      "clear": {
        "description": "Șterge ecranul terminalului"
      },
      "cat": {
        "description": "Afișează conținutul fișierului",
        "usage": "cat <fișier>"
      },
      "mkdir": {
        "description": "Creează director",
        "usage": "mkdir <nume>"
      },
      "touch": {
        "description": "Creează fișier sau actualizează data",
        "usage": "touch <nume>"
      },
      "rm": {
        "description": "Șterge fișier sau director",
        "usage": "rm <nume>"
      },
      "cp": {
        "description": "Copiază fișiere",
        "usage": "cp <sursă> <dest>"
      },
      "mv": {
        "description": "Mută (redenumeste) fișiere",
        "usage": "mv <sursă> <dest>"
      },
      "chmod": {
        "description": "Schimbă modurile (permisiunile) fișierului",
        "usage": "chmod <mod> <fișier>"
      },
      "chown": {
        "description": "Schimbă proprietarul și grupul fișierului",
        "usage": "chown <proprietar>[:<grup>] <fișier>"
      },
      "grep": {
        "description": "Arată liniile care corespund unui model",
        "usage": "grep <model> <fișier>"
      },
      "find": {
        "description": "Caută fișiere într-o ierarhie de directoare",
        "usage": "find [cale] [-name model]"
      },
      "echo": {
        "description": "Afișează o linie de text",
        "usage": "echo [text]"
      },
      "date": {
        "description": "Arată data și ora sistemului"
      },
      "uptime": {
        "description": "Spune de cât timp rulează sistemul"
      },
      "whoami": {
        "description": "Arată utilizatorul curent"
      },
      "hostname": {
        "description": "Arată numele sistemului"
      },
      "reset": {
        "description": "Resetează sistemul de fișiere la setările din fabrică"
      },
      "exit": {
        "description": "Ieși din sesiunea shell curentă"
      },
      "su": {
        "description": "Schimbă ID utilizator sau devino superutilizator",
        "usage": "su [utilizator] [parolă]"
      },
      "sudo": {
        "description": "Execută o comandă ca alt utilizator",
        "usage": "sudo [opțiuni] [comandă]"
      },
      "history": {
        "description": "Afișează istoricul comenzilor din terminal",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} vine curând",
    "descriptions": {
      "mail": "Gestionează emailurile, contactele și calendarul.",
      "calendar": "Programează întâlniri, evenimente și memento-uri.",
      "default": "Această aplicație este în dezvoltare."
    }
  },
  "filePicker": {
    "openFile": "Deschide fișierul",
    "openFileDescription": "Selectați un fișier pentru a-l deschide din sistemul de fișiere",
    "saveFile": "Salvează fișierul",
    "saveFileDescription": "Alegeți o locație și un nume pentru a salva fișierul",
    "emptyFolder": "Acest dosar este gol",
    "nameLabel": "Nume:",
    "untitledPlaceholder": "Fără Titlu",
    "toasts": {
      "permissionDenied": "Permisiune refuzată: {{name}}"
    },
    "cancel": "Anulează",
    "open": "Deschide",
    "save": "Salvează"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Muzica nu este instalată. Instaleaz-o din App Store.",
      "notepadNotInstalled": "Notepad nu este instalat. Instalează-l din App Store.",
      "photosNotInstalled": "Aplicația Fotografii nu este instalată. Instaleaz-o din App Store."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} elemente",
      "bytes": "{{count}} octeți",
      "type": "Tip",
      "owner": "Proprietar",
      "permissions": "Permisiuni",
      "modified": "Modificat",
      "size": "Mărime"
    },
    "sidebar": {
      "favorites": "Favorite",
      "system": "Sistem",
      "locations": "Locații"
    },
    "places": {
      "home": "Acasă",
      "desktop": "Desktop",
      "documents": "Documente",
      "downloads": "Descărcări",
      "pictures": "Imagini",
      "music": "Muzică",
      "trash": "Coș de gunoi"
    },
    "actions": {
      "moveToTrash": "Mută la Coșul de gunoi",
      "search": "Caută"
    },
    "toasts": {
      "permissionDenied": "Permisiune refuzată: {{name}}",
      "musicNotInstalled": "Muzica nu este instalată. Instaleaz-o din App Store.",
      "notepadNotInstalled": "Notepad nu este instalat. Instalează-l din App Store.",
      "photosNotInstalled": "Aplicația Fotografii nu este instalată. Instaleaz-o din App Store.",
      "movedItem": "1 element mutat",
      "movedItems": "S-au mutat {{count}} elemente",
      "movedItemTo": "1 element mutat în {{target}}",
      "movedItemsTo": "S-au mutat {{count}} elemente în {{target}}",
      "movedItemToTrash": "1 element mutat la Gunoi",
      "movedItemsToTrash": "S-au mutat {{count}} elemente la Gunoi",
      "moveFailedInvalidData": "Mutare eșuată: Date invalide",
      "failedToProcessDrop": "Nu s-a putut procesa plasarea",
      "couldNotGetInfo": "Nu s-au putut obține informațiile",
      "fileTypeNotSupported": "Tipul de fișier '{{type}}' nu este suportat"
    },
    "search": {
      "noResultsTitle": "Niciun rezultat găsit",
      "noResultsDesc": "Niciun rezultat găsit pentru \"{{query}}\"",
      "resultsTitle": "Rezultate căutare ({{count}})"
    },
    "emptyFolder": "Acest folder este gol"
  },
  "messages": {
    "title": "Mesaje",
    "sidebar": {
      "conversationsTitle": "Conversații",
      "allMessages": "Toate mesajele",
      "unread": "Necitite",
      "starred": "Marcate conversațiile"
    },
    "search": {
      "placeholder": "Caută conversații..."
    },
    "menu": {
      "newMessage": "Mesaj Nou"
    },
    "auth": {
      "welcomeBack": "Bine ai revenit",
      "createAccount": "Creează cont",
      "recoverAccount": "Recuperează cont",
      "signInToContinue": "Conectează-te pentru a continua către Mesaje",
      "joinSecureNetwork": "Alătură-te rețelei securizate",
      "enterRecoveryKey": "Introdu cheia de recuperare pentru a redobândi accesul",
      "invalidCredentials": "Nume de utilizator sau parolă incorectă",
      "credentialsRetrieved": "Acreditări recuperate",
      "password": "Parolă",
      "returnToLogin": "Înapoi la Autentificare",
      "recoveryKey": "Cheie de Recuperare",
      "username": "Nume de utilizator",
      "processing": "Se procesează...",
      "signIn": "Conectare",
      "create": "Creează Cont",
      "recover": "Recuperează Parola",
      "noAccount": "Nu ai un cont? Creează unul",
      "haveAccount": "Ai deja un cont? Conectează-te",
      "forgotPassword": "Ai uitat parola?",
      "backToLogin": "Înapoi la Autentificare",
      "accountCreated": "Cont Creat!",
      "saveRecoveryKey": "Te rugăm să salvezi cheia de recuperare. Vei avea nevoie de ea dacă îți uiți vreodată parola.",
      "oneTimeShow": "Aceasta este singura dată când va fi afișată.",
      "savedContinue": "Am salvat-o - Continuă",
      "copied": "Copiat",
      "recoveryKeyCopied": "Cheia de recuperare a fost copiată în clipboard",
      "failedCopy": "Copierea cheii a eșuat",
      "error": "Eroare"
    },
    "ui": {
      "noConversations": "Nu există conversații",
      "noResults": "Niciun rezultat găsit",
      "noChatSelected": "Nicio conversație selectată",
      "chooseConversation": "Alege o conversație sau începe una nouă.",
      "startNewMessage": "Începe Mesaj Nou",
      "online": "Online",
      "typeMessage": "Scrie lui {{partner}}...",
      "unstar": "Elimină stea",
      "star": "Adaugă stea",
      "cantMessageSelf": "Nu îți poți trimite mesaje ție (încă)",
      "userNotFound": "Utilizator negăsit",
      "messageFailed": "Mesajul a eșuat"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Bibliotecă",
      "albumsTitle": "Albume"
    },
    "library": {
      "allPhotos": "Toate Fotografiile",
      "favorites": "Favorite",
      "recent": "Recente"
    },
    "menu": {
      "slideshow": "Diaporamă",
      "rotateClockwise": "Rotește Dreapta",
      "rotateCounterClockwise": "Rotește Stânga"
    },
    "empty": {
      "recent": {
        "title": "Nicio fotografie vizualizată recent",
        "description": "Fotografiile tale deschise recent vor apărea aici."
      },
      "favorites": {
        "title": "Nicio favorită încă",
        "description": "Marchează fotografiile ca favorite pentru a le vedea aici."
      },
      "library": {
        "title": "Nu s-au găsit fotografii",
        "description": "Nu s-au găsit fișiere foto în dosarul Imagini.",
        "openFolder": "Deschide dosarul {{folder}}"
      },
      "noFolder": {
        "title": "Biblioteca lui {{user}} nu a fost găsită",
        "description": "Dosarul {{path}} nu a fost găsit pentru acest utilizator."
      },
      "openHome": "Deschide Directorul Acasă"
    },
    "folders": {
      "pictures": "Imagini"
    }
  },
  "mail": {
    "login": {
      "title": "Mail",
      "subtitle": "Conectează-te la contul tău",
      "emailPlaceholder": "Email",
      "passwordPlaceholder": "Parolă",
      "signingIn": "Se conectează...",
      "signIn": "Conectare",
      "signOut": "Deconectare",
      "createAccountInfo": "Creează un cont printr-un furnizor de e-mail"
    },
    "menu": {
      "newMailbox": "Cutie Poștală Nouă",
      "onlineStatus": "Status Online",
      "newMessage": "Mesaj Nou",
      "reply": "Răspunde",
      "replyAll": "Răspunde Tuturor",
      "forward": "Redirecționează"
    },
    "sidebar": {
      "mailboxes": "Cutii Poștale",
      "inbox": "Inbox",
      "starred": "Marcate cu stea",
      "archived": "Arhivate",
      "trash": "Coș de gunoi"
    },
    "search": {
      "placeholder": "Caută e-mailuri..."
    },
    "empty": {
      "noEmails": "Niciun e-mail",
      "noEmailsFound": "Niciun e-mail găsit",
      "selectEmail": "Selectează un e-mail pentru a-l citi"
    },
    "actions": {
      "reply": "Răspunde",
      "forward": "Redirecționează",
      "archive": "Arhivează",
      "unarchive": "Dezarhivează",
      "delete": "Șterge",
      "restore": "Restaurează",
      "deleteForever": "Șterge Definitiv"
    },
    "time": {
      "minutesAgo": "acum {{minutes}}m",
      "hoursAgo": "acum {{hours}}h",
      "today": "Astăzi",
      "yesterday": "Ieri",
      "daysAgo": "acum {{days}} zile"
    },
    "attachments": {
      "count": "{{count}} atașament",
      "count_plural": "{{count}} atașamente",
      "download": "Descarcă",
      "downloaded": "Descărcat",
      "downloadedTo": "{{name}} descărcat în {{folder}}",
      "downloadFailed": "Descărcare eșuată",
      "downloadFailedMessage": "Nu s-a putut descărca {{name}}"
    }
  },
  "notepad": {
    "untitled": "Fără titlu",
    "untitledTab": "Fără titlu {{index}}",
    "empty": {
      "title": "Notepad",
      "description": "Creează un fișier nou sau deschide unul existent pentru a începe.",
      "newFile": "Fișier Nou",
      "openFile": "Deschide Fișier"
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
      "txt": "Text Simplu"
    },
    "actions": {
      "openFile": "Deschide Fișier",
      "saveFile": "Salvează Fișier",
      "bold": "Bold",
      "italic": "Italic",
      "list": "Listă",
      "heading": "Titlu"
    },
    "preview": {
      "edit": "Editează",
      "preview": "Previzualizare",
      "htmlPreviewTitle": "Previzualizare HTML"
    },
    "status": {
      "chars": "{{count}} caractere",
      "lines": "Ln {{count}}"
    },
    "contextSwitcher": {
      "title": "Apasă pentru a schimba contextul",
      "searchPlaceholder": "Caută limbaj...",
      "noLanguageFound": "Niciun limbaj găsit."
    },
    "toasts": {
      "switchedTo": "Schimbat la {{language}}",
      "failedToReadFile": "Nu s-a putut citi fișierul",
      "fileSaved": "Fișier salvat",
      "failedToSaveFilePermissions": "Nu s-a putut salva fișierul (Verifică permisiunile)",
      "saved": "Salvat",
      "failedToSave": "Salvare eșuată"
    },
    "dialog": {
      "unsaved": {
        "title": "Vrei să salvezi modificările?",
        "description": "Modificările tale vor fi pierdute dacă nu le salvezi.",
        "dontSave": "Nu Salva",
        "cancel": "Anulează",
        "save": "Salvează"
      }
    },
    "menu": {
      "new": "Nou",
      "open": "Deschide...",
      "save": "Salvează",
      "closeTab": "Închide Tab",
      "bold": "Bold",
      "italic": "Italic",
      "list": "Listă",
      "heading1": "Titlu 1",
      "heading2": "Titlu 2",
      "togglePreview": "Comută Previzualizare",
      "zoomIn": "Mărește",
      "zoomOut": "Micșorează"
    }
  },
  "calendar": {
    "menu": {
      "day": "Zi",
      "week": "Săptămână",
      "month": "Lună",
      "year": "An"
    },
    "toolbar": {
      "today": "Azi",
      "month": "Lună",
      "day": "Zi"
    },
    "sidebar": {
      "myCalendars": "Calendarele Mele",
      "filterColors": "Filtrează Culori"
    },
    "actions": {
      "createEvent": "Creează Eveniment",
      "createCategory": "Creează Categorie",
      "clear": "Șterge",
      "delete": "Șterge",
      "cancel": "Anulează",
      "saveEvent": "Salvează Eveniment"
    },
    "loadingEvents": "Se încarcă evenimente...",
    "toasts": {
      "cannotDeleteSystemCategory": "Categoriile de sistem nu pot fi șterse",
      "eventDeleted": "Eveniment șters",
      "eventSaved": "Eveniment salvat",
      "requiredFields": "Te rog completează câmpurile obligatorii"
    },
    "modal": {
      "newEvent": "Eveniment Nou",
      "editEvent": "Editează Eveniment",
      "newEventDescription": "Programează un nou eveniment în calendar.",
      "editEventDescription": "Vezi sau editează detaliile evenimentului.",
      "fields": {
        "title": "Titlu",
        "date": "Dată",
        "time": "Oră",
        "duration": "Durată",
        "type": "Tip",
        "location": "Locație",
        "color": "Culoare",
        "notes": "Note"
      },
      "placeholders": {
        "eventTitle": "Titlu eveniment",
        "pickDate": "Alege o dată",
        "searchTime": "Caută o oră...",
        "noTimeFound": "Nicio oră găsită.",
        "selectDuration": "Selectează durata",
        "searchDuration": "Caută durată...",
        "noDurationFound": "Nicio durată găsită.",
        "selectType": "Selectează tip",
        "searchType": "Caută tip...",
        "noTypeFound": "Niciun tip găsit.",
        "addLocation": "Adaugă locație",
        "addNotes": "Adaugă note..."
      },
      "durationMinutes": "{{minutes}} min",
      "minutesOption": "{{minutes}} minute"
    },
    "categories": {
      "all": "Toate",
      "work": "Muncă",
      "personal": "Personal",
      "social": "Social",
      "events": "Evenimente",
      "family": "Familie"
    },
    "types": {
      "work": "Muncă",
      "personal": "Personal",
      "social": "Social",
      "events": "Evenimente",
      "family": "Familie",
      "other": "Altele"
    },
    "colors": {
      "blue": "Albastru",
      "green": "Verde",
      "red": "Roșu",
      "yellow": "Galben",
      "purple": "Mov",
      "pink": "Roz",
      "orange": "Portocaliu",
      "gray": "Gri"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Buclă Pornită",
        "location": "Turms",
        "notes": "Sistem de fișiere inițial."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "General",
      "dashboard": "Panou",
      "interfaceTitle": "Interfață",
      "uiAndSounds": "UI & Sunete",
      "systemTitle": "Sistem",
      "storage": "Stocare",
      "fileSystem": "Sistem de Fișiere",
      "appsTitle": "Aplicații",
      "performance": "Performanță"
    },
    "dashboard": {
      "title": "Panou",
      "description": "Prezentare generală a sistemului în curând."
    },
    "ui": {
      "title": "Interfață și Feedback",
      "notificationsTitle": "Notificări",
      "successToast": "Notificare Succes",
      "warningToast": "Notificare Avertisment",
      "errorToast": "Notificare Eroare",
      "soundFeedback": "Feedback Sonor",
      "buttons": {
        "success": "Succes",
        "warning": "Avertisment",
        "error": "Eroare",
        "app": "Notificare de aplicație",
        "open": "Deschide",
        "close": "Închide",
        "click": "Click",
        "hover": "Hover"
      }
    },
    "storage": {
      "title": "Inspector Stocare",
      "import": "Importă",
      "export": "Exportă",
      "clear": "Șterge",
      "toastTitle": "Stocare",
      "exportSuccess": "Preferințe exportate cu succes",
      "exportFail": "Eșec la exportul preferințelor",
      "importSuccess": "Preferințe importate cu succes",
      "importFail": "Eșec la parsarea fișierului de import",
      "clearConfirm": "Sigur dorești să ștergi TOATĂ stocarea locală? Aceasta va reseta preferințele de utilizare, setările temei și pozițiile ferestrelor.",
      "clearSuccess": "Toate cheile șterse",
      "softMemory": "Memorie Ușoară (Preferințe)",
      "hardMemory": "Memorie Grea (Sistem de fișiere)",
      "keysCount": "{{count}} chei",
      "localStorageKeys": "Chei Stocare Locală"
    },
    "filesystem": {
      "title": "Debugger Sistem Fișiere"
    },
    "performance": {
      "title": "Monitor Performanță"
    },
    "menu": {
      "resetFilesystem": "Resetează Sistem Fișiere",
      "runDiagnostics": "Rulează Diagnosticare"
    },
    "messages": {
      "createValues": {
        "title": "Creează / Resetează cont",
        "username": "Nume de utilizator",
        "password": "Parolă",
        "button": "Creează cont",
        "success": "Contul {{username}} a fost creat"
      },
      "registry": {
        "title": "Registru conturi",
        "empty": "Nu s-au găsit conturi",
        "useInSender": "Folosește ca expeditor",
        "delete": "Șterge cont",
        "deleteConfirm": "Ștergi contul {{username}}? Această acțiune este ireversibilă.",
        "deleteSuccess": "Contul {{username}} a fost șters"
      },
      "sendMessage": {
        "title": "Trimite mesaj",
        "from": "Expeditor (De la)",
        "to": "Destinatar (Către)",
        "selectAccount": "Selectează cont...",
        "content": "Conținut",
        "placeholder": "Scrie un mesaj...",
        "button": "Trimite mesaj",
        "success": "Mesaj trimis"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Sistem",
      "general": "General"
    },
    "sections": {
      "appearance": "Aspect",
      "performance": "Performanță",
      "displays": "Ecrane",
      "notifications": "Notificări",
      "network": "Rețea",
      "security": "Securitate & Confidențialitate",
      "users": "Utilizatori & Grupuri",
      "storage": "Stocare",
      "about": "Despre"
    },
    "appearance": {
      "title": "Aspect",
      "languageTitle": "Limbă",
      "languageDescription": "Alege limba de afișare pentru interfața sistemului",
      "languagePlaceholder": "Selectează limba",
      "wallpaperTitle": "Fundal Desktop",
      "wallpaperDescription": "Selectează un fundal pentru mediul tău desktop",
      "accentTitle": "Culoare Accent",
      "accentDescription": "Alege o culoare de accent pentru a personaliza experiența ta desktop",
      "presetColors": "Culori Presetate",
      "customColor": "Culoare Personalizată",
      "customColorHint": "Introdu un cod de culoare hex (ex. #3b82f6)",
      "preview": "Previzualizare",
      "previewPrimary": "Primar",
      "previewOutlined": "Conturat",
      "themeModeTitle": "Mod Temă",
      "themeModeDescription": "Alege cum afectează culoarea de accent nuanțele de fundal",
      "themeModeNeutralTitle": "Neutru",
      "themeModeNeutralDesc": "Doar griuri naturale",
      "themeModeShadesTitle": "Nuanțe",
      "themeModeShadesDesc": "Nuanțe culoare de accent",
      "themeModeContrastTitle": "Contrast",
      "themeModeContrastDesc": "Culori complementare",
      "themeTitle": "Temă",
      "themeDark": "Întunecat",
      "themeLightSoon": "Luminos (În Curând)",
      "wallpaperActive": "Activ",
      "wallpaperUse": "Folosește"
    },
    "performance": {
      "blurTitle": "Blur & Transparență",
      "blurDescription": "Activează efectul de blur sticlă și transparența ferestrelor",
      "reduceMotionTitle": "Redu Mișcarea",
      "reduceMotionDescription": "Dezactivează animațiile pentru răspuns mai rapid și accesibilitate",
      "disableShadowsTitle": "Dezactivează Umbre",
      "disableShadowsDescription": "Elimină umbrele ferestrelor pentru a îmbunătăți randarea",
      "disableGradientsTitle": "Dezactivează Gradienți",
      "disableGradientsDescription": "Folosește culori solide în loc de gradienți pentru pictograme"
    },
    "placeholders": {
      "displaysTitle": "Setări Ecran",
      "displaysDescription": "Rezoluție, scalare și luminozitate în curând.",
      "notificationsTitle": "Notificări",
      "notificationsDescription": "Preferințe centru de notificări în curând.",
      "networkTitle": "Rețea",
      "networkDescription": "Configurări Wi‑Fi și Bluetooth în curând.",
      "securityTitle": "Securitate & Confidențialitate",
      "securityDescription": "Firewall, permisiuni și setări de confidențialitate în curând.",
      "storageTitle": "Stocare",
      "storageDescription": "Analiză și gestionare spațiu disc în curând."
    },
    "users": {
      "currentUsersTitle": "Utilizatori Curenți",
      "addUser": "Adaugă Utilizator",
      "cancel": "Anulează",
      "editAction": "Editează",
      "newUserDetails": "Detalii Utilizator Nou",
      "usernamePlaceholder": "Nume utilizator (ex. alice)",
      "fullNamePlaceholder": "Nume Complet",
      "passwordOptionalPlaceholder": "Parolă (opțional)",
      "passwordHintOptionalPlaceholder": "Indiciu Parolă (opțional)",
      "createUser": "Creează Utilizator",
      "userExists": "Utilizatorul există deja",
      "currentBadge": "Curent",
      "rootBadge": "Root",
      "adminBadge": "Admin",
      "confirmDeleteUser": "Sigur dorești să ștergi pe {{username}}?",
      "editForm": {
        "fullNameLabel": "Nume Complet",
        "roleLabel": "Rol",
        "administrator": "Administrator",
        "newPasswordLabel": "Parolă Nouă (lasă gol pentru a păstra curenta)",
        "passwordHintLabel": "Indiciu Parolă",
        "saveChanges": "Salvează Modificări"
      }
    },
    "about": {
      "version": "Versiune",
      "framework": "Cadru",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Mediu",
      "browserMode": "Mod Browser",
      "developerMode": "Mod Dezvoltator",
      "developerModeDescription": "Activează unelte avansate și funcții de depanare",
      "exposeRootUser": "Expune Utilizator Root",
      "exposeRootUserDescription": "Arată utilizatorul root pe ecranul de autentificare",
      "memoryUsage": "Utilizare Memorie",
      "preferencesSoft": "Preferințe (Memorie Ușoară)",
      "filesystemHard": "Sistem de Fișiere (Memorie Grea)",
      "total": "Total"
    },
    "danger": {
      "title": "Zonă Periculoasă",
      "softResetTitle": "Resetare Ușoară",
      "softResetDescription": "Resetează preferințele, setările temei, pozițiile pictogramelor de pe desktop și stările aplicațiilor. Fișierele și dosarele tale vor fi păstrate.",
      "resetPreferences": "Resetează Preferințe",
      "confirmReset": "Confirmă Resetare",
      "hardResetTitle": "Resetare Totală",
      "hardResetDescription": "Șterge complet toate datele, inclusiv fișiere, dosare și setări. Această acțiune nu poate fi anulată.",
      "hardResetWarning": "⚠️ Toate fișierele și dosarele personalizate vor fi șterse permanent",
      "factoryReset": "Resetare din Fabrică",
      "deleteEverything": "Da, Șterge Tot"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Bun venit la Aurora",
        "description": "Selectează limba pentru a începe"
      },
      "account": {
        "title": "Creează Contul",
        "description": "Configurează contul principal de administrator"
      },
      "theme": {
        "title": "Personalizează",
        "description": "Fă-l al tău"
      },
      "finishing": {
        "title": "Configurare...",
        "description": "Se aplică configurația"
      }
    },
    "account": {
      "fullName": "Nume Complet",
      "fullNamePlaceholder": "Exemplu: Ion Popescu",
      "username": "Nume Utilizator",
      "password": "Parolă",
      "passwordHint": "Indiciu Parolă (Opțional)",
      "passwordHintPlaceholder": "Exemplu: Numele primului tău animal"
    },
    "theme": {
      "mode": "Mod Temă",
      "accentColor": "Culoare Accent",
      "darkMode": "Întunecat (Neutru)",
      "lightMode": "Luminos",
      "comingSoon": "În curând"
    },
    "finishing": {
      "title": "Ești gata!",
      "subtitle": "Aurora OS este pregătit. Te redirecționăm către ecranul de autentificare..."
    },
    "search": {
      "placeholder": "Caută limbă...",
      "noResults": "Nicio limbă găsită"
    },
    "validation": {
      "requiredFields": "Te rugăm să completezi toate câmpurile obligatorii",
      "passwordLength": "Parola trebuie să aibă cel puțin 6 caractere",
      "userExists": "Utilizatorul există deja. Te rugăm să alegi un alt nume de utilizator.",
      "fullNameFormat": "Numele complet trebuie să conțină doar litere, spații și cratime",
      "usernameFormat": "Numele de utilizator trebuie să conțină doar litere mici și cifre",
      "hintLength": "Indiciul parolei este prea lung (maxim 50 de caractere)",
      "hintSecurity": "Indiciul parolei nu poate conține parola însăși",
      "hintFormat": "Indiciul parolei conține caractere invalide",
      "creationFailed": "Crearea contului a eșuat. Te rugăm să încerci din nou."
    },
    "buttons": {
      "next": "Înainte",
      "back": "Înapoi",
      "startUsing": "Începe să folosești Aurora"
    }
  },
  "battery": {
    "title": "Baterie",
    "charging": "Se încarcă",
    "fullyCharged": "Complet Încărcată",
    "remaining": "{{percentage}}% Rămas",
    "powerSource": "Sursă Alimentare:",
    "powerSources": {
      "adapter": "Adaptor de Alimentare",
      "battery": "Baterie"
    },
    "condition": "Stare (Est.)",
    "metrics": {
      "health": "Sănătate",
      "cycles": "Cicluri",
      "temp": "Temp",
      "voltage": "Voltaj"
    },
    "disclaimer": "Măsurătorile privind sănătatea și starea bateriei sunt estimări bazate pe senzorii disponibili ai sistemului. Valorile reale pot varia.",
    "showPercentage": "Arată procentajul în bara de meniu"
  },
  "audio": {
    "title": "Sunet",
    "muteAll": "Oprește Tot",
    "unmute": "Pornește Sunet",
    "masterVolume": "Volum Principal",
    "mixer": "Mixer",
    "categories": {
      "music": "Muzică",
      "system": "Alerte Sistem",
      "interface": "Interfață",
      "feedback": "Feedback Intrare",
      "ambiance": "Ambianță"
    },
    "mixerLabels": {
      "masterOutput": "Ieșire Principală",
      "musicAppLevel": "Nivel Aplicație Muzică",
      "sfxInterface": "Efecte & Interfață",
      "backgroundLoop": "Buclă Fundal"
    }
  }
};

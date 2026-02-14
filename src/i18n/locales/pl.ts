import type { TranslationDict } from '@/i18n/types';

export const pl: TranslationDict = {
  "time": {
    "yesterday": "Wczoraj"
  },
  "common": {
    "name": "Nazwa",
    "color": "Kolor",
    "cancel": "Anuluj",
    "save": "Zapisz"
  },
  "game": {
    "intro": {
      "initialize": "Inicjalizacja systemu",
      "clickToStart": "KLIKNIJ, ABY ROZPOCZĄĆ",
      "skipHint": "ESC lub SPACJA, aby pominąć"
    },
    "mainMenu": {
      "continue": {
        "label": "Kontynuuj",
        "desc": {
          "canContinue": "Wznów poprzednią pętlę",
          "noData": "Brak danych pętli"
        }
      },
      "newGame": {
        "label": "Nowa pętla",
        "desc": "Rozpocznij od nowa (Usuwa dane)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Konfiguracja parametrów globalnych"
      },
      "exit": {
        "label": "Zamknij system",
        "desc": "Zakończ sesję",
        "confirm": {
          "title": "Zamknięcie systemu",
          "message": "Czy na pewno chcesz zamknąć system? Niezapisany postęp może zostać utracony.",
          "cancel": "Anuluj",
          "confirm": "Zamknij"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Ustawienia BIOS",
      "hardwareAcceleration": "Akceleracja sprzętowa",
      "displayMode": "Tryb Wyświetlania",
      "fullscreen": "Pełny Ekran",
      "borderless": "Bez Obramowania",
      "windowed": "W Oknie",
      "resolution": "Rozdzielczość",
      "windowSettings": "Ustawienia Okna",
      "windowFrame": "Obramowanie Okna",
      "windowFrameHint": "Pasek tytułu i obramowanie (Wymagany restart)",
      "configurationUtility": "Narzędzie Konfiguracji",
      "tabs": {
        "display": "Ekran",
        "audio": "Dźwięk",
        "system": "System"
      },
      "graphicsQuality": "Jakość Grafiki",
      "presets": {
        "highFidelity": {
          "label": "Wysoka Jakość",
          "desc": "Rozmycie, Cienie, Nasycenie włączone. wygląd++"
        },
        "performance": {
          "label": "Wydajność",
          "desc": "Maks. FPS. Minimalne efekty. prędkość++"
        }
      },
      "reduceMotion": "Ogranicz Ruch",
      "simpleColors": "Proste Kolory",
      "solidBackgrounds": "Jednolite Tła",
      "noShadows": "Bez Cieni",
      "dangerZone": "Strefa Zagrożenia",
      "configFooter": "KONFIG",
      "softReset": "Miękki reset",
      "softResetHint": "Przeładuj aplikację",
      "softResetConfirm": "Miękki reset: Spowoduje to przeładowanie aplikacji, ale zachowa Twoje dane. Kontynuować?",
      "factoryReset": "Reset fabryczny",
      "factoryResetHint": "Wyczyść wszystkie dane",
      "factoryResetConfirm": "RESET FABRYCZNY: To całkowicie wyczyści WSZYSTKIE dane, użytkowników i pliki. Tego nie można cofnąć. Czy jesteś pewien?"
    },
    "footer": {
      "originalDistribution": "Dystrybucja oryginalna",
      "temperedDistribution": "Dystrybucja zmodyfikowana"
    }
  },
  "appDescriptions": {
    "finder": "Menedżer plików",
    "browser": "Dostęp do sieci",
    "mail": "Czytaj i pisz e-maile",
    "appStore": "Pobieraj i zarządzaj aplikacjami",
    "terminal": "Interfejs wiersza poleceń",
    "systemSettings": "Konfiguruj swój system",
    "notepad": "Edytuj pliki tekstowe",
    "messages": "Czatuj ze znajomymi",
    "calendar": "Zarządzaj harmonogramem",
    "photos": "Przeglądaj i zarządzaj zdjęciami",
    "music": "Odtwarzaj ulubioną muzykę",
    "devCenter": "Narzędzia developerskie"
  },
  "a11y": {
    "common": {
      "close": "Zamknij",
      "open": "Otwórz",
      "notAvailable": "N/D"
    },
    "sidebar": {
      "toggleSidebar": "Przełącz pasek boczny"
    },
    "pagination": {
      "pagination": "Stronicowanie",
      "goToPreviousPage": "Idź do poprzedniej strony",
      "goToNextPage": "Idź do następnej strony",
      "previous": "Poprzednia",
      "next": "Następna",
      "morePages": "Więcej stron"
    },
    "breadcrumb": {
      "breadcrumb": "Okruszki",
      "more": "Więcej"
    },
    "carousel": {
      "previousSlide": "Poprzedni slajd",
      "nextSlide": "Następny slajd"
    }
  },
  "commandPalette": {
    "title": "Paleta poleceń",
    "description": "Wyszukaj polecenie do uruchomienia..."
  },
  "login": {
    "softReset": "Miękki reset",
    "hardReset": "Twardy reset",
    "hardResetConfirm": "Twardy reset: To wyczyści wszystkie dane. Kontynuować?",
    "selectUser": "Wybierz użytkownika",
    "enterPasswordToUnlock": "Wprowadź hasło, aby odblokować",
    "restoringPreviousSession": "Przywracanie poprzedniej sesji",
    "passwordPlaceholder": "Hasło",
    "incorrectPassword": "Nieprawidłowe hasło",
    "hint": "Podpowiedź",
    "enterSystem": "Wejdź do systemu",
    "switchAccount": "Przełącz konto",
    "back": "Wstecz",
    "suspendToSwitch": "Zawiesić sesję, aby przełączyć?",
    "cancel": "Anuluj",
    "switchUser": "Przełącz użytkownika",
    "logOut": "Wyloguj",
    "logOutConfirm": "Wylogować {{username}}? To zamknie wszystkie otwarte okna i odrzuci niezapisane zmiany.",
    "active": "Aktywna",
    "resume": "Wznów",
    "sessionActive": "Sesja aktywna"
  },
  "app": {
    "loadingKernel": "ŁADOWANIE JĄDRA..."
  },
  "menubar": {
    "menus": {
      "file": "Plik",
      "shell": "Powłoka",
      "edit": "Edycja",
      "format": "Format",
      "song": "Utwór",
      "view": "Widok",
      "go": "Idź",
      "controls": "Sterowanie",
      "window": "Okno",
      "help": "Pomoc",
      "store": "Sklep",
      "history": "Historia",
      "bookmarks": "Zakładki",
      "mailbox": "Skrzynka",
      "message": "Wiadomość",
      "conversations": "Rozmowy"
    },
    "items": {
      "newWindow": "Nowe okno",
      "newFolder": "Nowy folder",
      "open": "Otwórz",
      "changeWallpaper": "Zmień tapetę",
      "closeWindow": "Zamknij okno",
      "undo": "Cofnij",
      "redo": "Ponów",
      "cut": "Wytnij",
      "copy": "Kopiuj",
      "paste": "Wklej",
      "selectAll": "Zaznacz wszystko",
      "reload": "Odśwież",
      "toggleFullscreen": "Przełącz pełny ekran",
      "minimize": "Zminimalizuj",
      "bringAllToFront": "Wszystkie na wierzch",
      "back": "Wstecz",
      "forward": "Dalej",
      "enclosingFolder": "Folder nadrzędny",
      "getInfo": "Informacje",
      "moveToTrash": "Przenieś do kosza"
    },
    "help": {
      "appHelp": "Pomoc {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Funkcja niezaimplementowana"
    },
    "system": {
      "aboutThisComputer": "Ten komputer...",
      "systemSettings": "Ustawienia systemowe...",
      "appStore": "App Store...",
      "lockScreen": "Zablokuj ekran",
      "switchUser": "Przełącz użytkownika",
      "user": "Użytkownik",
      "logOutAs": "Wyloguj: {{username}}",
      "viewSystemInfo": "Wyświetl informacje o systemie",
      "viewSystemSettings": "Wyświetl ustawienia systemowe",
      "returnToLoginWhile": "Wróć do ekranu logowania,",
      "returnToUserSelectionWhile": "Wróć do wyboru użytkownika,",
      "keepingSession": "zachowując sesję",
      "clearingSession": "czyszcząc sesję",
      "panic": "PANIKA",
      "hardReset": "Twardy reset",
      "warning": "Ostrzeżenie",
      "panicWarningBody": "Spowoduje to przywrócenie ustawień fabrycznych {{productName}}. Dobre jako przycisk paniki, jeśli coś pójdzie nie tak.",
      "serverTime": "Czas serwera (UTC)",
      "localTime": "Czas lokalny"
    },
    "app": {
      "aboutApp": "O programie {{appName}}",
      "settings": "Ustawienia...",
      "quitApp": "Zakończ {{appName}}"
    }
  },
  "notifications": {
    "title": "Powiadomienia",
    "titles": {
      "permissionDenied": "Odmowa dostępu"
    },
    "clearAll": "Wyczyść wszystko",
    "new": "Nowe",
    "subtitles": {
      "appMissing": "Brak aplikacji",
      "permissionDenied": "Odmowa dostępu",
      "saved": "Zapisano",
      "deleted": "Usunięto",
      "moved": "Przeniesiono",
      "trash": "Kosz",
      "failed": "Niepowodzenie",
      "ui": "Interfejs",
      "validation": "Walidacja",
      "success": "Sukces",
      "error": "Błąd",
      "info": "Info",
      "warning": "Ostrzeżenie",
      "fileError": "Błąd pliku"
    },
    "empty": "Brak powiadomień",
    "clearApp": "Wyczyść wszystkie dla tej aplikacji",
    "messageFrom": "Message from {{sender}}"
  },
  "memory": {
    "title": "Pamięć",
    "used": "Użyta",
    "pressure": "Nacisk",
    "appMemory": "Pamięć aplikacji",
    "wiredMemory": "Pamięć sprzętowa",
    "processName": "Nazwa procesu",
    "memory": "Pamięć",
    "swapUsed": "Użyty Swap",
    "systemWired": "System Aurora",
    "activeSession": "Pamięć sprzętowa (Aktywna sesja)",
    "userSession": "Sesja: {{user}}",
    "backgroundSession": "Pamięć uśpiona (Tło)",
    "backgroundProcesses": "{{count}} procesów w tle",
    "instances": "{{count}} instancji",
    "type": {
      "mainWindow": "Główne okno",
      "extraWindow": "Dodatkowe okno",
      "extraTabs": "{{count}} dodatkowych kart"
    },
    "error": {
      "title": "Niewystarczająca Pamięć",
      "description": "Nie można otworzyć {{appName}}. Za mało dostępnej pamięci RAM."
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Sprawdź aktualizacje...",
      "viewMyAccount": "Pokaż moje konto"
    },
    "categories": {
      "all": "Wszystkie",
      "productivity": "Produktywność",
      "media": "Media",
      "utilities": "Narzędzia",
      "development": "Programowanie",
      "system": "System"
    },
    "searchPlaceholder": "Szukaj aplikacji...",
    "empty": {
      "title": "Nie znaleziono aplikacji",
      "description": "Spróbuj zmienić wyszukiwanie lub filtr kategorii."
    },
    "size": "Rozmiar",
    "sizeUnknown": "Nieznany",
    "install": "Zainstaluj",
    "uninstall": "Odinstaluj",
    "open": "Otwórz",
    "cancel": "Anuluj",
    "confirm": "Potwierdź",
    "restore": "Przywróć",
    "checkFailed": "Sprawdzanie nieudane",
    "checkFailedTitle": "Błąd sprawdzania instalacji",
    "restoreSuccess": "Pomyślnie przywrócono {{app}}",
    "restoreError": "Nie udało się przywrócić {{app}}",
    "restorePermissionDenied": "Wymagane uprawnienia administratora do przywracania aplikacji",
    "installingWarning": "Proszę czekać, trwa instalacja aplikacji."
  },
  "browser": {
    "menu": {
      "newTab": "Nowa karta",
      "closeTab": "Zamknij kartę"
    },
    "welcome": {
      "title": "Browser",
      "description": "Search for information or enter a URL to start browsing.",
      "searchPlaceholder": "Szukaj stron lub wpisz adres...",
      "favorites": "Ulubione",
      "recentActivity": "Ostatnia aktywność"
    },
    "searchPlaceholder": "Szukaj lub wpisz adres...",
    "error": {
      "pageNotFound": "Strona nie znaleziona",
      "pageNotFoundDesc": "Strona internetowa {{url}} nie została znaleziona.",
      "goHome": "Wróć do strony głównej",
      "offlineTitle": "No Internet Connection",
      "offlineDesc": "You are not connected to the internet. Please connect to a network to browse the web."
    }
  },
  "music": {
    "sidebar": {
      "library": "Biblioteka",
      "songs": "Utwory",
      "favorites": "Ulubione",
      "recentlyPlayed": "Ostatnio odtwarzane"
    },
    "titles": {
      "songs": "Utwory",
      "recentlyPlayed": "Ostatnio odtwarzane"
    },
    "actions": {
      "playAll": "Odtwórz wszystko"
    },
    "empty": {
      "recent": {
        "title": "Brak ostatnio odtwarzanych utworów",
        "description": "Tutaj pojawią się Twoje ostatnio odtwarzane utwory."
      },
      "library": {
        "title": "Brak utworów",
        "description": "Nie znaleziono plików muzycznych w folderze Muzyka.",
        "openFolder": "Otwórz folder {{folder}}"
      }
    },
    "folders": {
      "music": "Muzyka",
      "home": "Strona główna"
    },
    "player": {
      "notPlaying": "Nie odtwarza",
      "selectSong": "Wybierz utwór"
    },
    "metadata": {
      "unknownArtist": "Nieznany wykonawca",
      "unknownAlbum": "Nieznany album",
      "unknownTitle": "Nieznany tytuł"
    },
    "menu": {
      "newPlaylist": "Nowa playlista",
      "import": "Importuj...",
      "closeWindow": "Zamknij okno",
      "showInFinder": "Pokaż w Finderze",
      "addToPlaylist": "Dodaj do playlisty",
      "play": "Odtwórz",
      "previousSong": "Poprzedni utwór",
      "nextSong": "Następny utwór",
      "volumeUp": "Zwiększ głośność",
      "volumeDown": "Zmniejsz głośność"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Nowa karta",
      "clearScrollback": "Wyczyść bufor",
      "killProcess": "Zabij proces"
    },
    "help": {
      "availableCommands": "Dostępne polecenia:",
      "usage": "Użycie",
      "appLaunchHelp": "Uruchamianie zainstalowanych aplikacji (np. Finder)"
    },
    "commands": {
      "help": {
        "description": "Pokaż tę wiadomość pomocy"
      },
      "ls": {
        "description": "Wylistuj zawartość katalogu",
        "usage": "ls [ścieżka]"
      },
      "cd": {
        "description": "Zmień katalog",
        "usage": "cd <ścieżka>"
      },
      "pwd": {
        "description": "Wydrukuj katalog roboczy"
      },
      "logout": {
        "description": "Wyloguj z bieżącej sesji"
      },
      "who": {
        "description": "Pokaż zalogowanych użytkowników"
      },
      "clear": {
        "description": "Wyczyść ekran terminala"
      },
      "cat": {
        "description": "Wyświetl zawartość pliku",
        "usage": "cat <plik>"
      },
      "mkdir": {
        "description": "Utwórz katalog",
        "usage": "mkdir <nazwa>"
      },
      "touch": {
        "description": "Utwórz plik lub zaktualizuj znacznik czasu",
        "usage": "touch <nazwa>"
      },
      "rm": {
        "description": "Usuń plik lub katalog",
        "usage": "rm <nazwa>"
      },
      "cp": {
        "description": "Kopiuj pliki",
        "usage": "cp <źródło> <cel>"
      },
      "mv": {
        "description": "Przenieś (zmień nazwę) pliki",
        "usage": "mv <źródło> <cel>"
      },
      "chmod": {
        "description": "Zmień tryb pliku (uprawnienia)",
        "usage": "chmod <tryb> <plik>"
      },
      "chown": {
        "description": "Zmień właściciela i grupę pliku",
        "usage": "chown <właściciel>[:<grupa>] <plik>"
      },
      "grep": {
        "description": "Wydrukuj linie pasujące do wzorca",
        "usage": "grep <wzorzec> <plik>"
      },
      "find": {
        "description": "Szukaj plików w hierarchii katalogów",
        "usage": "find [ścieżka] [-name wzorzec]"
      },
      "echo": {
        "description": "Wyświetl linię tekstu",
        "usage": "echo [tekst]"
      },
      "date": {
        "description": "Wydrukuj datę i godzinę systemową"
      },
      "uptime": {
        "description": "Pokaż czas pracy systemu"
      },
      "whoami": {
        "description": "Wydrukuj bieżącego użytkownika"
      },
      "hostname": {
        "description": "Wydrukuj nazwę hosta systemu"
      },
      "reset": {
        "description": "Zresetuj system plików do ustawień fabrycznych"
      },
      "exit": {
        "description": "Zakończ bieżącą sesję powłoki"
      },
      "su": {
        "description": "Zmień ID użytkownika lub zostań superużytkownikiem",
        "usage": "su [użytkownik] [hasło]"
      },
      "sudo": {
        "description": "Wykonaj polecenie jako inny użytkownik",
        "usage": "sudo [opcje] [polecenie]"
      },
      "history": {
        "description": "Pokaż historię poleceń terminala",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} wkrótce dostępny",
    "descriptions": {
      "mail": "Zarządzaj e-mailami, kontaktami i wydarzeniami.",
      "calendar": "Planuj spotkania, wydarzenia i przypomnienia.",
      "default": "Ta aplikacja jest obecnie w fazie rozwoju."
    }
  },
  "filePicker": {
    "openFile": "Otwórz plik",
    "openFileDescription": "Wybierz plik do otwarcia z systemu plików",
    "saveFile": "Zapisz plik",
    "saveFileDescription": "Wybierz lokalizację i nazwę, aby zapisać plik",
    "emptyFolder": "Ten folder jest pusty",
    "nameLabel": "Nazwa:",
    "untitledPlaceholder": "Bez tytułu",
    "toasts": {
      "permissionDenied": "Odmowa dostępu: {{name}}"
    },
    "cancel": "Anuluj",
    "open": "Otwórz",
    "save": "Zapisz"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Aplikacja Music nie jest zainstalowana. Zainstaluj ją z App Store.",
      "notepadNotInstalled": "Notepad nie jest zainstalowany. Zainstaluj go z App Store.",
      "photosNotInstalled": "Aplikacja Photos nie jest zainstalowana. Zainstaluj ją z App Store."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} elementów",
      "bytes": "{{count}} bajtów",
      "type": "Typ",
      "owner": "Właściciel",
      "permissions": "Uprawnienia",
      "modified": "Zmodyfikowano",
      "size": "Rozmiar"
    },
    "sidebar": {
      "favorites": "Ulubione",
      "system": "System",
      "locations": "Lokalizacje"
    },
    "places": {
      "home": "Strona główna",
      "desktop": "Pulpit",
      "documents": "Dokumenty",
      "downloads": "Pobrane",
      "pictures": "Obrazy",
      "music": "Muzyka",
      "trash": "Kosz"
    },
    "actions": {
      "moveToTrash": "Przenieś do kosza",
      "search": "Szukaj"
    },
    "toasts": {
      "permissionDenied": "Odmowa dostępu: {{name}}",
      "musicNotInstalled": "Aplikacja Music nie jest zainstalowana. Zainstaluj ją z App Store.",
      "notepadNotInstalled": "Notepad nie jest zainstalowany. Zainstaluj go z App Store.",
      "photosNotInstalled": "Aplikacja Photos nie jest zainstalowana. Zainstaluj ją z App Store.",
      "movedItem": "Przeniesiono 1 element",
      "movedItems": "Przeniesiono {{count}} elementów",
      "movedItemTo": "Przeniesiono 1 element do {{target}}",
      "movedItemsTo": "Przeniesiono {{count}} elementów do {{target}}",
      "movedItemToTrash": "Przeniesiono 1 element do kosza",
      "movedItemsToTrash": "Przeniesiono {{count}} elementów do kosza",
      "moveFailedInvalidData": "Błąd przenoszenia: Nieprawidłowe dane",
      "failedToProcessDrop": "Nie udało się przetworzyć upuszczenia",
      "couldNotGetInfo": "Nie udało się pobrać informacji",
      "fileTypeNotSupported": "Typ pliku '{{type}}' nie jest obsługiwany"
    },
    "search": {
      "noResultsTitle": "Brak wyników",
      "noResultsDesc": "Nie znaleziono wyników dla \"{{query}}\"",
      "resultsTitle": "Wyniki wyszukiwania ({{count}})"
    },
    "emptyFolder": "Ten folder jest pusty"
  },
  "messages": {
    "title": "Wiadomości",
    "sidebar": {
      "conversationsTitle": "Rozmowy",
      "allMessages": "Wszystkie wiadomości",
      "unread": "Nieprzeczytane",
      "starred": "Oznaczone gwiazdką"
    },
    "search": {
      "placeholder": "Szukaj rozmów..."
    },
    "menu": {
      "newMessage": "Nowa wiadomość"
    },
    "auth": {
      "welcomeBack": "Witaj ponownie",
      "createAccount": "Utwórz konto",
      "recoverAccount": "Odzyskaj konto",
      "signInToContinue": "Zaloguj się, aby kontynuować",
      "joinSecureNetwork": "Dołącz do bezpiecznej sieci",
      "enterRecoveryKey": "Wprowadź klucz odzyskiwania, aby uzyskać dostęp",
      "invalidCredentials": "Nieprawidłowa nazwa użytkownika lub hasło",
      "credentialsRetrieved": "Dane uwierzytelniające pobrane",
      "password": "Hasło",
      "returnToLogin": "Wróć do logowania",
      "recoveryKey": "Klucz odzyskiwania",
      "username": "Nazwa użytkownika",
      "processing": "Przetwarzanie...",
      "signIn": "Zaloguj się",
      "create": "Utwórz konto",
      "recover": "Odzyskaj hasło",
      "noAccount": "Nie masz konta? Utwórz je",
      "haveAccount": "Masz już konto? Zaloguj się",
      "forgotPassword": "Zapomniałeś hasła?",
      "backToLogin": "Powrót do logowania",
      "accountCreated": "Konto utworzone!",
      "saveRecoveryKey": "Zapisz swój klucz odzyskiwania. Będziesz go potrzebować, jeśli zapomnisz hasła.",
      "oneTimeShow": "To jedyny raz, kiedy zostanie wyświetlony.",
      "savedContinue": "Zapisano - Kontynuuj",
      "copied": "Skopiowano",
      "recoveryKeyCopied": "Klucz odzyskiwania skopiowany do schowka",
      "failedCopy": "Nie udało się skopiować klucza",
      "error": "Błąd"
    },
    "ui": {
      "noConversations": "Brak rozmów",
      "noResults": "Brak wyników",
      "noChatSelected": "Nie wybrano czatu",
      "chooseConversation": "Wybierz rozmowę lub rozpocznij nową.",
      "startNewMessage": "Rozpocznij nową wiadomość",
      "online": "Online",
      "typeMessage": "Wiadomość do {{partner}}...",
      "unstar": "Usuń gwiazdkę",
      "star": "Oznacz gwiazdką",
      "cantMessageSelf": "Nie możesz wysyłać wiadomości do siebie (jeszcze)",
      "userNotFound": "Użytkownik nie znaleziony",
      "messageFailed": "Wysłanie wiadomości nie powiodło się"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Biblioteka",
      "albumsTitle": "Albumy"
    },
    "library": {
      "allPhotos": "Wszystkie zdjęcia",
      "favorites": "Ulubione",
      "recent": "Ostatnie",
      "userLibrary": "{{user}}'s Library"
    },
    "menu": {
      "slideshow": "Pokaz slajdów",
      "rotateClockwise": "Obróć w prawo",
      "rotateCounterClockwise": "Obróć w lewo"
    },
    "empty": {
      "recent": {
        "title": "Brak ostatnio przeglądanych zdjęć",
        "description": "Twoje ostatnio otwarte zdjęcia pojawią się tutaj."
      },
      "favorites": {
        "title": "Brak ulubionych",
        "description": "Oznacz zdjęcia jako ulubione, aby zobaczyć je tutaj."
      },
      "library": {
        "title": "Nie znaleziono zdjęć",
        "description": "Nie znaleziono plików zdjęć w folderze Obrazy.",
        "openFolder": "Otwórz folder {{folder}}"
      },
      "noFolder": {
        "title": "Nie znaleziono biblioteki {{user}}",
        "description": "Folder {{path}} nie został znaleziony dla tego użytkownika."
      },
      "openHome": "Otwórz katalog domowy"
    },
    "folders": {
      "pictures": "Obrazy",
      "recent": "Recent",
      "misc": "Misc"
    }
  },
  "mail": {
    "login": {
      "title": "Poczta",
      "subtitle": "Zaloguj się na swoje konto",
      "emailPlaceholder": "E-mail",
      "passwordPlaceholder": "Hasło",
      "signingIn": "Logowanie...",
      "signIn": "Zaloguj się",
      "signOut": "Wyloguj się",
      "createAccountInfo": "Utwórz konto przez dostawcę poczty"
    },
    "menu": {
      "newMailbox": "Nowa skrzynka",
      "onlineStatus": "Status online",
      "newMessage": "Nowa wiadomość",
      "reply": "Odpowiedz",
      "replyAll": "Odpowiedz wszystkim",
      "forward": "Przekaż"
    },
    "sidebar": {
      "mailboxes": "Skrzynki",
      "inbox": "Odebrane",
      "starred": "Oznaczone gwiazdką",
      "archived": "Zarchiwizowane",
      "trash": "Kosz"
    },
    "search": {
      "placeholder": "Szukaj e-maili..."
    },
    "empty": {
      "noEmails": "Brak wiadomości",
      "noEmailsFound": "Nie znaleziono wiadomości",
      "selectEmail": "Wybierz wiadomość, aby przeczytać"
    },
    "actions": {
      "reply": "Odpowiedz",
      "forward": "Przekaż",
      "archive": "Archiwizuj",
      "unarchive": "Przywróć z archiwum",
      "delete": "Usuń",
      "restore": "Przywróć",
      "deleteForever": "Usuń trwale"
    },
    "time": {
      "minutesAgo": "{{minutes}} min temu",
      "hoursAgo": "{{hours}} godz. temu",
      "today": "Dzisiaj",
      "yesterday": "Wczoraj",
      "daysAgo": "{{days}} dni temu"
    },
    "attachments": {
      "count": "{{count}} załącznik",
      "count_plural": "{{count}} załączników",
      "download": "Pobierz",
      "downloaded": "Pobrano",
      "downloadedTo": "{{name}} pobrano do {{folder}}",
      "downloadFailed": "Pobieranie nieudane",
      "downloadFailedMessage": "Nie udało się pobrać {{name}}"
    }
  },
  "notepad": {
    "untitled": "Bez tytułu",
    "untitledTab": "Bez tytułu {{index}}",
    "empty": {
      "title": "Notatnik",
      "description": "Utwórz nowy plik lub otwórz istniejący, aby rozpocząć.",
      "newFile": "Nowy plik",
      "openFile": "Otwórz plik"
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
      "txt": "Zwykły tekst"
    },
    "actions": {
      "openFile": "Otwórz plik",
      "saveFile": "Zapisz plik",
      "bold": "Pogrubienie",
      "italic": "Kursywa",
      "list": "Lista",
      "heading": "Nagłówek"
    },
    "preview": {
      "edit": "Edytuj",
      "preview": "Podgląd",
      "htmlPreviewTitle": "Podgląd HTML"
    },
    "status": {
      "chars": "{{count}} zn.",
      "lines": "Linia {{count}}"
    },
    "contextSwitcher": {
      "title": "Kliknij, aby zmienić kontekst",
      "searchPlaceholder": "Szukaj języka...",
      "noLanguageFound": "Nie znaleziono języka."
    },
    "toasts": {
      "switchedTo": "Przełączono na {{language}}",
      "failedToReadFile": "Nie udało się odczytać pliku",
      "fileSaved": "Plik zapisano",
      "failedToSaveFilePermissions": "Nie udało się zapisać pliku (Sprawdź uprawnienia)",
      "saved": "Zapisano",
      "failedToSave": "Zapisywanie nie powiodło się"
    },
    "dialog": {
      "unsaved": {
        "title": "Czy chcesz zapisać zmiany?",
        "description": "Twoje zmiany zostaną utracone, jeśli ich nie zapiszesz.",
        "dontSave": "Nie zapisuj",
        "cancel": "Anuluj",
        "save": "Zapisz"
      }
    },
    "menu": {
      "new": "Nowy",
      "open": "Otwórz...",
      "save": "Zapisz",
      "closeTab": "Zamknij kartę",
      "bold": "Pogrubienie",
      "italic": "Kursywa",
      "list": "Lista",
      "heading1": "Nagłówek 1",
      "heading2": "Nagłówek 2",
      "togglePreview": "Przełącz podgląd",
      "zoomIn": "Powiększ",
      "zoomOut": "Pomniejsz"
    }
  },
  "calendar": {
    "menu": {
      "day": "Dzień",
      "week": "Tydzień",
      "month": "Miesiąc",
      "year": "Rok"
    },
    "toolbar": {
      "today": "Dzisiaj",
      "month": "Miesiąc",
      "day": "Dzień"
    },
    "sidebar": {
      "myCalendars": "Moje Kalendarze",
      "filterColors": "Filtruj kolory"
    },
    "actions": {
      "createEvent": "Utwórz wydarzenie",
      "createCategory": "Utwórz kategorię",
      "clear": "Wyczyść",
      "delete": "Usuń",
      "cancel": "Anuluj",
      "saveEvent": "Zapisz wydarzenie"
    },
    "loadingEvents": "Ładowanie wydarzeń...",
    "toasts": {
      "cannotDeleteSystemCategory": "Kategorii systemowych nie można usunąć",
      "eventDeleted": "Wydarzenie usunięte",
      "eventSaved": "Wydarzenie zapisane",
      "requiredFields": "Wypełnij wymagane pola"
    },
    "modal": {
      "newEvent": "Nowe wydarzenie",
      "editEvent": "Edytuj wydarzenie",
      "newEventDescription": "Zaplanuj nowe wydarzenie w kalendarzu.",
      "editEventDescription": "Wyświetl lub edytuj szczegóły wydarzenia.",
      "fields": {
        "title": "Tytuł",
        "date": "Data",
        "time": "Czas",
        "duration": "Czas trwania",
        "type": "Typ",
        "location": "Lokalizacja",
        "color": "Kolor",
        "notes": "Notatki"
      },
      "placeholders": {
        "eventTitle": "Tytuł wydarzenia",
        "pickDate": "Wybierz datę",
        "searchTime": "Szukaj czasu...",
        "noTimeFound": "Nie znaleziono czasu.",
        "selectDuration": "Wybierz czas trwania",
        "searchDuration": "Szukaj czasu trwania...",
        "noDurationFound": "Nie znaleziono czasu trwania.",
        "selectType": "Wybierz typ",
        "searchType": "Szukaj typu...",
        "noTypeFound": "Nie znaleziono typu.",
        "addLocation": "Dodaj lokalizację",
        "addNotes": "Dodaj notatki..."
      },
      "durationMinutes": "{{minutes}} min",
      "minutesOption": "{{minutes}} minut"
    },
    "categories": {
      "all": "Wszystkie",
      "work": "Praca",
      "personal": "Osobiste",
      "social": "Społeczne",
      "events": "Wydarzenia",
      "family": "Rodzina"
    },
    "types": {
      "work": "Praca",
      "personal": "Osobiste",
      "social": "Społeczne",
      "events": "Wydarzenia",
      "family": "Rodzina",
      "other": "Inne"
    },
    "colors": {
      "blue": "Niebieski",
      "green": "Zielony",
      "red": "Czerwony",
      "yellow": "Żółty",
      "purple": "Fioletowy",
      "pink": "Różowy",
      "orange": "Pomarańczowy",
      "gray": "Szary"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Pętla rozpoczęta",
        "location": "Turms",
        "notes": "Inicjalizacja systemu plików."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "Ogólne",
      "dashboard": "Panel",
      "interfaceTitle": "Interfejs",
      "uiAndSounds": "UI i Dźwięki",
      "systemTitle": "System",
      "storage": "Pamięć",
      "fileSystem": "System Plików",
      "appsTitle": "Aplikacje",
      "performance": "Wydajność"
    },
    "dashboard": {
      "title": "Panel",
      "description": "Przegląd systemu wkrótce."
    },
    "ui": {
      "title": "Interfejs Użytkownika i Opinie",
      "notificationsTitle": "Powiadomienia",
      "successToast": "Toast Sukcesu",
      "warningToast": "Toast Ostrzegawczy",
      "errorToast": "Toast Błędu",
      "soundFeedback": "Informacja dźwiękowa",
      "buttons": {
        "success": "Sukces",
        "warning": "Ostrzeżenie",
        "error": "Błąd",
        "app": "Powiadomienie App",
        "open": "Otwórz",
        "close": "Zamknij",
        "click": "Klik",
        "hover": "Hover"
      }
    },
    "storage": {
      "title": "Inspektor Pamięci",
      "import": "Import",
      "export": "Eksport",
      "clear": "Wyczyść",
      "toastTitle": "Pamięć",
      "exportSuccess": "Preferencje wyeksportowane pomyślnie",
      "exportFail": "Nie udało się wyeksportować preferencji",
      "importSuccess": "Preferencje zaimportowane pomyślnie",
      "importFail": "Nie udało się przetworzyć pliku importu",
      "clearConfirm": "Czy na pewno chcesz wyczyścić CAŁĄ pamięć lokalną? Spowoduje to zresetowanie preferencji użytkowania, ustawień motywu i pozycji okien.",
      "clearSuccess": "Wszystkie klucze wyczyszczone",
      "softMemory": "Pamięć Miękka (Preferencje)",
      "hardMemory": "Pamięć Twarda (System Plików)",
      "keysCount": "{{count}} kluczy",
      "localStorageKeys": "Klucze Local Storage"
    },
    "filesystem": {
      "title": "Debugger Systemu Plików"
    },
    "performance": {
      "title": "Monitor Wydajności"
    },
    "menu": {
      "resetFilesystem": "Zresetuj System Plików",
      "runDiagnostics": "Uruchom Diagnostykę"
    },
    "messages": {
      "createValues": {
        "title": "Utwórz / Zresetuj Konto",
        "username": "Nazwa użytkownika",
        "password": "Hasło",
        "button": "Utwórz Konto",
        "success": "Konto {{username}} utworzone"
      },
      "registry": {
        "title": "Rejestr Kont",
        "empty": "Nie znaleziono kont",
        "useInSender": "Użyj w Nadawcy",
        "delete": "Usuń Konto",
        "deleteConfirm": "Usunąć konto {{username}}? Tego nie można cofnąć.",
        "deleteSuccess": "Konto {{username}} usunięte"
      },
      "sendMessage": {
        "title": "Wyślij Wiadomość Międzyużytkownikową",
        "from": "Nadawca (Od)",
        "to": "Odbiorca (Do)",
        "selectAccount": "Wybierz Konto...",
        "content": "Treść",
        "placeholder": "Wpisz wiadomość...",
        "button": "Wyślij Wiadomość",
        "success": "Wiadomość wysłana"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "System",
      "general": "Ogólne"
    },
    "sections": {
      "appearance": "Wygląd",
      "performance": "Wydajność",
      "displays": "Ekrany",
      "notifications": "Powiadomienia",
      "network": "Sieć",
      "security": "Bezpieczeństwo i Prywatność",
      "users": "Użytkownicy i Grupy",
      "storage": "Pamięć",
      "about": "O systemie"
    },
    "appearance": {
      "title": "Wygląd",
      "languageTitle": "Język",
      "languageDescription": "Wybierz język wyświetlania interfejsu systemu",
      "languagePlaceholder": "Wybierz język",
      "wallpaperTitle": "Tapeta Pulpitu",
      "wallpaperDescription": "Wybierz tło dla swojego środowiska pulpitu",
      "accentTitle": "Kolor Akcentu",
      "accentDescription": "Wybierz kolor akcentu, aby spersonalizować swoje doświadczenie",
      "presetColors": "Gotowe kolory",
      "customColor": "Kolor niestandardowy",
      "customColorHint": "Wpisz kod hex koloru (np. #3b82f6)",
      "preview": "Podgląd",
      "previewPrimary": "Podstawowy",
      "previewOutlined": "Obrysowany",
      "themeModeTitle": "Tryb Motywu",
      "themeModeDescription": "Wybierz, jak kolor akcentu wpływa na tło",
      "themeModeNeutralTitle": "Neutralny",
      "themeModeNeutralDesc": "Tylko naturalne szarości",
      "themeModeShadesTitle": "Odcienie",
      "themeModeShadesDesc": "Odcienie koloru akcentu",
      "themeModeContrastTitle": "Kontrast",
      "themeModeContrastDesc": "Kolory dopełniające",
      "themeTitle": "Motyw",
      "themeDark": "Ciemny",
      "themeLightSoon": "Jasny (Wkrótce)",
      "wallpaperActive": "Aktywna",
      "wallpaperUse": "Użyj"
    },
    "performance": {
      "blurTitle": "Rozmycie i Przezroczystość",
      "blurDescription": "Włącz efekt rozmycia szkła i przezroczystość okien",
      "reduceMotionTitle": "Ogranicz ruch",
      "reduceMotionDescription": "Wyłącz animacje dla szybszej reakcji i dostępności",
      "disableShadowsTitle": "Wyłącz cienie",
      "disableShadowsDescription": "Usuń cienie okien, aby poprawić wydajność renderowania",
      "disableGradientsTitle": "Wyłącz gradienty",
      "disableGradientsDescription": "Używaj jednolitych kolorów zamiast gradientów dla ikon",
      "gpuTitle": "Użyj akceleracji graficznej",
      "gpuDescription": "Użyj akceleracji sprzętowej, jeśli dostępna (wymagane ponowne uruchomienie)"
    },
    "network": {
      "wifiTitle": "Wi-Fi",
      "wifinotConnected": "Not Connected",
      "wifiDisabled": "Wi-Fi jest wyłączone",
      "wifiNetworks": "Dostępne sieci",
      "scanning": "Skanowanie...",
      "passwordPlaceholder": "Hasło",
      "disconnect": "Rozłącz",
      "configurationMode": "Tryb konfiguracji",
      "automatic": "Automatyczny (DHCP)",
      "manual": "Ręczny",
      "autoConfigTitle": "Konfiguracja automatyczna",
      "manualConfigTitle": "Konfiguracja ręczna",
      "ipAddress": "Adres IP",
      "subnetMask": "Maska podsieci",
      "gateway": "Brama",
      "dns": "Serwer DNS",
      "validateConfig": "Sprawdź konfigurację",
      "configSaved": "Konfiguracja sieci została pomyślnie zapisana",
      "dhcpAttributionProgress": "Pobieranie adresu IP przez DHCP"
    },
    "placeholders": {
      "notificationsTitle": "Powiadomienia",
      "notificationsDescription": "Preferencje centrum powiadomień wkrótce.",
      "securityTitle": "Bezpieczeństwo i Prywatność",
      "securityDescription": "Zapora, uprawnienia i ustawienia prywatności wkrótce.",
      "storageTitle": "Pamięć",
      "storageDescription": "Analiza zużycia dysku i zarządzanie wkrótce."
    },
    "users": {
      "currentUsersTitle": "Obecni Użytkownicy",
      "addUser": "Dodaj Użytkownika",
      "cancel": "Anuluj",
      "editAction": "Edytuj",
      "newUserDetails": "Szczegóły Nowego Użytkownika",
      "usernamePlaceholder": "Nazwa użytkownika (np. alicja)",
      "fullNamePlaceholder": "Pełne Imię i Nazwisko",
      "passwordOptionalPlaceholder": "Hasło (opcjonalnie)",
      "passwordHintOptionalPlaceholder": "Podpowiedź do hasła (opcjonalnie)",
      "createUser": "Utwórz Użytkownika",
      "userExists": "Użytkownik już istnieje",
      "currentBadge": "Obecny",
      "rootBadge": "Root",
      "adminBadge": "Admin",
      "confirmDeleteUser": "Czy na pewno chcesz usunąć {{username}}?",
      "editForm": {
        "fullNameLabel": "Pełne Imię i Nazwisko",
        "roleLabel": "Rola",
        "administrator": "Administrator",
        "newPasswordLabel": "Nowe hasło (pozostaw puste, aby zachować obecne)",
        "passwordHintLabel": "Podpowiedź do hasła",
        "saveChanges": "Zapisz Zmiany"
      }
    },
    "about": {
      "version": "Wersja",
      "framework": "Framework",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Środowisko",
      "browserMode": "Tryb Przeglądarki",
      "developerMode": "Tryb Deweloperski",
      "developerModeDescription": "Włącz zaawansowane narzędzia i funkcje debugowania",
      "exposeRootUser": "Pokaż Użytkownika Root",
      "exposeRootUserDescription": "Pokaż użytkownika root na ekranie logowania",
      "memoryUsage": "Zużycie Pamięci",
      "preferencesSoft": "Preferencje (Pamięć Miękka)",
      "filesystemHard": "System Plików (Pamięć Twarda)",
      "total": "Razem"
    },
    "danger": {
      "title": "Strefa Niebezpieczeństwa",
      "softResetTitle": "Miękki Reset",
      "softResetDescription": "Resetuje preferencje, ustawienia motywu, pozycje ikon pulpitu i stany aplikacji. Twoje pliki i foldery zostaną zachowane.",
      "resetPreferences": "Zresetuj Preferencje",
      "confirmReset": "Potwierdź Reset",
      "hardResetTitle": "Twardy Reset",
      "hardResetDescription": "Całkowicie usuwa wszystkie dane, w tym pliki, foldery i ustawienia. Tej czynności nie można cofnąć.",
      "hardResetWarning": "⚠️ Wszystkie niestandardowe pliki i foldery zostaną trwale usunięte",
      "factoryReset": "Reset Fabryczny",
      "deleteEverything": "Tak, Usuń Wszystko"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Witamy w Aurora",
        "description": "Wybierz swój język, aby rozpocząć"
      },
      "account": {
        "title": "Utwórz Swoje Konto",
        "description": "Skonfiguruj główne konto administratora"
      },
      "theme": {
        "title": "Spersonalizuj",
        "description": "Dostosuj do siebie"
      },
      "finishing": {
        "title": "Konfiguracja...",
        "description": "Stosowanie konfiguracji"
      }
    },
    "account": {
      "fullName": "Pełne Imię i Nazwisko",
      "fullNamePlaceholder": "Przykład: Jan Kowalski",
      "username": "Nazwa użytkownika",
      "password": "Hasło",
      "passwordHint": "Podpowiedź do hasła (Opcjonalnie)",
      "passwordHintPlaceholder": "Przykład: Imię pierwszego zwierzaka"
    },
    "theme": {
      "mode": "Tryb Motywu",
      "accentColor": "Kolor Akcentu",
      "darkMode": "Ciemny (Neutralny)",
      "lightMode": "Jasny",
      "comingSoon": "Wkrótce"
    },
    "finishing": {
      "title": "Wszystko gotowe!",
      "subtitle": "Aurora OS jest gotowy. Przekierowanie do ekranu logowania..."
    },
    "search": {
      "placeholder": "Szukaj języka...",
      "noResults": "Nie znaleziono języków"
    },
    "validation": {
      "requiredFields": "Wypełnij wszystkie wymagane pola",
      "passwordLength": "Hasło musi mieć co najmniej 6 znaków",
      "userExists": "Użytkownik już istnieje. Wybierz inną nazwę użytkownika.",
      "fullNameFormat": "Pełne imię i nazwisko powinno zawierać tylko litery, spacje i myślniki",
      "usernameFormat": "Nazwa użytkownika powinna zawierać tylko małe litery i cyfry",
      "hintLength": "Podpowiedź do hasła jest zbyt długa (maks. 50 znaków)",
      "hintSecurity": "Podpowiedź do hasła nie może zawierać samego hasła",
      "hintFormat": "Podpowiedź do hasła zawiera nieprawidłowe znaki",
      "creationFailed": "Nie udało się utworzyć konta. Spróbuj ponownie."
    },
    "buttons": {
      "next": "Dalej",
      "back": "Wstecz",
      "startUsing": "Zacznij używać Aurory"
    }
  },
  "battery": {
    "title": "Bateria",
    "charging": "Ładowanie",
    "fullyCharged": "W pełni naładowana",
    "remaining": "{{percentage}}% Pozostało",
    "powerSource": "Źródło zasilania:",
    "powerSources": {
      "adapter": "Zasilacz",
      "battery": "Bateria"
    },
    "condition": "Stan (Szac.)",
    "metrics": {
      "health": "Zdrowie",
      "cycles": "Cykle",
      "temp": "Temp",
      "voltage": "Napięcie"
    },
    "disclaimer": "Dane dotyczące zdrowia i stanu baterii są szacunkowe na podstawie dostępnych czujników systemowych. Rzeczywiste wartości mogą się różnić.",
    "showPercentage": "Pokaż procent w pasku menu"
  },
  "audio": {
    "title": "Dźwięk",
    "muteAll": "Wycisz wszystko",
    "unmute": "Wyłącz wyciszenie",
    "masterVolume": "Głośność główna",
    "mixer": "Mikser",
    "categories": {
      "music": "Muzyka",
      "system": "Alerty systemowe",
      "interface": "Interfejs",
      "feedback": "Informacje zwrotne",
      "ambiance": "Otoczenie"
    },
    "mixerLabels": {
      "masterOutput": "Wyjście główne",
      "musicAppLevel": "Poziom aplikacji muzycznej",
      "sfxInterface": "SFX i Interfejs",
      "backgroundLoop": "Pętla w tle"
    }
  }
};

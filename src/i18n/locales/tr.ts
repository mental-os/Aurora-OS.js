import type { TranslationDict } from '@/i18n/types';

export const tr: TranslationDict = {
  "time": {
    "yesterday": "Dün"
  },
  "common": {
    "name": "İsim",
    "color": "Renk",
    "cancel": "İptal",
    "save": "Kaydet"
  },
  "game": {
    "intro": {
      "initialize": "Sistem Başlatılıyor",
      "clickToStart": "BAŞLAMAK İÇİN TIKLAYIN",
      "skipHint": "Atlamak için ESC veya Space"
    },
    "mainMenu": {
      "continue": {
        "label": "Devam Et",
        "desc": {
          "canContinue": "Önceki döngüyü sürdür",
          "noData": "Döngü verisi bulunamadı"
        }
      },
      "newGame": {
        "label": "Yeni Döngü",
        "desc": "Yeniden başla (Veriler Silinir)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Küresel parametreleri yapılandır"
      },
      "exit": {
        "label": "Sistemi Kapat",
        "desc": "Oturumu sonlandır",
        "confirm": {
          "title": "Sistemi Kapat",
          "message": "Sistemi kapatmak istediğinizden emin misiniz? Kaydedilmemiş ilerleme kaybolabilir.",
          "cancel": "İptal",
          "confirm": "Kapat"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "BIOS Ayarları",
      "hardwareAcceleration": "Donanım Hızlandırma",
      "displayMode": "Görüntü Modu",
      "fullscreen": "Tam Ekran",
      "borderless": "Çerçevesiz",
      "windowed": "Pencere",
      "resolution": "Çözünürlük",
      "windowSettings": "Pencere Ayarları",
      "windowFrame": "Pencere Çerçevesi",
      "windowFrameHint": "Başlık çubuğu ve Kenarlıklar (Yeniden başlatma gerekir)",
      "configurationUtility": "Yapılandırma Aracı",
      "tabs": {
        "display": "Ekran",
        "audio": "Ses",
        "system": "Sistem"
      },
      "graphicsQuality": "Grafik Kalitesi",
      "presets": {
        "highFidelity": {
          "label": "Yüksek Kalite",
          "desc": "Bulanıklık, Gölgeler, Canlılık etkin. görsel++"
        },
        "performance": {
          "label": "Performans",
          "desc": "Maks FPS. Minimum efekt. hız++"
        }
      },
      "reduceMotion": "Hareketleri Azalt",
      "simpleColors": "Basit Renkler",
      "solidBackgrounds": "Düz Arkaplanlar",
      "noShadows": "Gölge Yok",
      "dangerZone": "Tehlike Bölgesi",
      "configFooter": "YAPILANDIRMA",
      "softReset": "Yazılımsal Sıfırlama",
      "softResetHint": "Uygulamayı yeniden yükle",
      "softResetConfirm": "Yazılımsal Sıfırlama: Bu işlem uygulamayı yeniden yükleyecek ancak verilerinizi koruyacaktır. Devam et?",
      "factoryReset": "Fabrika Ayarlarına Sıfırla",
      "factoryResetHint": "Tüm verileri sil",
      "factoryResetConfirm": "FABRİKA AYARLARINA SIFIRLA: Bu işlem TÜM verileri, kullanıcıları ve dosyaları tamamen silecektir. Bu işlem geri alınamaz. Emin misiniz?"
    },
    "footer": {
      "originalDistribution": "Orijinal Dağıtım",
      "temperedDistribution": "Değiştirilmiş Dağıtım"
    }
  },
  "appDescriptions": {
    "finder": "Dosya Yöneticisi",
    "browser": "İnternet Erişimi",
    "mail": "E-postaları Oku ve Yaz",
    "appStore": "Uygulamaları İndir ve Yönet",
    "terminal": "Komut Satırı Arayüzü",
    "systemSettings": "Sisteminizi Yapılandırın",
    "notepad": "Metin Dosyalarını Düzenle",
    "messages": "Arkadaşlarınızla Sohbet Edin",
    "calendar": "Programınızı Yönetin",
    "photos": "Fotoğrafları Görüntüle ve Yönet",
    "music": "En Sevdiğiniz Müzikleri Çalın",
    "devCenter": "Geliştirici Araçları"
  },
  "a11y": {
    "common": {
      "close": "Kapat",
      "open": "Aç",
      "notAvailable": "Yok"
    },
    "sidebar": {
      "toggleSidebar": "Kenar Çubuğunu Aç/Kapat"
    },
    "pagination": {
      "pagination": "Sayfalama",
      "goToPreviousPage": "Önceki sayfaya git",
      "goToNextPage": "Sonraki sayfaya git",
      "previous": "Önceki",
      "next": "Sonraki",
      "morePages": "Daha fazla sayfa"
    },
    "breadcrumb": {
      "breadcrumb": "İçerik Haritası",
      "more": "Daha Fazla"
    },
    "carousel": {
      "previousSlide": "Önceki slayt",
      "nextSlide": "Sonraki slayt"
    }
  },
  "commandPalette": {
    "title": "Komut Paleti",
    "description": "Çalıştırılacak bir komut ara..."
  },
  "login": {
    "softReset": "Yazılımsal Sıfırlama",
    "hardReset": "Donanımsal Sıfırlama",
    "hardResetConfirm": "Donanımsal Sıfırlama: Bu işlem tüm verileri silecek. Devam et?",
    "selectUser": "Kullanıcı Seç",
    "enterPasswordToUnlock": "Kilidi açmak için şifreyi girin",
    "restoringPreviousSession": "Önceki oturum geri yükleniyor",
    "passwordPlaceholder": "Şifre",
    "incorrectPassword": "Yanlış Şifre",
    "hint": "İpucu",
    "enterSystem": "Sisteme Gir",
    "switchAccount": "Hesap Değiştir",
    "back": "Geri",
    "suspendToSwitch": "Geçiş yapmak için oturum askıya alınsın mı?",
    "cancel": "İptal",
    "switchUser": "Kullanıcı Değiştir",
    "logOut": "Oturumu Kapat",
    "logOutConfirm": "{{username}} oturumu kapatılsın mı? Bu işlem tüm açık pencereleri kapatacak ve kaydedilmemiş değişiklikleri silecektir.",
    "active": "Aktif",
    "resume": "Devam Et",
    "sessionActive": "Oturum Aktif"
  },
  "app": {
    "loadingKernel": "ÇEKİRDEK YÜKLENİYOR..."
  },
  "menubar": {
    "menus": {
      "file": "Dosya",
      "shell": "Kabuk",
      "edit": "Düzenle",
      "format": "Biçim",
      "song": "Şarkı",
      "view": "Görünüm",
      "go": "Git",
      "controls": "Kontroller",
      "window": "Pencere",
      "help": "Yardım",
      "store": "Mağaza",
      "history": "Geçmiş",
      "bookmarks": "Yer İmleri",
      "mailbox": "Posta Kutusu",
      "message": "Mesaj",
      "conversations": "Konuşmalar"
    },
    "items": {
      "newWindow": "Yeni Pencere",
      "newFolder": "Yeni Klasör",
      "open": "Aç",
      "changeWallpaper": "Duvar Kağıdını Değiştir",
      "closeWindow": "Pencereyi Kapat",
      "undo": "Geri Al",
      "redo": "Yinele",
      "cut": "Kes",
      "copy": "Kopyala",
      "paste": "Yapıştır",
      "selectAll": "Hepsini Seç",
      "reload": "Yeniden Yükle",
      "toggleFullscreen": "Tam Ekranı Aç/Kapat",
      "minimize": "Küçült",
      "bringAllToFront": "Hepsini Öne Getir",
      "back": "Geri",
      "forward": "İleri",
      "enclosingFolder": "Üst Klasör",
      "getInfo": "Bilgi Al",
      "moveToTrash": "Çöp Kutusuna Taşı"
    },
    "help": {
      "appHelp": "{{appName}} Yardım"
    },
    "default": {
      "featureNotImplemented": "Özellik uygulanmadı"
    },
    "system": {
      "aboutThisComputer": "Bu Bilgisayar Hakkında...",
      "systemSettings": "Sistem Ayarları...",
      "appStore": "App Store...",
      "lockScreen": "Ekranı Kilitle",
      "switchUser": "Kullanıcı Değiştir",
      "user": "Kullanıcı",
      "logOutAs": "Oturumu Kapat: {{username}}",
      "viewSystemInfo": "Sistem Bilgilerini Görüntüle",
      "viewSystemSettings": "Sistem Ayarlarını Görüntüle",
      "returnToLoginWhile": "Oturum açma ekranına dön,",
      "returnToUserSelectionWhile": "Kullanıcı seçim ekranına dön,",
      "keepingSession": "oturumu koruyarak",
      "clearingSession": "oturumu temizleyerek",
      "panic": "PANİK",
      "hardReset": "Donanımsal Sıfırlama",
      "warning": "Uyarı",
      "panicWarningBody": "Bu işlem {{productName}} ürününü fabrika ayarlarına sıfırlayacaktır. Bir şeyler ters giderse panik butonu olarak kullanışlıdır.",
      "serverTime": "Sunucu Saati (UTC)",
      "localTime": "Yerel Saat"
    },
    "app": {
      "aboutApp": "{{appName}} Hakkında",
      "settings": "Ayarlar...",
      "quitApp": "{{appName}} uygulamasından çık"
    }
  },
  "notifications": {
    "title": "Bildirimler",
    "titles": {
      "permissionDenied": "İzin Reddedildi"
    },
    "clearAll": "Hepsini Temizle",
    "new": "Yeni",
    "subtitles": {
      "appMissing": "Uygulama Eksik",
      "permissionDenied": "İzin Reddedildi",
      "saved": "Kaydedildi",
      "deleted": "Silindi",
      "moved": "Taşındı",
      "trash": "Çöp Kutusu",
      "failed": "Başarısız",
      "ui": "Arayüz",
      "validation": "Doğrulama",
      "success": "Başarılı",
      "error": "Hata",
      "info": "Bilgi",
      "warning": "Uyarı",
      "fileError": "Dosya Hatası"
    },
    "empty": "Bildirim Yok",
    "clearApp": "Bu uygulamadan gelenlerin hepsini temizle",
    "messageFrom": "Message from {{sender}}"
  },
  "memory": {
    "title": "Bellek",
    "used": "Kullanılan",
    "pressure": "Baskı",
    "appMemory": "Uygulama Belleği",
    "wiredMemory": "Kablolu Bellek",
    "processName": "İşlem Adı",
    "memory": "Bellek",
    "swapUsed": "Kullanılan Takas",
    "systemWired": "Aurora Sistemi",
    "activeSession": "Kablolu Bellek (Aktif Oturum)",
    "userSession": "Oturum: {{user}}",
    "backgroundSession": "Uyuyan Bellek (Arka Plan)",
    "backgroundProcesses": "{{count}} Arka Plan İşlemi",
    "instances": "{{count}} Örnek",
    "type": {
      "mainWindow": "Ana Pencere",
      "extraWindow": "Ekstra Pencere",
      "extraTabs": "{{count}} Ekstra Sekme"
    },
    "error": {
      "title": "Yetersiz Bellek",
      "description": "{{appName}} açılamıyor. Yeterli RAM yok."
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Güncellemeleri Kontrol Et...",
      "viewMyAccount": "Hesabımı Görüntüle"
    },
    "categories": {
      "all": "Tümü",
      "productivity": "Üretkenlik",
      "media": "Medya",
      "utilities": "Araçlar",
      "development": "Geliştirme",
      "system": "Sistem"
    },
    "searchPlaceholder": "Uygulama ara...",
    "empty": {
      "title": "Uygulama Bulunamadı",
      "description": "Aradığınızı bulmak için aramanızı veya kategori filtrenizi değiştirmeyi deneyin."
    },
    "size": "Boyut",
    "sizeUnknown": "Bilinmiyor",
    "install": "Al",
    "uninstall": "Kaldır",
    "open": "Aç",
    "cancel": "İptal",
    "confirm": "Onayla",
    "restore": "Geri Yükle",
    "checkFailed": "Kontrol Başarısız",
    "checkFailedTitle": "Kurulum Kontrol Hatası",
    "restoreSuccess": "{{app}} başarıyla geri yüklendi",
    "restoreError": "{{app}} geri yüklenemedi",
    "restorePermissionDenied": "Uygulamaları geri yüklemek için yönetici izinleri gereklidir",
    "installingWarning": "Uygulama yüklenirken lütfen bekleyin."
  },
  "browser": {
    "menu": {
      "newTab": "Yeni Sekme",
      "closeTab": "Sekmeyi Kapat"
    },
    "welcome": {
      "title": "Browser",
      "description": "Search for information or enter a URL to start browsing.",
      "searchPlaceholder": "Web sitelerini ara veya adres gir...",
      "favorites": "Sık Kullanılanlar",
      "recentActivity": "Son Etkinlik"
    },
    "searchPlaceholder": "Ara veya adres gir...",
    "error": {
      "pageNotFound": "Sayfa Bulunamadı",
      "pageNotFoundDesc": "{{url}} web sitesi bulunamadı.",
      "goHome": "Eve Dön",
      "offlineTitle": "No Internet Connection",
      "offlineDesc": "You are not connected to the internet. Please connect to a network to browse the web."
    }
  },
  "music": {
    "sidebar": {
      "library": "Kütüphane",
      "songs": "Şarkılar",
      "favorites": "Sık Kullanılanlar",
      "recentlyPlayed": "Son Çalınanlar"
    },
    "titles": {
      "songs": "Şarkılar",
      "recentlyPlayed": "Son Çalınanlar"
    },
    "actions": {
      "playAll": "Hepsini Çal"
    },
    "empty": {
      "recent": {
        "title": "Son çalınan şarkı yok",
        "description": "Son çaldığınız şarkılar burada görünecek."
      },
      "library": {
        "title": "Şarkı Bulunamadı",
        "description": "Müzik klasörünüzde herhangi bir müzik dosyası bulunamadı.",
        "openFolder": "{{folder}} klasörünü aç"
      }
    },
    "folders": {
      "music": "Müzik",
      "home": "Ev"
    },
    "player": {
      "notPlaying": "Çalmıyor",
      "selectSong": "Şarkı Seç"
    },
    "metadata": {
      "unknownArtist": "Bilinmeyen Sanatçı",
      "unknownAlbum": "Bilinmeyen Albüm",
      "unknownTitle": "Bilinmeyen Başlık"
    },
    "menu": {
      "newPlaylist": "Yeni Çalma Listesi",
      "import": "İçe Aktar...",
      "closeWindow": "Pencereyi Kapat",
      "showInFinder": "Finder'da Göster",
      "addToPlaylist": "Çalma Listesine Ekle",
      "play": "Çal",
      "previousSong": "Önceki Şarkı",
      "nextSong": "Sonraki Şarkı",
      "volumeUp": "Sesi Aç",
      "volumeDown": "Sesi Kıs"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Yeni Sekme",
      "clearScrollback": "Geçmişi Temizle",
      "killProcess": "İşlemi Sonlandır"
    },
    "help": {
      "availableCommands": "Mevcut komutlar:",
      "usage": "Kullanım",
      "appLaunchHelp": "Yüklü uygulamaları başlat (örn. Finder)"
    },
    "commands": {
      "help": {
        "description": "Bu yardım mesajını göster"
      },
      "ls": {
        "description": "Dizin içeriğini listele",
        "usage": "ls [yol]"
      },
      "cd": {
        "description": "Dizini değiştir",
        "usage": "cd <yol>"
      },
      "pwd": {
        "description": "Çalışma dizinini yazdır"
      },
      "logout": {
        "description": "Mevcut oturumdan çıkış yap"
      },
      "who": {
        "description": "Kimlerin giriş yaptığını göster"
      },
      "clear": {
        "description": "Terminal ekranını temizle"
      },
      "cat": {
        "description": "Dosya içeriğini görüntüle",
        "usage": "cat <dosya>"
      },
      "mkdir": {
        "description": "Dizin oluştur",
        "usage": "mkdir <isim>"
      },
      "touch": {
        "description": "Dosya oluştur veya zaman damgasını güncelle",
        "usage": "touch <isim>"
      },
      "rm": {
        "description": "Dosya veya dizini kaldır",
        "usage": "rm <isim>"
      },
      "cp": {
        "description": "Dosyaları kopyala",
        "usage": "cp <kaynak> <hedef>"
      },
      "mv": {
        "description": "Dosyaları taşı (yeniden adlandır)",
        "usage": "mv <kaynak> <hedef>"
      },
      "chmod": {
        "description": "Dosya modunu (izinleri) değiştir",
        "usage": "chmod <mod> <dosya>"
      },
      "chown": {
        "description": "Dosya sahibini ve grubunu değiştir",
        "usage": "chown <sahip>[:<grup>] <dosya>"
      },
      "grep": {
        "description": "Bir desenle eşleşen satırları yazdır",
        "usage": "grep <desen> <dosya>"
      },
      "find": {
        "description": "Dizin hiyerarşisinde dosya ara",
        "usage": "find [yol] [-name desen]"
      },
      "echo": {
        "description": "Bir metin satırı görüntüle",
        "usage": "echo [metin]"
      },
      "date": {
        "description": "Sistem tarihini ve saatini yazdır"
      },
      "uptime": {
        "description": "Sistem çalışma süresini göster"
      },
      "whoami": {
        "description": "Mevcut kullanıcıyı yazdır"
      },
      "hostname": {
        "description": "Sistem ana bilgisayar adını yazdır"
      },
      "reset": {
        "description": "Dosya sistemini fabrika ayarlarına sıfırla"
      },
      "exit": {
        "description": "Mevcut kabuk oturumundan çık"
      },
      "su": {
        "description": "Kullanıcı kimliğini değiştir veya süper kullanıcı ol",
        "usage": "su [kullanıcı] [şifre]"
      },
      "sudo": {
        "description": "Başka bir kullanıcı olarak komut çalıştır",
        "usage": "sudo [seçenekler] [komut]"
      },
      "history": {
        "description": "Terminal komut geçmişini göster",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} Çok Yakında",
    "descriptions": {
      "mail": "E-postaları, kişileri ve takvim etkinliklerini yönetin.",
      "calendar": "Toplantılar, etkinlikler ve hatırlatıcılar planlayın.",
      "default": "Bu uygulama şu anda geliştirilmektedir."
    }
  },
  "filePicker": {
    "openFile": "Dosya Aç",
    "openFileDescription": "Dosya sisteminden açılacak bir dosya seçin",
    "saveFile": "Dosyayı Kaydet",
    "saveFileDescription": "Dosyayı kaydetmek için bir konum ve ad seçin",
    "emptyFolder": "Bu klasör boş",
    "nameLabel": "İsim:",
    "untitledPlaceholder": "Adsız",
    "toasts": {
      "permissionDenied": "İzin reddedildi: {{name}}"
    },
    "cancel": "İptal",
    "open": "Aç",
    "save": "Kaydet"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Müzik uygulaması yüklü değil. App Store'dan yükleyin.",
      "notepadNotInstalled": "Not Defteri yüklü değil. App Store'dan yükleyin.",
      "photosNotInstalled": "Fotoğraflar uygulaması yüklü değil. App Store'dan yükleyin."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} öğe",
      "bytes": "{{count}} bayt",
      "type": "Tür",
      "owner": "Sahip",
      "permissions": "İzinler",
      "modified": "Değiştirilme",
      "size": "Boyut"
    },
    "sidebar": {
      "favorites": "Sık Kullanılanlar",
      "system": "Sistem",
      "locations": "Konumlar"
    },
    "places": {
      "home": "Ev",
      "desktop": "Masaüstü",
      "documents": "Belgeler",
      "downloads": "İndirilenler",
      "pictures": "Resimler",
      "music": "Müzik",
      "trash": "Çöp Kutusu"
    },
    "actions": {
      "moveToTrash": "Çöp Kutusuna Taşı",
      "search": "Ara"
    },
    "toasts": {
      "permissionDenied": "İzin reddedildi: {{name}}",
      "musicNotInstalled": "Müzik uygulaması yüklü değil. App Store'dan yükleyin.",
      "notepadNotInstalled": "Not Defteri yüklü değil. App Store'dan yükleyin.",
      "photosNotInstalled": "Fotoğraflar uygulaması yüklü değil. App Store'dan yükleyin.",
      "movedItem": "1 öğe taşındı",
      "movedItems": "{{count}} öğe taşındı",
      "movedItemTo": "1 öğe {{target}} hedefine taşındı",
      "movedItemsTo": "{{count}} öğe {{target}} hedefine taşındı",
      "movedItemToTrash": "1 öğe Çöp Kutusuna taşındı",
      "movedItemsToTrash": "{{count}} öğe Çöp Kutusuna taşındı",
      "moveFailedInvalidData": "Taşıma Başarısız: Geçersiz Veri",
      "failedToProcessDrop": "Bırakma işlemi başarısız oldu",
      "couldNotGetInfo": "Bilgi alınamadı",
      "fileTypeNotSupported": "'{{type}}' dosya türü desteklenmiyor"
    },
    "search": {
      "noResultsTitle": "Sonuç Bulunamadı",
      "noResultsDesc": "\"{{query}}\" için sonuç bulunamadı",
      "resultsTitle": "Arama Sonuçları ({{count}})"
    },
    "emptyFolder": "Bu klasör boş"
  },
  "messages": {
    "title": "Mesajlar",
    "sidebar": {
      "conversationsTitle": "Konuşmalar",
      "allMessages": "Tüm Mesajlar",
      "unread": "Okunmamış",
      "starred": "Yıldızlı"
    },
    "search": {
      "placeholder": "Konuşmaları Ara..."
    },
    "menu": {
      "newMessage": "Yeni Mesaj"
    },
    "auth": {
      "welcomeBack": "Tekrar Hoş Geldiniz",
      "createAccount": "Hesap Oluştur",
      "recoverAccount": "Hesabı Kurtar",
      "signInToContinue": "Devam etmek için giriş yapın",
      "joinSecureNetwork": "Güvenli Ağa Katılın",
      "enterRecoveryKey": "Erişim için kurtarma anahtarını girin",
      "invalidCredentials": "Geçersiz kullanıcı adı veya şifre",
      "credentialsRetrieved": "Kimlik bilgileri alındı",
      "password": "Şifre",
      "returnToLogin": "Girişe Dön",
      "recoveryKey": "Kurtarma Anahtarı",
      "username": "Kullanıcı Adı",
      "processing": "İşleniyor...",
      "signIn": "Giriş Yap",
      "create": "Hesap Oluştur",
      "recover": "Şifreyi Kurtar",
      "noAccount": "Hesabınız yok mu? Oluşturun",
      "haveAccount": "Zaten hesabınız var mı? Giriş yapın",
      "forgotPassword": "Şifrenizi mi unuttunuz?",
      "backToLogin": "Girişe geri dön",
      "accountCreated": "Hesap oluşturuldu!",
      "saveRecoveryKey": "Lütfen kurtarma anahtarınızı kaydedin. Şifrenizi unutursanız buna ihtiyacınız olacak.",
      "oneTimeShow": "Bu sadece bir kez gösterilecek.",
      "savedContinue": "Kaydettim - Devam Et",
      "copied": "Kopyalandı",
      "recoveryKeyCopied": "Kurtarma anahtarı panoya kopyalandı",
      "failedCopy": "Anahtar kopyalanamadı",
      "error": "Hata"
    },
    "ui": {
      "noConversations": "Konuşma Yok",
      "noResults": "Sonuç Bulunamadı",
      "noChatSelected": "Sohbet Seçilmedi",
      "chooseConversation": "Bir konuşma seçin veya yeni bir tane başlatın.",
      "startNewMessage": "Yeni mesaj başlat",
      "online": "Çevrimiçi",
      "typeMessage": "{{partner}} kişisine mesaj...",
      "unstar": "Yıldızı Kaldır",
      "star": "Yıldızla",
      "cantMessageSelf": "Kendinize mesaj gönderemezsiniz (henüz)",
      "userNotFound": "Kullanıcı Bulunamadı",
      "messageFailed": "Mesaj Gönderilemedi"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Kütüphane",
      "albumsTitle": "Albümler"
    },
    "library": {
      "allPhotos": "Tüm Fotoğraflar",
      "favorites": "Sık Kullanılanlar",
      "recent": "En Son",
      "userLibrary": "{{user}}'s Library"
    },
    "menu": {
      "slideshow": "Slayt Gösterisi",
      "rotateClockwise": "Saat Yönünde Döndür",
      "rotateCounterClockwise": "Saat Yönünün Tersine Döndür"
    },
    "empty": {
      "recent": {
        "title": "Son görüntülenen fotoğraf yok",
        "description": "Son açtığınız fotoğraflar burada görünecek."
      },
      "favorites": {
        "title": "Sık kullanılan fotoğraf yok",
        "description": "Fotoğrafları favorilere eklediğinizde burada görünecekler."
      },
      "library": {
        "title": "Fotoğraf Bulunamadı",
        "description": "Resimler klasörünüzde herhangi bir fotoğraf dosyası bulunamadı.",
        "openFolder": "{{folder}} klasörünü aç"
      },
      "noFolder": {
        "title": "{{user}} Kütüphanesi Bulunamadı",
        "description": "{{path}} yolu bu kullanıcı için bulunamadı."
      },
      "openHome": "Ana dizini aç"
    },
    "folders": {
      "pictures": "Resimler",
      "recent": "Recent",
      "misc": "Misc"
    }
  },
  "mail": {
    "login": {
      "title": "Posta",
      "subtitle": "Hesabınıza giriş yapın",
      "emailPlaceholder": "E-posta",
      "passwordPlaceholder": "Şifre",
      "signingIn": "Giriş yapılıyor...",
      "signIn": "Giriş Yap",
      "signOut": "Çıkış Yap",
      "createAccountInfo": "Posta sağlayıcısı aracılığıyla hesap oluşturun"
    },
    "menu": {
      "newMailbox": "Yeni Posta Kutusu",
      "onlineStatus": "Çevrimiçi Durum",
      "newMessage": "Yeni Mesaj",
      "reply": "Yanıtla",
      "replyAll": "Tümünü Yanıtla",
      "forward": "İlet"
    },
    "sidebar": {
      "mailboxes": "Posta Kutuları",
      "inbox": "Gelen Kutusu",
      "starred": "Yıldızlı",
      "archived": "Arşivlenmiş",
      "trash": "Çöp Kutusu"
    },
    "search": {
      "placeholder": "E-postaları ara..."
    },
    "empty": {
      "noEmails": "E-posta Yok",
      "noEmailsFound": "E-posta Bulunamadı",
      "selectEmail": "Okumak için bir e-posta seçin"
    },
    "actions": {
      "reply": "Yanıtla",
      "forward": "İlet",
      "archive": "Arşivle",
      "unarchive": "Arşivden Çıkar",
      "delete": "Sil",
      "restore": "Geri Yükle",
      "deleteForever": "Kalıcı Olarak Sil"
    },
    "time": {
      "minutesAgo": "{{minutes}}d önce",
      "hoursAgo": "{{hours}}s önce",
      "today": "Bugün",
      "yesterday": "Dün",
      "daysAgo": "{{days}} gün önce"
    },
    "attachments": {
      "count": "{{count}} ek",
      "count_plural": "{{count}} ek",
      "download": "İndir",
      "downloaded": "İndirildi",
      "downloadedTo": "{{name}} dosyası {{folder}} klasörüne indirildi",
      "downloadFailed": "İndirme Başarısız",
      "downloadFailedMessage": "{{name}} indirilemedi"
    }
  },
  "notepad": {
    "untitled": "Adsız",
    "untitledTab": "Adsız {{index}}",
    "empty": {
      "title": "Not Defteri",
      "description": "Başlamak için yeni bir dosya oluşturun veya mevcut bir dosyayı açın.",
      "newFile": "Yeni Dosya",
      "openFile": "Dosya Aç"
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
      "txt": "Düz Metin"
    },
    "actions": {
      "openFile": "Dosya Aç",
      "saveFile": "Dosyayı Kaydet",
      "bold": "Kalın",
      "italic": "İtalik",
      "list": "Liste",
      "heading": "Başlık"
    },
    "preview": {
      "edit": "Düzenle",
      "preview": "Önizleme",
      "htmlPreviewTitle": "HTML Önizleme"
    },
    "status": {
      "chars": "{{count}} kar.",
      "lines": "Satır {{count}}"
    },
    "contextSwitcher": {
      "title": "Bağlamı değiştirmek için tıklayın",
      "searchPlaceholder": "Dil ara...",
      "noLanguageFound": "Dil bulunamadı."
    },
    "toasts": {
      "switchedTo": "{{language}} diline geçildi",
      "failedToReadFile": "Dosya okunamadı",
      "fileSaved": "Dosya kaydedildi",
      "failedToSaveFilePermissions": "Dosya kaydedilemedi (İzinleri Kontrol Edin)",
      "saved": "Kaydedildi",
      "failedToSave": "Kaydetme Başarısız"
    },
    "dialog": {
      "unsaved": {
        "title": "Değişiklikleri kaydetmek istiyor musunuz?",
        "description": "Kaydetmezseniz değişiklikleriniz kaybolacak.",
        "dontSave": "Kaydetme",
        "cancel": "İptal",
        "save": "Kaydet"
      }
    },
    "menu": {
      "new": "Yeni",
      "open": "Aç...",
      "save": "Kaydet",
      "closeTab": "Sekmeyi Kapat",
      "bold": "Kalın",
      "italic": "İtalik",
      "list": "Liste",
      "heading1": "Başlık 1",
      "heading2": "Başlık 2",
      "togglePreview": "Önizlemeyi Aç/Kapat",
      "zoomIn": "Yakınlaştır",
      "zoomOut": "Uzaklaştır"
    }
  },
  "calendar": {
    "menu": {
      "day": "Gün",
      "week": "Hafta",
      "month": "Ay",
      "year": "Yıl"
    },
    "toolbar": {
      "today": "Bugün",
      "month": "Ay",
      "day": "Gün"
    },
    "sidebar": {
      "myCalendars": "Takvimlerim",
      "filterColors": "Renkleri Filtrele"
    },
    "actions": {
      "createEvent": "Etkinlik Oluştur",
      "createCategory": "Kategori Oluştur",
      "clear": "Temizle",
      "delete": "Sil",
      "cancel": "İptal",
      "saveEvent": "Etkinliği Kaydet"
    },
    "loadingEvents": "Etkinlikler yükleniyor...",
    "toasts": {
      "cannotDeleteSystemCategory": "Sistem kategorileri silinemez",
      "eventDeleted": "Etkinlik silindi",
      "eventSaved": "Etkinlik kaydedildi",
      "requiredFields": "Lütfen gerekli alanları doldurun"
    },
    "modal": {
      "newEvent": "Yeni Etkinlik",
      "editEvent": "Etkinliği Düzenle",
      "newEventDescription": "Takvime yeni bir etkinlik planlayın.",
      "editEventDescription": "Etkinlik ayrıntılarını görüntüleyin veya düzenleyin.",
      "fields": {
        "title": "Başlık",
        "date": "Tarih",
        "time": "Saat",
        "duration": "Süre",
        "type": "Tür",
        "location": "Konum",
        "color": "Renk",
        "notes": "Notlar"
      },
      "placeholders": {
        "eventTitle": "Etkinlik başlığı",
        "pickDate": "Tarih seçin",
        "searchTime": "Saat ara...",
        "noTimeFound": "Saat bulunamadı.",
        "selectDuration": "Süre seçin",
        "searchDuration": "Süre ara...",
        "noDurationFound": "Süre bulunamadı.",
        "selectType": "Tür seçin",
        "searchType": "Tür ara...",
        "noTypeFound": "Tür bulunamadı.",
        "addLocation": "Konum ekle",
        "addNotes": "Not ekle..."
      },
      "durationMinutes": "{{minutes}} dk",
      "minutesOption": "{{minutes}} dakika"
    },
    "categories": {
      "all": "Tümü",
      "work": "İş",
      "personal": "Kişisel",
      "social": "Sosyal",
      "events": "Etkinlikler",
      "family": "Aile"
    },
    "types": {
      "work": "İş",
      "personal": "Kişisel",
      "social": "Sosyal",
      "events": "Etkinlikler",
      "family": "Aile",
      "other": "Diğer"
    },
    "colors": {
      "blue": "Mavi",
      "green": "Yeşil",
      "red": "Kırmızı",
      "yellow": "Sarı",
      "purple": "Mor",
      "pink": "Pembe",
      "orange": "Turuncu",
      "gray": "Gri"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Döngü Başlatıldı",
        "location": "Turms",
        "notes": "Dosya sistemi başlatma."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "Genel",
      "dashboard": "Gösterge Paneli",
      "interfaceTitle": "Arayüz",
      "uiAndSounds": "UI ve Sesler",
      "systemTitle": "Sistem",
      "storage": "Depolama",
      "fileSystem": "Dosya Sistemi",
      "appsTitle": "Uygulamalar",
      "performance": "Performans"
    },
    "dashboard": {
      "title": "Gösterge Paneli",
      "description": "Sistem genel bakışı çok yakında."
    },
    "ui": {
      "title": "Kullanıcı Arayüzü ve Geri Bildirim",
      "notificationsTitle": "Bildirimler",
      "successToast": "Başarı Bildirimi",
      "warningToast": "Uyarı Bildirimi",
      "errorToast": "Hata Bildirimi",
      "soundFeedback": "Sesli Geri Bildirim",
      "buttons": {
        "success": "Başarı",
        "warning": "Uyarı",
        "error": "Hata",
        "app": "Uygulama Bildirimi",
        "open": "Aç",
        "close": "Kapat",
        "click": "Tıkla",
        "hover": "Üzerine Gel"
      }
    },
    "storage": {
      "title": "Depolama Denetçisi",
      "import": "İçe Aktar",
      "export": "Dışa Aktar",
      "clear": "Temizle",
      "toastTitle": "Depolama",
      "exportSuccess": "Tercihler başarıyla dışa aktarıldı",
      "exportFail": "Tercihler dışa aktarılamadı",
      "importSuccess": "Tercihler başarıyla içe aktarıldı",
      "importFail": "İçe aktarma dosyası ayrıştırılamadı",
      "clearConfirm": "TÜM yerel depolama alanını temizlemek istediğinizden emin misiniz? Bu işlem kullanım tercihlerini, tema ayarlarını ve pencere konumlarını sıfırlayacaktır.",
      "clearSuccess": "Tüm anahtarlar temizlendi",
      "softMemory": "Yumuşak Bellek (Tercihler)",
      "hardMemory": "Sert Bellek (Dosya Sistemi)",
      "keysCount": "{{count}} anahtar",
      "localStorageKeys": "Yerel Depolama Anahtarları"
    },
    "filesystem": {
      "title": "Dosya Sistemi Hata Ayıklayıcı"
    },
    "performance": {
      "title": "Performans Monitörü"
    },
    "menu": {
      "resetFilesystem": "Dosya Sistemini Sıfırla",
      "runDiagnostics": "Tanılamayı Çalıştır"
    },
    "messages": {
      "createValues": {
        "title": "Hesap Oluştur / Sıfırla",
        "username": "Kullanıcı Adı",
        "password": "Şifre",
        "button": "Hesap Oluştur",
        "success": "Hesap {{username}} oluşturuldu"
      },
      "registry": {
        "title": "Hesap Kaydı",
        "empty": "Hesap bulunamadı",
        "useInSender": "Göndericide Kullan",
        "delete": "Hesabı Sil",
        "deleteConfirm": "{{username}} hesabı silinsin mi? Bu işlem geri alınamaz.",
        "deleteSuccess": "{{username}} hesabı silindi"
      },
      "sendMessage": {
        "title": "Kullanıcılar Arası Mesaj Gönder",
        "from": "Gönderen (Kimden)",
        "to": "Alıcı (Kime)",
        "selectAccount": "Hesap Seçin...",
        "content": "İçerik",
        "placeholder": "Mesajınızı yazın...",
        "button": "Mesaj Gönder",
        "success": "Mesaj gönderildi"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Sistem",
      "general": "Genel"
    },
    "sections": {
      "appearance": "Görünüm",
      "performance": "Performans",
      "displays": "Ekranlar",
      "notifications": "Bildirimler",
      "network": "Ağ",
      "security": "Güvenlik ve Gizlilik",
      "users": "Kullanıcılar ve Gruplar",
      "storage": "Depolama",
      "about": "Hakkında"
    },
    "appearance": {
      "title": "Görünüm",
      "languageTitle": "Dil",
      "languageDescription": "Sistem arayüzü görüntüleme dilini seçin",
      "languagePlaceholder": "Dil Seçin",
      "wallpaperTitle": "Masaüstü Duvar Kağıdı",
      "wallpaperDescription": "Masaüstü ortamınız için bir arka plan seçin",
      "accentTitle": "Vurgu Rengi",
      "accentDescription": "Deneyiminizi kişiselleştirmek için bir vurgu rengi seçin",
      "presetColors": "Ön Ayarlı Renkler",
      "customColor": "Özel Renk",
      "customColorHint": "Onaltılık renk kodu girin (örn. #3b82f6)",
      "preview": "Önizleme",
      "previewPrimary": "Birincil",
      "previewOutlined": "Ana hat",
      "themeModeTitle": "Tema Modu",
      "themeModeDescription": "Vurgu renginin arka plan tonunu nasıl etkileyeceğini seçin",
      "themeModeNeutralTitle": "Nötr",
      "themeModeNeutralDesc": "Sadece doğal griler",
      "themeModeShadesTitle": "Gölgeler",
      "themeModeShadesDesc": "Vurgu rengi gölgeleri",
      "themeModeContrastTitle": "Kontrast",
      "themeModeContrastDesc": "Tamamlayıcı renkler",
      "themeTitle": "Tema",
      "themeDark": "Karanlık",
      "themeLightSoon": "Aydınlık (Çok Yakında)",
      "wallpaperActive": "Aktif",
      "wallpaperUse": "Kullan"
    },
    "performance": {
      "blurTitle": "Bulanıklık ve Saydamlık",
      "blurDescription": "Cam bulanıklık efektini ve pencere saydamlığını etkinleştir",
      "reduceMotionTitle": "Hareketi Azalt",
      "reduceMotionDescription": "Duyarlılık ve erişilebilirlik için animasyonları devre dışı bırak",
      "disableShadowsTitle": "Gölgeleri Devre Dışı Bırak",
      "disableShadowsDescription": "Oluşturma performansını artırmak için pencere gölgelerini kaldır",
      "disableGradientsTitle": "Gradyanları Devre Dışı Bırak",
      "disableGradientsDescription": "Simgeler için gradyanlar yerine düz renkler kullan",
      "gpuTitle": "Grafik hızlandırmayı kullan",
      "gpuDescription": "Mümkün olduğunda donanım hızlandırmayı kullan (yeniden başlatma gerekir)"
    },
    "network": {
      "wifiTitle": "Wi-Fi",
      "wifinotConnected": "Not Connected",
      "wifiDisabled": "Wi-Fi kapalı",
      "wifiNetworks": "Kullanılabilir Ağlar",
      "scanning": "Taranıyor...",
      "passwordPlaceholder": "Şifre",
      "disconnect": "Bağlantıyı Kes",
      "configurationMode": "Yapılandırma modu",
      "automatic": "Otomatik (DHCP)",
      "manual": "Manuel",
      "autoConfigTitle": "Otomatik yapılandırma",
      "manualConfigTitle": "Manuel yapılandırma",
      "ipAddress": "IP Adresi",
      "subnetMask": "Alt Ağ Maskesi",
      "gateway": "Ağ Geçidi",
      "dns": "DNS Sunucusu",
      "validateConfig": "Yapılandırmayı Doğrula",
      "configSaved": "Ağ yapılandırması başarıyla kaydedildi",
      "dhcpAttributionProgress": "DHCP üzerinden IP adresi alınıyor"
    },
    "placeholders": {
      "notificationsTitle": "Bildirimler",
      "notificationsDescription": "Bildirim merkezi tercihleri çok yakında.",
      "securityTitle": "Güvenlik ve Gizlilik",
      "securityDescription": "Güvenlik duvarı, izinler ve gizlilik ayarları çok yakında.",
      "storageTitle": "Depolama",
      "storageDescription": "Disk kullanım analizi ve yönetimi çok yakında."
    },
    "users": {
      "currentUsersTitle": "Mevcut Kullanıcılar",
      "addUser": "Kullanıcı Ekle",
      "cancel": "İptal",
      "editAction": "Düzenle",
      "newUserDetails": "Yeni Kullanıcı Detayları",
      "usernamePlaceholder": "Kullanıcı adı (örn. ayse)",
      "fullNamePlaceholder": "Tam İsim",
      "passwordOptionalPlaceholder": "Şifre (isteğe bağlı)",
      "passwordHintOptionalPlaceholder": "Şifre ipucu (isteğe bağlı)",
      "createUser": "Kullanıcı Oluştur",
      "userExists": "Kullanıcı zaten var",
      "currentBadge": "Mevcut",
      "rootBadge": "Kök",
      "adminBadge": "Yönetici",
      "confirmDeleteUser": "{{username}} kullanıcısını silmek istediğinizden emin misiniz?",
      "editForm": {
        "fullNameLabel": "Tam İsim",
        "roleLabel": "Rol",
        "administrator": "Yönetici",
        "newPasswordLabel": "Yeni şifre (korumak için boş bırakın)",
        "passwordHintLabel": "Şifre ipucu",
        "saveChanges": "Değişiklikleri Kaydet"
      }
    },
    "about": {
      "version": "Sürüm",
      "framework": "Çerçeve",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Ortam",
      "browserMode": "Tarayıcı Modu",
      "developerMode": "Geliştirici Modu",
      "developerModeDescription": "Gelişmiş araçları ve hata ayıklama özelliklerini etkinleştir",
      "exposeRootUser": "Kök Kullanıcıyı Göster",
      "exposeRootUserDescription": "Giriş ekranında kök kullanıcıyı göster",
      "memoryUsage": "Bellek Kullanımı",
      "preferencesSoft": "Tercihler (Yumuşak Bellek)",
      "filesystemHard": "Dosya Sistemi (Sert Bellek)",
      "total": "Toplam"
    },
    "danger": {
      "title": "Tehlike Bölgesi",
      "softResetTitle": "Yazılımsal Sıfırlama",
      "softResetDescription": "Tercihleri, tema ayarlarını, masaüstü simge konumlarını ve uygulama durumlarını sıfırlar. Dosyalarınız ve klasörleriniz korunur.",
      "resetPreferences": "Tercihleri Sıfırla",
      "confirmReset": "Sıfırlamayı Onayla",
      "hardResetTitle": "Donanımsal Sıfırlama",
      "hardResetDescription": "Dosyalar, klasörler ve ayarlar dahil tüm verileri tamamen siler. Bu işlem geri alınamaz.",
      "hardResetWarning": "⚠️ Tüm özel dosya ve klasörler kalıcı olarak silinecek",
      "factoryReset": "Fabrika Ayarlarına Sıfırla",
      "deleteEverything": "Evet, Her Şeyi Sil"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Aurora'ya Hoş Geldiniz",
        "description": "Başlamak için dilinizi seçin"
      },
      "account": {
        "title": "Hesabınızı Oluşturun",
        "description": "Ana yönetici hesabını ayarlayın"
      },
      "theme": {
        "title": "Kişiselleştir",
        "description": "Kendinize ait yapın"
      },
      "finishing": {
        "title": "Kuruluyor...",
        "description": "Yapılandırma uygulanıyor"
      }
    },
    "account": {
      "fullName": "Tam İsim",
      "fullNamePlaceholder": "Örnek: Ahmet Yılmaz",
      "username": "Kullanıcı Adı",
      "password": "Şifre",
      "passwordHint": "İpucu (İsteğe Bağlı)",
      "passwordHintPlaceholder": "Örnek: İlk evcil hayvanın adı"
    },
    "theme": {
      "mode": "Tema Modu",
      "accentColor": "Vurgu Rengi",
      "darkMode": "Karanlık (Nötr)",
      "lightMode": "Aydınlık",
      "comingSoon": "Çok Yakında"
    },
    "finishing": {
      "title": "Her Şey Hazır!",
      "subtitle": "Aurora OS hazır. Giriş ekranına yönlendiriliyorsunuz..."
    },
    "search": {
      "placeholder": "Dil ara...",
      "noResults": "Dil bulunamadı"
    },
    "validation": {
      "requiredFields": "Lütfen tüm zorunlu alanları doldurun",
      "passwordLength": "Şifre en az 6 karakter olmalıdır",
      "userExists": "Kullanıcı zaten var. Lütfen farklı bir kullanıcı adı seçin.",
      "fullNameFormat": "Tam isim yalnızca harf, boşluk ve kısa çizgi içermelidir",
      "usernameFormat": "Kullanıcı adı yalnızca küçük harf ve rakam içermelidir",
      "hintLength": "Şifre ipucu çok uzun (maks. 50 karakter)",
      "hintSecurity": "Şifre ipucu şifrenin kendisini içeremez",
      "hintFormat": "Şifre ipucu geçersiz karakterler içeriyor",
      "creationFailed": "Hesap oluşturulamadı. Lütfen tekrar deneyin."
    },
    "buttons": {
      "next": "İleri",
      "back": "Geri",
      "startUsing": "Aurora'yı Kullanmaya Başla"
    }
  },
  "battery": {
    "title": "Pil",
    "charging": "Şarj Oluyor",
    "fullyCharged": "Tam Şarj Dolu",
    "remaining": "%{{percentage}} Kaldı",
    "powerSource": "Güç Kaynağı:",
    "powerSources": {
      "adapter": "Güç Adaptörü",
      "battery": "Pil"
    },
    "condition": "Durum (Tahmini)",
    "metrics": {
      "health": "Sağlık",
      "cycles": "Döngü",
      "temp": "Sıcaklık",
      "voltage": "Voltaj"
    },
    "disclaimer": "Pil sağlığı ve durum ölçümleri, mevcut sistem sensörlerine dayalı tahminlerdir. Gerçek değerler değişebilir.",
    "showPercentage": "Menü Çubuğunda Yüzdeyi Göster"
  },
  "audio": {
    "title": "Ses",
    "muteAll": "Hepsini Sessize Al",
    "unmute": "Sesi Aç",
    "masterVolume": "Ana Ses",
    "mixer": "Mikser",
    "categories": {
      "music": "Müzik",
      "system": "Sistem Uyarıları",
      "interface": "Arayüz",
      "feedback": "Giriş Geri Bildirimi",
      "ambiance": "Ortam"
    },
    "mixerLabels": {
      "masterOutput": "Ana Çıkış",
      "musicAppLevel": "Müzik Uygulaması Seviyesi",
      "sfxInterface": "SFX ve Arayüz",
      "backgroundLoop": "Arka Plan Döngüsü"
    }
  }
};

import type { TranslationDict } from '@/i18n/types';

export const hi: TranslationDict = {
  "time": {
    "yesterday": "कल"
  },
  "common": {
    "name": "नाम",
    "color": "रंग",
    "cancel": "रद्द करें",
    "save": "सहेजें"
  },
  "game": {
    "intro": {
      "initialize": "सिस्टम प्रारंभ करें",
      "clickToStart": "शुरू करने के लिए क्लिक करें",
      "skipHint": "छोड़ने के लिए ESC या SPACE दबाएं"
    },
    "mainMenu": {
      "continue": {
        "label": "जारी रखना",
        "desc": {
          "canContinue": "अपना पिछला लूप फिर से शुरू करें",
          "noData": "कोई लूप डेटा नहीं मिला"
        }
      },
      "newGame": {
        "label": "नया लूप",
        "desc": "नए सिरे से शुरू करें (डेटा मिटाता है)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "वैश्विक पैरामीटर कॉन्फ़िगर करें"
      },
      "exit": {
        "label": "शट डाउन",
        "desc": "सत्र समाप्त करें",
        "confirm": {
          "title": "सिस्टम बंद होना",
          "message": "क्या आप सच में सिस्टम को बंद करना चाहते हैं? बिना सेव किया हुआ काम खत्म हो सकता है।",
          "cancel": "रद्द करना",
          "confirm": "शट डाउन"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "BIOS सेटिंग्स",
      "hardwareAcceleration": "हार्डवेयर एक्सेलेरेशन",
      "displayMode": "डिस्प्ले मोड",
      "fullscreen": "पूर्ण स्क्रीन",
      "borderless": "सीमा रहित",
      "windowed": "विंडो",
      "resolution": "रिज़ॉल्यूशन",
      "windowSettings": "विंडो सेटिंग्स",
      "windowFrame": "विंडो फ़्रेम",
      "windowFrameHint": "शीर्षक पट्टी और सीमाएँ (पुनः आरंभ आवश्यक)",
      "configurationUtility": "कॉन्फ़िगरेशन उपयोगिता",
      "tabs": {
        "display": "प्रदर्शन",
        "audio": "ऑडियो",
        "system": "सिस्टम"
      },
      "graphicsQuality": "ग्राफ़िक्स गुणवत्ता",
      "presets": {
        "highFidelity": {
          "label": "उच्च निष्ठा",
          "desc": "ब्लर, छाया, कंपन सक्षम। दृश्य++"
        },
        "performance": {
          "label": "प्रदर्शन",
          "desc": "अधिकतम एफपीएस। न्यूनतम प्रभाव। गति++"
        }
      },
      "reduceMotion": "गति कम करें",
      "simpleColors": "साधारण रंग",
      "solidBackgrounds": "ठोस पृष्ठभूमि",
      "noShadows": "कोई छाया नहीं",
      "dangerZone": "खतरा क्षेत्र",
      "configFooter": "कॉन्फ़िगरेशन",
      "softReset": "सॉफ्ट रीसेट",
      "softResetHint": "एप्लिकेशन पुनः लोड करें",
      "softResetConfirm": "सॉफ्ट रीसेट: इससे एप्लिकेशन रीलोड हो जाएगा लेकिन आपका डेटा सुरक्षित रहेगा। जारी रखें?",
      "factoryReset": "नए यंत्र जैसी सेटिंग",
      "factoryResetHint": "सभी डेटा मिटाएँ",
      "factoryResetConfirm": "फ़ैक्टरी रीसेट: इससे सारा डेटा, यूज़र्स और फ़ाइलें पूरी तरह से डिलीट हो जाएंगी। इसे वापस ठीक नहीं किया जा सकता। क्या आप पक्का हैं?"
    },
    "footer": {
      "originalDistribution": "मूल वितरण",
      "temperedDistribution": "टेम्पर्ड वितरण"
    }
  },
  "appDescriptions": {
    "finder": "फ़ाइल मैनेजर",
    "browser": "वेब तक पहुंचें",
    "mail": "ईमेल पढ़ें और लिखें",
    "appStore": "ऐप्स डाउनलोड करें और मैनेज करें",
    "terminal": "कमांड लाइन इंटरफ़ेस",
    "systemSettings": "अपने सिस्टम को कॉन्फ़िगर करें",
    "notepad": "टेक्स्ट फ़ाइलों को संपादित करें",
    "messages": "बर्तन में बची हुई कॉफी",
    "calendar": "अपना शेड्यूल मैनेज करें",
    "photos": "फ़ोटो देखें और मैनेज करें",
    "music": "अपना पसंदीदा संगीत चलाएं",
    "devCenter": "डेवलपर उपकरण"
  },
  "a11y": {
    "common": {
      "close": "बंद करें",
      "open": "खोलें",
      "notAvailable": "लागू नहीं"
    },
    "sidebar": {
      "toggleSidebar": "साइडबार टॉगल करें"
    },
    "pagination": {
      "pagination": "पृष्ठ पर अंक लगाना",
      "goToPreviousPage": "पिछले पृष्ठ पर जाएं",
      "goToNextPage": "अगले पेज पर जाएं",
      "previous": "पहले का",
      "next": "अगला",
      "morePages": "और पेज"
    },
    "breadcrumb": {
      "breadcrumb": "ब्रेडक्रम्ब",
      "more": "अधिक"
    },
    "carousel": {
      "previousSlide": "पिछली स्लाइड",
      "nextSlide": "अगली स्लाइड"
    }
  },
  "commandPalette": {
    "title": "कमांड पैलेट",
    "description": "चलाने के लिए कमांड खोजें..."
  },
  "login": {
    "softReset": "सॉफ्ट रीसेट",
    "hardReset": "मुश्किल रीसेट",
    "hardResetConfirm": "हार्ड रीसेट: इससे सारा डेटा डिलीट हो जाएगा। जारी रखें?",
    "selectUser": "उपयोगकर्ता चुनें",
    "enterPasswordToUnlock": "अनलॉक करने के लिए पासवर्ड डालें",
    "restoringPreviousSession": "पिछला सत्र पुनर्स्थापित किया जा रहा है",
    "passwordPlaceholder": "पासवर्ड",
    "incorrectPassword": "गलत पासवर्ड",
    "hint": "संकेत",
    "enterSystem": "गलत पासवर्ड। संकेत:",
    "switchAccount": "खाता स्थानांतरित करें",
    "back": "पीछे",
    "suspendToSwitch": "स्विच करने के लिए सेशन को सस्पेंड करें?",
    "cancel": "रद्द करना",
    "switchUser": "उपयोगकर्ता बदलें",
    "logOut": "लॉग आउट",
    "logOutConfirm": "क्या {{username}} को लॉग आउट करें? इससे सभी खुली हुई विंडोज़ बंद हो जाएंगी और न सहेजे गए (unsaved) बदलाव हट जाएंगे।",
    "active": "सक्रिय",
    "resume": "फिर शुरू करना",
    "sessionActive": "सत्र सक्रिय"
  },
  "app": {
    "loadingKernel": "कर्नेल लोड हो रहा है..."
  },
  "menubar": {
    "menus": {
      "file": "फ़ाइल",
      "shell": "शंख",
      "edit": "संपादन करना",
      "format": "प्रारूप",
      "song": "गाना",
      "view": "देखना",
      "go": "जाना",
      "controls": "नियंत्रण",
      "window": "खिड़की",
      "help": "मदद",
      "store": "इकट्ठा करना",
      "history": "इतिहास",
      "bookmarks": "बुकमार्क",
      "mailbox": "मेलबॉक्स",
      "message": "संदेश",
      "conversations": "बात चिट"
    },
    "items": {
      "newWindow": "नई विंडो",
      "newFolder": "नया फ़ोल्डर",
      "open": "खोलें",
      "changeWallpaper": "वॉलपेपर बदलें",
      "closeWindow": "विंडो बंद",
      "undo": "पूर्ववत",
      "redo": "फिर से करना",
      "cut": "काटना",
      "copy": "प्रतिलिपि",
      "paste": "पेस्ट करें",
      "selectAll": "सबका चयन करें",
      "reload": "सीमा से अधिक लादना",
      "toggleFullscreen": "संपूर्ण स्क्रीन टॉगल करें",
      "minimize": "छोटा करना",
      "bringAllToFront": "सभी को सामने लाओ",
      "back": "पीछे",
      "forward": "आगे",
      "enclosingFolder": "संलग्न फ़ोल्डर",
      "getInfo": "जानकारी प्राप्त करें",
      "moveToTrash": "ट्रैश में ले जाएं"
    },
    "help": {
      "appHelp": "{{appName}} मदद"
    },
    "default": {
      "featureNotImplemented": "फ़ीचर लागू नहीं किया गया"
    },
    "system": {
      "aboutThisComputer": "इस कंप्यूटर के बारे में...",
      "systemSettings": "सिस्टम सेटिंग्स...",
      "appStore": "ऐप स्टोर...",
      "lockScreen": "लॉक स्क्रीन",
      "switchUser": "उपयोगकर्ता बदलें",
      "user": "उपयोगकर्ता",
      "logOutAs": "लॉग आउट: {{username}}",
      "viewSystemInfo": "सिस्टम की जानकारी देखें",
      "viewSystemSettings": "सिस्टम सेटिंग्स देखें",
      "returnToLoginWhile": "लॉगिन स्क्रीन पर वापस जाएं जबकि",
      "returnToUserSelectionWhile": "यूज़र सिलेक्शन स्क्रीन पर वापस जाएं",
      "keepingSession": "सत्र जारी रखना",
      "clearingSession": "समाशोधन सत्र",
      "panic": "घबड़ाहट",
      "hardReset": "मुश्किल रीसेट",
      "warning": "चेतावनी",
      "panicWarningBody": "अगर {{productName}} के साथ कुछ गड़बड़ हो जाए, तो यह उसके लिए एक पैनिक बटन (panic button) के तौर पर भी अच्छा है।",
      "serverTime": "सर्वर समय (UTC)",
      "localTime": "स्थानीय समय"
    },
    "app": {
      "aboutApp": "के बारे में {{appName}}",
      "settings": "सेटिंग्स...",
      "quitApp": "छोड़ना {{appName}}"
    }
  },
  "notifications": {
    "title": "सूचनाएं",
    "titles": {
      "permissionDenied": "अनुमति अस्वीकृत"
    },
    "clearAll": "सभी साफ करें",
    "new": "नया",
    "subtitles": {
      "appMissing": "ऐप गायब है",
      "permissionDenied": "अनुमति अस्वीकृत",
      "saved": "सहेजा गया",
      "deleted": "हटा दिया गया",
      "moved": "स्थानांतरित",
      "trash": " कचरा",
      "failed": "विफल",
      "ui": "इंटरफ़ेस",
      "validation": "सत्यापन",
      "success": "सफलता",
      "error": "त्रुटि",
      "info": "जानकारी",
      "warning": "चेतावनी",
      "fileError": "फ़ाइल त्रुटि"
    },
    "empty": "कोई सूचना नहीं",
    "clearApp": "इस ऐप से सभी साफ करें",
    "messageFrom": "{{sender}} से संदेश"
  },
  "memory": {
    "title": "याद",
    "used": "इस्तेमाल किया गया",
    "pressure": "दबाव",
    "appMemory": "ऐप मेमोरी",
    "wiredMemory": "वायर्ड मेमोरी",
    "processName": "प्रक्रिया नाम",
    "memory": "याद",
    "swapUsed": "स्वैप का इस्तेमाल किया गया",
    "systemWired": "अरोरा प्रणाली",
    "activeSession": "वायर्ड मेमोरी (सक्रिय सत्र)",
    "userSession": "सत्र: {{user}}",
    "backgroundSession": "सुप्त स्मृति (पृष्ठभूमि)",
    "backgroundProcesses": "{{count}} बैकग्राउंड प्रोसेस (Background Processes)",
    "instances": "{{count}} इंस्टेंस (Instances)",
    "type": {
      "mainWindow": "मुख्य विंडो",
      "extraWindow": "अतिरिक्त विंडो",
      "extraTabs": "{{count}} अतिरिक्त टैब (Extra Tabs)"
    },
    "error": {
      "title": "अपर्याप्त मेमोरी",
      "description": "{{appName}} नहीं खोल सकता। पर्याप्त RAM उपलब्ध नहीं है।"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "अद्यतन के लिए जाँच...",
      "viewMyAccount": "मेरा खाता देखें..."
    },
    "categories": {
      "all": "सभी",
      "productivity": "उत्पादकता",
      "media": "मिडिया",
      "utilities": "उपयोगिताओं",
      "development": "विकास",
      "system": "प्रणाली"
    },
    "searchPlaceholder": "ऐप्स खोजें...",
    "empty": {
      "title": "कोई ऐप नहीं मिला",
      "description": "आप जो ढूंढ रहे हैं, उसे खोजने के लिए अपनी सर्च या कैटेगरी फ़िल्टर को एडजस्ट करके देखें।"
    },
    "size": "आकार",
    "sizeUnknown": "अज्ञात",
    "install": "स्थापित करना",
    "uninstall": "अनइंस्टॉल करें",
    "open": "खोलें",
    "cancel": "रद्द करें",
    "confirm": "पुष्टि करें",
    "restore": "पुनर्स्थापित करें",
    "checkFailed": "जांच विफल",
    "checkFailedTitle": "इंस्टॉलेशन जांच विफल",
    "restoreSuccess": "{{app}} सफलतापूर्वक पुनर्स्थापित किया गया",
    "restoreError": "{{app}} पुनर्स्थापित करने में विफल",
    "restorePermissionDenied": "ऐप्स पुनर्स्थापित करने के लिए व्यवस्थापक विशेषाधिकार आवश्यक हैं",
    "installingWarning": "कृपया प्रतीक्षा करें जब तक एप्लिकेशन इंस्टॉल हो रहा है।"
  },
  "browser": {
    "menu": {
      "newTab": "नया टैब",
      "closeTab": "टैब बंद करें"
    },
    "welcome": {
      "title": "ब्राउज़र",
      "description": "जानकारी खोजने या ब्राउज़िंग शुरू करने के लिए URL दर्ज करें।",
      "searchPlaceholder": "वेबसाइट खोजें या पता डालें...",
      "favorites": "पसंदीदा",
      "recentActivity": "हाल की गतिविधि"
    },
    "searchPlaceholder": "खोजें या पता दर्ज करें...",
    "error": {
      "pageNotFound": "पृष्ठ नहीं मिला",
      "pageNotFoundDesc": "वेबसाइट {{url}} नहीं मिली।",
      "goHome": "होम पर जाएं",
      "offlineTitle": "No Internet Connection",
      "offlineDesc": "You are not connected to the internet. Please connect to a network to browse the web."
    }
  },
  "music": {
    "sidebar": {
      "library": "पुस्तकालय",
      "songs": "गीत",
      "favorites": "पसंदीदा",
      "recentlyPlayed": "हाल ही में खेला गया"
    },
    "titles": {
      "songs": "गीत",
      "recentlyPlayed": "हाल ही में खेला गया"
    },
    "actions": {
      "playAll": "सभी खेलना"
    },
    "empty": {
      "recent": {
        "title": "हाल ही में चलाए गए कोई गाने नहीं",
        "description": "आपके हाल ही में चलाए गए गाने यहां दिखाई देंगे।"
      },
      "library": {
        "title": "कोई गाना नहीं मिला",
        "description": "आपके म्यूज़िक फ़ोल्डर में कोई म्यूज़िक फ़ाइल नहीं मिली।",
        "openFolder": "{{folder}} फ़ोल्डर खोलें"
      }
    },
    "folders": {
      "music": "संगीत",
      "home": "घर"
    },
    "player": {
      "notPlaying": "नहीं खेल रहा",
      "selectSong": "एक गाना चुनें"
    },
    "metadata": {
      "unknownArtist": "अज्ञात कलाकार",
      "unknownAlbum": "अज्ञात एल्बम",
      "unknownTitle": "अज्ञात शीर्षक"
    },
    "menu": {
      "newPlaylist": "नई प्लेलिस्ट",
      "import": "आयात करना...",
      "closeWindow": "विंडो बंद",
      "showInFinder": "फाइंडर में दिखाएँ",
      "addToPlaylist": "प्लेलिस्ट में जोड़ें",
      "play": "खेल",
      "previousSong": "पिछला गाना",
      "nextSong": "अगला गाना",
      "volumeUp": "आवाज बढ़ाएं",
      "volumeDown": "नीची मात्रा"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "नया टैब",
      "clearScrollback": "स्क्रॉलबैक साफ़ करें",
      "killProcess": "प्रक्रिया समाप्त करें"
    },
    "help": {
      "availableCommands": "उपलब्ध कमांड:",
      "usage": "प्रयोग",
      "appLaunchHelp": "इंस्टॉल किए गए एप्लिकेशन लॉन्च करें (जैसे फाइंडर)"
    },
    "commands": {
      "help": {
        "description": "यह हेल्प मैसेज दिखाएँ"
      },
      "ls": {
        "description": "डायरेक्टरी की सामग्री सूचीबद्ध करें",
        "usage": "ls [path]"
      },
      "cd": {
        "description": "डायरेक्टरी बदलें",
        "usage": "cd <path>"
      },
      "pwd": {
        "description": "वर्तमान कार्यशील निर्देशिका प्रिंट करें"
      },
      "logout": {
        "description": "वर्तमान सत्र से लॉग आउट करें"
      },
      "who": {
        "description": "दिखाएँ कि कौन लॉग इन है"
      },
      "clear": {
        "description": "टर्मिनल स्क्रीन साफ़ करें"
      },
      "cat": {
        "description": "फ़ाइल सामग्री प्रदर्शित करें",
        "usage": "cat <file>"
      },
      "mkdir": {
        "description": "निर्देशिका बनाओ",
        "usage": "mkdir <name>"
      },
      "touch": {
        "description": "फ़ाइल बनाएं या टाइमस्टैम्प अपडेट करें",
        "usage": "touch <name>"
      },
      "rm": {
        "description": "फ़ाइल या डायरेक्टरी हटाएं",
        "usage": "rm <name>"
      },
      "cp": {
        "description": "फ़ाइलें कॉपी करें",
        "usage": "cp <source> <dest>"
      },
      "mv": {
        "description": "फ़ाइलों को मूव (नाम बदलें) करें",
        "usage": "mv <source> <dest>"
      },
      "chmod": {
        "description": "फ़ाइल मोड (अनुमतियाँ) बदलें",
        "usage": "chmod <mode> <file>"
      },
      "chown": {
        "description": "फ़ाइल के मालिक और ग्रुप को बदलें",
        "usage": "chown <owner>[:<group>] <file>"
      },
      "grep": {
        "description": "एक पैटर्न से मेल खाने वाली लाइनें प्रिंट करें",
        "usage": "grep <pattern> <file>"
      },
      "find": {
        "description": "एक डायरेक्टरी पदानुक्रम में फ़ाइलों को खोजें",
        "usage": "find [path] [-name pattern]"
      },
      "echo": {
        "description": "टेक्स्ट की एक लाइन दिखाएँ",
        "usage": "echo [text]"
      },
      "date": {
        "description": "सिस्टम की तारीख और समय प्रिंट करें"
      },
      "uptime": {
        "description": "बताएं कि सिस्टम कितने समय से चल रहा है।"
      },
      "whoami": {
        "description": "वर्तमान उपयोगकर्ता को प्रिंट करें"
      },
      "hostname": {
        "description": "सिस्टम होस्टनाम प्रिंट करें"
      },
      "reset": {
        "description": "फ़ाइलसिस्टम को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करें"
      },
      "exit": {
        "description": "वर्तमान शेल (shell) सत्र से बाहर निकलें"
      },
      "su": {
        "description": "यूज़र ID बदलें या सुपरयूज़र बनें",
        "usage": "su [username] [password]"
      },
      "sudo": {
        "description": "किसी दूसरे यूज़र के तौर पर कमांड चलाएँ",
        "usage": "sudo [options] [command]"
      },
      "history": {
        "description": "टर्मिनल कमांड हिस्ट्री दिखाएँ",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} जल्द ही आ रहा है",
    "descriptions": {
      "mail": "अपने ईमेल, कॉन्टैक्ट्स और कैलेंडर इवेंट्स को मैनेज करें।",
      "calendar": "मीटिंग, इवेंट और रिमाइंडर शेड्यूल करें।",
      "default": "यह एप्लीकेशन अभी डेवलपमेंट में है।"
    }
  },
  "filePicker": {
    "openFile": "फ़ाइल खोलें",
    "openFileDescription": "फ़ाइल सिस्टम से खोलने के लिए फ़ाइल चुनें",
    "saveFile": "फ़ाइल सहेजें",
    "saveFileDescription": "अपनी फ़ाइल सहेजने के लिए स्थान और नाम चुनें",
    "emptyFolder": "यह फ़ोल्डर खाली है",
    "nameLabel": "नाम:",
    "untitledPlaceholder": "शीर्षकहीन",
    "toasts": {
      "permissionDenied": "अनुमति अस्वीकार: {{name}}"
    },
    "cancel": "रद्द करना",
    "open": "खुला",
    "save": "बचाना"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "म्यूजिक ऐप इंस्टॉल नहीं है। इसे ऐप स्टोर से इंस्टॉल करें।",
      "notepadNotInstalled": "नोटपैड इंस्टॉल नहीं है। इसे ऐप स्टोर से इंस्टॉल करें।",
      "photosNotInstalled": "फ़ोटो ऐप इंस्टॉल नहीं है। इसे ऐप स्टोर से इंस्टॉल करें।"
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} आइटम",
      "bytes": "{{count}} बाइट्स",
      "type": "प्रकार",
      "owner": "मालिक",
      "permissions": "अनुमतियाँ",
      "modified": "संशोधित",
      "size": "आकार"
    },
    "sidebar": {
      "favorites": "पसंदीदा",
      "system": "प्रणाली",
      "locations": "स्थानों"
    },
    "places": {
      "home": "घर",
      "desktop": "डेस्कटॉप",
      "documents": "दस्तावेज़",
      "downloads": "डाउनलोड",
      "pictures": "चित्रों",
      "music": "संगीत",
      "trash": "कचरा"
    },
    "actions": {
      "moveToTrash": "ट्रैश में ले जाएं",
      "search": "खोजें"
    },
    "toasts": {
      "permissionDenied": "अनुमति अस्वीकार: {{name}}",
      "musicNotInstalled": "म्यूजिक ऐप इंस्टॉल नहीं है। इसे ऐप स्टोर से इंस्टॉल करें।",
      "notepadNotInstalled": "नोटपैड इंस्टॉल नहीं है। इसे ऐप स्टोर से इंस्टॉल करें।",
      "photosNotInstalled": "Photos app is not installed. Install it from the App Store.",
      "movedItem": "Moved 1 item",
      "movedItems": "{{count}} आइटम स्थानांतरित किए गए",
      "movedItemTo": "Moved 1 item to {{target}}",
      "movedItemsTo": "{{count}} आइटम {{target}} में स्थानांतरित किए गए",
      "movedItemToTrash": "Moved 1 item to Trash",
      "movedItemsToTrash": "{{count}} आइटम ट्रैश (Trash) में स्थानांतरित किए गए",
      "moveFailedInvalidData": "मूव विफल: अमान्य डेटा",
      "failedToProcessDrop": "ड्रॉप को प्रोसेस करने में विफल रहा",
      "couldNotGetInfo": "जानकारी प्राप्त नहीं की जा सकी",
      "fileTypeNotSupported": "फ़ाइल प्रकार '{{type}}' समर्थित नहीं है"
    },
    "search": {
      "noResultsTitle": "कोई परिणाम नहीं मिला",
      "noResultsDesc": "\"{{query}}\" के लिए कोई परिणाम नहीं मिला",
      "resultsTitle": "खोज परिणाम ({{count}})"
    },
    "emptyFolder": "यह फ़ोल्डर खाली है"
  },
  "messages": {
    "title": "Messages",
    "sidebar": {
      "conversationsTitle": "बात चिट",
      "allMessages": "सभी संदेश",
      "unread": "अपठित",
      "starred": "तारांकित"
    },
    "search": {
      "placeholder": "वार्तालाप खोजें..."
    },
    "menu": {
      "newMessage": "नया सन्देश"
    },
    "auth": {
      "welcomeBack": "वापसी पर स्वागत है",
      "createAccount": "खाता बनाएं",
      "recoverAccount": "खाता पुनर्प्राप्त करें",
      "signInToContinue": "Messages जारी रखने के लिए साइन इन करें",
      "joinSecureNetwork": "सुरक्षित नेटवर्क से जुड़ें",
      "enterRecoveryKey": "एक्सेस प्राप्त करने के लिए अपनी रिकवरी कुंजी दर्ज करें",
      "invalidCredentials": "अमान्य उपयोगकर्ता नाम या पासवर्ड",
      "credentialsRetrieved": "क्रेडेंशियल्स प्राप्त किए गए",
      "password": "पासवर्ड",
      "returnToLogin": "लॉगिन पर लौटें",
      "recoveryKey": "रिकवरी कुंजी",
      "username": "उपयोगकर्ता नाम",
      "processing": "प्रसंस्करण...",
      "signIn": "साइन इन करें",
      "create": "खाता बनाएं",
      "recover": "पासवर्ड पुनर्प्राप्त करें",
      "noAccount": "खाता नहीं है? एक बनाएं",
      "haveAccount": "क्या आपके पास पहले से एक खाता मौजूद है? साइन इन करें",
      "forgotPassword": "पासवर्ड भूल गए?",
      "backToLogin": "लॉगिन पर वापस जाएं",
      "accountCreated": "खाता बनाया गया!",
      "saveRecoveryKey": "कृपया अपनी रिकवरी कुंजी सहेजें। अगर आप कभी अपना पासवर्ड भूल जाते हैं तो आपको इसकी आवश्यकता होगी।",
      "oneTimeShow": "यह केवल एक बार दिखाया जाएगा।",
      "savedContinue": "मैंने इसे सहेज लिया है - जारी रखें",
      "copied": "कॉपी किया गया",
      "recoveryKeyCopied": "रिकवरी कुंजी क्लिपबोर्ड पर कॉपी की गई",
      "failedCopy": "कुंजी कॉपी करने में विफल",
      "error": "त्रुटि"
    },
    "ui": {
      "noConversations": "कोई बातचीत नहीं",
      "noResults": "कोई परिणाम नहीं मिला",
      "noChatSelected": "कोई चैट नहीं चुनी गई",
      "chooseConversation": "एक वार्तालाप चुनें या एक नया शुरू करें।",
      "startNewMessage": "नया संदेश शुरू करें",
      "online": "ऑनलाइन",
      "typeMessage": "{{partner}} को संदेश भेजें...",
      "unstar": "तारांकित हटाएं",
      "star": "तारांकित करें",
      "cantMessageSelf": "आप खुद को संदेश नहीं भेज सकते (अभी तक)",
      "userNotFound": "उपयोगकर्ता नहीं मिला",
      "messageFailed": "संदेश विफल"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "पुस्तकालय",
      "albumsTitle": "एलबम"
    },
    "library": {
      "allPhotos": "सभी तस्वीरें",
      "favorites": "पसंदीदा",
      "recent": "हाल ही का",
      "userLibrary": "{{user}} की लाइब्रेरी"
    },
    "menu": {
      "slideshow": "स्लाइड शो",
      "rotateClockwise": "घड़ी की दिशा में घुमाएँ",
      "rotateCounterClockwise": "वामावर्त स्थिति में घुमाएं"
    },
    "empty": {
      "recent": {
        "title": "हाल ही में देखी गई कोई फ़ोटो नहीं",
        "description": "आपकी हाल ही में खोली गई फ़ोटो यहाँ दिखाई देंगी।"
      },
      "favorites": {
        "title": "अभी तक कोई पसंदीदा नहीं",
        "description": "उन्हें यहाँ देखने के लिए फ़ोटो को पसंदीदा के रूप में चिह्नित करें।"
      },
      "library": {
        "title": "कोई फ़ोटो नहीं मिली",
        "description": "आपके चित्र फ़ोल्डर में कोई फ़ोटो फ़ाइल नहीं मिली।",
        "openFolder": "{{folder}} फ़ोल्डर खोलें"
      },
      "noFolder": {
        "title": "{{user}} की लाइब्रेरी नहीं मिली",
        "description": "इस उपयोगकर्ता के लिए फ़ोल्डर {{path}} नहीं मिला।"
      },
      "openHome": "होम डायरेक्टरी खोलें"
    },
    "folders": {
      "pictures": "चित्र",
      "recent": "हाल ही का",
      "misc": "विविध"
    }
  },
  "mail": {
    "login": {
      "title": "मेल",
      "subtitle": "अपने खाते में साइन इन करें",
      "emailPlaceholder": "ईमेल",
      "passwordPlaceholder": "पासवर्ड",
      "signingIn": "इन कर रहे हैं...",
      "signIn": "दाखिल करना",
      "signOut": "साइन आउट",
      "createAccountInfo": "ईमेल प्रोवाइडर के ज़रिए एक अकाउंट बनाएं"
    },
    "menu": {
      "newMailbox": "नया मेलबॉक्स",
      "onlineStatus": "ऑनलाइन स्थिति",
      "newMessage": "नया सन्देश",
      "reply": "जवाब",
      "replyAll": "सभी को उत्तर दें",
      "forward": "आगे"
    },
    "sidebar": {
      "mailboxes": "मेलबॉक्स",
      "inbox": "इनबॉक्स",
      "starred": "तारांकित",
      "archived": "संग्रहीत",
      "trash": "कचरा"
    },
    "search": {
      "placeholder": "ईमेल खोजें..."
    },
    "empty": {
      "noEmails": "कोई ईमेल नहीं",
      "noEmailsFound": "कोई ईमेल नहीं मिला",
      "selectEmail": "पढ़ने के लिए एक ईमेल चुनें"
    },
    "actions": {
      "reply": "जवाब",
      "forward": "आगे",
      "archive": "पुरालेख",
      "unarchive": "संग्रह से निकालें",
      "delete": "मिटाना",
      "restore": "पुनर्स्थापित करें",
      "deleteForever": "स्थायी रूप से हटाएं"
    },
    "time": {
      "minutesAgo": "{{minutes}} मिनट पहले",
      "hoursAgo": "{{hours}} घंटे पहले",
      "today": "आज",
      "yesterday": "कल",
      "daysAgo": "{{days}} दिन पहले"
    },
    "attachments": {
      "count": "{{count}} अटैचमेंट",
      "count_plural": "{{count}} अटैचमेंट",
      "download": "डाउनलोड करना",
      "downloaded": "डाउनलोड",
      "downloadedTo": "{{name}} को {{folder}} में डाउनलोड किया गया",
      "downloadFailed": "डाउनलोड विफल रहा",
      "downloadFailedMessage": "{{name}} डाउनलोड करने में विफल"
    }
  },
  "notepad": {
    "untitled": "शीर्षकहीन",
    "untitledTab": "बिना शीर्षक वाला {{index}}",
    "empty": {
      "title": "नोटपैड",
      "description": "शुरू करने के लिए नई फ़ाइल बनाएं या मौजूदा फ़ाइल खोलें।",
      "newFile": "नई फ़ाइल",
      "openFile": "फ़ाइल खोलें"
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
      "txt": "सादे पाठ"
    },
    "actions": {
      "openFile": "खुली फाइल",
      "saveFile": "फाइल सुरक्षित करें",
      "bold": "बोल्ड",
      "italic": "तिरछा",
      "list": "सूची",
      "heading": "शीर्षक"
    },
    "preview": {
      "edit": "संपादन करना",
      "preview": "पूर्व दर्शन",
      "htmlPreviewTitle": "एचटीएमएल पूर्वावलोकन"
    },
    "status": {
      "chars": "{{count}} अक्षर",
      "lines": "लाइन {{count}}"
    },
    "contextSwitcher": {
      "title": "संदर्भ बदलने के लिए क्लिक करें",
      "searchPlaceholder": "भाषा खोजें...",
      "noLanguageFound": "कोई भाषा नहीं मिली।"
    },
    "toasts": {
      "switchedTo": "{{language}} पर स्विच किया गया",
      "failedToReadFile": "फ़ाइल पढ़ने में विफल रहा",
      "fileSaved": "फ़ाइल सहेजी गई",
      "failedToSaveFilePermissions": "फ़ाइल सेव नहीं हो पाई (परमिशन चेक करें)",
      "saved": "सहेजा गया",
      "failedToSave": "सेव करने में विफल रहा"
    },
    "dialog": {
      "unsaved": {
        "title": "क्या आप बदलावों को सेव करना चाहते हैं?",
        "description": "अगर आप अपने बदलावों को सेव नहीं करेंगे तो वे खो जाएंगे।",
        "dontSave": "सेव न करें",
        "cancel": "रद्द करना",
        "save": "बचाना"
      }
    },
    "menu": {
      "new": "नया",
      "open": "खुला...",
      "save": "बचाना",
      "closeTab": "टैब बंद करें",
      "bold": "बोल्ड",
      "italic": "तिरछा",
      "list": "सूची",
      "heading1": "शीर्षक 1",
      "heading2": "शीर्षक 2",
      "togglePreview": "पूर्वावलोकन टॉगल करें",
      "zoomIn": "ज़ूम इन",
      "zoomOut": "ज़ूम आउट"
    }
  },
  "calendar": {
    "menu": {
      "day": "दिन",
      "week": "सप्ताह",
      "month": "महीना",
      "year": "वर्ष"
    },
    "toolbar": {
      "today": "आज",
      "month": "महीना",
      "day": "दिन"
    },
    "sidebar": {
      "myCalendars": "मेरे कैलेंडर",
      "filterColors": "फ़िल्टर रंग"
    },
    "actions": {
      "createEvent": "इवेंट बनाएं",
      "createCategory": "Create Category",
      "clear": "स्पष्ट",
      "delete": "मिटाना",
      "cancel": "रद्द करना",
      "saveEvent": "इवेंट सहेजें"
    },
    "loadingEvents": "इवेंट लोड हो रहे हैं...",
    "toasts": {
      "cannotDeleteSystemCategory": "System categories cannot be deleted",
      "eventDeleted": "इवेंट हटा दिया गया",
      "eventSaved": "इवेंट सहेजा गया",
      "requiredFields": "कृपया आवश्यक फील्ड्स भरें"
    },
    "modal": {
      "newEvent": "नई इवैंट",
      "editEvent": "इवेंट संपादित करें",
      "newEventDescription": "अपने कैलेंडर पर एक नया इवेंट शेड्यूल करें।",
      "editEventDescription": "इवेंट की डिटेल्स देखें या एडिट करें।",
      "fields": {
        "title": "शीर्षक",
        "date": "तारीख",
        "time": "समय",
        "duration": "अवधि",
        "type": "प्रकार",
        "location": "जगह",
        "color": "रंग",
        "notes": "टिप्पणियाँ"
      },
      "placeholders": {
        "eventTitle": "इवेंट का शीर्षक",
        "pickDate": "एक तारीख चुनें",
        "searchTime": "खोज का समय...",
        "noTimeFound": "कोई समय नहीं मिला।",
        "selectDuration": "अवधि चुनें",
        "searchDuration": "खोज की अवधि...",
        "noDurationFound": "कोई अवधि नहीं मिली।",
        "selectType": "Select type",
        "searchType": "तलाश की विधि...",
        "noTypeFound": "कोई प्रकार नहीं मिला।",
        "addLocation": "स्थान जोड़ना",
        "addNotes": "नोट्स जोड़ें..."
      },
      "durationMinutes": "{{minutes}} मिनट",
      "minutesOption": "{{minutes}} मिनट"
    },
    "categories": {
      "all": "सभी",
      "work": "काम",
      "personal": "निजी",
      "social": "सामाजिक",
      "events": "आयोजन",
      "family": "परिवार"
    },
    "types": {
      "work": "काम",
      "personal": "निजी",
      "social": "सामाजिक",
      "events": "आयोजन",
      "family": "परिवार",
      "other": "अन्य"
    },
    "colors": {
      "blue": "नीला",
      "green": "हरा",
      "red": "लाल",
      "yellow": "पीला",
      "purple": "बैंगनी",
      "pink": "गुलाबी",
      "orange": "नारंगी",
      "gray": "स्लेटी"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "लूप शुरू हो गया",
        "location": "Turms",
        "notes": "प्रारंभिक फ़ाइलसिस्टम।"
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "सामान्य",
      "dashboard": "डैशबोर्ड",
      "interfaceTitle": "इंटरफ़ेस",
      "uiAndSounds": "यूआई और ध्वनियाँ",
      "systemTitle": "प्रणाली",
      "storage": "भंडारण",
      "fileSystem": "फाइल सिस्टम",
      "appsTitle": "Apps",
      "performance": "प्रदर्शन"
    },
    "dashboard": {
      "title": "डेवलपर डैशबोर्ड",
      "description": "{{productName}} डेवलपर सेंटर में आपका स्वागत है।"
    },
    "ui": {
      "title": "User Interface & Feedback",
      "notificationsTitle": "Notifications",
      "successToast": "सफलता टोस्ट",
      "warningToast": "चेतावनी टोस्ट",
      "errorToast": "त्रुटि टोस्ट",
      "soundFeedback": "ध्वनि प्रतिक्रिया",
      "buttons": {
        "success": "Success",
        "warning": "Warning",
        "error": "Error",
        "app": "App Notification",
        "open": "Open",
        "close": "Close",
        "click": "Click",
        "hover": "Hover"
      }
    },
    "storage": {
      "title": "भंडारण निरीक्षक",
      "import": "आयात",
      "export": "निर्यात",
      "clear": "स्पष्ट",
      "toastTitle": "भंडारण",
      "exportSuccess": "पसंद सफलतापूर्वक निर्यात की गईं",
      "exportFail": "प्राथमिकताओं को एक्सपोर्ट करने में विफल रहा",
      "importSuccess": "पसंद सफलतापूर्वक आयात की गईं",
      "importFail": "इम्पोर्ट फ़ाइल को पार्स करने में विफल रहा",
      "clearConfirm": "क्या आप सच में सारा लोकल स्टोरेज क्लियर करना चाहते हैं? इससे यूसेज प्रेफरेंस, थीम सेटिंग्स और विंडो पोजीशन रीसेट हो जाएंगी।",
      "clearSuccess": "सभी कुंजियाँ साफ़ हो गईं",
      "softMemory": "सॉफ्ट मेमोरी (वरीयताएँ)",
      "hardMemory": "हार्ड मेमोरी (फ़ाइल सिस्टम)",
      "keysCount": "{{count}} कुंजियाँ (Keys)",
      "localStorageKeys": "स्थानीय भंडारण कुंजियाँ"
    },
    "filesystem": {
      "title": "फ़ाइल सिस्टम डीबगर"
    },
    "performance": {
      "title": "प्रदर्शन मॉनिटर"
    },
    "menu": {
      "resetFilesystem": "फ़ाइलसिस्टम रीसेट करें",
      "runDiagnostics": "डायग्नोस्टिक्स चलाएँ"
    },
    "messages": {
      "createValues": {
        "title": "Create / Reset Account",
        "username": "Username",
        "password": "Password",
        "button": "Create Account",
        "success": "Account {{username}} created"
      },
      "registry": {
        "title": "Accounts Registry",
        "empty": "No accounts found",
        "useInSender": "Use in Sender",
        "delete": "Delete Account",
        "deleteConfirm": "Delete account {{username}}? This cannot be undone.",
        "deleteSuccess": "Account {{username}} deleted"
      },
      "sendMessage": {
        "title": "Send Inter-User Message",
        "from": "Sender (From)",
        "to": "Recipient (To)",
        "selectAccount": "Select Account...",
        "content": "Content",
        "placeholder": "Type a message...",
        "button": "Send Message",
        "success": "Message sent"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "प्रणाली",
      "general": "सामान्य"
    },
    "sections": {
      "appearance": "उपस्थिति",
      "performance": "प्रदर्शन",
      "displays": "प्रदर्शित करता है",
      "notifications": "सूचनाएं",
      "network": "नेटवर्क",
      "security": "सुरक्षा और गोपनीयता",
      "users": "उपयोगकर्ता और समूह",
      "storage": "भंडारण",
      "about": "के बारे में"
    },
    "appearance": {
      "title": "उपस्थिति",
      "languageTitle": "भाषा",
      "languageDescription": "सिस्टम UI के लिए डिस्प्ले भाषा चुनें",
      "languagePlaceholder": "भाषा चुने",
      "wallpaperTitle": "डेस्कटॉप वॉलपेपर",
      "wallpaperDescription": "अपने डेस्कटॉप एनवायरनमेंट के लिए बैकग्राउंड चुनें",
      "accentTitle": "एक्सेंट रंग",
      "accentDescription": "अपने डेस्कटॉप अनुभव को पर्सनलाइज़ करने के लिए एक एक्सेंट कलर चुनें।",
      "presetColors": "प्रीसेट रंग",
      "customColor": "कस्टम रंग",
      "customColorHint": "एक हेक्स कलर कोड डालें (जैसे, #3b82f6)",
      "preview": "पूर्व दर्शन",
      "previewPrimary": "प्राथमिक",
      "previewOutlined": "उल्लिखित",
      "themeModeTitle": "थीम मोड",
      "themeModeDescription": "चुनें कि एक्सेंट कलर बैकग्राउंड टिंट को कैसे प्रभावित करता है",
      "themeModeNeutralTitle": "तटस्थ",
      "themeModeNeutralDesc": "केवल प्राकृतिक ग्रे रंग",
      "themeModeShadesTitle": "रंगों",
      "themeModeShadesDesc": "एक्सेंट रंग टिंट",
      "themeModeContrastTitle": "अंतर",
      "themeModeContrastDesc": "सहायक रंग",
      "themeTitle": "विषय",
      "themeDark": "अँधेरा",
      "themeLightSoon": "प्रकाश (जल्द आ रहा है)",
      "wallpaperActive": "सक्रिय",
      "wallpaperUse": "उपयोग"
    },
    "performance": {
      "blurTitle": "धुंधलापन और पारदर्शिता",
      "blurDescription": "ग्लास ब्लर इफ़ेक्ट और विंडो ट्रांसपेरेंसी चालू करें",
      "reduceMotionTitle": "मोशन घटाएं",
      "reduceMotionDescription": "तेज़ रिस्पॉन्स और एक्सेसिबिलिटी के लिए एनिमेशन डिसेबल करें।",
      "disableShadowsTitle": "परछाइयों को अक्षम करें",
      "disableShadowsDescription": "रेंडरिंग परफॉर्मेंस को बेहतर बनाने के लिए विंडो शैडो हटा दें।",
      "disableGradientsTitle": "ग्रेडिएंट्स को अक्षम करें",
      "disableGradientsDescription": "आइकन के लिए ग्रेडिएंट के बजाय सॉलिड रंगों का इस्तेमाल करें।",
      "gpuTitle": "Use graphics acceleration",
      "gpuDescription": "Use hardware acceleration when available (restart required)"
    },
    "network": {
      "wifiTitle": "Wi-Fi",
      "wifinotConnected": "Not Connected",
      "wifiDisabled": "Wi-Fi is off",
      "wifiNetworks": "Available Networks",
      "scanning": "Scanning...",
      "passwordPlaceholder": "Password",
      "disconnect": "Disconnect",
      "configurationMode": "Configuration mode",
      "automatic": "Automatic (DHCP)",
      "manual": "Manual",
      "autoConfigTitle": "Automatic configuration",
      "manualConfigTitle": "Manual configuration",
      "ipAddress": "IP Address",
      "subnetMask": "Subnet Mask",
      "gateway": "Gateway",
      "dns": "DNS Server",
      "validateConfig": "Validate configuration",
      "configSaved": "Network configuration saved successfully",
      "dhcpAttributionProgress": "Retrieving an IP address via DHCP"
    },
    "placeholders": {
      "notificationsTitle": "सूचनाएं",
      "notificationsDescription": "नोटिफिकेशन सेंटर प्रेफरेंस जल्द ही आ रहे हैं।",
      "securityTitle": "सुरक्षा और गोपनीयता",
      "securityDescription": "फ़ायरवॉल, परमिशन और प्राइवेसी सेटिंग्स जल्द ही आ रही हैं।",
      "storageTitle": "भंडारण",
      "storageDescription": "डिस्क यूसेज एनालिसिस और मैनेजमेंट जल्द ही आ रहा है।"
    },
    "users": {
      "currentUsersTitle": "मौजूदा उपयोगकर्ता",
      "addUser": "उपयोगकर्ता जोड़ें",
      "cancel": "रद्द करना",
      "editAction": "संपादन करना",
      "newUserDetails": "नए उपयोगकर्ता विवरण",
      "usernamePlaceholder": "यूज़रनेम (जैसे एलिस)",
      "fullNamePlaceholder": "पूरा नाम",
      "passwordOptionalPlaceholder": "पासवर्ड (वैकल्पिक)",
      "passwordHintOptionalPlaceholder": "पासवर्ड संकेत (वैकल्पिक)",
      "createUser": "उपयोगकर्ता बनाएं",
      "userExists": "उपयोगकर्ता पहले से मौजूद है",
      "currentBadge": "मौजूदा",
      "rootBadge": "Root",
      "adminBadge": "व्यवस्थापक",
      "confirmDeleteUser": "क्या आप वाकई {{username}} को हटाना चाहते हैं?",
      "editForm": {
        "fullNameLabel": "पूरा नाम",
        "roleLabel": "भूमिका",
        "administrator": "प्रशासक",
        "newPasswordLabel": "नया पासवर्ड (वर्तमान पासवर्ड रखने के लिए खाली छोड़ दें)",
        "passwordHintLabel": "पासवर्ड संकेत",
        "saveChanges": "परिवर्तनों को सुरक्षित करें"
      }
    },
    "about": {
      "version": "संस्करण",
      "framework": "रूपरेखा",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "पर्यावरण",
      "browserMode": "ब्राउज़र मोड",
      "developerMode": "डेवलपर मोड",
      "developerModeDescription": "एडवांस्ड टूल्स और डीबग फीचर्स को इनेबल करें",
      "exposeRootUser": "रूट (root) यूज़र को एक्सपोज़ करें",
      "exposeRootUserDescription": "लॉगिन स्क्रीन पर रूट (root) यूज़र दिखाएं",
      "memoryUsage": "स्मृति प्रयोग",
      "preferencesSoft": "पसंद (सॉफ्ट मेमोरी)",
      "filesystemHard": "फ़ाइलसिस्टम (हार्ड मेमोरी)",
      "total": "कुल"
    },
    "danger": {
      "title": "खतरा क्षेत्र",
      "softResetTitle": "सॉफ्ट रीसेट",
      "softResetDescription": "यह प्रेफरेंस, थीम सेटिंग्स, डेस्कटॉप आइकन की पोजीशन और ऐप की स्थिति को रीसेट करता है। आपकी फ़ाइलें और फ़ोल्डर सुरक्षित रहेंगे।",
      "resetPreferences": "वरीयताएँ रीसेट करें",
      "confirmReset": "रीसेट की पुष्टि करें",
      "hardResetTitle": "मुश्किल रीसेट",
      "hardResetDescription": "यह फ़ाइलों, फ़ोल्डरों और सेटिंग्स सहित सभी डेटा को पूरी तरह से मिटा देता है। इस कार्रवाई को वापस नहीं लिया जा सकता।",
      "hardResetWarning": "⚠️ सभी कस्टम फ़ाइलें और फ़ोल्डर स्थायी रूप से हटा दिए जाएँगे।",
      "factoryReset": "नए यंत्र जैसी सेटिंग",
      "deleteEverything": "हाँ, सब कुछ डिलीट करें"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "ऑरोरा में आपका स्वागत है",
        "description": "शुरू करने के लिए अपनी भाषा चुनें"
      },
      "account": {
        "title": "अपना खाता बनाएं",
        "description": "प्राइमरी एडमिनिस्ट्रेटर अकाउंट सेट अप करें"
      },
      "theme": {
        "title": "वैयक्तिकृत करें",
        "description": "इसे अपना बनाएं"
      },
      "finishing": {
        "title": "की स्थापना...",
        "description": "कॉन्फ़िगरेशन लागू करना"
      }
    },
    "account": {
      "fullName": "पूरा नाम",
      "fullNamePlaceholder": "उदाहरण: जॉन डो",
      "username": "यूज़रनेम",
      "password": "पासवर्ड",
      "passwordHint": "पासवर्ड संकेत (वैकल्पिक)",
      "passwordHintPlaceholder": "उदाहरण: आपके पहले पालतू जानवर का नाम"
    },
    "theme": {
      "mode": "थीम मोड",
      "accentColor": "एक्सेंट रंग",
      "darkMode": "गहरा (तटस्थ)",
      "lightMode": "रोशनी",
      "comingSoon": "जल्द आ रहा है"
    },
    "finishing": {
      "title": "तुम सब सेट हो!",
      "subtitle": "Aurora OS तैयार है। आपको लॉगिन स्क्रीन पर रीडायरेक्ट किया जा रहा है..."
    },
    "search": {
      "placeholder": "भाषा खोजें...",
      "noResults": "कोई भाषा नहीं मिली"
    },
    "validation": {
      "requiredFields": "कृपया सभी अपेक्षित फ़ील्ड को भरें",
      "passwordLength": "पासवर्ड कम से कम 6 अंकों का होना चाहिए",
      "userExists": "यूज़र पहले से मौजूद है। कृपया कोई दूसरा यूज़रनेम चुनें।",
      "fullNameFormat": "पूरे नाम में केवल अक्षर, स्पेस और हाइफ़न होने चाहिए।",
      "usernameFormat": "यूज़रनेम में सिर्फ़ छोटे अक्षर और नंबर होने चाहिए।",
      "hintLength": "पासवर्ड हिंट बहुत लंबा है (अधिकतम 50 कैरेक्टर)",
      "hintSecurity": "पासवर्ड हिंट में खुद पासवर्ड नहीं हो सकता।",
      "hintFormat": "पासवर्ड हिंट में अमान्य कैरेक्टर हैं",
      "creationFailed": "अकाउंट बनाने में फेल हो गए। कृपया फिर से कोशिश करें।"
    },
    "buttons": {
      "next": "अगला",
      "back": "पीछे",
      "startUsing": "Aurora का उपयोग शुरू करें"
    }
  },
  "battery": {
    "title": "बैटरी",
    "charging": "चार्ज",
    "fullyCharged": "पूर्णतःउर्जित",
    "remaining": "{{percentage}}% शेष",
    "powerSource": "शक्ति का स्रोत:",
    "powerSources": {
      "adapter": "बिजली अनुकूलक",
      "battery": "बैटरी"
    },
    "condition": "स्थिति (स्थापित)",
    "metrics": {
      "health": "स्वास्थ्य",
      "cycles": "साइकिल",
      "temp": "तापमान",
      "voltage": "वोल्टेज"
    },
    "disclaimer": "बैटरी हेल्थ और कंडीशन मेट्रिक्स उपलब्ध सिस्टम सेंसर पर आधारित अनुमान हैं। असल वैल्यू अलग हो सकती हैं।",
    "showPercentage": "मेनू बार में प्रतिशत दिखाएँ"
  },
  "audio": {
    "title": "आवाज़",
    "muteAll": "मूक सभी",
    "unmute": "अनम्यूट",
    "masterVolume": "मास्टर वॉल्यूम",
    "mixer": "मिक्सर",
    "categories": {
      "music": "संगीत",
      "system": "सिस्टम अलर्ट",
      "interface": "इंटरफ़ेस",
      "feedback": "इनपुट प्रतिक्रिया",
      "ambiance": "माहौल"
    },
    "mixerLabels": {
      "masterOutput": "मास्टर आउटपुट",
      "musicAppLevel": "संगीत ऐप स्तर",
      "sfxInterface": "एसएफएक्स और इंटरफेस",
      "backgroundLoop": "बैकग्राउंड लूप"
    }
  }
};

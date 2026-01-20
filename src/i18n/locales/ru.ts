import type { TranslationDict } from '@/i18n/types';

export const ru: TranslationDict = {
  "time": {
    "yesterday": "Вчера"
  },
  "common": {
    "name": "Имя",
    "color": "Цвет",
    "cancel": "Отмена",
    "save": "Сохранить"
  },
  "game": {
    "intro": {
      "initialize": "Инициализация системы",
      "clickToStart": "НАЖМИТЕ, ЧТОБЫ НАЧАТЬ",
      "skipHint": "ESC или ПРОБЕЛ, чтобы пропустить"
    },
    "mainMenu": {
      "continue": {
        "label": "Продолжить",
        "desc": {
          "canContinue": "Возобновить предыдущий цикл",
          "noData": "Нет данных цикла"
        }
      },
      "newGame": {
        "label": "Новый цикл",
        "desc": "Начать заново (Удаление данных)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Настройка глобальных параметров"
      },
      "exit": {
        "label": "Выключение",
        "desc": "Завершить сеанс",
        "confirm": {
          "title": "Выключение системы",
          "message": "Вы уверены, что хотите выключить систему? Несохраненный прогресс может быть потерян.",
          "cancel": "Отмена",
          "confirm": "Выключить"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Настройки BIOS",
      "fullScreen": "Полноэкранный режим",
      "immersiveMode": "Иммерсивный режим",
      "fullScreenEnter": "Войти",
      "fullScreenExit": "Выйти",
      "softReset": "Мягкий сброс",
      "softResetHint": "Перезагрузить приложение",
      "softResetConfirm": "Мягкий сброс: это перезагрузит приложение, но сохранит ваши данные. Продолжить?",
      "factoryReset": "Сброс до заводских настроек",
      "factoryResetHint": "Стереть все данные",
      "factoryResetConfirm": "СБРОС ДО ЗАВОДСКИХ НАСТРОЕК: Это полностью удалит ВСЕ данные, пользователей и файлы. Это действие нельзя отменить. Вы уверены?"
    },
    "footer": {
      "originalDistribution": "Оригинальная дистрибуция",
      "temperedDistribution": "Измененная дистрибуция"
    }
  },
  "appDescriptions": {
    "finder": "Файловый менеджер",
    "browser": "Доступ в Интернет",
    "mail": "Чтение и написание писем",
    "appStore": "Загрузка и управление приложениями",
    "terminal": "Интерфейс командной строки",
    "systemSettings": "Настройка системы",
    "notepad": "Редактирование текстовых файлов",
    "messages": "Общение с друзьями",
    "calendar": "Управление расписанием",
    "photos": "Просмотр и управление фото",
    "music": "Прослушивание любимой музыки",
    "devCenter": "Инструменты разработчика"
  },
  "a11y": {
    "common": {
      "close": "Закрыть",
      "open": "Открыть",
      "notAvailable": "Н/Д"
    },
    "sidebar": {
      "toggleSidebar": "Переключить боковую панель"
    },
    "pagination": {
      "pagination": "Пагинация",
      "goToPreviousPage": "Перейти на предыдущую страницу",
      "goToNextPage": "Перейти на следующую страницу",
      "previous": "Назад",
      "next": "Вперед",
      "morePages": "Больше страниц"
    },
    "breadcrumb": {
      "breadcrumb": "Навигационная цепочка",
      "more": "Еще"
    },
    "carousel": {
      "previousSlide": "Предыдущий слайд",
      "nextSlide": "Следующий слайд"
    }
  },
  "commandPalette": {
    "title": "Палитра команд",
    "description": "Поиск команды для выполнения..."
  },
  "login": {
    "softReset": "Мягкий сброс",
    "hardReset": "Жесткий сброс",
    "hardResetConfirm": "Жесткий сброс: это удалит все данные. Продолжить?",
    "selectUser": "Выбрать пользователя",
    "enterPasswordToUnlock": "Введите пароль для разблокировки",
    "restoringPreviousSession": "Восстановление предыдущей сессии",
    "passwordPlaceholder": "Пароль",
    "incorrectPassword": "Неверный пароль",
    "hint": "Подсказка",
    "enterSystem": "Войти в систему",
    "switchAccount": "Сменить аккаунт",
    "back": "Назад",
    "suspendToSwitch": "Приостановить сессию для переключения?",
    "cancel": "Отмена",
    "switchUser": "Сменить пользователя",
    "logOut": "Выйти",
    "logOutConfirm": "Выйти из {{username}}? Это закроет все открытые окна и отменит несохраненные изменения.",
    "active": "Активен",
    "resume": "Продолжить",
    "sessionActive": "Сессия активна"
  },
  "app": {
    "loadingKernel": "ЗАГРУЗКА ЯДРА..."
  },
  "menubar": {
    "menus": {
      "file": "Файл",
      "shell": "Оболочка",
      "edit": "Правка",
      "format": "Формат",
      "song": "Песня",
      "view": "Вид",
      "go": "Переход",
      "controls": "Управление",
      "window": "Окно",
      "help": "Справка",
      "store": "Магазин",
      "history": "История",
      "bookmarks": "Закладки",
      "mailbox": "Почтовый ящик",
      "message": "Сообщение",
      "devCenter": "DEV Центр",
      "tools": "Инструменты",
      "image": "Изображение",
      "conversations": "Разговоры"
    },
    "items": {
      "newWindow": "Новое окно",
      "newFolder": "Новая папка",
      "open": "Открыть",
      "changeWallpaper": "Сменить обои",
      "closeWindow": "Закрыть окно",
      "undo": "Отменить",
      "redo": "Повторить",
      "cut": "Вырезать",
      "copy": "Копировать",
      "paste": "Вставить",
      "selectAll": "Выбрать все",
      "reload": "Перезагрузить",
      "toggleFullscreen": "Полноэкранный режим",
      "minimize": "Свернуть",
      "bringAllToFront": "Все на передний план",
      "back": "Назад",
      "forward": "Вперед",
      "enclosingFolder": "Родительская папка",
      "getInfo": "Свойства",
      "moveToTrash": "Переместить в корзину"
    },
    "help": {
      "appHelp": "Справка {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Функция не реализована"
    },
    "system": {
      "aboutThisComputer": "Об этом компьютере...",
      "systemSettings": "Системные настройки...",
      "appStore": "App Store...",
      "lockScreen": "Заблокировать экран",
      "switchUser": "Сменить пользователя",
      "user": "Пользователь",
      "logOutAs": "Выйти: {{username}}",
      "viewSystemInfo": "Просмотр информации о системе",
      "viewSystemSettings": "Просмотр настроек системы",
      "returnToLoginWhile": "Вернуться на экран входа,",
      "returnToUserSelectionWhile": "Вернуться на экран выбора пользователя,",
      "keepingSession": "сохраняя сессию",
      "clearingSession": "очищая сессию",
      "panic": "ПАНИКА",
      "hardReset": "Жесткий сброс",
      "warning": "Внимание",
      "panicWarningBody": "Это сбросит {{productName}} до заводских настроек. Полезно как кнопка паники, если что-то пошло не так.",
      "serverTime": "Время сервера (UTC)",
      "localTime": "Местное время"
    },
    "app": {
      "aboutApp": "О приложении {{appName}}",
      "settings": "Настройки...",
      "quitApp": "Завершить {{appName}}"
    }
  },
  "notifications": {
    "title": "Уведомления",
    "titles": {
      "permissionDenied": "Доступ запрещен"
    },
    "clearAll": "Очистить все",
    "new": "Новое",
    "subtitles": {
      "appMissing": "Приложение отсутствует",
      "permissionDenied": "Доступ запрещен",
      "saved": "Сохранено",
      "deleted": "Удалено",
      "moved": "Перемещено",
      "trash": "Корзина",
      "failed": "Ошибка",
      "ui": "Интерфейс",
      "validation": "Валидация",
      "success": "Успех",
      "error": "Ошибка",
      "info": "Инфо",
      "warning": "Предупреждение",
      "fileError": "Ошибка файла"
    },
    "empty": "Нет уведомлений",
    "clearApp": "Очистить все от этого приложения"
  },
  "memory": {
    "title": "Память",
    "used": "Используется",
    "pressure": "Нагрузка",
    "appMemory": "Память приложений",
    "wiredMemory": "Зарезервированная память",
    "processName": "Имя процесса",
    "memory": "Память",
    "swapUsed": "Использованный своп",
    "systemWired": "Система Aurora",
    "activeSession": "Зарезервированная память (Активная сессия)",
    "userSession": "Сессия: {{user}}",
    "backgroundSession": "Спящая память (Фон)",
    "backgroundProcesses": "{{count}} фоновых процессов",
    "instances": "{{count}} экземпляров",
    "type": {
      "mainWindow": "Главное окно",
      "extraWindow": "Дополнительное окно",
      "extraTabs": "{{count}} дополнительных вкладок"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Проверить обновления...",
      "viewMyAccount": "Просмотреть мою учетную запись"
    },
    "categories": {
      "all": "Все",
      "productivity": "Продуктивность",
      "media": "Медиа",
      "utilities": "Утилиты",
      "development": "Разработка",
      "system": "Система"
    },
    "searchPlaceholder": "Поиск приложений...",
    "empty": {
      "title": "Приложения не найдены",
      "description": "Попробуйте изменить поиск или фильтр категории, чтобы найти то, что вы ищете."
    },
    "size": "Размер",
    "sizeUnknown": "Неизвестно",
    "install": "Установить",
    "uninstall": "Удалить",
    "open": "Открыть",
    "cancel": "Отмена",
    "confirm": "Подтвердить",
    "restore": "Восстановить",
    "checkFailed": "Ошибка проверки",
    "checkFailedTitle": "Ошибка проверки установки",
    "restoreSuccess": "{{app}} успешно восстановлено",
    "restoreError": "Не удалось восстановить {{app}}",
    "restorePermissionDenied": "Требуются права администратора для восстановления приложений",
    "installingWarning": "Пожалуйста, подождите, пока приложение устанавливается."
  },
  "browser": {
    "menu": {
      "newTab": "Новая вкладка",
      "closeTab": "Закрыть вкладку"
    },
    "welcome": {
      "searchPlaceholder": "Искать веб-сайты или ввести адрес...",
      "favorites": "Избранное",
      "recentActivity": "Недавняя активность"
    },
    "searchPlaceholder": "Искать или ввести адрес...",
    "error": {
      "pageNotFound": "Страница не найдена",
      "pageNotFoundDesc": "Веб-сайт {{url}} не найден.",
      "goHome": "На главную"
    }
  },
  "music": {
    "sidebar": {
      "library": "Библиотека",
      "songs": "Песни",
      "favorites": "Избранное",
      "recentlyPlayed": "Недавно воспроизведенные"
    },
    "titles": {
      "songs": "Песни",
      "recentlyPlayed": "Недавно воспроизведенные"
    },
    "actions": {
      "playAll": "Воспроизвести все"
    },
    "empty": {
      "recent": {
        "title": "Нет недавно воспроизведенных песен",
        "description": "Ваши недавно воспроизведенные песни появятся здесь."
      },
      "library": {
        "title": "Песни не найдены",
        "description": "В вашей папке Музыка не найдено музыкальных файлов.",
        "openFolder": "Открыть папку {{folder}}"
      }
    },
    "folders": {
      "music": "Музыка",
      "home": "Главная"
    },
    "player": {
      "notPlaying": "Не воспроизводится",
      "selectSong": "Выберите песню"
    },
    "metadata": {
      "unknownArtist": "Неизвестный исполнитель",
      "unknownAlbum": "Неизвестный альбом",
      "unknownTitle": "Неизвестное название"
    },
    "menu": {
      "newPlaylist": "Новый плейлист",
      "import": "Импорт...",
      "closeWindow": "Закрыть окно",
      "showInFinder": "Показать в Finder",
      "addToPlaylist": "Добавить в плейлист",
      "play": "Воспроизвести",
      "previousSong": "Предыдущая песня",
      "nextSong": "Следующая песня",
      "volumeUp": "Увеличить громкость",
      "volumeDown": "Уменьшить громкость"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Новая вкладка",
      "clearScrollback": "Очистить прокрутку",
      "killProcess": "Завершить процесс"
    },
    "help": {
      "availableCommands": "Доступные команды:",
      "usage": "Использование",
      "appLaunchHelp": "Запуск установленных приложений (например, Finder)"
    },
    "commands": {
      "help": {
        "description": "Показать это справочное сообщение"
      },
      "ls": {
        "description": "Список содержимого каталога",
        "usage": "ls [путь]"
      },
      "cd": {
        "description": "Сменить каталог",
        "usage": "cd <путь>"
      },
      "pwd": {
        "description": "Вывести текущий рабочий каталог"
      },
      "logout": {
        "description": "Выйти из текущего сеанса"
      },
      "who": {
        "description": "Показать, кто вошел в систему"
      },
      "clear": {
        "description": "Очистить экран терминала"
      },
      "cat": {
        "description": "Отобразить содержимое файла",
        "usage": "cat <файл>"
      },
      "mkdir": {
        "description": "Создать каталог",
        "usage": "mkdir <имя>"
      },
      "touch": {
        "description": "Создать файл или обновить временную метку",
        "usage": "touch <имя>"
      },
      "rm": {
        "description": "Удалить файл или каталог",
        "usage": "rm <имя>"
      },
      "cp": {
        "description": "Копировать файлы",
        "usage": "cp <источник> <назначение>"
      },
      "mv": {
        "description": "Переместить (переименовать) файлы",
        "usage": "mv <источник> <назначение>"
      },
      "chmod": {
        "description": "Изменить права доступа к файлу",
        "usage": "chmod <режим> <файл>"
      },
      "chown": {
        "description": "Изменить владельца и группу файла",
        "usage": "chown <владелец>[:<группа>] <файл>"
      },
      "grep": {
        "description": "Вывести строки, соответствующие шаблону",
        "usage": "grep <шаблон> <файл>"
      },
      "find": {
        "description": "Поиск файлов в иерархии каталогов",
        "usage": "find [путь] [-name шаблон]"
      },
      "echo": {
        "description": "Отобразить строку текста",
        "usage": "echo [текст]"
      },
      "date": {
        "description": "Вывести системную дату и время"
      },
      "uptime": {
        "description": "Показать время работы системы"
      },
      "whoami": {
        "description": "Вывести текущего пользователя"
      },
      "hostname": {
        "description": "Вывести имя хоста системы"
      },
      "reset": {
        "description": "Сбросить файловую систему до заводских настроек"
      },
      "exit": {
        "description": "Выйти из текущего сеанса оболочки"
      },
      "su": {
        "description": "Сменить ID пользователя или стать суперпользователем",
        "usage": "su [имя_пользователя] [пароль]"
      },
      "sudo": {
        "description": "Выполнить команду от имени другого пользователя",
        "usage": "sudo [опции] [команда]"
      },
      "history": {
        "description": "Показать историю команд терминала",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} скоро появится",
    "descriptions": {
      "mail": "Управляйте электронной почтой, контактами и событиями календаря.",
      "calendar": "Планируйте встречи, события и напоминания.",
      "default": "Это приложение в настоящее время находится в разработке."
    }
  },
  "filePicker": {
    "openFile": "Открыть файл",
    "openFileDescription": "Выберите файл для открытия из файловой системы",
    "saveFile": "Сохранить файл",
    "saveFileDescription": "Выберите место и имя для сохранения файла",
    "emptyFolder": "Эта папка пуста",
    "nameLabel": "Имя:",
    "untitledPlaceholder": "Без названия",
    "toasts": {
      "permissionDenied": "Доступ запрещен: {{name}}"
    },
    "cancel": "Отмена",
    "open": "Открыть",
    "save": "Сохранить"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Приложение Музыка не установлено. Установите его из App Store.",
      "notepadNotInstalled": "Блокнот не установлен. Установите его из App Store.",
      "photosNotInstalled": "Приложение Фото не установлено. Установите его из App Store."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} элементов",
      "bytes": "{{count}} байт",
      "type": "Тип",
      "owner": "Владелец",
      "permissions": "Права",
      "modified": "Изменен",
      "size": "Размер"
    },
    "sidebar": {
      "favorites": "Избранное",
      "system": "Система",
      "locations": "Места"
    },
    "places": {
      "home": "Домой",
      "desktop": "Рабочий стол",
      "documents": "Документы",
      "downloads": "Загрузки",
      "pictures": "Изображения",
      "music": "Музыка",
      "trash": "Корзина"
    },
    "actions": {
      "moveToTrash": "Переместить в корзину",
      "search": "Поиск"
    },
    "toasts": {
      "permissionDenied": "Доступ запрещен: {{name}}",
      "musicNotInstalled": "Приложение Музыка не установлено. Установите его из App Store.",
      "notepadNotInstalled": "Блокнот не установлен. Установите его из App Store.",
      "photosNotInstalled": "Приложение Фото не установлено. Установите его из App Store.",
      "movedItem": "Перемещен 1 элемент",
      "movedItems": "Перемещено {{count}} элементов",
      "movedItemTo": "Перемещен 1 элемент в {{target}}",
      "movedItemsTo": "Перемещено {{count}} элементов в {{target}}",
      "movedItemToTrash": "Перемещен 1 элемент в корзину",
      "movedItemsToTrash": "Перемещено {{count}} элементов в корзину",
      "moveFailedInvalidData": "Ошибка перемещения: Неверные данные",
      "failedToProcessDrop": "Не удалось обработать перетаскивание",
      "couldNotGetInfo": "Не удалось получить информацию",
      "fileTypeNotSupported": "Тип файла '{{type}}' не поддерживается"
    },
    "search": {
      "noResultsTitle": "Результатов не найдено",
      "noResultsDesc": "По запросу \"{{query}}\" ничего не найдено",
      "resultsTitle": "Результаты поиска ({{count}})"
    },
    "emptyFolder": "Эта папка пуста"
  },
  "messages": {
    "title": "Сообщения",
    "sidebar": {
      "conversationsTitle": "Разговоры",
      "allMessages": "Все сообщения",
      "unread": "Непрочитанные",
      "starred": "Избранные"
    },
    "search": {
      "placeholder": "Поиск разговоров..."
    },
    "menu": {
      "newMessage": "Новое сообщение"
    },
    "auth": {
      "welcomeBack": "С возвращением",
      "createAccount": "Создать аккаунт",
      "recoverAccount": "Восстановить аккаунт",
      "signInToContinue": "Войдите, чтобы продолжить в Сообщения",
      "joinSecureNetwork": "Присоединиться к защищенной сети",
      "enterRecoveryKey": "Введите ключ восстановления для доступа",
      "invalidCredentials": "Неверное имя пользователя или пароль",
      "credentialsRetrieved": "Учетные данные восстановлены",
      "password": "Пароль",
      "returnToLogin": "Вернуться к входу",
      "recoveryKey": "Ключ восстановления",
      "username": "Имя пользователя",
      "processing": "Обработка...",
      "signIn": "Войти",
      "create": "Создать аккаунт",
      "recover": "Восстановить пароль",
      "noAccount": "Нет аккаунта? Создать",
      "haveAccount": "Уже есть аккаунт? Войти",
      "forgotPassword": "Забыли пароль?",
      "backToLogin": "Назад к входу",
      "accountCreated": "Аккаунт создан!",
      "saveRecoveryKey": "Пожалуйста, сохраните ключ восстановления. Он понадобится, если вы забудете пароль.",
      "oneTimeShow": "Это единственный раз, когда он будет показан.",
      "savedContinue": "Я сохранил - Продолжить",
      "copied": "Скопировано",
      "recoveryKeyCopied": "Ключ восстановления скопирован в буфер обмена",
      "failedCopy": "Не удалось скопировать ключ",
      "error": "Ошибка"
    },
    "ui": {
      "noConversations": "Нет разговоров",
      "noResults": "Результатов не найдено",
      "noChatSelected": "Чат не выбран",
      "chooseConversation": "Выберите разговор или начните новый.",
      "startNewMessage": "Начать новое сообщение",
      "online": "В сети",
      "typeMessage": "Написать {{partner}}...",
      "unstar": "Убрать из избранного",
      "star": "В избранное",
      "cantMessageSelf": "Вы не можете писать самому себе (пока)",
      "userNotFound": "Пользователь не найден",
      "messageFailed": "Ошибка отправки"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Библиотека",
      "albumsTitle": "Альбомы"
    },
    "library": {
      "allPhotos": "Все фото",
      "favorites": "Избранное",
      "recent": "Недавние"
    },
    "menu": {
      "slideshow": "Слайд-шоу",
      "rotateClockwise": "Повернуть по часовой",
      "rotateCounterClockwise": "Повернуть против часовой"
    },
    "empty": {
      "recent": {
        "title": "Нет недавно просмотренных фото",
        "description": "Ваши недавно открытые фото появятся здесь."
      },
      "favorites": {
        "title": "Нет избранного",
        "description": "Отметьте фото как избранные, чтобы увидеть их здесь."
      },
      "library": {
        "title": "Фото не найдены",
        "description": "В вашей папке Изображения не найдено файлов фотографий.",
        "openFolder": "Открыть папку {{folder}}"
      },
      "noFolder": {
        "title": "Библиотека {{user}} не найдена",
        "description": "Папка {{path}} не найдена для этого пользователя."
      },
      "openHome": "Открыть домашнюю директорию"
    },
    "folders": {
      "pictures": "Изображения"
    }
  },
  "mail": {
    "login": {
      "title": "Почта",
      "subtitle": "Войдите в свой аккаунт",
      "emailPlaceholder": "Email",
      "passwordPlaceholder": "Пароль",
      "signingIn": "Вход...",
      "signIn": "Войти",
      "signOut": "Выйти",
      "createAccountInfo": "Создать аккаунт через почтового провайдера"
    },
    "menu": {
      "newMailbox": "Новый ящик",
      "onlineStatus": "Статус в сети",
      "newMessage": "Новое сообщение",
      "reply": "Ответить",
      "replyAll": "Ответить всем",
      "forward": "Переслать"
    },
    "sidebar": {
      "mailboxes": "Почтовые ящики",
      "inbox": "Входящие",
      "starred": "Избранные",
      "archived": "Архив",
      "trash": "Корзина"
    },
    "search": {
      "placeholder": "Поиск писем..."
    },
    "empty": {
      "noEmails": "Нет писем",
      "noEmailsFound": "Письма не найдены",
      "selectEmail": "Выберите письмо для чтения"
    },
    "actions": {
      "reply": "Ответить",
      "forward": "Переслать",
      "archive": "Архивировать",
      "unarchive": "Разархивировать",
      "delete": "Удалить",
      "restore": "Восстановить",
      "deleteForever": "Удалить навсегда"
    },
    "time": {
      "minutesAgo": "{{minutes}}м назад",
      "hoursAgo": "{{hours}}ч назад",
      "today": "Сегодня",
      "yesterday": "Вчера",
      "daysAgo": "{{days}}д назад"
    },
    "attachments": {
      "count": "{{count}} вложение",
      "count_plural": "{{count}} вложений",
      "download": "Скачать",
      "downloaded": "Скачано",
      "downloadedTo": "{{name}} скачано в {{folder}}",
      "downloadFailed": "Ошибка скачивания",
      "downloadFailedMessage": "Не удалось скачать {{name}}"
    }
  },
  "notepad": {
    "untitled": "Без названия",
    "untitledTab": "Без названия {{index}}",
    "empty": {
      "title": "Блокнот",
      "description": "Создайте новый файл или откройте существующий, чтобы начать.",
      "newFile": "Новый файл",
      "openFile": "Открыть файл"
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
      "txt": "Обычный текст"
    },
    "actions": {
      "openFile": "Открыть файл",
      "saveFile": "Сохранить файл",
      "bold": "Жирный",
      "italic": "Курсив",
      "list": "Список",
      "heading": "Заголовок"
    },
    "preview": {
      "edit": "Редактировать",
      "preview": "Предпросмотр",
      "htmlPreviewTitle": "Предпросмотр HTML"
    },
    "status": {
      "chars": "{{count}} симв.",
      "lines": "Стр. {{count}}"
    },
    "contextSwitcher": {
      "title": "Нажмите для смены контекста",
      "searchPlaceholder": "Поиск языка...",
      "noLanguageFound": "Язык не найден."
    },
    "toasts": {
      "switchedTo": "Переключено на {{language}}",
      "failedToReadFile": "Не удалось прочитать файл",
      "fileSaved": "Файл сохранен",
      "failedToSaveFilePermissions": "Не удалось сохранить файл (Проверьте права)",
      "saved": "Сохранено",
      "failedToSave": "Ошибка сохранения"
    },
    "dialog": {
      "unsaved": {
        "title": "Хотите сохранить изменения?",
        "description": "Ваши изменения будут потеряны, если вы не сохраните их.",
        "dontSave": "Не сохранять",
        "cancel": "Отмена",
        "save": "Сохранить"
      }
    },
    "menu": {
      "new": "Новый",
      "open": "Открыть...",
      "save": "Сохранить",
      "closeTab": "Закрыть вкладку",
      "bold": "Жирный",
      "italic": "Курсив",
      "list": "Список",
      "heading1": "Заголовок 1",
      "heading2": "Заголовок 2",
      "togglePreview": "Переключить предпросмотр",
      "zoomIn": "Увеличить",
      "zoomOut": "Уменьшить"
    }
  },
  "calendar": {
    "menu": {
      "day": "День",
      "week": "Неделя",
      "month": "Месяц",
      "year": "Год"
    },
    "toolbar": {
      "today": "Сегодня",
      "month": "Месяц",
      "day": "День"
    },
    "sidebar": {
      "myCalendars": "Мои календари",
      "filterColors": "Фильтр по цветам"
    },
    "actions": {
      "createEvent": "Создать событие",
      "createCategory": "Создать категорию",
      "clear": "Очистить",
      "delete": "Удалить",
      "cancel": "Отмена",
      "saveEvent": "Сохранить событие"
    },
    "loadingEvents": "Загрузка событий...",
    "toasts": {
      "cannotDeleteSystemCategory": "Системные категории нельзя удалить",
      "eventDeleted": "Событие удалено",
      "eventSaved": "Событие сохранено",
      "requiredFields": "Пожалуйста, заполните обязательные поля"
    },
    "modal": {
      "newEvent": "Новое событие",
      "editEvent": "Редактировать событие",
      "newEventDescription": "Запланируйте новое событие в календаре.",
      "editEventDescription": "Просмотр или редактирование деталей события.",
      "fields": {
        "title": "Название",
        "date": "Дата",
        "time": "Время",
        "duration": "Длительность",
        "type": "Тип",
        "location": "Место",
        "color": "Цвет",
        "notes": "Заметки"
      },
      "placeholders": {
        "eventTitle": "Название события",
        "pickDate": "Выберите дату",
        "searchTime": "Поиск времени...",
        "noTimeFound": "Время не найдено.",
        "selectDuration": "Выберите длительность",
        "searchDuration": "Поиск длительности...",
        "noDurationFound": "Длительность не найдена.",
        "selectType": "Выберите тип",
        "searchType": "Поиск типа...",
        "noTypeFound": "Тип не найден.",
        "addLocation": "Добавить место",
        "addNotes": "Добавить заметки..."
      },
      "durationMinutes": "{{minutes}} мин",
      "minutesOption": "{{minutes}} минут"
    },
    "categories": {
      "all": "Все",
      "work": "Работа",
      "personal": "Личное",
      "social": "Общение",
      "events": "События",
      "family": "Семья"
    },
    "types": {
      "work": "Работа",
      "personal": "Личное",
      "social": "Общение",
      "events": "События",
      "family": "Семья",
      "other": "Другое"
    },
    "colors": {
      "blue": "Синий",
      "green": "Зеленый",
      "red": "Красный",
      "yellow": "Желтый",
      "purple": "Фиолетовый",
      "pink": "Розовый",
      "orange": "Оранжевый",
      "gray": "Серый"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Цикл начат",
        "location": "Turms",
        "notes": "Инициализация файловой системы."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "Общее",
      "dashboard": "Дашборд",
      "interfaceTitle": "Интерфейс",
      "uiAndSounds": "UI и Звуки",
      "systemTitle": "Система",
      "storage": "Хранилище",
      "fileSystem": "Файловая система",
      "appsTitle": "Приложения",
      "performance": "Производительность"
    },
    "dashboard": {
      "title": "Дашборд",
      "description": "Обзор системы скоро появится."
    },
    "ui": {
      "title": "Пользовательский интерфейс и обратная связь",
      "notificationsTitle": "Уведомления",
      "successToast": "Успешное уведомление",
      "warningToast": "Предупреждающее уведомление",
      "errorToast": "Уведомление об ошибке",
      "soundFeedback": "Звуковая обратная связь",
      "buttons": {
        "success": "Успех",
        "warning": "Внимание",
        "error": "Ошибка",
        "app": "Уведомление приложения",
        "open": "Открыть",
        "close": "Закрыть",
        "click": "Клик",
        "hover": "Наведение"
      }
    },
    "storage": {
      "title": "Инспектор хранилища",
      "import": "Импорт",
      "export": "Экспорт",
      "clear": "Очистить",
      "toastTitle": "Хранилище",
      "exportSuccess": "Настройки успешно экспортированы",
      "exportFail": "Не удалось экспортировать настройки",
      "importSuccess": "Настройки успешно импортированы",
      "importFail": "Не удалось прочитать файл импорта",
      "clearConfirm": "Вы уверены, что хотите удалить ВСЁ локальное хранилище? Это сбросит настройки использования, темы и позиции окон.",
      "clearSuccess": "Все ключи очищены",
      "softMemory": "Мягкая память (Настройки)",
      "hardMemory": "Жесткая память (Файловая система)",
      "keysCount": "{{count}} ключей",
      "localStorageKeys": "Ключи Local Storage"
    },
    "filesystem": {
      "title": "Отладчик файловой системы"
    },
    "performance": {
      "title": "Монитор производительности"
    },
    "menu": {
      "resetFilesystem": "Сбросить файловую систему",
      "runDiagnostics": "Запустить диагностику"
    },
    "messages": {
      "createValues": {
        "title": "Создать / Сбросить аккаунт",
        "username": "Имя пользователя",
        "password": "Пароль",
        "button": "Создать аккаунт",
        "success": "Аккаунт {{username}} создан"
      },
      "registry": {
        "title": "Реестр аккаунтов",
        "empty": "Аккаунты не найдены",
        "useInSender": "Использовать в Отправителе",
        "delete": "Удалить аккаунт",
        "deleteConfirm": "Удалить аккаунт {{username}}? Это нельзя отменить.",
        "deleteSuccess": "Аккаунт {{username}} удален"
      },
      "sendMessage": {
        "title": "Отправить сообщение между пользователями",
        "from": "Отправитель (От)",
        "to": "Получатель (Кому)",
        "selectAccount": "Выберите аккаунт...",
        "content": "Содержимое",
        "placeholder": "Введите сообщение...",
        "button": "Отправить сообщение",
        "success": "Сообщение отправлено"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Система",
      "general": "Общее"
    },
    "sections": {
      "appearance": "Внешний вид",
      "performance": "Производительность",
      "displays": "Дисплеи",
      "notifications": "Уведомления",
      "network": "Сеть",
      "security": "Безопасность и Приватность",
      "users": "Пользователи и Группы",
      "storage": "Хранилище",
      "about": "О системе"
    },
    "appearance": {
      "title": "Внешний вид",
      "languageTitle": "Язык",
      "languageDescription": "Выберите язык интерфейса системы",
      "languagePlaceholder": "Выберите язык",
      "wallpaperTitle": "Обои рабочего стола",
      "wallpaperDescription": "Выберите фон для рабочего стола",
      "accentTitle": "Цвет акцента",
      "accentDescription": "Выберите цвет акцента для персонализации",
      "presetColors": "Предустановленные цвета",
      "customColor": "Свой цвет",
      "customColorHint": "Введите hex код (пр. #3b82f6)",
      "preview": "Предпросмотр",
      "previewPrimary": "Основной",
      "previewOutlined": "Контурный",
      "themeModeTitle": "Режим темы",
      "themeModeDescription": "Выберите, как цвет акцента влияет на фон",
      "themeModeNeutralTitle": "Нейтральный",
      "themeModeNeutralDesc": "Только серые тона",
      "themeModeShadesTitle": "Оттенки",
      "themeModeShadesDesc": "Оттенки цвета акцента",
      "themeModeContrastTitle": "Контраст",
      "themeModeContrastDesc": "Дополнительные цвета",
      "themeTitle": "Тема",
      "themeDark": "Темная",
      "themeLightSoon": "Светлая (Скоро)",
      "wallpaperActive": "Активно",
      "wallpaperUse": "Использовать"
    },
    "performance": {
      "blurTitle": "Размытие и Прозрачность",
      "blurDescription": "Включить эффект размытия стекла и прозрачность окон",
      "reduceMotionTitle": "Уменьшить движение",
      "reduceMotionDescription": "Отключить анимации для быстродействия и доступности",
      "disableShadowsTitle": "Отключить тени",
      "disableShadowsDescription": "Убрать тени окон для улучшения отрисовки",
      "disableGradientsTitle": "Отключить градиенты",
      "disableGradientsDescription": "Использовать сплошные цвета вместо градиентов для значков"
    },
    "placeholders": {
      "displaysTitle": "Настройки дисплея",
      "displaysDescription": "Разрешение, масштабирование и яркость скоро появятся.",
      "notificationsTitle": "Уведомления",
      "notificationsDescription": "Настройки центра уведомлений скоро появятся.",
      "networkTitle": "Сеть",
      "networkDescription": "Настройки Wi‑Fi и Bluetooth скоро появятся.",
      "securityTitle": "Безопасность и Приватность",
      "securityDescription": "Брандмауэр, права доступа и настройки приватности скоро появятся.",
      "storageTitle": "Хранилище",
      "storageDescription": "Анализ использования диска и управление скоро появятся."
    },
    "users": {
      "currentUsersTitle": "Текущие пользователи",
      "addUser": "Добавить пользователя",
      "cancel": "Отмена",
      "editAction": "Изменить",
      "newUserDetails": "Детали нового пользователя",
      "usernamePlaceholder": "Имя пользователя (напр. alisa)",
      "fullNamePlaceholder": "Полное имя",
      "passwordOptionalPlaceholder": "Пароль (необязательно)",
      "passwordHintOptionalPlaceholder": "Подсказка пароля (необязательно)",
      "createUser": "Создать пользователя",
      "userExists": "Пользователь уже существует",
      "currentBadge": "Текущий",
      "rootBadge": "Root",
      "adminBadge": "Админ",
      "confirmDeleteUser": "Вы уверены, что хотите удалить {{username}}?",
      "editForm": {
        "fullNameLabel": "Полное имя",
        "roleLabel": "Роль",
        "administrator": "Администратор",
        "newPasswordLabel": "Новый пароль (оставьте пустым, чтобы не менять)",
        "passwordHintLabel": "Подсказка пароля",
        "saveChanges": "Сохранить изменения"
      }
    },
    "about": {
      "version": "Версия",
      "framework": "Фреймворк",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Окружение",
      "browserMode": "Режим браузера",
      "developerMode": "Режим разработчика",
      "developerModeDescription": "Включить расширенные инструменты и функции отладки",
      "exposeRootUser": "Показать Root",
      "exposeRootUserDescription": "Показывать пользователя root на экране входа",
      "memoryUsage": "Использование памяти",
      "preferencesSoft": "Настройки (Мягкая память)",
      "filesystemHard": "Файловая система (Жесткая память)",
      "total": "Всего"
    },
    "danger": {
      "title": "Опасная зона",
      "softResetTitle": "Мягкий сброс",
      "softResetDescription": "Сбрасывает настройки, тему, позиции иконок и состояния приложений. Ваши файлы и папки сохранятся.",
      "resetPreferences": "Сбросить настройки",
      "confirmReset": "Подтвердить сброс",
      "hardResetTitle": "Жесткий сброс",
      "hardResetDescription": "Полностью удаляет все данные, включая файлы, папки и настройки. Это действие нельзя отменить.",
      "hardResetWarning": "⚠️ Все пользовательские файлы и папки будут удалены навсегда",
      "factoryReset": "Заводской сброс",
      "deleteEverything": "Да, удалить всё"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Добро пожаловать в Aurora",
        "description": "Выберите язык, чтобы начать"
      },
      "account": {
        "title": "Создайте аккаунт",
        "description": "Настройте основной аккаунт администратора"
      },
      "theme": {
        "title": "Персонализация",
        "description": "Сделайте его своим"
      },
      "finishing": {
        "title": "Настройка...",
        "description": "Применение конфигурации"
      }
    },
    "account": {
      "fullName": "Полное имя",
      "fullNamePlaceholder": "Пример: Иван Петров",
      "username": "Имя пользователя",
      "password": "Пароль",
      "passwordHint": "Подсказка (Необязательно)",
      "passwordHintPlaceholder": "Пример: Имя первого питомца"
    },
    "theme": {
      "mode": "Режим темы",
      "accentColor": "Цвет акцента",
      "darkMode": "Темный (Нейтральный)",
      "lightMode": "Светлый",
      "comingSoon": "Скоро"
    },
    "finishing": {
      "title": "Все готово!",
      "subtitle": "Aurora OS готова. Перенаправление на экран входа..."
    },
    "search": {
      "placeholder": "Поиск языка...",
      "noResults": "Языки не найдены"
    },
    "validation": {
      "requiredFields": "Пожалуйста, заполните все обязательные поля",
      "passwordLength": "Пароль должен быть не менее 6 символов",
      "userExists": "Пользователь уже существует. Выберите другое имя.",
      "fullNameFormat": "Полное имя должно содержать только буквы, пробелы и дефисы",
      "usernameFormat": "Имя пользователя должно содержать только строчные буквы и цифры",
      "hintLength": "Подсказка слишком длинная (макс. 50 символов)",
      "hintSecurity": "Подсказка не может содержать сам пароль",
      "hintFormat": "Подсказка содержит недопустимые символы",
      "creationFailed": "Не удалось создать аккаунт. Попробуйте еще раз."
    },
    "buttons": {
      "next": "Далее",
      "back": "Назад",
      "startUsing": "Начать использование Aurora"
    }
  },
  "battery": {
    "title": "Батарея",
    "charging": "Зарядка",
    "fullyCharged": "Полностью заряжено",
    "remaining": "{{percentage}}% Осталось",
    "powerSource": "Источник питания:",
    "powerSources": {
      "adapter": "Адаптер питания",
      "battery": "Батарея"
    },
    "condition": "Состояние (Оцен.)",
    "metrics": {
      "health": "Здоровье",
      "cycles": "Циклы",
      "temp": "Темп",
      "voltage": "Напряжение"
    },
    "disclaimer": "Метрики здоровья и состояния батареи являются оценочными на основе доступных датчиков. Реальные значения могут отличаться.",
    "showPercentage": "Показывать проценты в меню"
  },
  "audio": {
    "title": "Звук",
    "muteAll": "Заглушить все",
    "unmute": "Включить звук",
    "masterVolume": "Общая громкость",
    "mixer": "Микшер",
    "categories": {
      "music": "Музыка",
      "system": "Системные",
      "interface": "Интерфейс",
      "feedback": "Обратная связь",
      "ambiance": "Атмосфера"
    },
    "mixerLabels": {
      "masterOutput": "Общий выход",
      "musicAppLevel": "Музыка",
      "sfxInterface": "SFX и Интерфейс",
      "backgroundLoop": "Фоновая петля"
    }
  }
};

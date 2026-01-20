import type { TranslationDict } from '@/i18n/types';

export const zh: TranslationDict = {
  "time": {
    "yesterday": "昨天"
  },
  "common": {
    "name": "名称",
    "color": "颜色",
    "cancel": "取消",
    "save": "保存"
  },
  "game": {
    "intro": {
      "initialize": "初始化系统",
      "clickToStart": "点击开始",
      "skipHint": "ESC 或 空格键跳过"
    },
    "mainMenu": {
      "continue": {
        "label": "继续",
        "desc": {
          "canContinue": "恢复上次的循环",
          "noData": "未找到循环数据"
        }
      },
      "newGame": {
        "label": "新循环",
        "desc": "重新开始（将清除数据）"
      },
      "settings": {
        "label": "BIOS",
        "desc": "配置全局参数"
      },
      "exit": {
        "label": "关机",
        "desc": "终止会话",
        "confirm": {
          "title": "系统关机",
          "message": "确定要关闭系统吗？未保存的进度可能会丢失。",
          "cancel": "取消",
          "confirm": "关机"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "BIOS 设置",
      "fullScreen": "全屏",
      "immersiveMode": "沉浸模式",
      "fullScreenEnter": "进入",
      "fullScreenExit": "退出",
      "softReset": "软重置",
      "softResetHint": "重新加载应用",
      "softResetConfirm": "软重置：这将重新加载应用但保留数据。继续？",
      "factoryReset": "恢复出厂",
      "factoryResetHint": "清除所有数据",
      "factoryResetConfirm": "恢复出厂：这将擦除所有数据、用户和文件。此操作无法撤销。确定要继续吗？"
    },
    "footer": {
      "originalDistribution": "原始发行版",
      "temperedDistribution": "修改发行版"
    }
  },
  "appDescriptions": {
    "finder": "文件管理器",
    "browser": "浏览网页",
    "mail": "收发邮件",
    "appStore": "下载和管理应用",
    "terminal": "命令行界面",
    "systemSettings": "系统设置",
    "notepad": "编辑文本文件",
    "messages": "与好友聊天",
    "calendar": "管理日程",
    "photos": "查看和管理照片",
    "music": "播放音乐",
    "devCenter": "开发者工具"
  },
  "a11y": {
    "common": {
      "close": "关闭",
      "open": "打开",
      "notAvailable": "不可用"
    },
    "sidebar": {
      "toggleSidebar": "切换侧边栏"
    },
    "pagination": {
      "pagination": "分页",
      "goToPreviousPage": "转到上一页",
      "goToNextPage": "转到下一页",
      "previous": "上一页",
      "next": "下一页",
      "morePages": "更多页"
    },
    "breadcrumb": {
      "breadcrumb": "面包屑",
      "more": "更多"
    },
    "carousel": {
      "previousSlide": "上一张",
      "nextSlide": "下一张"
    }
  },
  "commandPalette": {
    "title": "命令面板",
    "description": "搜索要运行的命令..."
  },
  "login": {
    "softReset": "软重置",
    "hardReset": "硬重置",
    "hardResetConfirm": "硬重置：这将清除所有数据。继续？",
    "selectUser": "选择用户",
    "enterPasswordToUnlock": "输入密码以解锁",
    "restoringPreviousSession": "恢复上次会话",
    "passwordPlaceholder": "密码",
    "incorrectPassword": "密码错误",
    "hint": "提示",
    "enterSystem": "进入系统",
    "switchAccount": "切换账户",
    "back": "返回",
    "suspendToSwitch": "挂起会话以切换？",
    "cancel": "取消",
    "switchUser": "切换用户",
    "logOut": "登出",
    "logOutConfirm": "登出 {{username}}？这将关闭所有窗口并丢弃未保存的更改。",
    "active": "活跃",
    "resume": "恢复",
    "sessionActive": "会话已激活"
  },
  "app": {
    "loadingKernel": "正在加载内核..."
  },
  "menubar": {
    "menus": {
      "file": "文件",
      "shell": "终端",
      "edit": "编辑",
      "format": "格式",
      "song": "歌曲",
      "view": "视图",
      "go": "前往",
      "controls": "控制",
      "window": "窗口",
      "help": "帮助",
      "store": "商店",
      "history": "历史",
      "bookmarks": "书签",
      "mailbox": "邮箱",
      "message": "消息",
      "devCenter": "开发者中心",
      "tools": "工具",
      "image": "图片",
      "conversations": "对话"
    },
    "items": {
      "newWindow": "新窗口",
      "newFolder": "新建文件夹",
      "open": "打开",
      "changeWallpaper": "更改壁纸",
      "closeWindow": "关闭窗口",
      "undo": "撤销",
      "redo": "重做",
      "cut": "剪切",
      "copy": "复制",
      "paste": "粘贴",
      "selectAll": "全选",
      "reload": "重新加载",
      "toggleFullscreen": "切换全屏",
      "minimize": "最小化",
      "bringAllToFront": "全部置于最前",
      "back": "后退",
      "forward": "前进",
      "enclosingFolder": "上级文件夹",
      "getInfo": "显示简介",
      "moveToTrash": "移到废纸篓"
    },
    "help": {
      "appHelp": "{{appName}} 帮助"
    },
    "default": {
      "featureNotImplemented": "功能未实现"
    },
    "system": {
      "aboutThisComputer": "关于本机...",
      "systemSettings": "系统设置...",
      "appStore": "应用商店...",
      "lockScreen": "锁定屏幕",
      "switchUser": "切换用户",
      "user": "用户",
      "logOutAs": "登出：{{username}}",
      "viewSystemInfo": "查看系统信息",
      "viewSystemSettings": "查看系统设置",
      "returnToLoginWhile": "返回登录界面时",
      "returnToUserSelectionWhile": "返回用户选择界面时",
      "keepingSession": "保留会话",
      "clearingSession": "清除会话",
      "panic": "紧急",
      "hardReset": "硬重置",
      "warning": "警告",
      "panicWarningBody": "这将把 {{productName}} 恢复为出厂设置。发生故障时可用作紧急按钮。",
      "serverTime": "服务器时间 (UTC)",
      "localTime": "本地时间"
    },
    "app": {
      "aboutApp": "关于 {{appName}}",
      "settings": "设置...",
      "quitApp": "退出 {{appName}}"
    }
  },
  "notifications": {
    "title": "通知",
    "titles": {
      "permissionDenied": "拒绝访问"
    },
    "clearAll": "全部清除",
    "new": "新",
    "subtitles": {
      "appMissing": "应用程序缺失",
      "permissionDenied": "权限被拒绝",
      "saved": "已保存",
      "deleted": "已删除",
      "moved": "已移动",
      "trash": "废纸篓",
      "failed": "失败",
      "ui": "界面",
      "validation": "验证",
      "success": "成功",
      "error": "错误",
      "info": "信息",
      "warning": "警告",
      "fileError": "文件错误"
    },
    "empty": "暂无通知",
    "clearApp": "清除此应用所有通知"
  },
  "memory": {
    "title": "内存",
    "used": "已用",
    "pressure": "压力",
    "appMemory": "应用内存",
    "wiredMemory": "联动内存",
    "processName": "进程名称",
    "memory": "内存",
    "swapUsed": "已用交换空间",
    "systemWired": "Aurora 系统",
    "activeSession": "联动内存 (当前会话)",
    "userSession": "会话: {{user}}",
    "backgroundSession": "休眠内存 (后台)",
    "backgroundProcesses": "{{count}} 个后台进程",
    "instances": "{{count}} 个实例",
    "type": {
      "mainWindow": "主窗口",
      "extraWindow": "额外窗口",
      "extraTabs": "{{count}} 个额外标签页"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "检查更新...",
      "viewMyAccount": "查看我的账户"
    },
    "categories": {
      "all": "全部",
      "productivity": "效率",
      "media": "媒体",
      "utilities": "实用工具",
      "development": "开发",
      "system": "系统"
    },
    "searchPlaceholder": "搜索应用...",
    "empty": {
      "title": "未找到应用",
      "description": "尝试调整搜索或分类过滤以找到所需内容。"
    },
    "size": "大小",
    "sizeUnknown": "未知",
    "install": "安装",
    "uninstall": "卸载",
    "open": "打开",
    "cancel": "取消",
    "confirm": "确认",
    "restore": "恢复",
    "checkFailed": "Check Failed",
    "checkFailedTitle": "Installation Check Failed",
    "restoreSuccess": "{{app}} restored successfully",
    "restoreError": "Failed to restore {{app}}",
    "restorePermissionDenied": "Admin privileges required to restore apps",
    "installingWarning": "正在安装应用程序，请稍候。"
  },
  "browser": {
    "menu": {
      "newTab": "新标签页",
      "closeTab": "关闭标签页"
    },
    "welcome": {
      "searchPlaceholder": "搜索网站或输入地址...",
      "favorites": "收藏",
      "recentActivity": "最近活动"
    },
    "searchPlaceholder": "搜索或输入地址...",
    "error": {
      "pageNotFound": "页面未找到",
      "pageNotFoundDesc": "无法找到网站 {{url}}。",
      "goHome": "前往首页"
    }
  },
  "music": {
    "sidebar": {
      "library": "库",
      "songs": "歌曲",
      "favorites": "收藏",
      "recentlyPlayed": "最近播放"
    },
    "titles": {
      "songs": "歌曲",
      "recentlyPlayed": "最近播放"
    },
    "actions": {
      "playAll": "全部播放"
    },
    "empty": {
      "recent": {
        "title": "暂无最近播放歌曲",
        "description": "你最近播放的歌曲会显示在这里。"
      },
      "library": {
        "title": "未找到歌曲",
        "description": "在你的音乐文件夹中未找到音乐文件。",
        "openFolder": "打开 {{folder}} 文件夹"
      }
    },
    "folders": {
      "music": "音乐",
      "home": "主页"
    },
    "player": {
      "notPlaying": "未播放",
      "selectSong": "选择一首歌"
    },
    "metadata": {
      "unknownArtist": "未知艺术家",
      "unknownAlbum": "未知专辑",
      "unknownTitle": "未知曲目"
    },
    "menu": {
      "newPlaylist": "新建歌单",
      "import": "导入...",
      "closeWindow": "关闭窗口",
      "showInFinder": "在文件管理器中显示",
      "addToPlaylist": "添加到歌单",
      "play": "播放",
      "previousSong": "上一首",
      "nextSong": "下一首",
      "volumeUp": "增加音量",
      "volumeDown": "降低音量"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "新建标签页",
      "clearScrollback": "清除回滚",
      "killProcess": "结束进程"
    },
    "help": {
      "availableCommands": "可用命令：",
      "usage": "用法",
      "appLaunchHelp": "启动已安装的应用（例如 Finder）"
    },
    "commands": {
      "help": {
        "description": "显示此帮助信息"
      },
      "ls": {
        "description": "列出目录内容",
        "usage": "ls [path]"
      },
      "cd": {
        "description": "切换目录",
        "usage": "cd <path>"
      },
      "pwd": {
        "description": "显示当前目录"
      },
      "logout": {
        "description": "注销当前会话"
      },
      "who": {
        "description": "显示当前登录用户"
      },
      "clear": {
        "description": "清除终端屏幕"
      },
      "cat": {
        "description": "显示文件内容",
        "usage": "cat <file>"
      },
      "mkdir": {
        "description": "创建目录",
        "usage": "mkdir <name>"
      },
      "touch": {
        "description": "创建文件或更新时间戳",
        "usage": "touch <name>"
      },
      "rm": {
        "description": "删除文件或目录",
        "usage": "rm <name>"
      },
      "cp": {
        "description": "复制文件",
        "usage": "cp <source> <dest>"
      },
      "mv": {
        "description": "移动（重命名）文件",
        "usage": "mv <source> <dest>"
      },
      "chmod": {
        "description": "更改文件权限",
        "usage": "chmod <mode> <file>"
      },
      "chown": {
        "description": "更改文件所有者和组",
        "usage": "chown <owner>[:<group>] <file>"
      },
      "grep": {
        "description": "打印匹配模式的行",
        "usage": "grep <pattern> <file>"
      },
      "find": {
        "description": "在目录层次结构中搜索文件",
        "usage": "find [path] [-name pattern]"
      },
      "echo": {
        "description": "显示一行文本",
        "usage": "echo [text]"
      },
      "date": {
        "description": "显示系统日期和时间"
      },
      "uptime": {
        "description": "显示系统运行时间"
      },
      "whoami": {
        "description": "显示当前用户"
      },
      "hostname": {
        "description": "显示系统主机名"
      },
      "reset": {
        "description": "将文件系统重置为出厂默认值"
      },
      "exit": {
        "description": "退出当前 Shell 会话"
      },
      "su": {
        "description": "更改用户 ID 或成为超级用户",
        "usage": "su [username] [password]"
      },
      "sudo": {
        "description": "以其他用户身份执行命令",
        "usage": "sudo [options] [command]"
      },
      "history": {
        "description": "显示终端命令历史",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} 即将推出",
    "descriptions": {
      "mail": "管理你的邮件、联系人和日历事件。",
      "calendar": "安排会议、活动和提醒。",
      "default": "此应用程序目前正在开发中。"
    }
  },
  "filePicker": {
    "openFile": "打开文件",
    "openFileDescription": "从文件系统中选择要打开的文件",
    "saveFile": "保存文件",
    "saveFileDescription": "选择保存文件的位置和名称",
    "emptyFolder": "此文件夹为空",
    "nameLabel": "名称：",
    "untitledPlaceholder": "未命名",
    "toasts": {
      "permissionDenied": "权限被拒绝：{{name}}"
    },
    "cancel": "取消",
    "open": "打开",
    "save": "保存"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "音乐应用未安装。请从应用商店安装。",
      "notepadNotInstalled": "记事本未安装。请从应用商店安装。",
      "photosNotInstalled": "照片应用未安装。请从应用商店安装。"
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} 个项目",
      "bytes": "{{count}} 字节",
      "type": "类型",
      "owner": "所有者",
      "permissions": "权限",
      "modified": "修改日期",
      "size": "大小"
    },
    "sidebar": {
      "favorites": "收藏",
      "system": "系统",
      "locations": "位置"
    },
    "places": {
      "home": "主目录",
      "desktop": "桌面",
      "documents": "文稿",
      "downloads": "下载",
      "pictures": "图片",
      "music": "音乐",
      "trash": "废纸篓"
    },
    "actions": {
      "moveToTrash": "移到废纸篓",
      "search": "搜索"
    },
    "toasts": {
      "permissionDenied": "权限被拒绝：{{name}}",
      "musicNotInstalled": "音乐应用未安装。请从应用商店安装。",
      "notepadNotInstalled": "记事本未安装。请从应用商店安装。",
      "photosNotInstalled": "照片应用未安装。请从应用商店安装。",
      "movedItem": "已移动 1 个项目",
      "movedItems": "已移动 {{count}} 个项目",
      "movedItemTo": "已将 1 个项目移动到 {{target}}",
      "movedItemsTo": "已将 {{count}} 个项目移动到 {{target}}",
      "movedItemToTrash": "已将 1 个项目移动到废纸篓",
      "movedItemsToTrash": "已将 {{count}} 个项目移动到废纸篓",
      "moveFailedInvalidData": "移动失败：无效数据",
      "failedToProcessDrop": "处理拖放失败",
      "couldNotGetInfo": "无法获取信息",
      "fileTypeNotSupported": "不支持的文件类型 '{{type}}'"
    },
    "search": {
      "noResultsTitle": "未找到结果",
      "noResultsDesc": "未找到关于 \"{{query}}\" 的结果",
      "resultsTitle": "搜索结果 ({{count}})"
    },
    "emptyFolder": "此文件夹为空"
  },
  "messages": {
    "title": "消息",
    "sidebar": {
      "conversationsTitle": "对话",
      "allMessages": "所有消息",
      "unread": "未读",
      "starred": "星标"
    },
    "search": {
      "placeholder": "搜索对话..."
    },
    "menu": {
      "newMessage": "新消息"
    },
    "auth": {
      "welcomeBack": "欢迎回来",
      "createAccount": "创建账户",
      "recoverAccount": "恢复账户",
      "signInToContinue": "登录以继续使用消息",
      "joinSecureNetwork": "加入安全网络",
      "enterRecoveryKey": "输入恢复密钥以重新获取访问权限",
      "invalidCredentials": "无效的用户名或密码",
      "credentialsRetrieved": "凭据已恢复",
      "password": "密码",
      "returnToLogin": "返回登录",
      "recoveryKey": "恢复密钥",
      "username": "用户名",
      "processing": "处理中...",
      "signIn": "登录",
      "create": "创建",
      "recover": "恢复",
      "noAccount": "没有账户？创建一个",
      "haveAccount": "已有账户？登录",
      "forgotPassword": "忘记密码？",
      "backToLogin": "返回登录",
      "accountCreated": "账户已创建！",
      "saveRecoveryKey": "请保存您的恢复密钥。如果您忘记密码，将需要它。",
      "oneTimeShow": "这将是唯一一次显示它的机会。",
      "savedContinue": "我已保存 - 继续",
      "copied": "已复制",
      "recoveryKeyCopied": "恢复密钥已复制到剪贴板",
      "failedCopy": "复制密钥失败",
      "error": "错误"
    },
    "ui": {
      "noConversations": "暂无对话",
      "noResults": "未找到结果",
      "noChatSelected": "未选择聊天",
      "chooseConversation": "选择一个对话或开始新的对话。",
      "startNewMessage": "开始新消息",
      "online": "在线",
      "typeMessage": "发消息给 {{partner}}...",
      "unstar": "取消星标",
      "star": "星标",
      "cantMessageSelf": "您不能给自己发送消息（暂时）",
      "userNotFound": "用户未找到",
      "messageFailed": "发送失败"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "资料库",
      "albumsTitle": "相册"
    },
    "library": {
      "allPhotos": "所有照片",
      "favorites": "收藏",
      "recent": "最近"
    },
    "menu": {
      "slideshow": "幻灯片",
      "rotateClockwise": "顺时针旋转",
      "rotateCounterClockwise": "逆时针旋转"
    },
    "empty": {
      "recent": {
        "title": "没有最近查看的照片",
        "description": "你最近打开的照片将显示在这里。"
      },
      "favorites": {
        "title": "尚无收藏",
        "description": "将照片标记为收藏即可在此处查看。"
      },
      "library": {
        "title": "未找到照片",
        "description": "在你的图片文件夹中未找到照片文件。",
        "openFolder": "打开 {{folder}} 文件夹"
      },
      "noFolder": {
        "title": "未找到 {{user}} 的资料库",
        "description": "找不到该用户的文件夹 {{path}}。"
      },
      "openHome": "打开主目录"
    },
    "folders": {
      "pictures": "图片"
    }
  },
  "mail": {
    "login": {
      "title": "邮件",
      "subtitle": "登录你的账户",
      "emailPlaceholder": "邮箱",
      "passwordPlaceholder": "密码",
      "signingIn": "登录中...",
      "signIn": "登录",
      "signOut": "登出",
      "createAccountInfo": "通过电子邮件提供商创建账户"
    },
    "menu": {
      "newMailbox": "新建邮箱",
      "onlineStatus": "在线状态",
      "newMessage": "新消息",
      "reply": "回复",
      "replyAll": "全部回复",
      "forward": "转发"
    },
    "sidebar": {
      "mailboxes": "邮箱",
      "inbox": "收件箱",
      "starred": "星标",
      "archived": "已归档",
      "trash": "废纸篓"
    },
    "search": {
      "placeholder": "搜索邮件..."
    },
    "empty": {
      "noEmails": "无邮件",
      "noEmailsFound": "未找到邮件",
      "selectEmail": "选择一封邮件以阅读"
    },
    "actions": {
      "reply": "回复",
      "forward": "转发",
      "archive": "归档",
      "unarchive": "取消归档",
      "delete": "删除",
      "restore": "恢复",
      "deleteForever": "永久删除"
    },
    "time": {
      "minutesAgo": "{{minutes}} 分钟前",
      "hoursAgo": "{{hours}} 小时前",
      "today": "今天",
      "yesterday": "昨天",
      "daysAgo": "{{days}} 天前"
    },
    "attachments": {
      "count": "{{count}} 个附件",
      "count_plural": "{{count}} 个附件",
      "download": "下载",
      "downloaded": "已下载",
      "downloadedTo": "{{name}} 已下载到 {{folder}}",
      "downloadFailed": "下载失败",
      "downloadFailedMessage": "无法下载 {{name}}"
    }
  },
  "notepad": {
    "untitled": "未命名",
    "untitledTab": "未命名 {{index}}",
    "empty": {
      "title": "记事本",
      "description": "创建新文件或打开现有文件以开始。",
      "newFile": "新建文件",
      "openFile": "打开文件"
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
      "txt": "纯文本"
    },
    "actions": {
      "openFile": "打开文件",
      "saveFile": "保存文件",
      "bold": "粗体",
      "italic": "斜体",
      "list": "列表",
      "heading": "标题"
    },
    "preview": {
      "edit": "编辑",
      "preview": "预览",
      "htmlPreviewTitle": "HTML 预览"
    },
    "status": {
      "chars": "{{count}} 个字符",
      "lines": "第 {{count}} 行"
    },
    "contextSwitcher": {
      "title": "点击切换上下文",
      "searchPlaceholder": "搜索语言...",
      "noLanguageFound": "未找到语言。"
    },
    "toasts": {
      "switchedTo": "已切换到 {{language}}",
      "failedToReadFile": "读取文件失败",
      "fileSaved": "文件已保存",
      "failedToSaveFilePermissions": "保存文件失败（检查权限）",
      "saved": "已保存",
      "failedToSave": "保存失败"
    },
    "dialog": {
      "unsaved": {
        "title": "要保存更改吗？",
        "description": "如果不保存，你的更改将会丢失。",
        "dontSave": "不保存",
        "cancel": "取消",
        "save": "保存"
      }
    },
    "menu": {
      "new": "新建",
      "open": "打开...",
      "save": "保存",
      "closeTab": "关闭标签页",
      "bold": "粗体",
      "italic": "斜体",
      "list": "列表",
      "heading1": "标题 1",
      "heading2": "标题 2",
      "togglePreview": "切换预览",
      "zoomIn": "放大",
      "zoomOut": "缩小"
    }
  },
  "calendar": {
    "menu": {
      "day": "日",
      "week": "周",
      "month": "月",
      "year": "年"
    },
    "toolbar": {
      "today": "今天",
      "month": "月",
      "day": "日"
    },
    "sidebar": {
      "myCalendars": "我的日历",
      "filterColors": "筛选颜色"
    },
    "actions": {
      "createEvent": "创建事件",
      "createCategory": "创建类别",
      "clear": "清除",
      "delete": "删除",
      "cancel": "取消",
      "saveEvent": "保存事件"
    },
    "loadingEvents": "正在加载事件...",
    "toasts": {
      "cannotDeleteSystemCategory": "系统类别无法删除",
      "eventDeleted": "事件已删除",
      "eventSaved": "事件已保存",
      "requiredFields": "请填写必填字段"
    },
    "modal": {
      "newEvent": "新建事件",
      "editEvent": "编辑事件",
      "newEventDescription": "在日历上安排新事件。",
      "editEventDescription": "查看或编辑事件详情。",
      "fields": {
        "title": "标题",
        "date": "日期",
        "time": "时间",
        "duration": "时长",
        "type": "类型",
        "location": "地点",
        "color": "颜色",
        "notes": "备注"
      },
      "placeholders": {
        "eventTitle": "事件标题",
        "pickDate": "选择日期",
        "searchTime": "搜索时间...",
        "noTimeFound": "未找到时间。",
        "selectDuration": "选择时长",
        "searchDuration": "搜索时长...",
        "noDurationFound": "未找到时长。",
        "selectType": "选择类型",
        "searchType": "搜索类型...",
        "noTypeFound": "未找到类型。",
        "addLocation": "添加地点",
        "addNotes": "添加备注..."
      },
      "durationMinutes": "{{minutes}} 分钟",
      "minutesOption": "{{minutes}} 分钟"
    },
    "categories": {
      "all": "全部",
      "work": "工作",
      "personal": "个人",
      "social": "社交",
      "events": "活动",
      "family": "家庭"
    },
    "types": {
      "work": "工作",
      "personal": "个人",
      "social": "社交",
      "events": "活动",
      "family": "家庭",
      "other": "其他"
    },
    "colors": {
      "blue": "蓝色",
      "green": "绿色",
      "red": "红色",
      "yellow": "黄色",
      "purple": "紫色",
      "pink": "粉色",
      "orange": "橙色",
      "gray": "灰色"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "循环已开始",
        "location": "Turms",
        "notes": "初始文件系统。"
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "常规",
      "dashboard": "仪表盘",
      "interfaceTitle": "界面",
      "uiAndSounds": "界面与声音",
      "systemTitle": "系统",
      "storage": "存储",
      "fileSystem": "文件系统",
      "appsTitle": "应用",
      "performance": "性能"
    },
    "dashboard": {
      "title": "仪表板",
      "description": "系统概览即将推出。"
    },
    "ui": {
      "title": "界面与反馈",
      "notificationsTitle": "通知",
      "successToast": "成功提示",
      "warningToast": "警告提示",
      "errorToast": "错误提示",
      "soundFeedback": "声音反馈",
      "buttons": {
        "success": "成功",
        "warning": "警告",
        "error": "错误",
        "app": "应用通知",
        "open": "打开",
        "close": "关闭",
        "click": "点击",
        "hover": "悬停"
      }
    },
    "storage": {
      "title": "存储检查器",
      "import": "导入",
      "export": "导出",
      "clear": "清除",
      "toastTitle": "存储",
      "exportSuccess": "首选项导出成功",
      "exportFail": "导出首选项失败",
      "importSuccess": "首选项导入成功",
      "importFail": "解析导入文件失败",
      "clearConfirm": "确定要清除所有本地存储吗？这将重置使用偏好、主题设置和窗口位置。",
      "clearSuccess": "所有键已清除",
      "softMemory": "软内存（首选项）",
      "hardMemory": "硬内存（文件系统）",
      "keysCount": "{{count}} 个键",
      "localStorageKeys": "本地存储键"
    },
    "filesystem": {
      "title": "文件系统调试器"
    },
    "performance": {
      "title": "性能监视器"
    },
    "menu": {
      "resetFilesystem": "重置文件系统",
      "runDiagnostics": "运行诊断"
    },
    "messages": {
      "createValues": {
        "title": "创建 / 重置账户",
        "username": "用户名",
        "password": "密码",
        "button": "创建账户",
        "success": "账户 {{username}} 已创建"
      },
      "registry": {
        "title": "账户注册表",
        "empty": "未找到账户",
        "useInSender": "用作发送者",
        "delete": "删除账户",
        "deleteConfirm": "删除账户 {{username}}？此操作无法撤销。",
        "deleteSuccess": "账户 {{username}} 已删除"
      },
      "sendMessage": {
        "title": "发送消息",
        "from": "发送者 (From)",
        "to": "接收者 (To)",
        "selectAccount": "选择账户...",
        "content": "内容",
        "placeholder": "输入消息...",
        "button": "发送消息",
        "success": "消息已发送"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "系统",
      "general": "通用"
    },
    "sections": {
      "appearance": "外观",
      "performance": "性能",
      "displays": "显示器",
      "notifications": "通知",
      "network": "网络",
      "security": "安全与隐私",
      "users": "用户与群组",
      "storage": "存储",
      "about": "关于"
    },
    "appearance": {
      "title": "外观",
      "languageTitle": "语言",
      "languageDescription": "选择系统界面的显示语言",
      "languagePlaceholder": "选择语言",
      "wallpaperTitle": "桌面壁纸",
      "wallpaperDescription": "为桌面环境选择背景",
      "accentTitle": "强调色",
      "accentDescription": "选择强调色以个性化你的桌面体验",
      "presetColors": "预设颜色",
      "customColor": "自定义颜色",
      "customColorHint": "输入十六进制颜色代码（例如 #3b82f6）",
      "preview": "预览",
      "previewPrimary": "主要",
      "previewOutlined": "轮廓",
      "themeModeTitle": "主题模式",
      "themeModeDescription": "选择强调色如何影响背景色调",
      "themeModeNeutralTitle": "中性",
      "themeModeNeutralDesc": "仅使用自然灰色",
      "themeModeShadesTitle": "色调",
      "themeModeShadesDesc": "强调色色调",
      "themeModeContrastTitle": "对比",
      "themeModeContrastDesc": "互补色",
      "themeTitle": "主题",
      "themeDark": "深色",
      "themeLightSoon": "浅色（即将推出）",
      "wallpaperActive": "当前",
      "wallpaperUse": "使用"
    },
    "performance": {
      "blurTitle": "模糊与透明度",
      "blurDescription": "启用玻璃模糊效果和窗口透明度",
      "reduceMotionTitle": "减少动画",
      "reduceMotionDescription": "禁用动画以加快响应速度并提高可访问性",
      "disableShadowsTitle": "禁用阴影",
      "disableShadowsDescription": "移除窗口阴影以提高渲染性能",
      "disableGradientsTitle": "禁用渐变",
      "disableGradientsDescription": "使用纯色代替图标渐变"
    },
    "placeholders": {
      "displaysTitle": "显示器设置",
      "displaysDescription": "分辨率、缩放和亮度控制即将推出。",
      "notificationsTitle": "通知",
      "notificationsDescription": "通知中心首选项即将推出。",
      "networkTitle": "网络",
      "networkDescription": "Wi‑Fi 和蓝牙配置即将推出。",
      "securityTitle": "安全与隐私",
      "securityDescription": "防火墙、权限和隐私设置即将推出。",
      "storageTitle": "存储",
      "storageDescription": "磁盘使用情况分析和管理即将推出。"
    },
    "users": {
      "currentUsersTitle": "当前用户",
      "addUser": "添加用户",
      "cancel": "取消",
      "editAction": "编辑",
      "newUserDetails": "新用户详情",
      "usernamePlaceholder": "用户名（例如 alice）",
      "fullNamePlaceholder": "全名",
      "passwordOptionalPlaceholder": "密码（可选）",
      "passwordHintOptionalPlaceholder": "密码提示（可选）",
      "createUser": "创建用户",
      "userExists": "用户已存在",
      "currentBadge": "当前",
      "rootBadge": "Root",
      "adminBadge": "管理员",
      "confirmDeleteUser": "确定要删除 {{username}} 吗？",
      "editForm": {
        "fullNameLabel": "全名",
        "roleLabel": "角色",
        "administrator": "管理员",
        "newPasswordLabel": "新密码（留空保持不变）",
        "passwordHintLabel": "密码提示",
        "saveChanges": "保存更改"
      }
    },
    "about": {
      "version": "版本",
      "framework": "框架",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "环境",
      "browserMode": "浏览器模式",
      "developerMode": "开发者模式",
      "developerModeDescription": "启用高级工具和调试功能",
      "exposeRootUser": "显示 Root 用户",
      "exposeRootUserDescription": "在登录界面显示 root 用户",
      "memoryUsage": "内存使用情况",
      "preferencesSoft": "首选项（软内存）",
      "filesystemHard": "文件系统（硬内存）",
      "total": "总计"
    },
    "danger": {
      "title": "危险区域",
      "softResetTitle": "软重置",
      "softResetDescription": "重置首选项、主题设置、桌面图标位置和应用状态。你的文件和文件夹将被保留。",
      "resetPreferences": "重置首选项",
      "confirmReset": "确认重置",
      "hardResetTitle": "硬重置",
      "hardResetDescription": "完全清除所有数据，包括文件、文件夹和设置。此操作无法撤销。",
      "hardResetWarning": "⚠️ 所有自定义文件和文件夹将被永久删除",
      "factoryReset": "恢复出厂",
      "deleteEverything": "是的，删除所有内容"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "欢迎使用 Aurora",
        "description": "选择语言以开始"
      },
      "account": {
        "title": "创建你的账户",
        "description": "设置主管理员账户"
      },
      "theme": {
        "title": "个性化",
        "description": "定制你的体验"
      },
      "finishing": {
        "title": "正在设置...",
        "description": "应用配置"
      }
    },
    "account": {
      "fullName": "全名",
      "fullNamePlaceholder": "例如：张三",
      "username": "用户名",
      "password": "密码",
      "passwordHint": "密码提示（可选）",
      "passwordHintPlaceholder": "例如：你第一只宠物的名字"
    },
    "theme": {
      "mode": "主题模式",
      "accentColor": "强调色",
      "darkMode": "深色（中性）",
      "lightMode": "浅色",
      "comingSoon": "即将推出"
    },
    "finishing": {
      "title": "一切就绪！",
      "subtitle": "Aurora OS 已准备就绪。正在跳转到登录界面..."
    },
    "search": {
      "placeholder": "搜索语言...",
      "noResults": "未找到语言"
    },
    "validation": {
      "requiredFields": "请填写所有必填字段",
      "passwordLength": "密码长度必须至少为 6 个字符",
      "userExists": "用户已存在。请选择其他用户名。",
      "fullNameFormat": "全名只能包含字母、空格和连字符",
      "usernameFormat": "用户名只能包含小写字母和数字",
      "hintLength": "密码提示过长（最多 50 个字符）",
      "hintSecurity": "密码提示不能包含密码本身",
      "hintFormat": "密码提示包含无效字符",
      "creationFailed": "创建账户失败。请重试。"
    },
    "buttons": {
      "next": "下一步",
      "back": "返回",
      "startUsing": "开始使用 Aurora"
    }
  },
  "battery": {
    "title": "电池",
    "charging": "正在充电",
    "fullyCharged": "已充满",
    "remaining": "剩余 {{percentage}}%",
    "powerSource": "电源：",
    "powerSources": {
      "adapter": "电源适配器",
      "battery": "电池"
    },
    "condition": "状况（估计）",
    "metrics": {
      "health": "健康度",
      "cycles": "循环次数",
      "temp": "温度",
      "voltage": "电压"
    },
    "disclaimer": "电池健康度和状况指标是基于可用系统传感器的估计值。实际值可能有所不同。",
    "showPercentage": "在菜单栏中显示百分比"
  },
  "audio": {
    "title": "声音",
    "muteAll": "全部静音",
    "unmute": "取消静音",
    "masterVolume": "主音量",
    "mixer": "混音器",
    "categories": {
      "music": "音乐",
      "system": "系统提示",
      "interface": "界面",
      "feedback": "输入反馈",
      "ambiance": "环境音效"
    },
    "mixerLabels": {
      "masterOutput": "主输出",
      "musicAppLevel": "音乐应用音量",
      "sfxInterface": "音效与界面",
      "backgroundLoop": "背景循环"
    }
  }
};

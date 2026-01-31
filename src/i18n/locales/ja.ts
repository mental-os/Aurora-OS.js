import type { TranslationDict } from '@/i18n/types';

export const ja: TranslationDict = {
  "time": {
    "yesterday": "昨日"
  },
  "common": {
    "name": "名前",
    "color": "色",
    "cancel": "キャンセル",
    "save": "保存"
  },
  "game": {
    "intro": {
      "initialize": "システム初期化",
      "clickToStart": "クリックして開始",
      "skipHint": "ESC または スペースキーでスキップ"
    },
    "mainMenu": {
      "continue": {
        "label": "続ける",
        "desc": {
          "canContinue": "前回のループを再開",
          "noData": "ループデータが見つかりません"
        }
      },
      "newGame": {
        "label": "新しいループ",
        "desc": "最初から始める (データ消去)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "グローバル設定"
      },
      "exit": {
        "label": "シャットダウン",
        "desc": "セッションを終了",
        "confirm": {
          "title": "システムシャットダウン",
          "message": "システムをシャットダウンしてもよろしいですか？保存されていない進行状況は失われる可能性があります。",
          "cancel": "キャンセル",
          "confirm": "シャットダウン"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "BIOS設定",
      "hardwareAcceleration": "ハードウェアアクセラレーション",
      "fullScreen": "フルスクリーン",
      "immersiveMode": "没入モード",
      "fullScreenEnter": "入る",
      "fullScreenExit": "出る",
      "softReset": "ソフトリセット",
      "softResetHint": "アプリケーションをリロード",
      "softResetConfirm": "ソフトリセット：アプリケーションをリロードしますが、データは保持されます。続けますか？",
      "factoryReset": "工場出荷時リセット",
      "factoryResetHint": "全データを消去",
      "factoryResetConfirm": "工場出荷時リセット：すべてのデータ、ユーザー、ファイルを完全に消去します。この操作は取り消せません。本当によろしいですか？"
    },
    "footer": {
      "originalDistribution": "オリジナルディストリビューション",
      "temperedDistribution": "変更されたディストリビューション"
    }
  },
  "appDescriptions": {
    "finder": "ファイルマネージャー",
    "browser": "ウェブアクセス",
    "mail": "メールの読み書き",
    "appStore": "アプリのダウンロードと管理",
    "terminal": "コマンドラインインターフェース",
    "systemSettings": "システム設定",
    "notepad": "テキストファイルの編集",
    "messages": "友達とチャット",
    "calendar": "スケジュールの管理",
    "photos": "写真の表示と管理",
    "music": "音楽を再生",
    "devCenter": "開発者ツール"
  },
  "a11y": {
    "common": {
      "close": "閉じる",
      "open": "開く",
      "notAvailable": "N/A"
    },
    "sidebar": {
      "toggleSidebar": "サイドバーを切り替え"
    },
    "pagination": {
      "pagination": "ページネーション",
      "goToPreviousPage": "前のページへ",
      "goToNextPage": "次のページへ",
      "previous": "前へ",
      "next": "次へ",
      "morePages": "その他のページ"
    },
    "breadcrumb": {
      "breadcrumb": "パンくずリスト",
      "more": "もっと見る"
    },
    "carousel": {
      "previousSlide": "前のスライド",
      "nextSlide": "次のスライド"
    }
  },
  "commandPalette": {
    "title": "コマンドパレット",
    "description": "実行するコマンドを検索..."
  },
  "login": {
    "softReset": "ソフトリセット",
    "hardReset": "ハードリセット",
    "hardResetConfirm": "ハードリセット：すべてのデータを消去します。続けますか？",
    "selectUser": "ユーザーを選択",
    "enterPasswordToUnlock": "パスワードを入力してロック解除",
    "restoringPreviousSession": "前のセッションを復元中",
    "passwordPlaceholder": "パスワード",
    "incorrectPassword": "パスワードが間違っています",
    "hint": "ヒント",
    "enterSystem": "システムに入る",
    "switchAccount": "アカウントを切り替え",
    "back": "戻る",
    "suspendToSwitch": "セッションを中断して切り替えますか？",
    "cancel": "キャンセル",
    "switchUser": "ユーザーを切り替え",
    "logOut": "ログアウト",
    "logOutConfirm": "{{username}} をログアウトしますか？すべてのウィンドウが閉じられ、保存されていない変更は破棄されます。",
    "active": "アクティブ",
    "resume": "再開",
    "sessionActive": "セッションアクティブ"
  },
  "app": {
    "loadingKernel": "カーネルを読み込み中..."
  },
  "menubar": {
    "menus": {
      "file": "ファイル",
      "shell": "シェル",
      "edit": "編集",
      "format": "フォーマット",
      "song": "曲",
      "view": "表示",
      "go": "移動",
      "controls": "コントロール",
      "window": "ウィンドウ",
      "help": "ヘルプ",
      "store": "ストア",
      "history": "履歴",
      "bookmarks": "ブックマーク",
      "mailbox": "メールボックス",
      "message": "メッセージ",
      "devCenter": "DEVセンター",
      "tools": "ツール",
      "image": "画像",
      "conversations": "会話"
    },
    "items": {
      "newWindow": "新規ウィンドウ",
      "newFolder": "新規フォルダ",
      "open": "開く",
      "changeWallpaper": "壁紙を変更",
      "closeWindow": "ウィンドウを閉じる",
      "undo": "取り消し",
      "redo": "やり直し",
      "cut": "切り取り",
      "copy": "コピー",
      "paste": "貼り付け",
      "selectAll": "すべて選択",
      "reload": "リロード",
      "toggleFullscreen": "フルスクリーン切り替え",
      "minimize": "最小化",
      "bringAllToFront": "すべてを手前に移動",
      "back": "戻る",
      "forward": "進む",
      "enclosingFolder": "親フォルダ",
      "getInfo": "情報を見る",
      "moveToTrash": "ゴミ箱に入れる"
    },
    "help": {
      "appHelp": "{{appName}} ヘルプ"
    },
    "default": {
      "featureNotImplemented": "機能は実装されていません"
    },
    "system": {
      "aboutThisComputer": "このコンピュータについて...",
      "systemSettings": "システム設定...",
      "appStore": "App Store...",
      "lockScreen": "画面をロック",
      "switchUser": "ユーザーを切り替え",
      "user": "ユーザー",
      "logOutAs": "ログアウト: {{username}}",
      "viewSystemInfo": "システム情報を表示",
      "viewSystemSettings": "システム設定を表示",
      "returnToLoginWhile": "ログイン画面に戻ります（",
      "returnToUserSelectionWhile": "ユーザー選択画面に戻ります（",
      "keepingSession": "セッションを保持",
      "clearingSession": "セッションを消去",
      "panic": "パニック",
      "hardReset": "ハードリセット",
      "warning": "警告",
      "panicWarningBody": "これにより {{productName}} は工場出荷時の設定にリセットされます。何か問題が発生した場合のパニックボタンとしても機能します。",
      "serverTime": "サーバー時間 (UTC)",
      "localTime": "現地時間"
    },
    "app": {
      "aboutApp": "{{appName}} について",
      "settings": "設定...",
      "quitApp": "{{appName}} を終了"
    }
  },
  "notifications": {
    "title": "通知",
    "titles": {
      "permissionDenied": "アクセス拒否"
    },
    "clearAll": "すべて消去",
    "new": "新規",
    "subtitles": {
      "appMissing": "アプリが見つかりません",
      "permissionDenied": "アクセス拒否",
      "saved": "保存しました",
      "deleted": "削除しました",
      "moved": "移動しました",
      "trash": "ゴミ箱",
      "failed": "失敗",
      "ui": "インターフェース",
      "validation": "検証",
      "success": "成功",
      "error": "エラー",
      "info": "情報",
      "warning": "警告",
      "fileError": "ファイルエラー"
    },
    "empty": "通知はありません",
    "clearApp": "このアプリからの通知をすべて消去",
    "messageFrom": "Message from {{sender}}"
  },
  "memory": {
    "title": "メモリ",
    "used": "使用中",
    "pressure": "負荷",
    "appMemory": "アプリメモリ",
    "wiredMemory": "確保されたメモリ",
    "processName": "プロセス名",
    "memory": "メモリ",
    "swapUsed": "スワップ使用量",
    "systemWired": "Aurora システム",
    "activeSession": "確保されたメモリ (アクティブセッション)",
    "userSession": "セッション: {{user}}",
    "backgroundSession": "休止メモリ (バックグラウンド)",
    "backgroundProcesses": "{{count}} バックグラウンドプロセス",
    "instances": "{{count}} インスタンス",
    "type": {
      "mainWindow": "メインウィンドウ",
      "extraWindow": "追加ウィンドウ",
      "extraTabs": "{{count}} 追加タブ"
    },
    "error": {
      "title": "メモリ不足",
      "description": "{{appName}}を開けません。利用可能なRAMが不足しています。"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "アップデートを確認...",
      "viewMyAccount": "マイアカウントを表示"
    },
    "categories": {
      "all": "すべて",
      "productivity": "仕事効率化",
      "media": "メディア",
      "utilities": "ユーティリティ",
      "development": "開発",
      "system": "システム"
    },
    "searchPlaceholder": "アプリを検索...",
    "empty": {
      "title": "アプリが見つかりません",
      "description": "検索条件やカテゴリフィルターを変更して、お探しのものを見つけてください。"
    },
    "size": "サイズ",
    "sizeUnknown": "不明",
    "install": "入手",
    "uninstall": "アンインストール",
    "open": "開く",
    "cancel": "キャンセル",
    "confirm": "確認",
    "restore": "復元",
    "checkFailed": "確認に失敗しました",
    "checkFailedTitle": "インストール確認エラー",
    "restoreSuccess": "{{app}} を正常に復元しました",
    "restoreError": "{{app}} の復元に失敗しました",
    "restorePermissionDenied": "アプリの復元には管理者権限が必要です",
    "installingWarning": "アプリケーションをインストールしています。しばらくお待ちください。"
  },
  "browser": {
    "menu": {
      "newTab": "新しいタブ",
      "closeTab": "タブを閉じる"
    },
    "welcome": {
      "title": "Browser",
      "description": "Search for information or enter a URL to start browsing.",
      "searchPlaceholder": "ウェブサイトを検索またはアドレスを入力...",
      "favorites": "お気に入り",
      "recentActivity": "最近のアクティビティ"
    },
    "searchPlaceholder": "検索またはアドレスを入力...",
    "error": {
      "pageNotFound": "ページが見つかりません",
      "pageNotFoundDesc": "ウェブサイト {{url}} は見つかりませんでした。",
      "goHome": "ホームへ"
    }
  },
  "music": {
    "sidebar": {
      "library": "ライブラリ",
      "songs": "曲",
      "favorites": "お気に入り",
      "recentlyPlayed": "最近再生した項目"
    },
    "titles": {
      "songs": "曲",
      "recentlyPlayed": "最近再生した項目"
    },
    "actions": {
      "playAll": "すべて再生"
    },
    "empty": {
      "recent": {
        "title": "最近再生した曲はありません",
        "description": "最近再生した曲がここに表示されます。"
      },
      "library": {
        "title": "曲が見つかりません",
        "description": "ミュージックフォルダに音楽ファイルが見つかりませんでした。",
        "openFolder": "{{folder}} フォルダを開く"
      }
    },
    "folders": {
      "music": "ミュージック",
      "home": "ホーム"
    },
    "player": {
      "notPlaying": "再生停止中",
      "selectSong": "曲を選択"
    },
    "metadata": {
      "unknownArtist": "不明なアーティスト",
      "unknownAlbum": "不明なアルバム",
      "unknownTitle": "不明なタイトル"
    },
    "menu": {
      "newPlaylist": "新規プレイリスト",
      "import": "インポート...",
      "closeWindow": "ウィンドウを閉じる",
      "showInFinder": "Finderで表示",
      "addToPlaylist": "プレイリストに追加",
      "play": "再生",
      "previousSong": "前の曲",
      "nextSong": "次の曲",
      "volumeUp": "音量を上げる",
      "volumeDown": "音量を下げる"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "新しいタブ",
      "clearScrollback": "スクロールバックを消去",
      "killProcess": "プロセスを終了"
    },
    "help": {
      "availableCommands": "利用可能なコマンド:",
      "usage": "使用法",
      "appLaunchHelp": "インストールされたアプリケーションを起動 (例: Finder)"
    },
    "commands": {
      "help": {
        "description": "このヘルプメッセージを表示"
      },
      "ls": {
        "description": "ディレクトリの内容を一覧表示",
        "usage": "ls [パス]"
      },
      "cd": {
        "description": "ディレクトリを変更",
        "usage": "cd <パス>"
      },
      "pwd": {
        "description": "現在の作業ディレクトリを表示"
      },
      "logout": {
        "description": "現在のセッションからログアウト"
      },
      "who": {
        "description": "ログイン中のユーザーを表示"
      },
      "clear": {
        "description": "ターミナル画面をクリア"
      },
      "cat": {
        "description": "ファイルの内容を表示",
        "usage": "cat <ファイル>"
      },
      "mkdir": {
        "description": "ディレクトリを作成",
        "usage": "mkdir <名前>"
      },
      "touch": {
        "description": "ファイルを作成またはタイムスタンプを更新",
        "usage": "touch <名前>"
      },
      "rm": {
        "description": "ファイルまたはディレクトリを削除",
        "usage": "rm <名前>"
      },
      "cp": {
        "description": "ファイルをコピー",
        "usage": "cp <元> <先>"
      },
      "mv": {
        "description": "ファイルを移動 (名前変更)",
        "usage": "mv <元> <先>"
      },
      "chmod": {
        "description": "ファイルモード (権限) を変更",
        "usage": "chmod <モード> <ファイル>"
      },
      "chown": {
        "description": "ファイルの所有者とグループを変更",
        "usage": "chown <所有者>[:<グループ>] <ファイル>"
      },
      "grep": {
        "description": "パターンに一致する行を表示",
        "usage": "grep <パターン> <ファイル>"
      },
      "find": {
        "description": "ディレクトリ階層内のファイルを検索",
        "usage": "find [パス] [-name パターン]"
      },
      "echo": {
        "description": "テキスト行を表示",
        "usage": "echo [テキスト]"
      },
      "date": {
        "description": "システムの日付と時刻を表示"
      },
      "uptime": {
        "description": "システムの稼働時間を表示"
      },
      "whoami": {
        "description": "現在のユーザーを表示"
      },
      "hostname": {
        "description": "システムのホスト名を表示"
      },
      "reset": {
        "description": "ファイルシステムを工場出荷時の設定にリセット"
      },
      "exit": {
        "description": "現在のシェルセッションを終了"
      },
      "su": {
        "description": "ユーザーIDを変更またはスーパーユーザーになる",
        "usage": "su [ユーザー名] [パスワード]"
      },
      "sudo": {
        "description": "別のユーザーとしてコマンドを実行",
        "usage": "sudo [オプション] [コマンド]"
      },
      "history": {
        "description": "ターミナルのコマンド履歴を表示",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} は近日公開予定",
    "descriptions": {
      "mail": "メール、連絡先、カレンダーのイベントを管理します。",
      "calendar": "会議、イベント、リマインダーをスケジュールします。",
      "default": "このアプリケーションは現在開発中です。"
    }
  },
  "filePicker": {
    "openFile": "ファイルを開く",
    "openFileDescription": "ファイルシステムから開くファイルを選択",
    "saveFile": "ファイルを保存",
    "saveFileDescription": "ファイルの保存場所と名前を選択",
    "emptyFolder": "このフォルダは空です",
    "nameLabel": "名前:",
    "untitledPlaceholder": "無題",
    "toasts": {
      "permissionDenied": "アクセス拒否: {{name}}"
    },
    "cancel": "キャンセル",
    "open": "開く",
    "save": "保存"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Music アプリがインストールされていません。App Storeからインストールしてください。",
      "notepadNotInstalled": "Notepad はインストールされていません。App Storeからインストールしてください。",
      "photosNotInstalled": "Photos アプリがインストールされていません。App Storeからインストールしてください。"
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} 項目",
      "bytes": "{{count}} バイト",
      "type": "種類",
      "owner": "所有者",
      "permissions": "権限",
      "modified": "変更日",
      "size": "サイズ"
    },
    "sidebar": {
      "favorites": "よく使う項目",
      "system": "システム",
      "locations": "場所"
    },
    "places": {
      "home": "ホーム",
      "desktop": "デスクトップ",
      "documents": "書類",
      "downloads": "ダウンロード",
      "pictures": "ピクチャ",
      "music": "ミュージック",
      "trash": "ゴミ箱"
    },
    "actions": {
      "moveToTrash": "ゴミ箱に入れる",
      "search": "検索"
    },
    "toasts": {
      "permissionDenied": "アクセス拒否: {{name}}",
      "musicNotInstalled": "Music アプリがインストールされていません。App Storeからインストールしてください。",
      "notepadNotInstalled": "Notepad はインストールされていません。App Storeからインストールしてください。",
      "photosNotInstalled": "Photos アプリがインストールされていません。App Storeからインストールしてください。",
      "movedItem": "1 項目を移動しました",
      "movedItems": "{{count}} 項目を移動しました",
      "movedItemTo": "1 項目を {{target}} に移動しました",
      "movedItemsTo": "{{count}} 項目を {{target}} に移動しました",
      "movedItemToTrash": "1 項目をゴミ箱に移動しました",
      "movedItemsToTrash": "{{count}} 項目をゴミ箱に移動しました",
      "moveFailedInvalidData": "移動失敗: 無効なデータ",
      "failedToProcessDrop": "ドロップの処理に失敗しました",
      "couldNotGetInfo": "情報を取得できませんでした",
      "fileTypeNotSupported": "ファイル形式 '{{type}}' はサポートされていません"
    },
    "search": {
      "noResultsTitle": "結果が見つかりません",
      "noResultsDesc": "\"{{query}}\" に対する結果は見つかりませんでした",
      "resultsTitle": "検索結果 ({{count}})"
    },
    "emptyFolder": "このフォルダは空です"
  },
  "messages": {
    "title": "メッセージ",
    "sidebar": {
      "conversationsTitle": "会話",
      "allMessages": "すべてのメッセージ",
      "unread": "未読",
      "starred": "スター付き"
    },
    "search": {
      "placeholder": "会話を検索..."
    },
    "menu": {
      "newMessage": "新規メッセージ"
    },
    "auth": {
      "welcomeBack": "おかえりなさい",
      "createAccount": "アカウント作成",
      "recoverAccount": "アカウント復旧",
      "signInToContinue": "サインインしてメッセージを続ける",
      "joinSecureNetwork": "セキュアネットワークに参加",
      "enterRecoveryKey": "アクセスを回復するにはリカバリキーを入力してください",
      "invalidCredentials": "ユーザー名またはパスワードが無効です",
      "credentialsRetrieved": "認証情報を取得しました",
      "password": "パスワード",
      "returnToLogin": "ログインに戻る",
      "recoveryKey": "リカバリキー",
      "username": "ユーザー名",
      "processing": "処理中...",
      "signIn": "サインイン",
      "create": "アカウント作成",
      "recover": "パスワード復旧",
      "noAccount": "アカウントをお持ちでないですか？ 作成する",
      "haveAccount": "すでにアカウントをお持ちですか？ サインイン",
      "forgotPassword": "パスワードをお忘れですか？",
      "backToLogin": "ログインに戻る",
      "accountCreated": "アカウントを作成しました！",
      "saveRecoveryKey": "リカバリキーを保存してください。パスワードを忘れた場合に必要になります。",
      "oneTimeShow": "これは一度だけ表示されます。",
      "savedContinue": "保存しました - 続ける",
      "copied": "コピーしました",
      "recoveryKeyCopied": "リカバリキーをクリップボードにコピーしました",
      "failedCopy": "キーのコピーに失敗しました",
      "error": "エラー"
    },
    "ui": {
      "noConversations": "会話はありません",
      "noResults": "結果が見つかりません",
      "noChatSelected": "チャットが選択されていません",
      "chooseConversation": "会話を選択するか、新しく始めましょう。",
      "startNewMessage": "新しいメッセージを作成",
      "online": "オンライン",
      "typeMessage": "{{partner}} にメッセージ...",
      "unstar": "スターを外す",
      "star": "スターを付ける",
      "cantMessageSelf": "自分にメッセージは送れません（今のところ）",
      "userNotFound": "ユーザーが見つかりません",
      "messageFailed": "送信失敗"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "ライブラリ",
      "albumsTitle": "アルバム"
    },
    "library": {
      "allPhotos": "すべての写真",
      "favorites": "お気に入り",
      "recent": "最近の項目",
      "userLibrary": "{{user}}'s Library"
    },
    "menu": {
      "slideshow": "スライドショー",
      "rotateClockwise": "時計回りに回転",
      "rotateCounterClockwise": "反時計回りに回転"
    },
    "empty": {
      "recent": {
        "title": "最近表示した写真はありません",
        "description": "最近開いた写真がここに表示されます。"
      },
      "favorites": {
        "title": "お気に入りはまだありません",
        "description": "写真を「お気に入り」にするとここに表示されます。"
      },
      "library": {
        "title": "写真が見つかりません",
        "description": "ピクチャフォルダに写真ファイルが見つかりませんでした。",
        "openFolder": "{{folder}} フォルダを開く"
      },
      "noFolder": {
        "title": "{{user}} のライブラリが見つかりません",
        "description": "パス {{path}} はこのユーザーには見つかりませんでした。"
      },
      "openHome": "ホームディレクトリを開く"
    },
    "folders": {
      "pictures": "ピクチャ",
      "recent": "Recent",
      "misc": "Misc"
    }
  },
  "mail": {
    "login": {
      "title": "メール",
      "subtitle": "アカウントにサインイン",
      "emailPlaceholder": "メールアドレス",
      "passwordPlaceholder": "パスワード",
      "signingIn": "サインイン中...",
      "signIn": "サインイン",
      "signOut": "サインアウト",
      "createAccountInfo": "メールプロバイダー経由でアカウントを作成"
    },
    "menu": {
      "newMailbox": "新規メールボックス",
      "onlineStatus": "オンラインステータス",
      "newMessage": "新規メッセージ",
      "reply": "返信",
      "replyAll": "全員に返信",
      "forward": "転送"
    },
    "sidebar": {
      "mailboxes": "メールボックス",
      "inbox": "受信トレイ",
      "starred": "スター付き",
      "archived": "アーカイブ",
      "trash": "ゴミ箱"
    },
    "search": {
      "placeholder": "メールを検索..."
    },
    "empty": {
      "noEmails": "メールはありません",
      "noEmailsFound": "メールが見つかりません",
      "selectEmail": "メールを選択して読む"
    },
    "actions": {
      "reply": "返信",
      "forward": "転送",
      "archive": "アーカイブ",
      "unarchive": "アーカイブ解除",
      "delete": "削除",
      "restore": "復元",
      "deleteForever": "完全に削除"
    },
    "time": {
      "minutesAgo": "{{minutes}}分前",
      "hoursAgo": "{{hours}}時間前",
      "today": "今日",
      "yesterday": "昨日",
      "daysAgo": "{{days}}日前"
    },
    "attachments": {
      "count": "{{count}} 個の添付ファイル",
      "count_plural": "{{count}} 個の添付ファイル",
      "download": "ダウンロード",
      "downloaded": "ダウンロード済み",
      "downloadedTo": "{{name}} を {{folder}} にダウンロードしました",
      "downloadFailed": "ダウンロード失敗",
      "downloadFailedMessage": "{{name}} のダウンロードに失敗しました"
    }
  },
  "notepad": {
    "untitled": "無題",
    "untitledTab": "無題 {{index}}",
    "empty": {
      "title": "メモ帳",
      "description": "新しいファイルを作成するか、既存のファイルを開いて始めましょう。",
      "newFile": "新規ファイル",
      "openFile": "ファイルを開く"
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
      "txt": "プレーンテキスト"
    },
    "actions": {
      "openFile": "ファイルを開く",
      "saveFile": "ファイルを保存",
      "bold": "太字",
      "italic": "斜体",
      "list": "リスト",
      "heading": "見出し"
    },
    "preview": {
      "edit": "編集",
      "preview": "プレビュー",
      "htmlPreviewTitle": "HTML プレビュー"
    },
    "status": {
      "chars": "{{count}} 文字",
      "lines": "{{count}} 行"
    },
    "contextSwitcher": {
      "title": "クリックしてコンテキストを切り替え",
      "searchPlaceholder": "言語を検索...",
      "noLanguageFound": "言語が見つかりません。"
    },
    "toasts": {
      "switchedTo": "{{language}} に切り替えました",
      "failedToReadFile": "ファイルの読み込みに失敗しました",
      "fileSaved": "ファイルを保存しました",
      "failedToSaveFilePermissions": "ファイルの保存に失敗しました（権限を確認してください）",
      "saved": "保存しました",
      "failedToSave": "保存に失敗しました"
    },
    "dialog": {
      "unsaved": {
        "title": "変更を保存しますか？",
        "description": "保存しないと変更内容は失われます。",
        "dontSave": "保存しない",
        "cancel": "キャンセル",
        "save": "保存"
      }
    },
    "menu": {
      "new": "新規",
      "open": "開く...",
      "save": "保存",
      "closeTab": "タブを閉じる",
      "bold": "太字",
      "italic": "斜体",
      "list": "リスト",
      "heading1": "見出し 1",
      "heading2": "見出し 2",
      "togglePreview": "プレビューを切り替え",
      "zoomIn": "拡大",
      "zoomOut": "縮小"
    }
  },
  "calendar": {
    "menu": {
      "day": "日",
      "week": "週",
      "month": "月",
      "year": "年"
    },
    "toolbar": {
      "today": "今日",
      "month": "月",
      "day": "日"
    },
    "sidebar": {
      "myCalendars": "マイカレンダー",
      "filterColors": "色でフィルタ"
    },
    "actions": {
      "createEvent": "イベントを作成",
      "createCategory": "カテゴリを作成",
      "clear": "クリア",
      "delete": "削除",
      "cancel": "キャンセル",
      "saveEvent": "イベントを保存"
    },
    "loadingEvents": "イベントを読み込み中...",
    "toasts": {
      "cannotDeleteSystemCategory": "システムカテゴリは削除できません",
      "eventDeleted": "イベントを削除しました",
      "eventSaved": "イベントを保存しました",
      "requiredFields": "必須項目を入力してください"
    },
    "modal": {
      "newEvent": "新規イベント",
      "editEvent": "イベントを編集",
      "newEventDescription": "カレンダーに新しいイベントをスケジュールします。",
      "editEventDescription": "イベントの詳細を表示または編集します。",
      "fields": {
        "title": "タイトル",
        "date": "日付",
        "time": "時間",
        "duration": "期間",
        "type": "種類",
        "location": "場所",
        "color": "色",
        "notes": "メモ"
      },
      "placeholders": {
        "eventTitle": "イベントのタイトル",
        "pickDate": "日付を選択",
        "searchTime": "時間を検索...",
        "noTimeFound": "時間が見つかりません。",
        "selectDuration": "期間を選択",
        "searchDuration": "期間を検索...",
        "noDurationFound": "期間が見つかりません。",
        "selectType": "種類を選択",
        "searchType": "種類を検索...",
        "noTypeFound": "種類が見つかりません。",
        "addLocation": "場所を追加",
        "addNotes": "メモを追加..."
      },
      "durationMinutes": "{{minutes}} 分",
      "minutesOption": "{{minutes}} 分"
    },
    "categories": {
      "all": "すべて",
      "work": "仕事",
      "personal": "個人",
      "social": "ソーシャル",
      "events": "イベント",
      "family": "家族"
    },
    "types": {
      "work": "仕事",
      "personal": "個人",
      "social": "ソーシャル",
      "events": "イベント",
      "family": "家族",
      "other": "その他"
    },
    "colors": {
      "blue": "青",
      "green": "緑",
      "red": "赤",
      "yellow": "黄",
      "purple": "紫",
      "pink": "ピンク",
      "orange": "オレンジ",
      "gray": "グレー"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "ループ開始",
        "location": "Turms",
        "notes": "ファイルシステムの初期化。"
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "一般",
      "dashboard": "ダッシュボード",
      "interfaceTitle": "インターフェース",
      "uiAndSounds": "UI とサウンド",
      "systemTitle": "システム",
      "storage": "ストレージ",
      "fileSystem": "ファイルシステム",
      "appsTitle": "アプリ",
      "performance": "パフォーマンス"
    },
    "dashboard": {
      "title": "ダッシュボード",
      "description": "システム概要は近日公開予定。"
    },
    "ui": {
      "title": "ユーザーインターフェース & フィードバック",
      "notificationsTitle": "通知",
      "successToast": "成功トースト",
      "warningToast": "警告トースト",
      "errorToast": "エラートースト",
      "soundFeedback": "サウンドフィードバック",
      "buttons": {
        "success": "成功",
        "warning": "警告",
        "error": "エラー",
        "app": "アプリ通知",
        "open": "開く",
        "close": "閉じる",
        "click": "クリック",
        "hover": "ホバー"
      }
    },
    "storage": {
      "title": "ストレージインスペクタ",
      "import": "インポート",
      "export": "エクスポート",
      "clear": "クリア",
      "toastTitle": "ストレージ",
      "exportSuccess": "設定を正常にエクスポートしました",
      "exportFail": "設定のエクスポートに失敗しました",
      "importSuccess": "設定を正常にインポートしました",
      "importFail": "インポートファイルの解析に失敗しました",
      "clearConfirm": "すべてのローカルストレージを消去してもよろしいですか？使用設定、テーマ設定、ウィンドウ位置がリセットされます。",
      "clearSuccess": "すべてのキーを消去しました",
      "softMemory": "ソフトメモリ (設定)",
      "hardMemory": "ハードメモリ (ファイルシステム)",
      "keysCount": "{{count}} キー",
      "localStorageKeys": "ローカルストレージキー"
    },
    "filesystem": {
      "title": "ファイルシステムデバッガ"
    },
    "performance": {
      "title": "パフォーマンスモニター"
    },
    "menu": {
      "resetFilesystem": "ファイルシステムをリセット",
      "runDiagnostics": "診断を実行"
    },
    "messages": {
      "createValues": {
        "title": "アカウント作成 / リセット",
        "username": "ユーザー名",
        "password": "パスワード",
        "button": "アカウント作成",
        "success": "アカウント {{username}} を作成しました"
      },
      "registry": {
        "title": "アカウントレジストリ",
        "empty": "アカウントが見つかりません",
        "useInSender": "送信者で使用",
        "delete": "アカウント削除",
        "deleteConfirm": "アカウント {{username}} を削除しますか？この操作は元に戻せません。",
        "deleteSuccess": "アカウント {{username}} を削除しました"
      },
      "sendMessage": {
        "title": "ユーザー間メッセージ送信",
        "from": "送信者 (From)",
        "to": "受信者 (To)",
        "selectAccount": "アカウントを選択...",
        "content": "内容",
        "placeholder": "メッセージを入力...",
        "button": "メッセージを送信",
        "success": "メッセージを送信しました"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "システム",
      "general": "一般"
    },
    "sections": {
      "appearance": "外観",
      "performance": "パフォーマンス",
      "displays": "ディスプレイ",
      "notifications": "通知",
      "network": "ネットワーク",
      "security": "セキュリティとプライバシー",
      "users": "ユーザーとグループ",
      "storage": "ストレージ",
      "about": "概要"
    },
    "appearance": {
      "title": "外観",
      "languageTitle": "言語",
      "languageDescription": "システムUIの表示言語を選択",
      "languagePlaceholder": "言語を選択",
      "wallpaperTitle": "デスクトップの壁紙",
      "wallpaperDescription": "デスクトップ環境の背景を選択",
      "accentTitle": "アクセントカラー",
      "accentDescription": "デスクトップ体験をカスタマイズするためのアクセントカラーを選択",
      "presetColors": "プリセットカラー",
      "customColor": "カスタムカラー",
      "customColorHint": "16進カラーコードを入力 (例: #3b82f6)",
      "preview": "プレビュー",
      "previewPrimary": "プライマリ",
      "previewOutlined": "アウトライン",
      "themeModeTitle": "テーマモード",
      "themeModeDescription": "アクセントカラーが背景の色合いにどう影響するかを選択",
      "themeModeNeutralTitle": "ニュートラル",
      "themeModeNeutralDesc": "自然なグレーのみ",
      "themeModeShadesTitle": "シェード",
      "themeModeShadesDesc": "アクセントカラーの色合い",
      "themeModeContrastTitle": "コントラスト",
      "themeModeContrastDesc": "補色",
      "themeTitle": "テーマ",
      "themeDark": "ダーク",
      "themeLightSoon": "ライト (近日公開)",
      "wallpaperActive": "アクティブ",
      "wallpaperUse": "使用"
    },
    "performance": {
      "blurTitle": "ぼかしと透明度",
      "blurDescription": "すりガラス効果とウィンドウの透明化を有効にする",
      "reduceMotionTitle": "視差効果を減らす",
      "reduceMotionDescription": "アニメーションを無効にして応答性とアクセシビリティを向上",
      "disableShadowsTitle": "影を無効化",
      "disableShadowsDescription": "ウィンドウの影を削除して描画パフォーマンスを向上",
      "disableGradientsTitle": "グラデーションを無効化",
      "disableGradientsDescription": "アイコンにグラデーションの代わりに単色を使用",
      "gpuTitle": "グラフィックスアクセラレーションを使用",
      "gpuDescription": "利用可能な場合はハードウェアアクセラレーションを使用（再起動が必要）"
    },
    "network": {
      "wifiTitle": "Wi-Fi",
      "wifiConnected": "{{network}} に接続済み",
      "wifiDisabled": "Wi-Fi はオフです",
      "bluetoothTitle": "Bluetooth",
      "bluetoothConnected": "{{device}} に接続済み",
      "bluetoothDisabled": "Bluetooth はオフです",
      "wifiNetworks": "利用可能なネットワーク",
      "scanning": "スキャン中...",
      "enterPassword": "パスワードを入力",
      "passwordPlaceholder": "パスワード",
      "connect": "接続",
      "disconnect": "切断",
      "configurationMode": "構成モード",
      "automatic": "自動 (DHCP)",
      "manual": "手動",
      "autoConfigTitle": "自動構成",
      "manualConfigTitle": "手動構成",
      "ipAddress": "IPアドレス",
      "subnetMask": "サブネットマスク",
      "gateway": "ゲートウェイ",
      "dns": "DNSサーバー",
      "validateConfig": "構成を検証",
      "invalidIP": "無効なIPアドレス",
      "invalidGateway": "無効なゲートウェイ",
      "invalidSubnetMask": "無効なサブネットマスク",
      "invalidDNS": "無効なDNSサーバー",
      "gatewayNotInSubnet": "ゲートウェイがIPアドレスと同じサブネットにありません",
      "configSaved": "ネットワーク構成が正常に保存されました",
      "dhcpAttributionProgress": "DHCP経由でIPアドレスを取得中"
    },
    "placeholders": {
      "displaysTitle": "ディスプレイ設定",
      "displaysDescription": "解像度、スケーリング、明るさの制御は近日公開予定。",
      "notificationsTitle": "通知",
      "notificationsDescription": "通知センターの設定は近日公開予定。",
      "networkTitle": "ネットワーク",
      "networkDescription": "Wi‑Fi と Bluetooth の設定は近日公開予定。",
      "securityTitle": "セキュリティとプライバシー",
      "securityDescription": "ファイアウォール、権限、プライバシー設定は近日公開予定。",
      "storageTitle": "ストレージ",
      "storageDescription": "ディスク使用量の分析と管理は近日公開予定。"
    },
    "users": {
      "currentUsersTitle": "現在のユーザー",
      "addUser": "ユーザーを追加",
      "cancel": "キャンセル",
      "editAction": "編集",
      "newUserDetails": "新規ユーザーの詳細",
      "usernamePlaceholder": "ユーザー名 (例: taro)",
      "fullNamePlaceholder": "フルネーム",
      "passwordOptionalPlaceholder": "パスワード (任意)",
      "passwordHintOptionalPlaceholder": "パスワードのヒント (任意)",
      "createUser": "ユーザーを作成",
      "userExists": "ユーザーはすでに存在します",
      "currentBadge": "現在",
      "rootBadge": "Root",
      "adminBadge": "管理者",
      "confirmDeleteUser": "{{username}} を削除してもよろしいですか？",
      "editForm": {
        "fullNameLabel": "フルネーム",
        "roleLabel": "役割",
        "administrator": "管理者",
        "newPasswordLabel": "新しいパスワード (変更しない場合は空のまま)",
        "passwordHintLabel": "パスワードのヒント",
        "saveChanges": "変更を保存"
      }
    },
    "about": {
      "version": "バージョン",
      "framework": "フレームワーク",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "環境",
      "browserMode": "ブラウザモード",
      "developerMode": "開発者モード",
      "developerModeDescription": "高度なツールとデバッグ機能を有効にする",
      "exposeRootUser": "Root ユーザーを表示",
      "exposeRootUserDescription": "ログイン画面に root ユーザーを表示する",
      "memoryUsage": "メモリ使用量",
      "preferencesSoft": "設定 (ソフトメモリ)",
      "filesystemHard": "ファイルシステム (ハードメモリ)",
      "total": "合計"
    },
    "danger": {
      "title": "危険ゾーン",
      "softResetTitle": "ソフトリセット",
      "softResetDescription": "設定、テーマ設定、デスクトップアイコンの位置、アプリの状態をリセットします。ファイルとフォルダは保持されます。",
      "resetPreferences": "設定をリセット",
      "confirmReset": "リセットを確認",
      "hardResetTitle": "ハードリセット",
      "hardResetDescription": "ファイル、フォルダ、設定を含むすべてのデータを完全に消去します。この操作は元に戻せません。",
      "hardResetWarning": "⚠️ すべてのカスタムファイルとフォルダは永久に削除されます",
      "factoryReset": "工場出荷時リセット",
      "deleteEverything": "はい、すべて削除します"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Aurora へようこそ",
        "description": "開始するには言語を選択してください"
      },
      "account": {
        "title": "アカウントを作成",
        "description": "主要な管理者アカウントを設定します"
      },
      "theme": {
        "title": "パーソナライズ",
        "description": "あなた好みに"
      },
      "finishing": {
        "title": "設定中...",
        "description": "構成を適用しています"
      }
    },
    "account": {
      "fullName": "フルネーム",
      "fullNamePlaceholder": "例: 山田 太郎",
      "username": "ユーザー名",
      "password": "パスワード",
      "passwordHint": "パスワードのヒント (任意)",
      "passwordHintPlaceholder": "例: 最初のペットの名前"
    },
    "theme": {
      "mode": "テーマモード",
      "accentColor": "アクセントカラー",
      "darkMode": "ダーク (ニュートラル)",
      "lightMode": "ライト",
      "comingSoon": "近日公開"
    },
    "finishing": {
      "title": "準備完了！",
      "subtitle": "Aurora OS の準備が整いました。ログイン画面にリダイレクトします..."
    },
    "search": {
      "placeholder": "言語を検索...",
      "noResults": "言語が見つかりません"
    },
    "validation": {
      "requiredFields": "必須項目をすべて入力してください",
      "passwordLength": "パスワードは6文字以上である必要があります",
      "userExists": "ユーザーはすでに存在します。別のユーザー名を選択してください。",
      "fullNameFormat": "フルネームには文字、スペース、ハイフンのみ使用できます",
      "usernameFormat": "ユーザー名には小文字と数字のみ使用できます",
      "hintLength": "パスワードのヒントが長すぎます (最大50文字)",
      "hintSecurity": "パスワードのヒントにパスワードそのものを含めることはできません",
      "hintFormat": "パスワードのヒントに無効な文字が含まれています",
      "creationFailed": "アカウントの作成に失敗しました。もう一度お試しください。"
    },
    "buttons": {
      "next": "次へ",
      "back": "戻る",
      "startUsing": "Aurora を使い始める"
    }
  },
  "battery": {
    "title": "バッテリー",
    "charging": "充電中",
    "fullyCharged": "フル充電済み",
    "remaining": "残り {{percentage}}%",
    "powerSource": "電源:",
    "powerSources": {
      "adapter": "電源アダプタ",
      "battery": "バッテリー"
    },
    "condition": "状態 (推定)",
    "metrics": {
      "health": "状態",
      "cycles": "サイクル",
      "temp": "温度",
      "voltage": "電圧"
    },
    "disclaimer": "バッテリーの健康状態などのメトリクスは、利用可能なシステムセンサーに基づく推定値です。実際の値とは異なる場合があります。",
    "showPercentage": "メニューバーにパーセンテージを表示"
  },
  "audio": {
    "title": "サウンド",
    "muteAll": "すべてミュート",
    "unmute": "ミュート解除",
    "masterVolume": "マスターボリューム",
    "mixer": "ミキサー",
    "categories": {
      "music": "音楽",
      "system": "システムアラート",
      "interface": "インターフェース",
      "feedback": "入力フィードバック",
      "ambiance": "環境音"
    },
    "mixerLabels": {
      "masterOutput": "マスター出力",
      "musicAppLevel": "ミュージックアプリ",
      "sfxInterface": "SFX & インターフェース",
      "backgroundLoop": "バックグラウンドループ"
    }
  }
};

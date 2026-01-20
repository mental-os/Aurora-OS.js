import type { TranslationDict } from '@/i18n/types';

export const ko: TranslationDict = {
  "time": {
    "yesterday": "어제"
  },
  "common": {
    "name": "이름",
    "color": "색상",
    "cancel": "취소",
    "save": "저장"
  },
  "game": {
    "intro": {
      "initialize": "시스템 초기화",
      "clickToStart": "시작하려면 클릭하세요",
      "skipHint": "건너뛰려면 ESC 또는 스페이스바"
    },
    "mainMenu": {
      "continue": {
        "label": "계속하기",
        "desc": {
          "canContinue": "이전 루프 재개",
          "noData": "루프 데이터 없음"
        }
      },
      "newGame": {
        "label": "새 루프",
        "desc": "다시 시작 (데이터 삭제)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "글로벌 매개변수 설정"
      },
      "exit": {
        "label": "시스템 종료",
        "desc": "세션 종료",
        "confirm": {
          "title": "시스템 종료",
          "message": "시스템을 종료하시겠습니까? 저장되지 않은 진행 상황이 손실될 수 있습니다.",
          "cancel": "취소",
          "confirm": "종료"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "BIOS 설정",
      "fullScreen": "전체 화면",
      "immersiveMode": "몰입 모드",
      "fullScreenEnter": "진입",
      "fullScreenExit": "종료",
      "softReset": "소프트 리셋",
      "softResetHint": "애플리케이션 다시 로드",
      "softResetConfirm": "소프트 리셋: 애플리케이션을 다시 로드하지만 데이터는 유지됩니다. 계속하시겠습니까?",
      "factoryReset": "공장 초기화",
      "factoryResetHint": "모든 데이터 지우기",
      "factoryResetConfirm": "공장 초기화: 모든 데이터, 사용자 및 파일을 완전히 지웁니다. 이 작업은 취소할 수 없습니다. 확실합니까?"
    },
    "footer": {
      "originalDistribution": "원본 배포",
      "temperedDistribution": "수정된 배포"
    }
  },
  "appDescriptions": {
    "finder": "파일 관리자",
    "browser": "웹 액세스",
    "mail": "이메일 읽기 및 쓰기",
    "appStore": "앱 다운로드 및 관리",
    "terminal": "명령줄 인터페이스",
    "systemSettings": "시스템 구성",
    "notepad": "텍스트 파일 편집",
    "messages": "친구들과 채팅",
    "calendar": "일정 관리",
    "photos": "사진 보기 및 관리",
    "music": "음악 재생",
    "devCenter": "개발자 도구"
  },
  "a11y": {
    "common": {
      "close": "닫기",
      "open": "열기",
      "notAvailable": "해당 없음"
    },
    "sidebar": {
      "toggleSidebar": "사이드바 토글"
    },
    "pagination": {
      "pagination": "페이지 매김",
      "goToPreviousPage": "이전 페이지로 이동",
      "goToNextPage": "다음 페이지로 이동",
      "previous": "이전",
      "next": "다음",
      "morePages": "더 많은 페이지"
    },
    "breadcrumb": {
      "breadcrumb": "탐색 경로",
      "more": "더 보기"
    },
    "carousel": {
      "previousSlide": "이전 슬라이드",
      "nextSlide": "다음 슬라이드"
    }
  },
  "commandPalette": {
    "title": "명령 팔레트",
    "description": "실행할 명령 검색..."
  },
  "login": {
    "softReset": "소프트 리셋",
    "hardReset": "하드 리셋",
    "hardResetConfirm": "하드 리셋: 모든 데이터가 지워집니다. 계속하시겠습니까?",
    "selectUser": "사용자 선택",
    "enterPasswordToUnlock": "잠금 해제하려면 비밀번호 입력",
    "restoringPreviousSession": "이전 세션 복원 중",
    "passwordPlaceholder": "비밀번호",
    "incorrectPassword": "잘못된 비밀번호",
    "hint": "힌트",
    "enterSystem": "시스템 진입",
    "switchAccount": "계정 전환",
    "back": "뒤로",
    "suspendToSwitch": "세션을 일시 중지하고 전환하시겠습니까?",
    "cancel": "취소",
    "switchUser": "사용자 전환",
    "logOut": "로그아웃",
    "logOutConfirm": "{{username}} 님을 로그아웃하시겠습니까? 열려 있는 모든 창이 닫히고 저장되지 않은 변경 사항은 버려집니다.",
    "active": "활성",
    "resume": "재개",
    "sessionActive": "세션 활성"
  },
  "app": {
    "loadingKernel": "커널 로드 중..."
  },
  "menubar": {
    "menus": {
      "file": "파일",
      "shell": "셸",
      "edit": "편집",
      "format": "서식",
      "song": "노래",
      "view": "보기",
      "go": "이동",
      "controls": "컨트롤",
      "window": "창",
      "help": "도움말",
      "store": "스토어",
      "history": "기록",
      "bookmarks": "북마크",
      "mailbox": "메일함",
      "message": "메시지",
      "devCenter": "DEV 센터",
      "tools": "도구",
      "image": "이미지",
      "conversations": "대화"
    },
    "items": {
      "newWindow": "새 창",
      "newFolder": "새 폴더",
      "open": "열기",
      "changeWallpaper": "배경화면 변경",
      "closeWindow": "창 닫기",
      "undo": "실행 취소",
      "redo": "다시 실행",
      "cut": "잘라내기",
      "copy": "복사",
      "paste": "붙여넣기",
      "selectAll": "전체 선택",
      "reload": "새로 고침",
      "toggleFullscreen": "전체 화면 토글",
      "minimize": "최소화",
      "bringAllToFront": "모두 앞으로 가져오기",
      "back": "뒤로",
      "forward": "앞으로",
      "enclosingFolder": "상위 폴더",
      "getInfo": "정보 가져오기",
      "moveToTrash": "휴지통으로 이동"
    },
    "help": {
      "appHelp": "{{appName}} 도움말"
    },
    "default": {
      "featureNotImplemented": "기능이 구현되지 않음"
    },
    "system": {
      "aboutThisComputer": "이 컴퓨터에 관하여...",
      "systemSettings": "시스템 설정...",
      "appStore": "App Store...",
      "lockScreen": "화면 잠금",
      "switchUser": "사용자 전환",
      "user": "사용자",
      "logOutAs": "로그아웃: {{username}}",
      "viewSystemInfo": "시스템 정보 보기",
      "viewSystemSettings": "시스템 설정 보기",
      "returnToLoginWhile": "로그인 화면으로 돌아갑니다 (",
      "returnToUserSelectionWhile": "사용자 선택 화면으로 돌아갑니다 (",
      "keepingSession": "세션 유지",
      "clearingSession": "세션 지우기",
      "panic": "패닉",
      "hardReset": "하드 리셋",
      "warning": "경고",
      "panicWarningBody": "{{productName}}이(가) 공장 설정으로 재설정됩니다. 문제가 발생했을 때 패닉 버튼으로 유용합니다.",
      "serverTime": "서버 시간 (UTC)",
      "localTime": "현지 시간"
    },
    "app": {
      "aboutApp": "{{appName}}에 관하여",
      "settings": "설정...",
      "quitApp": "{{appName}} 종료"
    }
  },
  "notifications": {
    "title": "알림",
    "titles": {
      "permissionDenied": "권한 거부됨"
    },
    "clearAll": "모두 지우기",
    "new": "신규",
    "subtitles": {
      "appMissing": "앱 누락됨",
      "permissionDenied": "권한 거부됨",
      "saved": "저장됨",
      "deleted": "삭제됨",
      "moved": "이동됨",
      "trash": "휴지통",
      "failed": "실패",
      "ui": "인터페이스",
      "validation": "유효성 검사",
      "success": "성공",
      "error": "오류",
      "info": "정보",
      "warning": "경고",
      "fileError": "파일 오류"
    },
    "empty": "알림 없음",
    "clearApp": "이 앱의 모든 알림 지우기"
  },
  "memory": {
    "title": "메모리",
    "used": "사용됨",
    "pressure": "압력",
    "appMemory": "앱 메모리",
    "wiredMemory": "Wired 메모리",
    "processName": "프로세스 이름",
    "memory": "메모리",
    "swapUsed": "사용한 스왑",
    "systemWired": "Aurora 시스템",
    "activeSession": "Wired 메모리 (활성 세션)",
    "userSession": "세션: {{user}}",
    "backgroundSession": "휴면 메모리 (백그라운드)",
    "backgroundProcesses": "{{count}}개의 백그라운드 프로세스",
    "instances": "{{count}}개의 인스턴스",
    "type": {
      "mainWindow": "메인 창",
      "extraWindow": "추가 창",
      "extraTabs": "{{count}}개의 추가 탭"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "업데이트 확인...",
      "viewMyAccount": "내 계정 보기"
    },
    "categories": {
      "all": "모두",
      "productivity": "생산성",
      "media": "미디어",
      "utilities": "유틸리티",
      "development": "개발",
      "system": "시스템"
    },
    "searchPlaceholder": "앱 검색...",
    "empty": {
      "title": "앱을 찾을 수 없음",
      "description": "검색 또는 카테고리 필터를 변경하여 원하는 것을 찾으십시오."
    },
    "size": "크기",
    "sizeUnknown": "알 수 없음",
    "install": "설치",
    "uninstall": "제거",
    "open": "열기",
    "cancel": "취소",
    "confirm": "확인",
    "restore": "복원",
    "checkFailed": "확인 실패",
    "checkFailedTitle": "설치 확인 오류",
    "restoreSuccess": "{{app}} 복원 성공",
    "restoreError": "{{app}} 복원 실패",
    "restorePermissionDenied": "앱을 복원하려면 관리자 권한이 필요합니다",
    "installingWarning": "애플리케이션을 설치하는 동안 기다려 주십시오."
  },
  "browser": {
    "menu": {
      "newTab": "새 탭",
      "closeTab": "탭 닫기"
    },
    "welcome": {
      "searchPlaceholder": "웹사이트 검색 또는 주소 입력...",
      "favorites": "즐겨찾기",
      "recentActivity": "최근 활동"
    },
    "searchPlaceholder": "검색 또는 주소 입력...",
    "error": {
      "pageNotFound": "페이지를 찾을 수 없음",
      "pageNotFoundDesc": "웹사이트 {{url}}을(를) 찾을 수 없습니다.",
      "goHome": "홈으로"
    }
  },
  "music": {
    "sidebar": {
      "library": "라이브러리",
      "songs": "노래",
      "favorites": "즐겨찾기",
      "recentlyPlayed": "최근 재생"
    },
    "titles": {
      "songs": "노래",
      "recentlyPlayed": "최근 재생"
    },
    "actions": {
      "playAll": "모두 재생"
    },
    "empty": {
      "recent": {
        "title": "최근 재생한 노래 없음",
        "description": "최근 재생한 노래가 여기에 나타납니다."
      },
      "library": {
        "title": "노래를 찾을 수 없음",
        "description": "음악 폴더에서 음악 파일을 찾을 수 없습니다.",
        "openFolder": "{{folder}} 폴더 열기"
      }
    },
    "folders": {
      "music": "음악",
      "home": "홈"
    },
    "player": {
      "notPlaying": "재생 중이 아님",
      "selectSong": "노래 선택"
    },
    "metadata": {
      "unknownArtist": "알 수 없는 아티스트",
      "unknownAlbum": "알 수 없는 앨범",
      "unknownTitle": "알 수 없는 제목"
    },
    "menu": {
      "newPlaylist": "새 재생 목록",
      "import": "가져오기...",
      "closeWindow": "창 닫기",
      "showInFinder": "Finder에서 보기",
      "addToPlaylist": "재생 목록에 추가",
      "play": "재생",
      "previousSong": "이전 노래",
      "nextSong": "다음 노래",
      "volumeUp": "볼륨 높이기",
      "volumeDown": "볼륨 낮추기"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "새 탭",
      "clearScrollback": "스크롤백 지우기",
      "killProcess": "프로세스 종료"
    },
    "help": {
      "availableCommands": "사용 가능한 명령:",
      "usage": "사용법",
      "appLaunchHelp": "설치된 애플리케이션 실행 (예: Finder)"
    },
    "commands": {
      "help": {
        "description": "이 도움말 메시지 표시"
      },
      "ls": {
        "description": "디렉토리 내용 나열",
        "usage": "ls [경로]"
      },
      "cd": {
        "description": "디렉토리 변경",
        "usage": "cd <경로>"
      },
      "pwd": {
        "description": "현재 작업 디렉토리 출력"
      },
      "logout": {
        "description": "현재 세션에서 로그아웃"
      },
      "who": {
        "description": "로그인한 사용자 표시"
      },
      "clear": {
        "description": "터미널 화면 지우기"
      },
      "cat": {
        "description": "파일 내용 표시",
        "usage": "cat <파일>"
      },
      "mkdir": {
        "description": "디렉토리 생성",
        "usage": "mkdir <이름>"
      },
      "touch": {
        "description": "파일 생성 또는 타임스탬프 업데이트",
        "usage": "touch <이름>"
      },
      "rm": {
        "description": "파일 또는 디렉토리 제거",
        "usage": "rm <이름>"
      },
      "cp": {
        "description": "파일 복사",
        "usage": "cp <원본> <대상>"
      },
      "mv": {
        "description": "파일 이동 (이름 변경)",
        "usage": "mv <원본> <대상>"
      },
      "chmod": {
        "description": "파일 모드(권한) 변경",
        "usage": "chmod <모드> <파일>"
      },
      "chown": {
        "description": "파일 소유자 및 그룹 변경",
        "usage": "chown <소유자>[:<그룹>] <파일>"
      },
      "grep": {
        "description": "패턴과 일치하는 줄 출력",
        "usage": "grep <패턴> <파일>"
      },
      "find": {
        "description": "디렉토리 계층에서 파일 검색",
        "usage": "find [경로] [-name 패턴]"
      },
      "echo": {
        "description": "텍스트 줄 표시",
        "usage": "echo [텍스트]"
      },
      "date": {
        "description": "시스템 날짜 및 시간 출력"
      },
      "uptime": {
        "description": "시스템 가동 시간 표시"
      },
      "whoami": {
        "description": "현재 사용자 출력"
      },
      "hostname": {
        "description": "시스템 호스트 이름 출력"
      },
      "reset": {
        "description": "파일 시스템을 공장 설정으로 재설정"
      },
      "exit": {
        "description": "현재 셸 세션 종료"
      },
      "su": {
        "description": "사용자 ID 변경 또는 슈퍼유저 되기",
        "usage": "su [사용자] [비밀번호]"
      },
      "sudo": {
        "description": "다른 사용자로 명령 실행",
        "usage": "sudo [옵션] [명령]"
      },
      "history": {
        "description": "터미널 명령 기록 표시",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} 곧 출시 예정",
    "descriptions": {
      "mail": "이메일, 연락처 및 캘린더 일정을 관리합니다.",
      "calendar": "회의, 이벤트 및 알림을 예약합니다.",
      "default": "이 애플리케이션은 현재 개발 중입니다."
    }
  },
  "filePicker": {
    "openFile": "파일 열기",
    "openFileDescription": "파일 시스템에서 열 파일을 선택하십시오",
    "saveFile": "파일 저장",
    "saveFileDescription": "파일을 저장할 위치와 이름을 선택하십시오",
    "emptyFolder": "이 폴더는 비어 있습니다",
    "nameLabel": "이름:",
    "untitledPlaceholder": "제목 없음",
    "toasts": {
      "permissionDenied": "권한 거부됨: {{name}}"
    },
    "cancel": "취소",
    "open": "열기",
    "save": "저장"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "Music 앱이 설치되어 있지 않습니다. App Store에서 설치하십시오.",
      "notepadNotInstalled": "Notepad가 설치되어 있지 않습니다. App Store에서 설치하십시오.",
      "photosNotInstalled": "Photos 앱이 설치되어 있지 않습니다. App Store에서 설치하십시오."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} 항목",
      "bytes": "{{count}} 바이트",
      "type": "유형",
      "owner": "소유자",
      "permissions": "권한",
      "modified": "수정됨",
      "size": "크기"
    },
    "sidebar": {
      "favorites": "즐겨찾기",
      "system": "시스템",
      "locations": "위치"
    },
    "places": {
      "home": "홈",
      "desktop": "데스크탑",
      "documents": "문서",
      "downloads": "다운로드",
      "pictures": "사진",
      "music": "음악",
      "trash": "휴지통"
    },
    "actions": {
      "moveToTrash": "휴지통으로 이동",
      "search": "검색"
    },
    "toasts": {
      "permissionDenied": "권한 거부됨: {{name}}",
      "musicNotInstalled": "Music 앱이 설치되어 있지 않습니다. App Store에서 설치하십시오.",
      "notepadNotInstalled": "Notepad가 설치되어 있지 않습니다. App Store에서 설치하십시오.",
      "photosNotInstalled": "Photos 앱이 설치되어 있지 않습니다. App Store에서 설치하십시오.",
      "movedItem": "1개 항목 이동됨",
      "movedItems": "{{count}}개 항목 이동됨",
      "movedItemTo": "1개 항목이 {{target}}(으)로 이동됨",
      "movedItemsTo": "{{count}}개 항목이 {{target}}(으)로 이동됨",
      "movedItemToTrash": "1개 항목이 휴지통으로 이동됨",
      "movedItemsToTrash": "{{count}}개 항목이 휴지통으로 이동됨",
      "moveFailedInvalidData": "이동 실패: 잘못된 데이터",
      "failedToProcessDrop": "드롭을 처리하지 못했습니다",
      "couldNotGetInfo": "정보를 가져올 수 없습니다",
      "fileTypeNotSupported": "파일 형식 '{{type}}'은(는) 지원되지 않습니다"
    },
    "search": {
      "noResultsTitle": "결과 없음",
      "noResultsDesc": "\"{{query}}\"에 대한 결과를 찾지 못했습니다",
      "resultsTitle": "검색 결과 ({{count}})"
    },
    "emptyFolder": "이 폴더는 비어 있습니다"
  },
  "messages": {
    "title": "메시지",
    "sidebar": {
      "conversationsTitle": "대화",
      "allMessages": "모든 메시지",
      "unread": "읽지 않음",
      "starred": "별표 표시됨"
    },
    "search": {
      "placeholder": "대화 검색..."
    },
    "menu": {
      "newMessage": "새 메시지"
    },
    "auth": {
      "welcomeBack": "환영합니다",
      "createAccount": "계정 생성",
      "recoverAccount": "계정 복구",
      "signInToContinue": "계속하려면 로그인하십시오",
      "joinSecureNetwork": "보안 네트워크 가입",
      "enterRecoveryKey": "액세스하려면 복구 키를 입력하십시오",
      "invalidCredentials": "잘못된 사용자 이름 또는 비밀번호",
      "credentialsRetrieved": "자격 증명 검색됨",
      "password": "비밀번호",
      "returnToLogin": "로그인으로 돌아가기",
      "recoveryKey": "복구 키",
      "username": "사용자 이름",
      "processing": "처리 중...",
      "signIn": "로그인",
      "create": "계정 생성",
      "recover": "비밀번호 복구",
      "noAccount": "계정이 없으신가요? 생성하기",
      "haveAccount": "이미 계정이 있으신가요? 로그인",
      "forgotPassword": "비밀번호를 잊으셨나요?",
      "backToLogin": "로그인으로 돌아가기",
      "accountCreated": "계정이 생성되었습니다!",
      "saveRecoveryKey": "복구 키를 저장하십시오. 비밀번호를 잊어버린 경우 필요합니다.",
      "oneTimeShow": "이번 한 번만 표시됩니다.",
      "savedContinue": "저장했습니다 - 계속",
      "copied": "복사됨",
      "recoveryKeyCopied": "복구 키가 클립보드에 복사되었습니다",
      "failedCopy": "키를 복사하지 못했습니다",
      "error": "오류"
    },
    "ui": {
      "noConversations": "대화 없음",
      "noResults": "결과 없음",
      "noChatSelected": "채팅이 선택되지 않음",
      "chooseConversation": "대화를 선택하거나 새로운 대화를 시작하십시오.",
      "startNewMessage": "새 메시지 시작",
      "online": "온라인",
      "typeMessage": "{{partner}} 님에게 메시지 보내기...",
      "unstar": "별표 해제",
      "star": "별표 표시",
      "cantMessageSelf": "자신에게 메시지를 보낼 수 없습니다 (아직)",
      "userNotFound": "사용자를 찾을 수 없음",
      "messageFailed": "메시지 전송 실패"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "라이브러리",
      "albumsTitle": "앨범"
    },
    "library": {
      "allPhotos": "모든 사진",
      "favorites": "즐겨찾기",
      "recent": "최근 항목"
    },
    "menu": {
      "slideshow": "슬라이드쇼",
      "rotateClockwise": "시계 방향으로 회전",
      "rotateCounterClockwise": "반시계 방향으로 회전"
    },
    "empty": {
      "recent": {
        "title": "최근 본 사진 없음",
        "description": "최근에 연 사진이 여기에 나타납니다."
      },
      "favorites": {
        "title": "즐겨찾기 없음",
        "description": "사진을 즐겨찾기로 표시하면 여기에 나타납니다."
      },
      "library": {
        "title": "사진을 찾을 수 없음",
        "description": "사진 폴더에서 사진 파일을 찾을 수 없습니다.",
        "openFolder": "{{folder}} 폴더 열기"
      },
      "noFolder": {
        "title": "{{user}} 라이브러리를 찾을 수 없음",
        "description": "이 사용자에 대한 경로 {{path}}를 찾을 수 없습니다."
      },
      "openHome": "홈 디렉토리 열기"
    },
    "folders": {
      "pictures": "사진"
    }
  },
  "mail": {
    "login": {
      "title": "메일",
      "subtitle": "계정에 로그인",
      "emailPlaceholder": "이메일",
      "passwordPlaceholder": "비밀번호",
      "signingIn": "로그인 중...",
      "signIn": "로그인",
      "signOut": "로그아웃",
      "createAccountInfo": "메일 제공업체를 통해 계정 생성"
    },
    "menu": {
      "newMailbox": "새 메일함",
      "onlineStatus": "온라인 상태",
      "newMessage": "새 메시지",
      "reply": "답장",
      "replyAll": "전체 답장",
      "forward": "전달"
    },
    "sidebar": {
      "mailboxes": "메일함",
      "inbox": "받은 편지함",
      "starred": "별표 표시됨",
      "archived": "보관됨",
      "trash": "휴지통"
    },
    "search": {
      "placeholder": "이메일 검색..."
    },
    "empty": {
      "noEmails": "이메일 없음",
      "noEmailsFound": "이메일을 찾을 수 없음",
      "selectEmail": "읽을 이메일 선택"
    },
    "actions": {
      "reply": "답장",
      "forward": "전달",
      "archive": "보관",
      "unarchive": "보관 취소",
      "delete": "삭제",
      "restore": "복원",
      "deleteForever": "영구 삭제"
    },
    "time": {
      "minutesAgo": "{{minutes}}분 전",
      "hoursAgo": "{{hours}}시간 전",
      "today": "오늘",
      "yesterday": "어제",
      "daysAgo": "{{days}}일 전"
    },
    "attachments": {
      "count": "{{count}}개 첨부 파일",
      "count_plural": "{{count}}개 첨부 파일",
      "download": "다운로드",
      "downloaded": "다운로드됨",
      "downloadedTo": "{{name}}이(가) {{folder}}에 다운로드됨",
      "downloadFailed": "다운로드 실패",
      "downloadFailedMessage": "{{name}}을(를) 다운로드하지 못했습니다"
    }
  },
  "notepad": {
    "untitled": "제목 없음",
    "untitledTab": "제목 없음 {{index}}",
    "empty": {
      "title": "메모장",
      "description": "시작하려면 새 파일을 만들거나 기존 파일을 여십시오.",
      "newFile": "새 파일",
      "openFile": "파일 열기"
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
      "txt": "일반 텍스트"
    },
    "actions": {
      "openFile": "파일 열기",
      "saveFile": "파일 저장",
      "bold": "굵게",
      "italic": "기울임꼴",
      "list": "목록",
      "heading": "제목"
    },
    "preview": {
      "edit": "편집",
      "preview": "미리보기",
      "htmlPreviewTitle": "HTML 미리보기"
    },
    "status": {
      "chars": "{{count}}자",
      "lines": "{{count}}줄"
    },
    "contextSwitcher": {
      "title": "컨텍스트를 전환하려면 클릭",
      "searchPlaceholder": "언어 검색...",
      "noLanguageFound": "언어를 찾을 수 없음."
    },
    "toasts": {
      "switchedTo": "{{language}}(으)로 전환됨",
      "failedToReadFile": "파일을 읽지 못했습니다",
      "fileSaved": "파일 저장됨",
      "failedToSaveFilePermissions": "파일을 저장하지 못했습니다 (권한 확인)",
      "saved": "저장됨",
      "failedToSave": "저장 실패"
    },
    "dialog": {
      "unsaved": {
        "title": "변경 사항을 저장하시겠습니까?",
        "description": "저장하지 않으면 변경 사항이 손실됩니다.",
        "dontSave": "저장 안 함",
        "cancel": "취소",
        "save": "저장"
      }
    },
    "menu": {
      "new": "새로 만들기",
      "open": "열기...",
      "save": "저장",
      "closeTab": "탭 닫기",
      "bold": "굵게",
      "italic": "기울임꼴",
      "list": "목록",
      "heading1": "제목 1",
      "heading2": "제목 2",
      "togglePreview": "미리보기 토글",
      "zoomIn": "확대",
      "zoomOut": "축소"
    }
  },
  "calendar": {
    "menu": {
      "day": "일",
      "week": "주",
      "month": "월",
      "year": "년"
    },
    "toolbar": {
      "today": "오늘",
      "month": "월",
      "day": "일"
    },
    "sidebar": {
      "myCalendars": "내 캘린더",
      "filterColors": "색상 필터"
    },
    "actions": {
      "createEvent": "이벤트 생성",
      "createCategory": "카테고리 생성",
      "clear": "지우기",
      "delete": "삭제",
      "cancel": "취소",
      "saveEvent": "이벤트 저장"
    },
    "loadingEvents": "이벤트 로드 중...",
    "toasts": {
      "cannotDeleteSystemCategory": "시스템 카테고리는 삭제할 수 없습니다",
      "eventDeleted": "이벤트 삭제됨",
      "eventSaved": "이벤트 저장됨",
      "requiredFields": "필수 필드를 입력하십시오"
    },
    "modal": {
      "newEvent": "새 이벤트",
      "editEvent": "이벤트 편집",
      "newEventDescription": "캘린더에 새로운 이벤트를 예약합니다.",
      "editEventDescription": "이벤트 세부 정보를 보거나 편집합니다.",
      "fields": {
        "title": "제목",
        "date": "날짜",
        "time": "시간",
        "duration": "기간",
        "type": "유형",
        "location": "위치",
        "color": "색상",
        "notes": "메모"
      },
      "placeholders": {
        "eventTitle": "이벤트 제목",
        "pickDate": "날짜 선택",
        "searchTime": "시간 검색...",
        "noTimeFound": "시간을 찾을 수 없음.",
        "selectDuration": "기간 선택",
        "searchDuration": "기간 검색...",
        "noDurationFound": "기간을 찾을 수 없음.",
        "selectType": "유형 선택",
        "searchType": "유형 검색...",
        "noTypeFound": "유형을 찾을 수 없음.",
        "addLocation": "위치 추가",
        "addNotes": "메모 추가..."
      },
      "durationMinutes": "{{minutes}}분",
      "minutesOption": "{{minutes}}분"
    },
    "categories": {
      "all": "모두",
      "work": "업무",
      "personal": "개인",
      "social": "사교",
      "events": "이벤트",
      "family": "가족"
    },
    "types": {
      "work": "업무",
      "personal": "개인",
      "social": "사교",
      "events": "이벤트",
      "family": "가족",
      "other": "기타"
    },
    "colors": {
      "blue": "파랑",
      "green": "초록",
      "red": "빨강",
      "yellow": "노랑",
      "purple": "보라",
      "pink": "분홍",
      "orange": "주황",
      "gray": "회색"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "루프 시작됨",
        "location": "Turms",
        "notes": "파일 시스템 초기화."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "일반",
      "dashboard": "대시보드",
      "interfaceTitle": "인터페이스",
      "uiAndSounds": "UI 및 사운드",
      "systemTitle": "시스템",
      "storage": "스토리지",
      "fileSystem": "파일 시스템",
      "appsTitle": "앱",
      "performance": "성능"
    },
    "dashboard": {
      "title": "대시보드",
      "description": "시스템 개요 곧 출시 예정."
    },
    "ui": {
      "title": "사용자 인터페이스 및 피드백",
      "notificationsTitle": "알림",
      "successToast": "성공 토스트",
      "warningToast": "경고 토스트",
      "errorToast": "오류 토스트",
      "soundFeedback": "사운드 피드백",
      "buttons": {
        "success": "성공",
        "warning": "경고",
        "error": "오류",
        "app": "앱 알림",
        "open": "열기",
        "close": "닫기",
        "click": "클릭",
        "hover": "호버"
      }
    },
    "storage": {
      "title": "스토리지 검사기",
      "import": "가져오기",
      "export": "내보내기",
      "clear": "지우기",
      "toastTitle": "스토리지",
      "exportSuccess": "환경 설정이 성공적으로 내보내졌습니다",
      "exportFail": "환경 설정을 내보내지 못했습니다",
      "importSuccess": "환경 설정이 성공적으로 가져와졌습니다",
      "importFail": "가져오기 파일을 구문 분석하지 못했습니다",
      "clearConfirm": "모든 로컬 스토리지를 지우시겠습니까? 사용 환경 설정, 테마 설정 및 창 위치가 재설정됩니다.",
      "clearSuccess": "모든 키가 지워졌습니다",
      "softMemory": "소프트 메모리 (환경 설정)",
      "hardMemory": "하드 메모리 (파일 시스템)",
      "keysCount": "{{count}} 키",
      "localStorageKeys": "로컬 스토리지 키"
    },
    "filesystem": {
      "title": "파일 시스템 디버거"
    },
    "performance": {
      "title": "성능 모니터"
    },
    "menu": {
      "resetFilesystem": "파일 시스템 재설정",
      "runDiagnostics": "진단 실행"
    },
    "messages": {
      "createValues": {
        "title": "계정 생성 / 재설정",
        "username": "사용자 이름",
        "password": "비밀번호",
        "button": "계정 생성",
        "success": "계정 {{username}} 생성됨"
      },
      "registry": {
        "title": "계정 레지스트리",
        "empty": "계정을 찾을 수 없음",
        "useInSender": "보낸 사람에서 사용",
        "delete": "계정 삭제",
        "deleteConfirm": "계정 {{username}}을(를) 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
        "deleteSuccess": "계정 {{username}} 삭제됨"
      },
      "sendMessage": {
        "title": "사용자 간 메시지 보내기",
        "from": "보낸 사람 (From)",
        "to": "받는 사람 (To)",
        "selectAccount": "계정 선택...",
        "content": "내용",
        "placeholder": "메시지 입력...",
        "button": "메시지 보내기",
        "success": "메시지 전송됨"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "시스템",
      "general": "일반"
    },
    "sections": {
      "appearance": "모양",
      "performance": "성능",
      "displays": "디스플레이",
      "notifications": "알림",
      "network": "네트워크",
      "security": "보안 및 개인 정보 보호",
      "users": "사용자 및 그룹",
      "storage": "스토리지",
      "about": "정보"
    },
    "appearance": {
      "title": "모양",
      "languageTitle": "언어",
      "languageDescription": "시스템 인터페이스 표시 언어 선택",
      "languagePlaceholder": "언어 선택",
      "wallpaperTitle": "데스크탑 배경화면",
      "wallpaperDescription": "데스크탑 환경의 배경 선택",
      "accentTitle": "강조 색상",
      "accentDescription": "경험을 개인화할 강조 색상 선택",
      "presetColors": "사전 설정 색상",
      "customColor": "사용자 지정 색상",
      "customColorHint": "16진수 색상 코드 입력 (예: #3b82f6)",
      "preview": "미리보기",
      "previewPrimary": "기본",
      "previewOutlined": "윤곽선",
      "themeModeTitle": "테마 모드",
      "themeModeDescription": "강조 색상이 배경 색조에 미치는 영향 선택",
      "themeModeNeutralTitle": "중립",
      "themeModeNeutralDesc": "자연 회색만",
      "themeModeShadesTitle": "음영",
      "themeModeShadesDesc": "강조 색상의 음영",
      "themeModeContrastTitle": "대비",
      "themeModeContrastDesc": "보색",
      "themeTitle": "테마",
      "themeDark": "다크",
      "themeLightSoon": "라이트 (곧 출시)",
      "wallpaperActive": "활성",
      "wallpaperUse": "사용"
    },
    "performance": {
      "blurTitle": "흐림 및 투명도",
      "blurDescription": "유리 흐림 효과 및 창 투명도 활성화",
      "reduceMotionTitle": "동작 줄이기",
      "reduceMotionDescription": "반응성 및 접근성을 위해 애니메이션 비활성화",
      "disableShadowsTitle": "그림자 비활성화",
      "disableShadowsDescription": "렌더링 성능 향상을 위해 창 그림자 제거",
      "disableGradientsTitle": "그라디언트 비활성화",
      "disableGradientsDescription": "아이콘에 그라디언트 대신 단색 사용"
    },
    "placeholders": {
      "displaysTitle": "디스플레이 설정",
      "displaysDescription": "해상도, 배율 및 밝기 제어 곧 출시 예정.",
      "notificationsTitle": "알림",
      "notificationsDescription": "알림 센터 환경 설정 곧 출시 예정.",
      "networkTitle": "네트워크",
      "networkDescription": "Wi‑Fi 및 Bluetooth 구성 곧 출시 예정.",
      "securityTitle": "보안 및 개인 정보 보호",
      "securityDescription": "방화벽, 권한 및 개인 정보 설정 곧 출시 예정.",
      "storageTitle": "스토리지",
      "storageDescription": "디스크 사용량 분석 및 관리 곧 출시 예정."
    },
    "users": {
      "currentUsersTitle": "현재 사용자",
      "addUser": "사용자 추가",
      "cancel": "취소",
      "editAction": "편집",
      "newUserDetails": "새 사용자 세부 정보",
      "usernamePlaceholder": "사용자 이름 (예: jisu)",
      "fullNamePlaceholder": "전체 이름",
      "passwordOptionalPlaceholder": "비밀번호 (선택 사항)",
      "passwordHintOptionalPlaceholder": "비밀번호 힌트 (선택 사항)",
      "createUser": "사용자 생성",
      "userExists": "사용자가 이미 존재함",
      "currentBadge": "현재",
      "rootBadge": "Root",
      "adminBadge": "관리자",
      "confirmDeleteUser": "{{username}}을(를) 삭제하시겠습니까?",
      "editForm": {
        "fullNameLabel": "전체 이름",
        "roleLabel": "역할",
        "administrator": "관리자",
        "newPasswordLabel": "새 비밀번호 (유지하려면 비워 두기)",
        "passwordHintLabel": "비밀번호 힌트",
        "saveChanges": "변경 사항 저장"
      }
    },
    "about": {
      "version": "버전",
      "framework": "프레임워크",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "환경",
      "browserMode": "브라우저 모드",
      "developerMode": "개발자 모드",
      "developerModeDescription": "고급 도구 및 디버깅 기능 활성화",
      "exposeRootUser": "Root 사용자 표시",
      "exposeRootUserDescription": "로그인 화면에 root 사용자 표시",
      "memoryUsage": "메모리 사용량",
      "preferencesSoft": "환경 설정 (소프트 메모리)",
      "filesystemHard": "파일 시스템 (하드 메모리)",
      "total": "총계"
    },
    "danger": {
      "title": "위험 구역",
      "softResetTitle": "소프트 리셋",
      "softResetDescription": "환경 설정, 테마 설정, 데스크탑 아이콘 위치 및 앱 상태를 재설정합니다. 파일과 폴더는 유지됩니다.",
      "resetPreferences": "환경 설정 재설정",
      "confirmReset": "재설정 확인",
      "hardResetTitle": "하드 리셋",
      "hardResetDescription": "파일, 폴더 및 설정을 포함한 모든 데이터를 완전히 지웁니다. 이 작업은 취소할 수 없습니다.",
      "hardResetWarning": "⚠️ 모든 사용자 지정 파일 및 폴더가 영구적으로 삭제됩니다",
      "factoryReset": "공장 초기화",
      "deleteEverything": "예, 모두 삭제"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Aurora에 오신 것을 환영합니다",
        "description": "시작하려면 언어를 선택하십시오"
      },
      "account": {
        "title": "계정 생성",
        "description": "기본 관리자 계정 설정"
      },
      "theme": {
        "title": "개인화",
        "description": "나만의 것으로 만들기"
      },
      "finishing": {
        "title": "설정 중...",
        "description": "구성 적용 중"
      }
    },
    "account": {
      "fullName": "전체 이름",
      "fullNamePlaceholder": "예: 김철수",
      "username": "사용자 이름",
      "password": "비밀번호",
      "passwordHint": "비밀번호 힌트 (선택 사항)",
      "passwordHintPlaceholder": "예: 첫 반려동물 이름"
    },
    "theme": {
      "mode": "테마 모드",
      "accentColor": "강조 색상",
      "darkMode": "다크 (중립)",
      "lightMode": "라이트",
      "comingSoon": "곧 출시"
    },
    "finishing": {
      "title": "준비 완료!",
      "subtitle": "Aurora OS가 준비되었습니다. 로그인 화면으로 리디렉션 중..."
    },
    "search": {
      "placeholder": "언어 검색...",
      "noResults": "언어를 찾을 수 없음"
    },
    "validation": {
      "requiredFields": "모든 필수 필드를 입력하십시오",
      "passwordLength": "비밀번호는 최소 6자 이상이어야 합니다",
      "userExists": "사용자가 이미 존재합니다. 다른 사용자 이름을 선택하십시오.",
      "fullNameFormat": "전체 이름에는 문자와 공백만 포함해야 합니다",
      "usernameFormat": "사용자 이름에는 소문자와 숫자만 포함해야 합니다",
      "hintLength": "비밀번호 힌트가 너무 깁니다 (최대 50자)",
      "hintSecurity": "비밀번호 힌트에는 비밀번호 자체가 포함될 수 없습니다",
      "hintFormat": "비밀번호 힌트에 유효하지 않은 문자가 포함되어 있습니다",
      "creationFailed": "계정을 생성하지 못했습니다. 다시 시도하십시오."
    },
    "buttons": {
      "next": "다음",
      "back": "뒤로",
      "startUsing": "Aurora 사용 시작"
    }
  },
  "battery": {
    "title": "배터리",
    "charging": "충전 중",
    "fullyCharged": "완전히 충전됨",
    "remaining": "{{percentage}}% 남음",
    "powerSource": "전원:",
    "powerSources": {
      "adapter": "전원 어댑터",
      "battery": "배터리"
    },
    "condition": "상태 (예상)",
    "metrics": {
      "health": "상태",
      "cycles": "사이클",
      "temp": "온도",
      "voltage": "전압"
    },
    "disclaimer": "배터리 상태 및 상태 메트릭은 사용 가능한 시스템 센서를 기반으로 한 예상치입니다. 실제 값은 다를 수 있습니다.",
    "showPercentage": "메뉴 막대에 백분율 표시"
  },
  "audio": {
    "title": "오디오",
    "muteAll": "모두 음소거",
    "unmute": "음소거 해제",
    "masterVolume": "마스터 볼륨",
    "mixer": "믹서",
    "categories": {
      "music": "음악",
      "system": "시스템 경고",
      "interface": "인터페이스",
      "feedback": "입력 피드백",
      "ambiance": "분위기"
    },
    "mixerLabels": {
      "masterOutput": "마스터 출력",
      "musicAppLevel": "음악 앱 수준",
      "sfxInterface": "SFX 및 인터페이스",
      "backgroundLoop": "백그라운드 루프"
    }
  }
};

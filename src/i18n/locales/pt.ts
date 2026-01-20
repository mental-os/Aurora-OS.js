import type { TranslationDict } from '@/i18n/types';

export const pt: TranslationDict = {
  "time": {
    "yesterday": "Ontem"
  },
  "common": {
    "name": "Nome",
    "color": "Cor",
    "cancel": "Cancelar",
    "save": "Salvar"
  },
  "game": {
    "intro": {
      "initialize": "Inicializar sistema",
      "clickToStart": "CLIQUE PARA COMEÇAR",
      "skipHint": "ESC ou ESPAÇO para pular"
    },
    "mainMenu": {
      "continue": {
        "label": "Continuar",
        "desc": {
          "canContinue": "Retomar seu loop anterior",
          "noData": "Nenhum dado de loop encontrado"
        }
      },
      "newGame": {
        "label": "Novo Loop",
        "desc": "Começar do zero (apaga os dados)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Configurar parâmetros globais"
      },
      "exit": {
        "label": "Desligar",
        "desc": "Encerrar sessão",
        "confirm": {
          "title": "Desligamento do Sistema",
          "message": "Tem certeza que deseja desligar o sistema? Progresso não salvo pode ser perdido.",
          "cancel": "Cancelar",
          "confirm": "Desligar"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Configurações da BIOS",
      "fullScreen": "Tela cheia",
      "immersiveMode": "Modo imersivo",
      "fullScreenEnter": "Entrar",
      "fullScreenExit": "Sair",
      "softReset": "Reinicialização suave",
      "softResetHint": "Recarregar aplicativo",
      "softResetConfirm": "Reinicialização suave: isso vai recarregar o aplicativo e manter seus dados. Continuar?",
      "factoryReset": "Redefinição de fábrica",
      "factoryResetHint": "Apagar todos os dados",
      "factoryResetConfirm": "REDEFINIÇÃO DE FÁBRICA: isso vai apagar TODOS os dados, usuários e arquivos. Isso não pode ser desfeito. Tem certeza?"
    },
    "footer": {
      "originalDistribution": "Distribuição original",
      "temperedDistribution": "Distribuição temperada"
    }
  },
  "appDescriptions": {
    "finder": "Gerenciador de arquivos",
    "browser": "Acessar a web",
    "mail": "Ler e escrever e-mails",
    "appStore": "Baixar e gerenciar apps",
    "terminal": "Interface de linha de comando",
    "systemSettings": "Configurar o sistema",
    "notepad": "Editar arquivos de texto",
    "messages": "Conversar com amigos",
    "calendar": "Gerenciar sua agenda",
    "photos": "Ver e gerenciar fotos",
    "music": "Ouvir suas músicas favoritas",
    "devCenter": "Ferramentas de desenvolvedor"
  },
  "a11y": {
    "common": {
      "close": "Fechar",
      "open": "Abrir",
      "notAvailable": "N/A"
    },
    "sidebar": {
      "toggleSidebar": "Alternar barra lateral"
    },
    "pagination": {
      "pagination": "Paginação",
      "goToPreviousPage": "Ir para a página anterior",
      "goToNextPage": "Ir para a próxima página",
      "previous": "Anterior",
      "next": "Próxima",
      "morePages": "Mais páginas"
    },
    "breadcrumb": {
      "breadcrumb": "Caminho de navegação",
      "more": "Mais"
    },
    "carousel": {
      "previousSlide": "Slide anterior",
      "nextSlide": "Próximo slide"
    }
  },
  "commandPalette": {
    "title": "Paleta de comandos",
    "description": "Buscar um comando para executar..."
  },
  "login": {
    "softReset": "Reinicialização suave",
    "hardReset": "Reinicialização completa",
    "hardResetConfirm": "Reinicialização completa: isso vai apagar todos os dados. Continuar?",
    "selectUser": "Selecionar usuário",
    "enterPasswordToUnlock": "Digite a senha para desbloquear",
    "restoringPreviousSession": "Restaurando sessão anterior",
    "passwordPlaceholder": "Senha",
    "incorrectPassword": "Senha incorreta",
    "hint": "Dica",
    "enterSystem": "Entrar no sistema",
    "switchAccount": "Trocar conta",
    "back": "Voltar",
    "suspendToSwitch": "Suspender sessão para trocar?",
    "cancel": "Cancelar",
    "switchUser": "Trocar usuário",
    "logOut": "Sair",
    "logOutConfirm": "Sair de {{username}}? Isso vai fechar todas as janelas abertas e descartar alterações não salvas.",
    "active": "Ativo",
    "resume": "Retomar",
    "sessionActive": "Sessão ativa"
  },
  "app": {
    "loadingKernel": "CARREGANDO KERNEL..."
  },
  "menubar": {
    "menus": {
      "file": "Arquivo",
      "shell": "Shell",
      "edit": "Editar",
      "format": "Formatar",
      "song": "Música",
      "view": "Visualizar",
      "go": "Ir",
      "controls": "Controles",
      "window": "Janela",
      "help": "Ajuda",
      "store": "Loja",
      "history": "Histórico",
      "bookmarks": "Favoritos",
      "mailbox": "Caixa de Correio",
      "message": "Mensagem",
      "devCenter": "Centro DEV",
      "tools": "Ferramentas",
      "image": "Imagem",
      "conversations": "Conversas"
    },
    "items": {
      "newWindow": "Nova Janela",
      "newFolder": "Nova Pasta",
      "open": "Abrir",
      "changeWallpaper": "Alterar Papel de Parede",
      "closeWindow": "Fechar Janela",
      "undo": "Desfazer",
      "redo": "Refazer",
      "cut": "Recortar",
      "copy": "Copiar",
      "paste": "Colar",
      "selectAll": "Selecionar Tudo",
      "reload": "Recarregar",
      "toggleFullscreen": "Alternar Tela Cheia",
      "minimize": "Minimizar",
      "bringAllToFront": "Trazer Tudo para Frente",
      "back": "Voltar",
      "forward": "Avançar",
      "enclosingFolder": "Pasta Superior",
      "getInfo": "Obter Informações",
      "moveToTrash": "Mover para a Lixeira"
    },
    "help": {
      "appHelp": "Ajuda do {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Recurso não implementado"
    },
    "system": {
      "aboutThisComputer": "Sobre Este Computador...",
      "systemSettings": "Ajustes do Sistema...",
      "appStore": "Loja de Apps...",
      "lockScreen": "Bloquear Tela",
      "switchUser": "Trocar Usuário",
      "user": "Usuário",
      "logOutAs": "Sair como: {{username}}",
      "viewSystemInfo": "Ver informações do sistema",
      "viewSystemSettings": "Ver ajustes do sistema",
      "returnToLoginWhile": "Retornar à tela de login enquanto",
      "returnToUserSelectionWhile": "Retornar à seleção de usuário enquanto",
      "keepingSession": "mantém a sessão",
      "clearingSession": "limpa a sessão",
      "panic": "PÂNICO",
      "hardReset": "Reinicialização Completa",
      "warning": "Aviso",
      "panicWarningBody": "Isso redefinirá o {{productName}} para os padrões de fábrica. Útil se algo der muito errado.",
      "serverTime": "Horário do Servidor (UTC)",
      "localTime": "Horário Local"
    },
    "app": {
      "aboutApp": "Sobre {{appName}}",
      "settings": "Ajustes...",
      "quitApp": "Sair do {{appName}}"
    }
  },
  "notifications": {
    "title": "Notificações",
    "titles": {
      "permissionDenied": "Permissão negada"
    },
    "clearAll": "Limpar tudo",
    "new": "Novo",
    "subtitles": {
      "appMissing": "APP Faltando",
      "permissionDenied": "Permissão Negada",
      "saved": "Salvo",
      "deleted": "Excluído",
      "moved": "Movido",
      "trash": "Lixeira",
      "failed": "Falhou",
      "ui": "Interface",
      "validation": "Validação",
      "success": "Sucesso",
      "error": "Erro",
      "info": "Informações",
      "warning": "Aviso",
      "fileError": "Erro de Arquivo"
    },
    "empty": "Sem notificações",
    "clearApp": "Limpar tudo deste app"
  },
  "memory": {
    "title": "Memória",
    "used": "Usada",
    "pressure": "Pressão",
    "appMemory": "Memória de Apps",
    "wiredMemory": "Memória Residente",
    "processName": "Nome do Processo",
    "memory": "Memória",
    "swapUsed": "Swap Usado",
    "systemWired": "Sistema Aurora",
    "activeSession": "Memória Residente (Sessão Ativa)",
    "userSession": "Sessão: {{user}}",
    "backgroundSession": "Memória Inativa (Fundo)",
    "backgroundProcesses": "{{count}} Processos em Segundo Plano",
    "instances": "{{count}} Instâncias",
    "type": {
      "mainWindow": "Janela Principal",
      "extraWindow": "Janela Adicional",
      "extraTabs": "{{count}} Abas Extras"
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Verificar atualizações...",
      "viewMyAccount": "Ver minha conta"
    },
    "categories": {
      "all": "Todos",
      "productivity": "Produtividade",
      "media": "Mídia",
      "utilities": "Utilitários",
      "development": "Desenvolvimento",
      "system": "Sistema"
    },
    "searchPlaceholder": "Buscar apps...",
    "empty": {
      "title": "Nenhum app encontrado",
      "description": "Tente ajustar sua busca ou categoria para encontrar o que você procura."
    },
    "size": "Tamanho",
    "sizeUnknown": "Desconhecido",
    "install": "Instalar",
    "uninstall": "Desinstalar",
    "open": "Abrir",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "restore": "Restaurar",
    "checkFailed": "Check Failed",
    "checkFailedTitle": "Installation Check Failed",
    "restoreSuccess": "{{app}} restored successfully",
    "restoreError": "Failed to restore {{app}}",
    "restorePermissionDenied": "Admin privileges required to restore apps",
    "installingWarning": "Aguarde enquanto a aplicação é instalada."
  },
  "browser": {
    "menu": {
      "newTab": "Nova Aba",
      "closeTab": "Fechar Aba"
    },
    "welcome": {
      "searchPlaceholder": "Buscar sites ou digitar endereço...",
      "favorites": "Favoritos",
      "recentActivity": "Atividade Recente"
    },
    "searchPlaceholder": "Buscar ou digitar endereço...",
    "error": {
      "pageNotFound": "Página Não Encontrada",
      "pageNotFoundDesc": "O site {{url}} não pôde ser encontrado.",
      "goHome": "Ir para o Início"
    }
  },
  "music": {
    "sidebar": {
      "library": "Biblioteca",
      "songs": "Músicas",
      "favorites": "Favoritas",
      "recentlyPlayed": "Tocadas Recentemente"
    },
    "titles": {
      "songs": "Músicas",
      "recentlyPlayed": "Tocadas Recentemente"
    },
    "actions": {
      "playAll": "Tocar Tudo"
    },
    "empty": {
      "recent": {
        "title": "Nenhuma música recente",
        "description": "As músicas tocadas recentemente aparecem aqui."
      },
      "library": {
        "title": "Nenhuma música encontrada",
        "description": "Nenhum arquivo de música foi encontrado na pasta Música.",
        "openFolder": "Abrir pasta {{folder}}"
      }
    },
    "folders": {
      "music": "Música",
      "home": "Início"
    },
    "player": {
      "notPlaying": "Nada tocando",
      "selectSong": "Selecionar música"
    },
    "metadata": {
      "unknownArtist": "Artista desconhecido",
      "unknownAlbum": "Álbum desconhecido",
      "unknownTitle": "Título desconhecido"
    },
    "menu": {
      "newPlaylist": "Nova playlist",
      "import": "Importar...",
      "closeWindow": "Fechar janela",
      "showInFinder": "Mostrar no Finder",
      "addToPlaylist": "Adicionar à playlist",
      "play": "Tocar",
      "previousSong": "Música anterior",
      "nextSong": "Próxima música",
      "volumeUp": "Aumentar volume",
      "volumeDown": "Diminuir volume"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Nova aba",
      "clearScrollback": "Limpar histórico",
      "killProcess": "Encerrar Processo"
    },
    "help": {
      "availableCommands": "Comandos disponíveis:",
      "usage": "Uso",
      "appLaunchHelp": "Inicie apps instalados (ex.: Arquivos)"
    },
    "commands": {
      "help": {
        "description": "Mostrar esta ajuda"
      },
      "ls": {
        "description": "Listar conteúdo do diretório",
        "usage": "ls [caminho]"
      },
      "cd": {
        "description": "Mudar de diretório",
        "usage": "cd <caminho>"
      },
      "pwd": {
        "description": "Mostrar diretório de trabalho atual"
      },
      "logout": {
        "description": "Sair da sessão atual"
      },
      "who": {
        "description": "Mostrar usuários logados"
      },
      "clear": {
        "description": "Limpar a tela do terminal"
      },
      "cat": {
        "description": "Mostrar conteúdo de arquivos",
        "usage": "cat <arquivo>"
      },
      "mkdir": {
        "description": "Criar diretório",
        "usage": "mkdir <nome>"
      },
      "touch": {
        "description": "Criar arquivo ou atualizar timestamp",
        "usage": "touch <nome>"
      },
      "rm": {
        "description": "Remover arquivo ou diretório",
        "usage": "rm <nome>"
      },
      "cp": {
        "description": "Copiar arquivos",
        "usage": "cp <origem> <destino>"
      },
      "mv": {
        "description": "Mover (renomear)",
        "usage": "mv <origem> <destino>"
      },
      "chmod": {
        "description": "Alterar permissões (modo) do arquivo",
        "usage": "chmod <modo> <arquivo>"
      },
      "chown": {
        "description": "Alterar proprietário e grupo do arquivo",
        "usage": "chown <proprietario>[:<grupo>] <arquivo>"
      },
      "grep": {
        "description": "Imprimir linhas que correspondem a um padrão",
        "usage": "grep <padrao> <arquivo>"
      },
      "find": {
        "description": "Buscar arquivos na árvore de diretórios",
        "usage": "find [caminho] [-name padrao]"
      },
      "echo": {
        "description": "Imprimir uma linha de texto",
        "usage": "echo [texto]"
      },
      "date": {
        "description": "Mostrar data e hora do sistema"
      },
      "uptime": {
        "description": "Mostrar tempo de atividade do sistema"
      },
      "whoami": {
        "description": "Mostrar usuário atual"
      },
      "hostname": {
        "description": "Mostrar hostname do sistema"
      },
      "reset": {
        "description": "Redefinir o sistema de arquivos para o padrão de fábrica"
      },
      "exit": {
        "description": "Encerrar a sessão atual do shell"
      },
      "su": {
        "description": "Trocar ID de usuário ou virar superusuário",
        "usage": "su [nome-de-usuario] [senha]"
      },
      "sudo": {
        "description": "Executar um comando como outro usuário",
        "usage": "sudo [opcoes] [comando]"
      },
      "history": {
        "description": "Mostrar histórico de comandos do terminal",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} em breve",
    "descriptions": {
      "mail": "Gerencie seus e-mails, contatos e eventos do calendário.",
      "calendar": "Agende reuniões, eventos e lembretes.",
      "default": "Este app está em desenvolvimento."
    }
  },
  "filePicker": {
    "openFile": "Abrir arquivo",
    "openFileDescription": "Selecione um arquivo para abrir do sistema de arquivos",
    "saveFile": "Salvar arquivo",
    "saveFileDescription": "Escolha um local e um nome para salvar seu arquivo",
    "emptyFolder": "Esta pasta está vazia",
    "nameLabel": "Nome:",
    "untitledPlaceholder": "Sem título",
    "toasts": {
      "permissionDenied": "Permissão negada: {{name}}"
    },
    "cancel": "Cancelar",
    "open": "Abrir",
    "save": "Salvar"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "O app Música não está instalado. Instale na Loja de Apps.",
      "notepadNotInstalled": "O Bloco de Notas não está instalado. Instale na Loja de Apps.",
      "photosNotInstalled": "O app Fotos não está instalado. Instale na Loja de Apps."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} itens",
      "bytes": "{{count}} bytes",
      "type": "Tipo",
      "owner": "Proprietário",
      "permissions": "Permissões",
      "modified": "Modificado",
      "size": "Tamanho"
    },
    "sidebar": {
      "favorites": "Favoritos",
      "system": "Sistema",
      "locations": "Locais"
    },
    "places": {
      "home": "Início",
      "desktop": "Área de trabalho",
      "documents": "Documentos",
      "downloads": "Downloads",
      "pictures": "Imagens",
      "music": "Música",
      "trash": "Lixeira"
    },
    "actions": {
      "moveToTrash": "Mover para a lixeira",
      "search": "Pesquisar"
    },
    "toasts": {
      "permissionDenied": "Permissão negada: {{name}}",
      "musicNotInstalled": "O app Música não está instalado. Instale na Loja de Apps.",
      "notepadNotInstalled": "O Bloco de Notas não está instalado. Instale na Loja de Apps.",
      "photosNotInstalled": "O app Fotos não está instalado. Instale na Loja de Apps.",
      "movedItem": "1 item movido",
      "movedItems": "{{count}} itens movidos",
      "movedItemTo": "1 item movido para {{target}}",
      "movedItemsTo": "{{count}} itens movidos para {{target}}",
      "movedItemToTrash": "1 item movido para a lixeira",
      "movedItemsToTrash": "{{count}} itens movidos para a lixeira",
      "moveFailedInvalidData": "Falha ao mover: dados inválidos",
      "failedToProcessDrop": "Falha ao processar o arrastar-e-soltar",
      "couldNotGetInfo": "Não foi possível recuperar as informações",
      "fileTypeNotSupported": "O tipo de arquivo '{{type}}' não é suportado"
    },
    "search": {
      "noResultsTitle": "Nenhum resultado encontrado",
      "noResultsDesc": "Nenhum resultado encontrado para \"{{query}}\"",
      "resultsTitle": "Resultados da Pesquisa ({{count}})"
    },
    "emptyFolder": "Esta pasta está vazia"
  },
  "messages": {
    "title": "Mensagens",
    "sidebar": {
      "conversationsTitle": "Conversas",
      "allMessages": "Todas as mensagens",
      "unread": "Não lidas",
      "starred": "Favoritas"
    },
    "search": {
      "placeholder": "Pesquisar conversas..."
    },
    "menu": {
      "newMessage": "Nova mensagem"
    },
    "auth": {
      "welcomeBack": "Bem-vindo de volta",
      "createAccount": "Criar Conta",
      "recoverAccount": "Recuperar Conta",
      "signInToContinue": "Faça login para continuar no Mensagens",
      "joinSecureNetwork": "Junte-se à rede segura",
      "enterRecoveryKey": "Digite sua chave de recuperação para recuperar o acesso",
      "invalidCredentials": "Nome de usuário ou senha inválidos",
      "credentialsRetrieved": "Credenciais Recuperadas",
      "password": "Senha",
      "returnToLogin": "Voltar ao Login",
      "recoveryKey": "Chave de Recuperação",
      "username": "Nome de usuário",
      "processing": "Processando...",
      "signIn": "Entrar",
      "create": "Criar",
      "recover": "Recuperar",
      "noAccount": "Não tem uma conta? Crie uma",
      "haveAccount": "Já tem uma conta? Entrar",
      "forgotPassword": "Esqueceu a senha?",
      "backToLogin": "Voltar ao Login",
      "accountCreated": "Conta Criada!",
      "saveRecoveryKey": "Por favor, salve sua chave de recuperação. Você precisará dela se esquecer sua senha.",
      "oneTimeShow": "Esta é a única vez que será mostrada.",
      "savedContinue": "Salvei - Continuar",
      "copied": "Copiado",
      "recoveryKeyCopied": "Chave de recuperação copiada para a área de transferência",
      "failedCopy": "Falha ao copiar chave",
      "error": "Erro"
    },
    "ui": {
      "noConversations": "Sem conversas",
      "noResults": "Nenhum resultado encontrado",
      "noChatSelected": "Nenhum chat selecionado",
      "chooseConversation": "Escolha uma conversa ou inicie uma nova.",
      "startNewMessage": "Nova Mensagem",
      "online": "Online",
      "typeMessage": "Mensagem para {{partner}}...",
      "unstar": "Remover estrela",
      "star": "Favoritar",
      "cantMessageSelf": "Você não pode enviar mensagens para si mesmo (ainda)",
      "userNotFound": "Usuário não encontrado",
      "messageFailed": "Falha no envio"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Biblioteca",
      "albumsTitle": "Álbuns"
    },
    "library": {
      "allPhotos": "Todas as fotos",
      "favorites": "Favoritas",
      "recent": "Recentes"
    },
    "menu": {
      "slideshow": "Apresentação",
      "rotateClockwise": "Girar no sentido horário",
      "rotateCounterClockwise": "Girar no sentido anti-horário"
    },
    "empty": {
      "recent": {
        "title": "Nenhuma foto visualizada recentemente",
        "description": "Fotos que você abriu recentemente aparecerão aqui."
      },
      "favorites": {
        "title": "Nenhuma favorita ainda",
        "description": "Marque fotos como favoritas para vê-las aqui."
      },
      "library": {
        "title": "Nenhuma foto encontrada",
        "description": "Nenhum arquivo de foto foi encontrado na sua pasta Imagens.",
        "openFolder": "Abrir pasta {{folder}}"
      },
      "noFolder": {
        "title": "Biblioteca de {{user}} não encontrada",
        "description": "A pasta {{path}} não foi encontrada para este usuário."
      },
      "openHome": "Abrir pasta pessoal"
    },
    "folders": {
      "pictures": "Imagens"
    }
  },
  "mail": {
    "login": {
      "title": "E-mail",
      "subtitle": "Entre na sua conta",
      "emailPlaceholder": "E-mail",
      "passwordPlaceholder": "Senha",
      "signingIn": "Entrando...",
      "signIn": "Entrar",
      "signOut": "Sair",
      "createAccountInfo": "Crie uma conta através de um provedor de e-mail"
    },
    "menu": {
      "newMailbox": "Nova Caixa de Correio",
      "onlineStatus": "Status Online",
      "newMessage": "Nova Mensagem",
      "reply": "Responder",
      "replyAll": "Responder a Todos",
      "forward": "Encaminhar"
    },
    "sidebar": {
      "mailboxes": "Caixas de Correio",
      "inbox": "Entrada",
      "starred": "Favoritas",
      "archived": "Arquivadas",
      "trash": "Lixeira"
    },
    "search": {
      "placeholder": "Buscar e-mails..."
    },
    "empty": {
      "noEmails": "Sem e-mails",
      "noEmailsFound": "Nenhum e-mail encontrado",
      "selectEmail": "Selecione um e-mail para ler"
    },
    "actions": {
      "reply": "Responder",
      "forward": "Encaminhar",
      "archive": "Arquivar",
      "unarchive": "Desarquivar",
      "delete": "Excluir",
      "restore": "Restaurar",
      "deleteForever": "Excluir permanentemente"
    },
    "time": {
      "minutesAgo": "há {{minutes}}m",
      "hoursAgo": "há {{hours}}h",
      "today": "Hoje",
      "yesterday": "Ontem",
      "daysAgo": "há {{days}}d"
    },
    "attachments": {
      "count": "{{count}} anexo",
      "count_plural": "{{count}} anexos",
      "download": "Baixar",
      "downloaded": "Baixado",
      "downloadedTo": "{{name}} baixado para {{folder}}",
      "downloadFailed": "Falha no download",
      "downloadFailedMessage": "Falha ao baixar {{name}}"
    }
  },
  "notepad": {
    "untitled": "Sem título",
    "untitledTab": "Sem título {{index}}",
    "empty": {
      "title": "Bloco de Notas",
      "description": "Crie um novo arquivo ou abra um existente para começar.",
      "newFile": "Novo Arquivo",
      "openFile": "Abrir Arquivo"
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
      "txt": "Texto simples"
    },
    "actions": {
      "openFile": "Abrir arquivo",
      "saveFile": "Salvar arquivo",
      "bold": "Negrito",
      "italic": "Itálico",
      "list": "Lista",
      "heading": "Título"
    },
    "preview": {
      "edit": "Editar",
      "preview": "Pré-visualizar",
      "htmlPreviewTitle": "Prévia HTML"
    },
    "status": {
      "chars": "{{count}} caracteres",
      "lines": "Linha {{count}}"
    },
    "contextSwitcher": {
      "title": "Clique para trocar o contexto",
      "searchPlaceholder": "Buscar idioma...",
      "noLanguageFound": "Nenhum idioma encontrado."
    },
    "toasts": {
      "switchedTo": "Alterado para {{language}}",
      "failedToReadFile": "Falha ao ler o arquivo",
      "fileSaved": "Arquivo salvo",
      "failedToSaveFilePermissions": "Não foi possível salvar (verifique permissões)",
      "saved": "Salvo",
      "failedToSave": "Falha ao salvar"
    },
    "dialog": {
      "unsaved": {
        "title": "Deseja salvar as alterações?",
        "description": "Suas alterações serão perdidas se você não salvar.",
        "dontSave": "Não salvar",
        "cancel": "Cancelar",
        "save": "Salvar"
      }
    },
    "menu": {
      "new": "Novo",
      "open": "Abrir...",
      "save": "Salvar",
      "closeTab": "Fechar aba",
      "bold": "Negrito",
      "italic": "Itálico",
      "list": "Lista",
      "heading1": "Título 1",
      "heading2": "Título 2",
      "togglePreview": "Alternar prévia",
      "zoomIn": "Aumentar zoom",
      "zoomOut": "Diminuir zoom"
    }
  },
  "calendar": {
    "menu": {
      "day": "Dia",
      "week": "Semana",
      "month": "Mês",
      "year": "Ano"
    },
    "toolbar": {
      "today": "Hoje",
      "month": "Mês",
      "day": "Dia"
    },
    "sidebar": {
      "myCalendars": "Meus calendários",
      "filterColors": "Filtrar cores"
    },
    "actions": {
      "createEvent": "Criar evento",
      "createCategory": "Criar categoria",
      "clear": "Limpar",
      "delete": "Remover",
      "cancel": "Cancelar",
      "saveEvent": "Salvar evento"
    },
    "loadingEvents": "Carregando eventos...",
    "toasts": {
      "cannotDeleteSystemCategory": "Categorias do sistema não podem ser excluídas",
      "eventDeleted": "Evento removido",
      "eventSaved": "Evento salvo",
      "requiredFields": "Preencha os campos obrigatórios"
    },
    "modal": {
      "newEvent": "Novo evento",
      "editEvent": "Editar evento",
      "newEventDescription": "Planeje um novo evento no seu calendário.",
      "editEventDescription": "Veja ou edite os detalhes do evento.",
      "fields": {
        "title": "Título",
        "date": "Data",
        "time": "Hora",
        "duration": "Duração",
        "type": "Tipo",
        "location": "Local",
        "color": "Cor",
        "notes": "Notas"
      },
      "placeholders": {
        "eventTitle": "Título do evento",
        "pickDate": "Selecionar data",
        "searchTime": "Buscar horário...",
        "noTimeFound": "Nenhum horário encontrado.",
        "selectDuration": "Selecionar duração",
        "searchDuration": "Buscar duração...",
        "noDurationFound": "Nenhuma duração encontrada.",
        "selectType": "Selecionar tipo",
        "searchType": "Buscar tipo...",
        "noTypeFound": "Nenhum tipo encontrado.",
        "addLocation": "Adicionar local",
        "addNotes": "Adicionar notas..."
      },
      "durationMinutes": "{{minutes}} min",
      "minutesOption": "{{minutes}} minutos"
    },
    "categories": {
      "all": "Todos",
      "work": "Trabalho",
      "personal": "Pessoal",
      "social": "Social",
      "events": "Eventos",
      "family": "Família"
    },
    "types": {
      "work": "Trabalho",
      "personal": "Pessoal",
      "social": "Social",
      "events": "Eventos",
      "family": "Família",
      "other": "Outros"
    },
    "colors": {
      "blue": "Azul",
      "green": "Verde",
      "red": "Vermelho",
      "yellow": "Amarelo",
      "purple": "Roxo",
      "pink": "Rosa",
      "orange": "Laranja",
      "gray": "Cinza"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Loop iniciado",
        "location": "Torre",
        "notes": "Sistema de arquivos inicial."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "Geral",
      "dashboard": "Painel",
      "interfaceTitle": "Interface",
      "uiAndSounds": "UI e Sons",
      "systemTitle": "Sistema",
      "storage": "Armazenamento",
      "fileSystem": "Sistema de arquivos",
      "appsTitle": "Apps",
      "performance": "Desempenho"
    },
    "dashboard": {
      "title": "Painel",
      "description": "Visão geral do sistema em breve."
    },
    "ui": {
      "title": "Interface e Comentários",
      "notificationsTitle": "Notificações",
      "successToast": "Sucesso",
      "warningToast": "Aviso",
      "errorToast": "Erro",
      "soundFeedback": "Feedback sonoro",
      "buttons": {
        "success": "Sucesso",
        "warning": "Aviso",
        "error": "Erro",
        "app": "Notificação de App",
        "open": "Abrir",
        "close": "Fechar",
        "click": "Clique",
        "hover": "Pairar"
      }
    },
    "storage": {
      "title": "Inspetor de armazenamento",
      "import": "Importar",
      "export": "Exportar",
      "clear": "Limpar",
      "toastTitle": "Armazenamento",
      "exportSuccess": "Configurações exportadas com sucesso",
      "exportFail": "Falha ao exportar configurações",
      "importSuccess": "Configurações importadas com sucesso",
      "importFail": "Não foi possível interpretar o arquivo de importação",
      "clearConfirm": "Deseja realmente apagar TODOS os valores do armazenamento local? Isso redefine preferências de uso, tema e posições das janelas.",
      "clearSuccess": "Todas as chaves removidas",
      "softMemory": "Soft Memory (preferências)",
      "hardMemory": "Hard Memory (sistema de arquivos)",
      "keysCount": "{{count}} chaves",
      "localStorageKeys": "Chaves do Local Storage"
    },
    "filesystem": {
      "title": "Debugger do sistema de arquivos"
    },
    "performance": {
      "title": "Monitor de desempenho"
    },
    "menu": {
      "resetFilesystem": "Redefinir sistema de arquivos",
      "runDiagnostics": "Executar diagnóstico"
    },
    "messages": {
      "createValues": {
        "title": "Criar / Redefinir Conta",
        "username": "Nome de usuário",
        "password": "Senha",
        "button": "Criar conta",
        "success": "Conta {{username}} criada"
      },
      "registry": {
        "title": "Registro de Contas",
        "empty": "Nenhuma conta encontrada",
        "useInSender": "Usar no Remetente",
        "delete": "Excluir conta",
        "deleteConfirm": "Excluir conta {{username}}? Isso não pode ser desfeito.",
        "deleteSuccess": "Conta {{username}} excluída"
      },
      "sendMessage": {
        "title": "Enviar mensagem",
        "from": "Remetente (De)",
        "to": "Destinatário (Para)",
        "selectAccount": "Selecionar conta...",
        "content": "Conteúdo",
        "placeholder": "Digite uma mensagem...",
        "button": "Enviar mensagem",
        "success": "Mensagem enviada"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Sistema",
      "general": "Geral"
    },
    "sections": {
      "appearance": "Aparência",
      "performance": "Desempenho",
      "displays": "Monitores",
      "notifications": "Notificações",
      "network": "Rede",
      "security": "Segurança e privacidade",
      "users": "Usuários e grupos",
      "storage": "Armazenamento",
      "about": "Sobre"
    },
    "appearance": {
      "title": "Aparência",
      "languageTitle": "Idioma",
      "languageDescription": "Escolha o idioma da interface do sistema",
      "languagePlaceholder": "Selecionar idioma",
      "wallpaperTitle": "Papel de parede",
      "wallpaperDescription": "Escolha um plano de fundo para a área de trabalho",
      "accentTitle": "Cor de destaque",
      "accentDescription": "Escolha uma cor de destaque para personalizar o desktop",
      "presetColors": "Cores predefinidas",
      "customColor": "Cor personalizada",
      "customColorHint": "Digite um hex (ex.: #3b82f6)",
      "preview": "Prévia",
      "previewPrimary": "Primário",
      "previewOutlined": "Contornado",
      "themeModeTitle": "Modo de tema",
      "themeModeDescription": "Defina como a cor de destaque influencia as tonalidades do fundo",
      "themeModeNeutralTitle": "Neutro",
      "themeModeNeutralDesc": "Apenas tons naturais de cinza",
      "themeModeShadesTitle": "Tonalidades",
      "themeModeShadesDesc": "Tons da cor de destaque",
      "themeModeContrastTitle": "Contraste",
      "themeModeContrastDesc": "Cores complementares",
      "themeTitle": "Tema",
      "themeDark": "Escuro",
      "themeLightSoon": "Claro (em breve)",
      "wallpaperActive": "Ativo",
      "wallpaperUse": "Usar"
    },
    "performance": {
      "blurTitle": "Desfoque e transparência",
      "blurDescription": "Ativar efeito de vidro e transparência das janelas",
      "reduceMotionTitle": "Reduzir movimento",
      "reduceMotionDescription": "Desativar animações para resposta mais rápida e acessibilidade",
      "disableShadowsTitle": "Desativar sombras",
      "disableShadowsDescription": "Remover sombras das janelas para melhorar desempenho",
      "disableGradientsTitle": "Desativar gradientes",
      "disableGradientsDescription": "Usar cores sólidas em vez de gradientes nos ícones"
    },
    "placeholders": {
      "displaysTitle": "Configurações de exibição",
      "displaysDescription": "Resolução, escala e brilho em breve.",
      "notificationsTitle": "Notificações",
      "notificationsDescription": "Configurações da central de notificações em breve.",
      "networkTitle": "Rede",
      "networkDescription": "Configuração de Wi‑Fi e Bluetooth em breve.",
      "securityTitle": "Segurança e privacidade",
      "securityDescription": "Firewall, permissões e privacidade em breve.",
      "storageTitle": "Armazenamento",
      "storageDescription": "Análise e gerenciamento de uso de armazenamento em breve."
    },
    "users": {
      "currentUsersTitle": "Usuários atuais",
      "addUser": "Adicionar usuário",
      "cancel": "Cancelar",
      "editAction": "Editar",
      "newUserDetails": "Detalhes do novo usuário",
      "usernamePlaceholder": "Nome de usuário (ex.: alice)",
      "fullNamePlaceholder": "Nome completo",
      "passwordOptionalPlaceholder": "Senha (opcional)",
      "passwordHintOptionalPlaceholder": "Dica de senha (opcional)",
      "createUser": "Criar usuário",
      "userExists": "Usuário já existe",
      "currentBadge": "Atual",
      "rootBadge": "Root",
      "adminBadge": "Admin",
      "confirmDeleteUser": "Deseja realmente excluir {{username}}?",
      "editForm": {
        "fullNameLabel": "Nome completo",
        "roleLabel": "Função",
        "administrator": "Administrador",
        "newPasswordLabel": "Nova senha (deixe em branco para manter a atual)",
        "passwordHintLabel": "Dica de senha",
        "saveChanges": "Salvar alterações"
      }
    },
    "about": {
      "version": "Versão",
      "framework": "Framework",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Ambiente",
      "browserMode": "Modo navegador",
      "developerMode": "Modo desenvolvedor",
      "developerModeDescription": "Ativar ferramentas avançadas e recursos de depuração",
      "exposeRootUser": "Exibir usuário root",
      "exposeRootUserDescription": "Mostrar o usuário root na tela de login",
      "memoryUsage": "Uso de memória",
      "preferencesSoft": "Preferências (Soft Memory)",
      "filesystemHard": "Sistema de arquivos (Hard Memory)",
      "total": "Total"
    },
    "danger": {
      "title": "Zona de Perigo",
      "softResetTitle": "Reinicialização Suave",
      "softResetDescription": "Redefine preferências, tema, posições de ícones e estados de apps. Seus arquivos e pastas serão preservados.",
      "resetPreferences": "Redefinir Preferências",
      "confirmReset": "Confirmar Redefinição",
      "hardResetTitle": "Reinicialização Completa",
      "hardResetDescription": "Apaga completamente todos os dados, incluindo arquivos, pastas e configurações. Esta ação não pode ser desfeita.",
      "hardResetWarning": "⚠️ Todos os arquivos e pastas personalizados serão excluídos permanentemente",
      "factoryReset": "Redefinição de Fábrica",
      "deleteEverything": "Sim, Excluir Tudo"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Bem-vindo ao Aurora",
        "description": "Selecione seu idioma para começar"
      },
      "account": {
        "title": "Crie Sua Conta",
        "description": "Configure a conta principal de administrador"
      },
      "theme": {
        "title": "Personalizar",
        "description": "Deixe com a sua cara"
      },
      "finishing": {
        "title": "Configurando...",
        "description": "Aplicando configurações"
      }
    },
    "account": {
      "fullName": "Nome Completo",
      "fullNamePlaceholder": "Exemplo: João Silva",
      "username": "Usuário",
      "password": "Senha",
      "passwordHint": "Dica da Senha (Opcional)",
      "passwordHintPlaceholder": "Exemplo: Nome do seu primeiro pet"
    },
    "theme": {
      "mode": "Modo do Tema",
      "accentColor": "Cor de Destaque",
      "darkMode": "Escuro (Neutral)",
      "lightMode": "Claro",
      "comingSoon": "Em breve"
    },
    "finishing": {
      "title": "Tudo pronto!",
      "subtitle": "O Aurora OS está pronto. Redirecionando para a tela de login..."
    },
    "search": {
      "placeholder": "Buscar idioma...",
      "noResults": "Nenhum idioma encontrado"
    },
    "validation": {
      "requiredFields": "Preencha todos os campos obrigatórios",
      "passwordLength": "A senha deve ter pelo menos 6 caracteres",
      "userExists": "O usuário já existe. Por favor, escolha outro nome de usuário.",
      "fullNameFormat": "O nome completo deve conter apenas letras, espaços e hifens",
      "usernameFormat": "O nome de usuário deve conter apenas letras minúsculas e números",
      "hintLength": "A dica de senha é muito longa (máx. 50 caracteres)",
      "hintSecurity": "A dica de senha não pode conter a própria senha",
      "hintFormat": "A dica de senha contém caracteres inválidos",
      "creationFailed": "Falha ao criar conta. Por favor, tente novamente."
    },
    "buttons": {
      "next": "Próximo",
      "back": "Voltar",
      "startUsing": "Começar a Usar o Aurora"
    }
  },
  "battery": {
    "title": "Bateria",
    "charging": "Carregando",
    "fullyCharged": "Totalmente Carregada",
    "remaining": "{{percentage}}% Restante",
    "powerSource": "Fonte de Energia:",
    "powerSources": {
      "adapter": "Adaptador de Energia",
      "battery": "Bateria"
    },
    "condition": "Condição (Est.)",
    "metrics": {
      "health": "Saúde",
      "cycles": "Ciclos",
      "temp": "Temp",
      "voltage": "Voltagem"
    },
    "disclaimer": "As métricas de saúde e condição da bateria são estimativas baseadas nos sensores do sistema disponíveis. Os valores reais podem variar.",
    "showPercentage": "Mostrar porcentagem na barra de menus"
  },
  "audio": {
    "title": "Som",
    "muteAll": "Silenciar Tudo",
    "unmute": "Reativar Som",
    "masterVolume": "Volume Principal",
    "mixer": "Mixer",
    "categories": {
      "music": "Música",
      "system": "Alertas do Sistema",
      "interface": "Interface",
      "feedback": "Feedback de Entrada",
      "ambiance": "Ambiente"
    },
    "mixerLabels": {
      "masterOutput": "Saída Principal",
      "musicAppLevel": "Nível da Música",
      "sfxInterface": "Efeitos e Interface",
      "backgroundLoop": "Loop de Fundo"
    }
  }
};

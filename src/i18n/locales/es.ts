import type { TranslationDict } from '@/i18n/types';

export const es: TranslationDict = {
  "time": {
    "yesterday": "Ayer"
  },
  "common": {
    "name": "Nombre",
    "color": "Color",
    "cancel": "Cancelar",
    "save": "Guardar"
  },
  "game": {
    "intro": {
      "initialize": "Inicializar sistema",
      "clickToStart": "CLIC PARA COMENZAR",
      "skipHint": "ESC o ESPACIO para omitir"
    },
    "mainMenu": {
      "continue": {
        "label": "Continuar",
        "desc": {
          "canContinue": "Reanudar tu bucle anterior",
          "noData": "No se encontraron datos del bucle"
        }
      },
      "newGame": {
        "label": "Nuevo bucle",
        "desc": "Empezar de cero (borra los datos)"
      },
      "settings": {
        "label": "BIOS",
        "desc": "Configurar parámetros globales"
      },
      "exit": {
        "label": "Apagar",
        "desc": "Terminar sesión",
        "confirm": {
          "title": "Apagado del Sistema",
          "message": "¿Estás seguro de que quieres apagar el sistema? El progreso no guardado puede perderse.",
          "cancel": "Cancelar",
          "confirm": "Apagar"
        }
      },
      "credits": {}
    },
    "bios": {
      "title": "Ajustes de BIOS",
      "hardwareAcceleration": "Aceleración de hardware",
      "fullScreen": "Pantalla completa",
      "immersiveMode": "Modo inmersivo",
      "fullScreenEnter": "Entrar",
      "fullScreenExit": "Salir",
      "softReset": "Reinicio suave",
      "softResetHint": "Recargar aplicación",
      "softResetConfirm": "Reinicio suave: esto recargará la aplicación pero mantendrá tus datos. ¿Continuar?",
      "factoryReset": "Reinicio total",
      "factoryResetHint": "Borrar todos los datos",
      "factoryResetConfirm": "REINICIO TOTAL: esto borrará TODOS los datos, usuarios y archivos. No se puede deshacer. ¿Estás seguro?"
    },
    "footer": {
      "originalDistribution": "Distribución original",
      "temperedDistribution": "Distribución alterada"
    }
  },
  "appDescriptions": {
    "finder": "Administrador de archivos",
    "browser": "Accede a la web",
    "mail": "Lee y escribe correos",
    "appStore": "Descarga y administra apps",
    "terminal": "Interfaz de línea de comandos",
    "systemSettings": "Configura tu sistema",
    "notepad": "Edita archivos de texto",
    "messages": "Chatea con amigos",
    "calendar": "Gestiona tu agenda",
    "photos": "Ver y administrar fotos",
    "music": "Reproduce tu música favorita",
    "devCenter": "Herramientas de desarrollo"
  },
  "a11y": {
    "common": {
      "close": "Cerrar",
      "open": "Abrir",
      "notAvailable": "N/A"
    },
    "sidebar": {
      "toggleSidebar": "Alternar barra lateral"
    },
    "pagination": {
      "pagination": "Paginación",
      "goToPreviousPage": "Ir a la página anterior",
      "goToNextPage": "Ir a la página siguiente",
      "previous": "Anterior",
      "next": "Siguiente",
      "morePages": "Más páginas"
    },
    "breadcrumb": {
      "breadcrumb": "Migas de pan",
      "more": "Más"
    },
    "carousel": {
      "previousSlide": "Diapositiva anterior",
      "nextSlide": "Siguiente diapositiva"
    }
  },
  "commandPalette": {
    "title": "Paleta de comandos",
    "description": "Busca un comando para ejecutar..."
  },
  "login": {
    "softReset": "Reinicio suave",
    "hardReset": "Reinicio total",
    "hardResetConfirm": "Reinicio total: esto borrará todos los datos. ¿Continuar?",
    "selectUser": "Seleccionar usuario",
    "enterPasswordToUnlock": "Introduce la contraseña para desbloquear",
    "restoringPreviousSession": "Restaurando sesión anterior",
    "passwordPlaceholder": "Contraseña",
    "incorrectPassword": "Contraseña incorrecta",
    "hint": "Pista",
    "enterSystem": "Entrar al sistema",
    "switchAccount": "Cambiar cuenta",
    "back": "Atrás",
    "suspendToSwitch": "¿Suspender la sesión para cambiar?",
    "cancel": "Cancelar",
    "switchUser": "Cambiar usuario",
    "logOut": "Cerrar sesión",
    "logOutConfirm": "¿Cerrar sesión de {{username}}? Esto cerrará todas las ventanas y descartará cambios sin guardar.",
    "active": "Activo",
    "resume": "Reanudar",
    "sessionActive": "Sesión activa"
  },
  "app": {
    "loadingKernel": "CARGANDO KERNEL..."
  },
  "menubar": {
    "menus": {
      "file": "Archivo",
      "shell": "Shell",
      "edit": "Editar",
      "format": "Formato",
      "song": "Canción",
      "view": "Ver",
      "go": "Ir",
      "controls": "Controles",
      "window": "Ventana",
      "help": "Ayuda",
      "store": "Tienda",
      "history": "Historial",
      "bookmarks": "Marcadores",
      "mailbox": "Buzón",
      "message": "Mensaje",
      "devCenter": "Centro DEV",
      "tools": "Herramientas",
      "image": "Imagen",
      "conversations": "Conversaciones"
    },
    "items": {
      "newWindow": "Nueva ventana",
      "newFolder": "Nueva Carpeta",
      "open": "Abrir",
      "changeWallpaper": "Cambiar Fondo",
      "closeWindow": "Cerrar Ventana",
      "undo": "Deshacer",
      "redo": "Rehacer",
      "cut": "Cortar",
      "copy": "Copiar",
      "paste": "Pegar",
      "selectAll": "Seleccionar todo",
      "reload": "Recargar",
      "toggleFullscreen": "Alternar pantalla completa",
      "minimize": "Minimizar",
      "bringAllToFront": "Traer todo al frente",
      "back": "Atrás",
      "forward": "Adelante",
      "enclosingFolder": "Carpeta Superior",
      "getInfo": "Obtener Información",
      "moveToTrash": "Mover a la papelera"
    },
    "help": {
      "appHelp": "Ayuda de {{appName}}"
    },
    "default": {
      "featureNotImplemented": "Función no implementada"
    },
    "system": {
      "aboutThisComputer": "Acerca de este equipo...",
      "systemSettings": "Configuración del sistema...",
      "appStore": "Tienda de apps...",
      "lockScreen": "Bloquear pantalla",
      "switchUser": "Cambiar usuario",
      "user": "Usuario",
      "logOutAs": "Cerrar sesión: {{username}}",
      "viewSystemInfo": "Ver información del sistema",
      "viewSystemSettings": "Ver configuración del sistema",
      "returnToLoginWhile": "Volver a la pantalla de inicio mientras",
      "returnToUserSelectionWhile": "Volver a la selección de usuario mientras",
      "keepingSession": "se mantiene la sesión",
      "clearingSession": "se limpia la sesión",
      "panic": "PÁNICO",
      "hardReset": "Reinicio total",
      "warning": "Advertencia",
      "panicWarningBody": "Esto restablecerá {{productName}} a valores de fábrica. Útil como botón de pánico si algo falla.",
      "serverTime": "Hora del Servidor (UTC)",
      "localTime": "Hora Local"
    },
    "app": {
      "aboutApp": "Acerca de {{appName}}",
      "settings": "Configuración...",
      "quitApp": "Salir de {{appName}}"
    }
  },
  "notifications": {
    "title": "Notificaciones",
    "titles": {
      "permissionDenied": "Permiso denegado"
    },
    "clearAll": "Borrar todo",
    "new": "Nuevo",
    "subtitles": {
      "appMissing": "APP faltante",
      "permissionDenied": "Permiso denegado",
      "saved": "Guardado",
      "deleted": "Eliminado",
      "moved": "Movido",
      "trash": "Papelera",
      "failed": "Fallido",
      "ui": "Interfaz",
      "validation": "Validación",
      "success": "Éxito",
      "error": "Error",
      "info": "Información",
      "warning": "Advertencia",
      "fileError": "Error de archivo"
    },
    "empty": "No hay notificaciones",
    "clearApp": "Borrar todo de esta app",
    "messageFrom": "Mensaje de {{sender}}"
  },
  "memory": {
    "title": "Memoria",
    "used": "Usada",
    "pressure": "Presión",
    "appMemory": "Memoria de Apps",
    "wiredMemory": "Memoria Reservada",
    "processName": "Nombre del Proceso",
    "memory": "Memoria",
    "swapUsed": "Intercambio Usado",
    "systemWired": "Sistema Aurora",
    "activeSession": "Memoria Reservada (Sesión Activa)",
    "userSession": "Sesión: {{user}}",
    "backgroundSession": "Memoria Inactiva (Fondo)",
    "backgroundProcesses": "{{count}} Procesos en Segundo Plano",
    "instances": "{{count}} Instancias",
    "type": {
      "mainWindow": "Ventana Principal",
      "extraWindow": "Ventana Adicional",
      "extraTabs": "{{count}} Pestañas Extra"
    },
    "error": {
      "title": "Memoria Insuficiente",
      "description": "No se puede abrir {{appName}}. No hay suficiente RAM disponible."
    }
  },
  "appStore": {
    "menu": {
      "checkForUpdates": "Buscar actualizaciones...",
      "viewMyAccount": "Ver mi cuenta"
    },
    "categories": {
      "all": "Todas",
      "productivity": "Productividad",
      "media": "Multimedia",
      "utilities": "Utilidades",
      "development": "Desarrollo",
      "system": "Sistema"
    },
    "searchPlaceholder": "Buscar apps...",
    "empty": {
      "title": "No se encontraron apps",
      "description": "Prueba ajustando tu búsqueda o filtro de categoría para encontrar lo que buscas."
    },
    "size": "Tamaño",
    "sizeUnknown": "Desconocido",
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
    "installingWarning": "Por favor espere mientras se instala la aplicación."
  },
  "browser": {
    "menu": {
      "newTab": "Nueva pestaña",
      "closeTab": "Cerrar pestaña"
    },
    "welcome": {
      "title": "Navegador",
      "description": "Busca información o introduce una URL para empezar a navegar.",
      "searchPlaceholder": "Busca sitios web o introduce una dirección...",
      "favorites": "Favoritos",
      "recentActivity": "Actividad reciente"
    },
    "searchPlaceholder": "Busca o introduce una dirección...",
    "error": {
      "pageNotFound": "Página no encontrada",
      "pageNotFoundDesc": "No se ha podido encontrar el sitio web {{url}}.",
      "goHome": "Ir al inicio"
    }
  },
  "music": {
    "sidebar": {
      "library": "Biblioteca",
      "songs": "Canciones",
      "favorites": "Favoritos",
      "recentlyPlayed": "Reproducido recientemente"
    },
    "titles": {
      "songs": "Canciones",
      "recentlyPlayed": "Reproducido recientemente"
    },
    "actions": {
      "playAll": "Reproducir todo"
    },
    "empty": {
      "recent": {
        "title": "No hay canciones reproducidas recientemente",
        "description": "Tus canciones reproducidas recientemente aparecerán aquí."
      },
      "library": {
        "title": "No se encontraron canciones",
        "description": "No se encontraron archivos de música en tu carpeta Música.",
        "openFolder": "Abrir carpeta {{folder}}"
      }
    },
    "folders": {
      "music": "Música",
      "home": "Inicio"
    },
    "player": {
      "notPlaying": "No se está reproduciendo",
      "selectSong": "Selecciona una canción"
    },
    "metadata": {
      "unknownArtist": "Artista desconocido",
      "unknownAlbum": "Álbum desconocido",
      "unknownTitle": "Título desconocido"
    },
    "menu": {
      "newPlaylist": "Nueva lista de reproducción",
      "import": "Importar...",
      "closeWindow": "Cerrar ventana",
      "showInFinder": "Mostrar en Finder",
      "addToPlaylist": "Agregar a la lista de reproducción",
      "play": "Reproducir",
      "previousSong": "Canción anterior",
      "nextSong": "Siguiente canción",
      "volumeUp": "Subir volumen",
      "volumeDown": "Bajar volumen"
    }
  },
  "terminal": {
    "menu": {
      "newTab": "Nueva Pestaña",
      "clearScrollback": "Borrar Historial",
      "killProcess": "Matar Proceso"
    },
    "help": {
      "availableCommands": "Comandos disponibles:",
      "usage": "Uso",
      "appLaunchHelp": "Lanzar aplicaciones instaladas (p. ej. Finder)"
    },
    "commands": {
      "help": {
        "description": "Mostrar este mensaje de ayuda"
      },
      "ls": {
        "description": "Listar contenido del directorio",
        "usage": "ls [camino]"
      },
      "cd": {
        "description": "Cambiar directorio",
        "usage": "cd <camino>"
      },
      "pwd": {
        "description": "Imprimir directorio de trabajo"
      },
      "logout": {
        "description": "Cerrar la sesión actual"
      },
      "who": {
        "description": "Mostrar quién ha iniciado sesión"
      },
      "clear": {
        "description": "Limpiar la pantalla del terminal"
      },
      "cat": {
        "description": "Mostrar contenido del archivo",
        "usage": "cat <archivo>"
      },
      "mkdir": {
        "description": "Crear directorio",
        "usage": "mkdir <nombre>"
      },
      "touch": {
        "description": "Crear archivo o actualizar marca de tiempo",
        "usage": "touch <nombre>"
      },
      "rm": {
        "description": "Eliminar archivo o directorio",
        "usage": "rm <nombre>"
      },
      "cp": {
        "description": "Copiar archivos",
        "usage": "cp <origen> <destino>"
      },
      "mv": {
        "description": "Mover (renombrar) archivos",
        "usage": "mv <origen> <destino>"
      },
      "chmod": {
        "description": "Cambiar modos (permisos) de archivo",
        "usage": "chmod <modo> <archivo>"
      },
      "chown": {
        "description": "Cambiar propietario y grupo del archivo",
        "usage": "chown <propietario>[:<grupo>] <archivo>"
      },
      "grep": {
        "description": "Imprimir líneas que coincidan con un patrón",
        "usage": "grep <patrón> <archivo>"
      },
      "find": {
        "description": "Buscar archivos en una jerarquía de directorios",
        "usage": "find [camino] [-name patrón]"
      },
      "echo": {
        "description": "Mostrar una línea de texto",
        "usage": "echo [texto]"
      },
      "date": {
        "description": "Imprimir la fecha y hora del sistema"
      },
      "uptime": {
        "description": "Indicar cuánto tiempo ha estado funcionando el sistema"
      },
      "whoami": {
        "description": "Imprimir usuario actual"
      },
      "hostname": {
        "description": "Imprimir nombre del sistema"
      },
      "reset": {
        "description": "Restablecer sistema de archivos a valores de fábrica"
      },
      "exit": {
        "description": "Salir de la sesión de shell actual"
      },
      "su": {
        "description": "Cambiar ID de usuario o convertirse en superusuario",
        "usage": "su [usuario] [contraseña]"
      },
      "sudo": {
        "description": "Ejecutar un comando como otro usuario",
        "usage": "sudo [opciones] [comando]"
      },
      "history": {
        "description": "Mostrar historial de comandos del terminal",
        "usage": "history [-c] [n]"
      }
    }
  },
  "placeholderApp": {
    "comingSoonTitle": "{{title}} llegará pronto",
    "descriptions": {
      "mail": "Gestiona tus correos, contactos y eventos del calendario.",
      "calendar": "Programa reuniones, eventos y recordatorios.",
      "default": "Esta aplicación está en desarrollo."
    }
  },
  "filePicker": {
    "openFile": "Abrir archivo",
    "openFileDescription": "Seleccione un archivo para abrir del sistema de archivos",
    "saveFile": "Guardar archivo",
    "saveFileDescription": "Elija una ubicación y un nombre para guardar su archivo",
    "emptyFolder": "Esta carpeta está vacía",
    "nameLabel": "Nombre:",
    "untitledPlaceholder": "Sin título",
    "toasts": {
      "permissionDenied": "Permiso denegado: {{name}}"
    },
    "cancel": "Cancelar",
    "open": "Abrir",
    "save": "Guardar"
  },
  "os": {
    "toasts": {
      "musicNotInstalled": "La app Música no está instalada. Instálala desde la App Store.",
      "notepadNotInstalled": "La app Bloc de notas no está instalada. Instálala desde la App Store.",
      "photosNotInstalled": "La app Fotos no está instalada. Instálala desde la App Store."
    }
  },
  "fileManager": {
    "details": {
      "items": "{{count}} elementos",
      "bytes": "{{count}} bytes",
      "type": "Tipo",
      "owner": "Propietario",
      "permissions": "Permisos",
      "modified": "Modificado",
      "size": "Tamaño"
    },
    "sidebar": {
      "favorites": "Favoritos",
      "system": "Sistema",
      "locations": "Ubicaciones"
    },
    "places": {
      "home": "Inicio",
      "desktop": "Escritorio",
      "documents": "Documentos",
      "downloads": "Descargas",
      "pictures": "Imágenes",
      "music": "Música",
      "trash": "Papelera"
    },
    "actions": {
      "moveToTrash": "Mover a la papelera",
      "search": "Buscar"
    },
    "toasts": {
      "permissionDenied": "Permiso denegado: {{name}}",
      "musicNotInstalled": "La app Música no está instalada. Instálala desde la App Store.",
      "notepadNotInstalled": "La app Bloc de notas no está instalada. Instálala desde la App Store.",
      "photosNotInstalled": "La app Fotos no está instalada. Instálala desde la App Store.",
      "movedItem": "Se movió 1 elemento",
      "movedItems": "Se movieron {{count}} elementos",
      "movedItemTo": "Se movió 1 elemento a {{target}}",
      "movedItemsTo": "Se movieron {{count}} elementos a {{target}}",
      "movedItemToTrash": "Se movió 1 elemento a la papelera",
      "movedItemsToTrash": "Se movieron {{count}} elementos a la papelera",
      "moveFailedInvalidData": "Movimiento fallido: datos inválidos",
      "failedToProcessDrop": "No se pudo procesar el arrastre",
      "couldNotGetInfo": "No se pudo obtener la información",
      "fileTypeNotSupported": "El tipo de archivo '{{type}}' no es compatible"
    },
    "search": {
      "noResultsTitle": "No se encontraron resultados",
      "noResultsDesc": "No se encontraron resultados para \"{{query}}\"",
      "resultsTitle": "Resultados de búsqueda ({{count}})"
    },
    "emptyFolder": "Esta carpeta está vacía"
  },
  "messages": {
    "title": "Mensajes",
    "sidebar": {
      "conversationsTitle": "Conversaciones",
      "allMessages": "Todos los mensajes",
      "unread": "No leídos",
      "starred": "Destacados"
    },
    "search": {
      "placeholder": "Buscar conversaciones..."
    },
    "menu": {
      "newMessage": "Nuevo mensaje"
    },
    "auth": {
      "welcomeBack": "Bienvenido de nuevo",
      "createAccount": "Crear cuenta",
      "recoverAccount": "Recuperar cuenta",
      "signInToContinue": "Inicia sesión para continuar en Mensajes",
      "joinSecureNetwork": "Únete a la red segura",
      "enterRecoveryKey": "Introduce tu clave de recuperación para acceder",
      "invalidCredentials": "Nombre de usuario o contraseña inválidos",
      "credentialsRetrieved": "Credenciales recuperadas",
      "password": "Contraseña",
      "returnToLogin": "Volver al inicio de sesión",
      "recoveryKey": "Clave de recuperación",
      "username": "Nombre de usuario",
      "processing": "Procesando...",
      "signIn": "Iniciar sesión",
      "create": "Crear cuenta",
      "recover": "Recuperar contraseña",
      "noAccount": "¿No tienes una cuenta? Crea una",
      "haveAccount": "¿Ya tienes una cuenta? Inicia sesión",
      "forgotPassword": "¿Olvidaste tu contraseña?",
      "backToLogin": "Volver al inicio de sesión",
      "accountCreated": "¡Cuenta creada!",
      "saveRecoveryKey": "Por favor guarda tu clave de recuperación. La necesitarás si olvidas tu contraseña.",
      "oneTimeShow": "Esta es la única vez que se mostrará.",
      "savedContinue": "La he guardado - Continuar",
      "copied": "Copiado",
      "recoveryKeyCopied": "Clave de recuperación copiada al portapapeles",
      "failedCopy": "Error al copiar la clave",
      "error": "Error"
    },
    "ui": {
      "noConversations": "No hay conversaciones",
      "noResults": "No se encontraron resultados",
      "noChatSelected": "Ningún chat seleccionado",
      "chooseConversation": "Elige una conversación o empieza una nueva.",
      "startNewMessage": "Empezar nuevo mensaje",
      "online": "En línea",
      "typeMessage": "Mensaje a {{partner}}...",
      "unstar": "Desmarcar",
      "star": "Destacar",
      "cantMessageSelf": "No puedes enviarte mensajes a ti mismo (aún)",
      "userNotFound": "Usuario no encontrado",
      "messageFailed": "Mensaje fallido"
    }
  },
  "photos": {
    "sidebar": {
      "libraryTitle": "Biblioteca",
      "albumsTitle": "Álbumes"
    },
    "library": {
      "allPhotos": "Todas las fotos",
      "favorites": "Favoritos",
      "recent": "Recientes",
      "userLibrary": "Biblioteca de {{user}}"
    },
    "menu": {
      "slideshow": "Presentación",
      "rotateClockwise": "Girar a la derecha",
      "rotateCounterClockwise": "Girar a la izquierda"
    },
    "empty": {
      "recent": {
        "title": "No hay fotos vistas recientemente",
        "description": "Tus fotos abiertas recientemente aparecerán aquí."
      },
      "favorites": {
        "title": "Aún no hay favoritos",
        "description": "Marca fotos como favoritas para verlas aquí."
      },
      "library": {
        "title": "No se encontraron fotos",
        "description": "No se encontraron archivos de fotos en tu carpeta de Imágenes.",
        "openFolder": "Abrir carpeta {{folder}}"
      },
      "noFolder": {
        "title": "Biblioteca de {{user}} no encontrada",
        "description": "No se encontró la carpeta {{path}} para este usuario."
      },
      "openHome": "Abrir directorio de inicio"
    },
    "folders": {
      "pictures": "Imágenes",
      "recent": "Recientes",
      "misc": "Misc"
    }
  },
  "mail": {
    "login": {
      "title": "Correo",
      "subtitle": "Inicia sesión en tu cuenta",
      "emailPlaceholder": "Correo electrónico",
      "passwordPlaceholder": "Contraseña",
      "signingIn": "Iniciando sesión...",
      "signIn": "Iniciar sesión",
      "signOut": "Cerrar sesión",
      "createAccountInfo": "Crea una cuenta a través de un proveedor de correo electrónico"
    },
    "menu": {
      "newMailbox": "Nuevo buzón",
      "onlineStatus": "Estado en línea",
      "newMessage": "Nuevo mensaje",
      "reply": "Responder",
      "replyAll": "Responder a todos",
      "forward": "Reenviar"
    },
    "sidebar": {
      "mailboxes": "Buzones",
      "inbox": "Bandeja de entrada",
      "starred": "Destacados",
      "archived": "Archivados",
      "trash": "Papelera"
    },
    "search": {
      "placeholder": "Buscar correos..."
    },
    "empty": {
      "noEmails": "No hay correos",
      "noEmailsFound": "No se encontraron correos",
      "selectEmail": "Selecciona un correo para leer"
    },
    "actions": {
      "reply": "Responder",
      "forward": "Reenviar",
      "archive": "Archivar",
      "unarchive": "Desarchivar",
      "delete": "Eliminar",
      "restore": "Restaurar",
      "deleteForever": "Eliminar definitivamente"
    },
    "time": {
      "minutesAgo": "hace {{minutes}} min",
      "hoursAgo": "hace {{hours}} h",
      "today": "Hoy",
      "yesterday": "Ayer",
      "daysAgo": "hace {{days}} d"
    },
    "attachments": {
      "count": "{{count}} archivo adjunto",
      "count_plural": "{{count}} archivos adjuntos",
      "download": "Descargar",
      "downloaded": "Descargado",
      "downloadedTo": "{{name}} descargado en {{folder}}",
      "downloadFailed": "Error al descargar",
      "downloadFailedMessage": "No se pudo descargar {{name}}"
    }
  },
  "notepad": {
    "untitled": "Sin título",
    "untitledTab": "Sin título {{index}}",
    "empty": {
      "title": "Bloc de Notas",
      "description": "Crea un nuevo archivo o abre uno existente para comenzar.",
      "newFile": "Nuevo Archivo",
      "openFile": "Abrir Archivo"
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
      "txt": "Texto sin formato"
    },
    "actions": {
      "openFile": "Abrir archivo",
      "saveFile": "Guardar archivo",
      "bold": "Negrita",
      "italic": "Cursiva",
      "list": "Lista",
      "heading": "Encabezado"
    },
    "preview": {
      "edit": "Editar",
      "preview": "Vista previa",
      "htmlPreviewTitle": "Vista previa HTML"
    },
    "status": {
      "chars": "{{count}} caracteres",
      "lines": "Lín. {{count}}"
    },
    "contextSwitcher": {
      "title": "Haz clic para cambiar el contexto",
      "searchPlaceholder": "Buscar lenguaje...",
      "noLanguageFound": "No se encontró ningún lenguaje."
    },
    "toasts": {
      "switchedTo": "Cambiado a {{language}}",
      "failedToReadFile": "No se pudo leer el archivo",
      "fileSaved": "Archivo guardado",
      "failedToSaveFilePermissions": "No se pudo guardar el archivo (verifica permisos)",
      "saved": "Guardado",
      "failedToSave": "No se pudo guardar"
    },
    "dialog": {
      "unsaved": {
        "title": "¿Quieres guardar los cambios?",
        "description": "Tus cambios se perderán si no los guardas.",
        "dontSave": "No guardar",
        "cancel": "Cancelar",
        "save": "Guardar"
      }
    },
    "menu": {
      "new": "Nuevo",
      "open": "Abrir...",
      "save": "Guardar",
      "closeTab": "Cerrar pestaña",
      "bold": "Negrita",
      "italic": "Cursiva",
      "list": "Lista",
      "heading1": "Encabezado 1",
      "heading2": "Encabezado 2",
      "togglePreview": "Alternar vista previa",
      "zoomIn": "Acercar",
      "zoomOut": "Alejar"
    }
  },
  "calendar": {
    "menu": {
      "day": "Día",
      "week": "Semana",
      "month": "Mes",
      "year": "Año"
    },
    "toolbar": {
      "today": "Hoy",
      "month": "Mes",
      "day": "Día"
    },
    "sidebar": {
      "myCalendars": "Mis calendarios",
      "filterColors": "Filtrar colores"
    },
    "actions": {
      "createEvent": "Crear evento",
      "createCategory": "Crear categoría",
      "clear": "Limpiar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "saveEvent": "Guardar evento"
    },
    "loadingEvents": "Cargando eventos...",
    "toasts": {
      "cannotDeleteSystemCategory": "No se pueden eliminar las categorías del sistema",
      "eventDeleted": "Evento eliminado",
      "eventSaved": "Evento guardado",
      "requiredFields": "Completa los campos obligatorios"
    },
    "modal": {
      "newEvent": "Nuevo evento",
      "editEvent": "Editar evento",
      "newEventDescription": "Programa un nuevo evento en tu calendario.",
      "editEventDescription": "Ver o editar los detalles del evento.",
      "fields": {
        "title": "Título",
        "date": "Fecha",
        "time": "Hora",
        "duration": "Duración",
        "type": "Tipo",
        "location": "Ubicación",
        "color": "Color",
        "notes": "Notas"
      },
      "placeholders": {
        "eventTitle": "Título del evento",
        "pickDate": "Elige una fecha",
        "searchTime": "Buscar hora...",
        "noTimeFound": "No se encontró hora.",
        "selectDuration": "Selecciona duración",
        "searchDuration": "Buscar duración...",
        "noDurationFound": "No se encontró duración.",
        "selectType": "Selecciona tipo",
        "searchType": "Buscar tipo...",
        "noTypeFound": "No se encontró tipo.",
        "addLocation": "Añadir ubicación",
        "addNotes": "Añadir notas..."
      },
      "durationMinutes": "{{minutes}} min",
      "minutesOption": "{{minutes}} minutos"
    },
    "categories": {
      "all": "Todos",
      "work": "Trabajo",
      "personal": "Personal",
      "social": "Social",
      "events": "Eventos",
      "family": "Familia"
    },
    "types": {
      "work": "Trabajo",
      "personal": "Personal",
      "social": "Social",
      "events": "Eventos",
      "family": "Familia",
      "other": "Otro"
    },
    "colors": {
      "blue": "Azul",
      "green": "Verde",
      "red": "Rojo",
      "yellow": "Amarillo",
      "purple": "Morado",
      "pink": "Rosa",
      "orange": "Naranja",
      "gray": "Gris"
    },
    "mockEvents": {
      "loopStarted": {
        "title": "Bucle iniciado",
        "location": "Turms",
        "notes": "Sistema de archivos inicial."
      }
    }
  },
  "devCenter": {
    "sidebar": {
      "generalTitle": "General",
      "dashboard": "Panel",
      "interfaceTitle": "Interfaz",
      "uiAndSounds": "UI y sonidos",
      "systemTitle": "Sistema",
      "storage": "Almacenamiento",
      "fileSystem": "Sistema de archivos",
      "appsTitle": "Apps",
      "performance": "Rendimiento"
    },
    "dashboard": {
      "title": "Panel",
      "description": "Resumen del sistema próximamente."
    },
    "ui": {
      "title": "Interfaz de Usuario y Comentarios",
      "notificationsTitle": "Notificaciones",
      "successToast": "Aviso de éxito",
      "warningToast": "Aviso de advertencia",
      "errorToast": "Aviso de error",
      "soundFeedback": "Respuesta de sonido",
      "buttons": {
        "success": "Éxito",
        "warning": "Advertencia",
        "error": "Error",
        "app": "Notificación de App",
        "open": "Abrir",
        "close": "Cerrar",
        "click": "Clic",
        "hover": "Hover"
      }
    },
    "storage": {
      "title": "Inspector de almacenamiento",
      "import": "Importar",
      "export": "Exportar",
      "clear": "Borrar",
      "toastTitle": "Almacenamiento",
      "exportSuccess": "Preferencias exportadas correctamente",
      "exportFail": "No se pudieron exportar las preferencias",
      "importSuccess": "Preferencias importadas correctamente",
      "importFail": "No se pudo leer el archivo de importación",
      "clearConfirm": "¿Seguro que quieres borrar TODO el almacenamiento local? Esto restablecerá preferencias de uso, tema y posiciones de ventanas.",
      "clearSuccess": "Se borraron todas las claves",
      "softMemory": "Memoria blanda (preferencias)",
      "hardMemory": "Memoria dura (sistema de archivos)",
      "keysCount": "{{count}} claves",
      "localStorageKeys": "Claves de almacenamiento local"
    },
    "filesystem": {
      "title": "Depurador del sistema de archivos"
    },
    "performance": {
      "title": "Monitor de rendimiento"
    },
    "menu": {
      "resetFilesystem": "Restablecer sistema de archivos",
      "runDiagnostics": "Ejecutar diagnósticos"
    },
    "messages": {
      "createValues": {
        "title": "Crear / Restablecer cuenta",
        "username": "Nombre de usuario",
        "password": "Contraseña",
        "button": "Crear cuenta",
        "success": "Cuenta {{username}} creada"
      },
      "registry": {
        "title": "Registro de Cuentas",
        "empty": "No se encontraron cuentas",
        "useInSender": "Usar en Remitente",
        "delete": "Eliminar cuenta",
        "deleteConfirm": "¿Eliminar cuenta {{username}}? Esto no se puede deshacer.",
        "deleteSuccess": "Cuenta {{username}} eliminada"
      },
      "sendMessage": {
        "title": "Enviar mensaje",
        "from": "Remitente (De)",
        "to": "Destinatario (A)",
        "selectAccount": "Seleccionar cuenta...",
        "content": "Contenido",
        "placeholder": "Escribe un mensaje...",
        "button": "Enviar mensaje",
        "success": "Mensaje enviado"
      }
    }
  },
  "settings": {
    "sidebar": {
      "system": "Sistema",
      "general": "General"
    },
    "sections": {
      "appearance": "Apariencia",
      "performance": "Rendimiento",
      "displays": "Pantallas",
      "notifications": "Notificaciones",
      "network": "Red",
      "security": "Seguridad y privacidad",
      "users": "Usuarios y grupos",
      "storage": "Almacenamiento",
      "about": "Acerca de"
    },
    "appearance": {
      "title": "Apariencia",
      "languageTitle": "Idioma",
      "languageDescription": "Elige el idioma de la interfaz del sistema",
      "languagePlaceholder": "Selecciona un idioma",
      "wallpaperTitle": "Fondo de escritorio",
      "wallpaperDescription": "Selecciona un fondo para tu entorno de escritorio",
      "accentTitle": "Color de acento",
      "accentDescription": "Elige un color de acento para personalizar tu experiencia",
      "presetColors": "Colores predefinidos",
      "customColor": "Color personalizado",
      "customColorHint": "Introduce un código hex (p. ej., #3b82f6)",
      "preview": "Vista previa",
      "previewPrimary": "Primario",
      "previewOutlined": "Contorno",
      "themeModeTitle": "Modo de tema",
      "themeModeDescription": "Elige cómo el color de acento afecta los fondos",
      "themeModeNeutralTitle": "Neutro",
      "themeModeNeutralDesc": "Solo grises naturales",
      "themeModeShadesTitle": "Tonos",
      "themeModeShadesDesc": "Tintas del color de acento",
      "themeModeContrastTitle": "Contraste",
      "themeModeContrastDesc": "Colores complementarios",
      "themeTitle": "Tema",
      "themeDark": "Oscuro",
      "themeLightSoon": "Claro (Próximamente)",
      "wallpaperActive": "Activo",
      "wallpaperUse": "Usar"
    },
    "performance": {
      "blurTitle": "Desenfoque y transparencia",
      "blurDescription": "Activa el efecto de vidrio y la transparencia de las ventanas",
      "reduceMotionTitle": "Reducir movimiento",
      "reduceMotionDescription": "Desactiva animaciones para mejorar rendimiento y accesibilidad",
      "disableShadowsTitle": "Desactivar sombras",
      "disableShadowsDescription": "Elimina sombras de las ventanas para mejorar el rendimiento",
      "disableGradientsTitle": "Desactivar degradados",
      "disableGradientsDescription": "Usa colores sólidos en lugar de degradados para los iconos",
      "gpuTitle": "Usar aceleración gráfica",
      "gpuDescription": "Usar aceleración por hardware si está disponible (requiere reinicio)"
    },
    network: {
      wifiTitle: 'Wi-Fi',
      wifiConnected: 'Conectado a {{network}}',
      wifiDisabled: 'Wi-Fi desactivado',
      bluetoothTitle: 'Bluetooth',
      bluetoothConnected: 'Conectado a {{device}}',
      bluetoothDisabled: 'Bluetooth desactivado',
      wifiNetworks: 'Redes disponibles',
      scanning: 'Buscando...',
      enterPassword: 'Introducir contraseña',
      passwordPlaceholder: 'Contraseña',
      connect: 'Conectar',
      disconnect: 'Desconectar',
      configurationMode: 'Modo de configuración',
      automatic: 'Automático (DHCP)',
      manual: 'Manual',
      autoConfigTitle: 'Configuración automática',
      manualConfigTitle: 'Configuración manual',
      ipAddress: 'Dirección IP',
      subnetMask: 'Máscara de subred',
      gateway: 'Puerta de enlace',
      dns: 'Servidor DNS',
      validateConfig: 'Validar configuración',
      invalidIP: 'Dirección IP inválida',
      invalidGateway: 'Puerta de enlace inválida',
      invalidSubnetMask: 'Máscara de subred inválida',
      invalidDNS: 'Servidor DNS inválido',
      gatewayNotInSubnet: 'La puerta de enlace no está en la misma subred que la dirección IP',
      configSaved: 'Configuración de red guardada con éxito',
      dhcpAttributionProgress: 'Recuperando una dirección IP vía DHCP',
    },
    placeholders: {
      displaysTitle: 'Configuración de pantalla',
      displaysDescription: 'Resolución, escala y brillo próximamente.',
      notificationsTitle: 'Notificaciones',
      notificationsDescription: 'Preferencias del centro de notificaciones próximamente.',
      networkTitle: 'Red',
      networkDescription: 'Configuración de Wi‑Fi y Bluetooth próximamente.',
      securityTitle: 'Seguridad y privacidad',
      securityDescription: 'Cortafuegos, permisos y privacidad próximamente.',
      storageTitle: 'Almacenamiento',
      storageDescription: 'Análisis y gestión de uso de disco próximamente.',
    },
    "users": {
      "currentUsersTitle": "Usuarios actuales",
      "addUser": "Añadir usuario",
      "cancel": "Cancelar",
      "editAction": "Editar",
      "newUserDetails": "Detalles del nuevo usuario",
      "usernamePlaceholder": "Usuario (p. ej., alice)",
      "fullNamePlaceholder": "Nombre completo",
      "passwordOptionalPlaceholder": "Contraseña (opcional)",
      "passwordHintOptionalPlaceholder": "Pista de contraseña (opcional)",
      "createUser": "Crear usuario",
      "userExists": "El usuario ya existe",
      "currentBadge": "Actual",
      "rootBadge": "Root",
      "adminBadge": "Admin",
      "confirmDeleteUser": "¿Seguro que quieres eliminar a {{username}}?",
      "editForm": {
        "fullNameLabel": "Nombre completo",
        "roleLabel": "Rol",
        "administrator": "Administrador",
        "newPasswordLabel": "Nueva contraseña (deja vacío para mantener la actual)",
        "passwordHintLabel": "Pista de contraseña",
        "saveChanges": "Guardar cambios"
      }
    },
    "about": {
      "version": "Versión",
      "framework": "Framework",
      "electron": "Electron",
      "chrome": "Chrome",
      "node": "Node.js",
      "v8": "V8",
      "environment": "Entorno",
      "browserMode": "Modo navegador",
      "developerMode": "Modo desarrollador",
      "developerModeDescription": "Activa herramientas avanzadas y opciones de depuración",
      "exposeRootUser": "Mostrar usuario root",
      "exposeRootUserDescription": "Muestra el usuario root en la pantalla de inicio de sesión",
      "memoryUsage": "Uso de memoria",
      "preferencesSoft": "Preferencias (memoria suave)",
      "filesystemHard": "Sistema de archivos (memoria dura)",
      "total": "Total"
    },
    "danger": {
      "title": "Zona de peligro",
      "softResetTitle": "Reinicio suave",
      "softResetDescription": "Reinicia preferencias, tema, posición de iconos y estados de apps. Tus archivos y carpetas se conservan.",
      "resetPreferences": "Reiniciar preferencias",
      "confirmReset": "Confirmar reinicio",
      "hardResetTitle": "Reinicio total",
      "hardResetDescription": "Borra todos los datos incluyendo archivos, carpetas y ajustes. Esta acción no se puede deshacer.",
      "hardResetWarning": "⚠️ Todos los archivos y carpetas personalizados se borrarán permanentemente",
      "factoryReset": "Restablecer de fábrica",
      "deleteEverything": "Sí, borrar todo"
    }
  },
  "onboarding": {
    "steps": {
      "language": {
        "title": "Bienvenido a Aurora",
        "description": "Selecciona tu idioma para comenzar"
      },
      "account": {
        "title": "Crea tu cuenta",
        "description": "Configura la cuenta de administrador principal"
      },
      "theme": {
        "title": "Personalizar",
        "description": "Hazlo tuyo"
      },
      "finishing": {
        "title": "Configurando...",
        "description": "Aplicando configuración"
      }
    },
    "account": {
      "fullName": "Nombre completo",
      "fullNamePlaceholder": "Ejemplo: Juan Pérez",
      "username": "Usuario",
      "password": "Contraseña",
      "passwordHint": "Pista de contraseña (Opcional)",
      "passwordHintPlaceholder": "Ejemplo: Nombre de tu primera mascota"
    },
    "theme": {
      "mode": "Modo de tema",
      "accentColor": "Color de acento",
      "darkMode": "Oscuro (Neutro)",
      "lightMode": "Claro",
      "comingSoon": "Próximamente"
    },
    "finishing": {
      "title": "¡Todo listo!",
      "subtitle": "Aurora OS está listo. Redirigiéndote a la pantalla de inicio de sesión..."
    },
    "search": {
      "placeholder": "Buscar idioma...",
      "noResults": "No se encontraron idiomas"
    },
    "validation": {
      "requiredFields": "Completa todos los campos requeridos",
      "passwordLength": "La contraseña debe tener al menos 6 caracteres",
      "userExists": "El usuario ya existe. Por favor, elige otro nombre de usuario.",
      "fullNameFormat": "El nombre completo solo debe contener letras, espacios y guiones",
      "usernameFormat": "El nombre de usuario solo debe contener letras minúsculas y números",
      "hintLength": "La sugerencia de contraseña es demasiado larga (máx. 50 caracteres)",
      "hintSecurity": "La sugerencia de contraseña no puede contener la contraseña misma",
      "hintFormat": "La sugerencia de contraseña contiene caracteres no válidos",
      "creationFailed": "Error al crear la cuenta. Por favor, inténtelo de nuevo."
    },
    "buttons": {
      "next": "Siguiente",
      "back": "Atrás",
      "startUsing": "Empezar a usar Aurora"
    }
  },
  "battery": {
    "title": "Batería",
    "charging": "Cargando",
    "fullyCharged": "Completamente cargada",
    "remaining": "{{percentage}}% restante",
    "powerSource": "Fuente de alimentación:",
    "powerSources": {
      "adapter": "Adaptador de corriente",
      "battery": "Batería"
    },
    "condition": "Condición (Est.)",
    "metrics": {
      "health": "Salud",
      "cycles": "Ciclos",
      "temp": "Temp",
      "voltage": "Voltaje"
    },
    "disclaimer": "Las métricas de salud y condición de la batería son estimaciones basadas en los sensores del sistema disponibles. Los valores reales pueden variar.",
    "showPercentage": "Mostrar porcentaje en la barra de menú"
  },
  "audio": {
    "title": "Sonido",
    "muteAll": "Silenciar todo",
    "unmute": "Activar sonido",
    "masterVolume": "Volumen maestro",
    "mixer": "Mezclador",
    "categories": {
      "music": "Música",
      "system": "Alertas del sistema",
      "interface": "Interfaz",
      "feedback": "Retroalimentación de entrada",
      "ambiance": "Ambiente"
    },
    "mixerLabels": {
      "masterOutput": "Salida Principal",
      "musicAppLevel": "Nivel de Música",
      "sfxInterface": "Efectos e Interfaz",
      "backgroundLoop": "Bucle de Fondo"
    }
  }
};

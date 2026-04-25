import ExifReader from 'exifreader';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Bold, Italic, Strikethrough, 
  Quote, Link as LinkIcon, 
  Table as TableIcon, Minus, AlignCenter, 
  AlignJustify, Image as ImageIcon, Settings, 
  Save, FolderOpen, FileText, AtSign, Rocket, 
  Trash2, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Menu, Eye, Edit3, Plus, ShieldCheck, Key, Download,
  Search, List as ListIcon, Lock, LayoutGrid, Maximize2, Calendar, Tags, Shield,
  Code, Terminal, Indent, Layers, CheckCircle, Check, AlignLeft, AlignRight, Rows, PanelLeft, PanelRight, Camera, Moon, Sun, FilePlus, Zap, MoveVertical, Info, Globe
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from './lib/utils';
import { Draft, Template, ImageItem, AuthType, TagGroup, Language, QueueItem } from './types';
import { Buffer } from 'buffer';
import { SecurityService } from './services/securityService';
import { PexelsService, PexelsPhoto } from './services/pexelsService';
import ImageItemComp from './components/ImageItem';
import ExternalImageItem from './components/ExternalImageItem';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// --- Constants ---
const COMMUNITIES = [
  { id: 'ukraine', name: 'Steem Ukraine', tags: ['hive-145157', 'ukraine', 'steemexclusive'] },
  { id: 'venezuela', name: 'Steem Venezuela', tags: ['hive-193637', 'venezuela', 'steemexclusive'] },
  { id: 'colombia', name: 'Colombia-Original', tags: ['hive-113376', 'colombia', 'steemexclusive'] },
  { id: 'bangladesh', name: 'Steem Bangladesh', tags: ['hive-138339', 'bangladesh', 'steemexclusive'] },
  { id: 'indonesia', name: 'Steem Indonesia', tags: ['hive-133280', 'indonesia', 'steemexclusive'] },
  { id: 'xpilar', name: 'World of Xpilar', tags: ['hive-185836', 'xpilar', 'steemexclusive'] },
  { id: 'betterlife', name: 'Steem For Betterlife', tags: ['hive-153970', 'betterlife', 'steemexclusive'] },
  { id: 'entrepreneurs', name: 'Steem Entrepreneurs', tags: ['hive-181136', 'steem-entrepreneurs', 'steemexclusive'] },
  { id: 'kids', name: 'Steem Kids & Parents', tags: ['hive-139765', 'steemkids', 'steemexclusive'] },
  { id: 'newcomers', name: 'Newcomers Community', tags: ['hive-172186', 'achievement1'] },
  { id: 'writing', name: 'Writing & Reviews', tags: ['hive-190212', 'writing', 'steemexclusive'] },
  { id: 'foods', name: 'Steem Foods', tags: ['hive-180301', 'steemfoods', 'steemexclusive'] },
  { id: 'fashion', name: 'Fashion & Style', tags: ['hive-125125', 'fashion', 'steemexclusive'] },
  { id: 'crypto', name: 'Crypto Academy', tags: ['hive-108451', 'cryptoacademy', 'steemexclusive'] },
  { id: 'travel', name: 'Steem Travel', tags: ['hive-163291', 'travel', 'steemexclusive'] },
  { id: 'art', name: 'Steem Art', tags: ['hive-185836', 'art', 'steemexclusive'] },
  { id: 'garden', name: 'Steem Garden', tags: ['hive-180821', 'garden', 'steemexclusive'] },
  { id: 'news', name: 'Steem News', tags: ['hive-179607', 'news', 'steemexclusive'] },
  { id: 'promo', name: 'PromoSteem', tags: ['hive-152200', 'promosteem', 'steemexclusive'] },
  { id: 'woa', name: 'World of Animals', tags: ['hive-140292', 'animals', 'steemexclusive'] },
  { id: 'learn', name: 'Steem Learning', tags: ['hive-190212', 'learning', 'steemexclusive'] },
  { id: 'tech', name: 'Steem Tech', tags: ['hive-190212', 'technology', 'steemexclusive'] },
  { id: 'sport', name: 'Steem Sport', tags: ['hive-106444', 'sport', 'steemexclusive'] },
  { id: 'health', name: 'Steem Health', tags: ['hive-168205', 'health', 'steemexclusive'] },
];

const COMMON_TAGS = ['life', 'betterlife', 'thediarygame', 'club5050', 'club75', 'club100', 'art', 'photography', 'travel', 'food', 'nature', 'blog', 'creative'];

// --- Translations ---
const translations = {
  uk: {
    saveDraftBeforeNew: "Зберегти поточний допис як чернетку перед створенням нового?",
    confirmNewPost: "Ви впевнені, що хочете почати новий допис? Поточний текст буде втрачено, якщо він не збережений.",
    confirmDeleteAccount: "Ви впевнені, що хочете видалити акаунт {acc}?",
    confirmResetVault: "Ви впевнені, що хочете скинути Сховище? Усі дані будуть видалені.",
    confirmClearApiKeys: "Очистити всі API ключі?",
    general: "Загальні",
    about: "Про застосунок",
    vault: "Сховище",
    enterPin: "Введіть ПІН-код",
    sessionActive: "СЕСІЯ АКТИВНА",
    vaultClosed: "СХОВИЩЕ ЗАКРИТЕ",
    addMention: "Додати користувача (без @):",
    performanceMode: "Режим продуктивності",
    widgetSettings: "Налаштування віджета",
    appearance: "Зовнішній вигляд",
    theme: "Тема",
    font: "Шрифт",
    widgetPos: "Позиція віджета",
    posFloating: "Плаваючий",
    posBottom: "Знизу",
    posPreview: "Прев'ю",
    widgetMinimal: "Мінімалістичний режим",
    widgetOpacity: "Прозорість",
    activeToolsSort: "Сортування інструментів",
    settingsToolsDesc: "Увімкніть та впорядкуйте інструменти, які будуть доступні у плаваючому віджеті.",
    gallerySettings: "Налаштування галереї",
    vaultSecurity: "Безпека Сховища",
    accounts: "Акаунти",
    importBtn: "ІМПОРТУВАТИ ТАБЛИЦЮ",
    editor: "Редактор",
    preview: "Прев'ю",
    gallery: "Галерея",
    settings: "Налаштування",
    publish: "Опублікувати",
    drafts: "Чернетки",
    templates: "Шаблони",
    tags: "Теги",
    mentions: "Згадки",
    tagGroups: "Групи тегів",
    addTagGroup: "Додати групу",
    importTable: "Імпорт таблиці",
    schedule: "Розклад",
    saveDraft: "Зберегти чернетку",
    insert: "Вставити",
    delete: "Видалити",
    cancel: "Скасувати",
    confirm: "Підтвердити",
    username: "Користувач",
    title: "Заголовок",
    tagsPlaceholder: "теги через пробіл",
    cacheCleared: "Кеш галереї очищено",
    pexelsSearch: "Пошук у Pexels",
    noDrafts: "Чернеток немає",
    noTemplates: "Шаблонів немає",
    wordsLabel: "Слів",
    cleanWordsLabel: "Чистих слів",
    charsLabel: "Символів",
    words: "слів",
    chars: "симв",
    clean: "чисто",
    editorTools: "Інструменти",
    steemitSetup: "Налаштування Steemit",
    themeCyan: "Ціан (Ніч)",
    themeEmerald: "Смарагд",
    themeOrange: "Захід сонця",
    themeRose: "Кварц",
    fontSans: "Sans (Inter)",
    fontSerif: "Serif (PT Serif)",
    fontMono: "Mono (JetBrains)",
    advanced: "Додатково",
    appAgent: "Агент застосунку",
    rewardType: "Тип винагороди",
    rewardsSP: "100% SP",
    rewards50: "50% / 50%",
    trafficOptimization: "Оптимізація трафіку",
    trafficDesc: "Мініатюри в галереї",
    darkMode: "Темна тема",
    lightMode: "Світла тема",
    exifEnabled: "Зчитувати EXIF",
    exifDesc: "Додавати параметри зйомки після фото",
    beneficiaries: "Бенефіціари",
    addBeneficiary: "Додати",
    weight: "%",
    fromMentions: "Із згадувань",
    noBeneficiaries: "Немає бенефіціарів",
    mentionsList: "Список згадок",
    signaturePolicy: "Перевірка підпису",
    signatureMissing: "Підпис відсутній у кінці поста!",
    signatureFound: "Підпис знайдено.",
    twoTapPublish: "Швидка публікація",
    applyGroup: "Вставити групу",
    importTableTitle: "Імпорт таблиці",
    importTableDesc: "Вставте дані з Excel, Google Sheets або CSV. Ми автоматично перетворимо їх у Markdown.",
    importTablePlaceholder: "Вставте дані сюди...",
    tableFormat: "Формат таблиці",
    loadDraftConfirm: "Завантажити цю чернетку? Поточний текст буде замінено.",
    parts: "частин",
    splitPost: "Розділити допис",
    splitPostDesc: "Розділити довгий текст на кілька частин по ~300 слів.",
    minWordsPerPart: "Мін. слів на частину",
    splitBtn: "РОЗДІЛИТИ",
    formatting: "Форматування",
    steemitOptions: "Опції Steemit",
    clearfix: "Фікс. текст (Clearfix)",
    imageFormat: "Формат зображень",
    additional: "Додатково",
    pexelsAttribution: "Атрибуція Pexels",
    pexelsLink: "Посилання в фото",
    pexelsKey: "Ключ Pexels",
    vaultPin: "ПІН-код Vault",
    unlock: "Розблокувати",
    lock: "Заблокувати",
    keys: "Ключі",
    mobileEditor: "Ред",
    mobilePreview: "Прев",
    queue: "Черга",
    addToQueue: "В чергу",
    queueEmpty: "Черга порожня",
    publishNext: "Опублікувати наступний",
    autoPublish: "Авто-публікація",
    status: "Статус",
    pending: "Очікує",
    published: "Опубліковано",
    error: "Помилка",
    gridWithCaptions: "Додати підписи до сітки",
    placeholder: "Почніть писати свій шедевр тут...",
    fillRequired: "Будь ласка, заповніть усі обов'язкові поля.",
    publishing: "⏳ Початок публікації...",
    publishedSuccess: "✅ Опубліковано!",
    noKeychain: "Steem Keychain не знайдено.",
    pinRequired: "ПІН-код обов'язковий",
    saveSuccess: "Збережено!",
    fillAll: "Заповніть усі поля!",
    noAccount: "Оберіть акаунт!",
    pinShort: "ПІН-код занадто короткий (мін. 4)",
    vaultInit: "Сховище ініціалізовано!",
    accountAdded: "Акаунт додано!",
    bold: "Жирний",
    italic: "Курсив",
    strike: "Закреслений",
    h1: "Заголовок 1",
    h2: "Заголовок 2",
    h3: "Заголовок 3",
    quote: "Цитата",
    link: "Посилання",
    hr: "Розділювач",
    justify: "По ширині",
    center: "По центру",
    addAccount: "Додати акаунт",
    templateName: "Назва шаблону",
    saveTemplate: "Зберегти шаблон",
    mentionUsername: "Користувач",
    saveMention: "Додати",
    search: "Пошук",
    light: "Світла",
    dark: "Темна",
    syncScroll: "Синхронне прокручування",
    dragToReorder: "Перетягніть для зміни порядку",
    transparent: "Прозорий",
    borderless: "Без рамок",
    systemDialogAlert: "Повідомлення",
    systemDialogConfirm: "Підтвердіть дію",
    systemDialogPrompt: "Введіть дані",
    aboutDesc: "Професійний редактор для Steem з безпекою на базі Web Crypto (AES-GCM), подвійним шифруванням та захистом ПІН-кодом.",
    aboutApp: "Про застосунок",
    packagesUsed: "Використані пакети (NPM)",
    externalLibs: "Зовнішні бібліотеки (CDN)",
    credits: "Авторство та розробка",
    aiCredits: "ШІ (Gemini AI)",
    humanCredits: "Людина",
    aiTasks: "Написання коду, тех. оптимізація, реалізація логіки",
    humanTasks: "Ідея, творче спрямування, тестування, асистування",
    appAgentDesc: "Мета-рядок, що додається до ваших постів.",
    version: "Версія",
    developer: "Розробник",
    github: "GitHub",
    license: "Ліцензія",
    copyright: "2024 SteemEditor Pro. Всі права захищені.",
    showInWidget: "Показувати у віджеті",
    hideInWidget: "Приховати у віджеті",
    opacity: "Прозорість",
    noBorder: "Без рамок",
    resetWidget: "Скинути вигляд",
    templatesEmpty: "Список шаблонів порожній",
    saveAsTemplate: "Зберегти як шаблон",
    confirmDeleteTemplate: "Видалити шаблон {name}?",
    templateSaved: "Шаблон збережено!",
    templateDeleted: "Шаблон видалено!",
    mentionAdded: "Згадування додано!",
    mentionDeleted: "Згадування видалено!",
    confirmDeleteMention: "Видалити згадування @{name}?",
    table: "Таблиця",
    downloadMd: "Завантажити .md",
    tagPresets: "Пресет тегів",
    commonTags: "Популярні теги",
    communities: "Спільноти",
    indent: "Відступ (4 пр.)",
    escape: "Екранування",
    codeBlock: "Блок коду",
    inlineCode: "Код в рядку",
    addTags: "Додати теги",
    attribution: "Атрибуція автора",
    linkInImg: "Лінк у картинці",
    createGrid: "Створити сітку",
    account: "Акаунт",
    leftText: "Зліва + текст",
    rightText: "Справа + текст",
    asIs: "Як є",
    uploadToSteemit: "Завантажити на Steemit",
    pexelsError: "Помилка Pexels: Перевірте API ключ або підключення.",
    linkPrompt: "Це посилання. Введіть текст для нього (або залиште порожнім):",
    urlPrompt: "Введіть URL:",
    leftContent: " ✍️ ",
    rightContent: " ✍️ ",
    loadingParser: "Завантаження парсера...",
    previewError: "Помилка рендерингу превью",
    untitled: "Без назви",
    needVaultAccount: "Для вивантаження зображень необхідно обрати акаунт у сховищі (Vault)!",
    pinError: "Помилка ПІН-коду: ",
    preparingUpload: "⏳ Підготовка до завантаження...",
    proxyAttempt: "⏳ Спроба через проксі...",
    proxyError: "Не вдалося завантажити зображення навіть через проксі (CORS)",
    signingImage: "⏳ Підпис зображення...",
    uploadingSteemit: "⏳ Вивантаження на SteemitImages...",
    serverError: "Помилка сервера: ",
    uploadSuccess: "✅ Зображення успішно завантажено!",
    uploadProgress: "⏳ Завантаження {current} з {total}: {name}...",
    uploadComplete: "✅ Завантажено {count} з {total} зображень.",
    pasteUrl: "Вставте посилання тут...",
    fullScreen: "Повний екран",
    enterNewPin: "Введіть новий ПІН-код",
    enterPinPlaceholder: "Введіть ПІН-код",
    usernameNoAt: "Нікнейм (без @)",
    vaultUnlocked: "Сховище розблоковано",
    vaultLocked: "Сховище заблоковано",
    vaultTitle: "Сховище акаунтів",
    vaultWarning: "Подвійне шифрування: ПІН-код захищає Майстер-ключ, який шифрує ваші акаунти.",
    pinSetup: "Налаштування ПІН-коду",
    pinSetupDesc: "Встановіть ПІН-код для захисту вашого сховища. Він не зберігається ніде, крім вашої голови.",
    createVault: "СТВОРИТИ СХОВИЩЕ",
    unlockBtn: "РОЗБЛОКУВАТИ",
    yourAccounts: "Ваші акаунти",
    newAccount: "Новий акаунт",
    postingKeyPlaceholder: "Posting Key (5J...)",
    done: "Готово",
    publishToSteem: "Публікація в Steem",
    vaultNotConfigured: "Сховище не налаштовано. Встановіть ПІН-код у налаштуваннях.",
    setupVaultBtn: "Налаштувати сховище",
    vaultActive: "Сховище активне",
    vaultActiveDesc: "Ви можете публікувати пости від обраного акаунта.",
    selectAccount: "Оберіть акаунт...",
    autosaveActive: "Автозбереження активно",
    clear: "Очистити",
    saveToVault: "ЗБЕРЕГТИ В СХОВИЩЕ",
    protectedByMK: "Захищено MK",
    vaultEmpty: "Сховище порожнє",
    resetVault: "Скинути все сховище",
    save: "ЗБЕРЕГТИ",
    links: "ПОСИЛАННЯ",
    text: "ТЕКСТ",
    keys_mobile: "КЛЮЧІ",
    clearfixDesc: "Запобігає обтіканню текстом після зображень зліва/справа.",
    splitSuccess: "Допис розділено на {count} частин та збережено в чернетки!",
    importTableSuccess: "Таблицю успішно імпортовано!",
    pexelsKeyRequired: "Спочатку додайте API ключ Pexels у налаштуваннях (отримайте його на pexels.com після реєстрації).",
    pixabayKeyRequired: "Спочатку додайте API ключ Pixabay у налаштуваннях (отримайте його на pixabay.com після реєстрації).",
    unsplashKeyRequired: "Спочатку додайте API ключ Unsplash (Access Key) у налаштуваннях (отримайте його на unsplash.com/developers).",
    pixabayError: "Помилка Pixabay: Перевірте API ключ або підключення.",
    unsplashError: "Помилка Unsplash: Перевірте API ключ або підключення.",
    working: "В роботі",
    ready: "Затверджено",
    pixabayKey: "Ключ Pixabay",
    unsplashKey: "Ключ Unsplash",
    enableThumbnails: "Мініатюри в галереї",
    caption: "Підпис",
    addCaption: "Додати підпис",
    typeHere: " ✍️ ",
    image: "Зображення",
    description: "Опис",
    color: "Колір",
    rowLayout: "Рядок поруч",
    colImgText: "Фото → Опис",
    colTextImg: "Опис → Фото",
    alignLeft: "Ліворуч",
    alignCenter: "По центру",
    alignRight: "Праворуч",
    align: "Вирівнювання",
    gridLayout: "Макет сітки",
    redText: "Червоний текст",
    loadMore: "Завантажити ще",
    saveUnencrypted: "Зберегти без PIN-коду",
    unsplashAppId: "Unsplash Application ID",
    unsplashAccessKey: "Unsplash Access Key",
    unsplashSecretKey: "Unsplash Secret Key",
    keysCleared: "API ключі очищено!",
    clearApiKeys: "Очистити API ключі",
    clearCache: "Очистити кеш",
    performanceDesc: "Вимикає деякі анімації та підсвічування для підвищення швидкості роботи.",
    allSettings: "Усі налаштування",
    widgetNoBorder: "Без рамок",
    saved: "Збережено",
    load: "Завантажити",
    newPost: "Новий допис",
  },
  en: {
    saveDraftBeforeNew: "Save current post as draft before starting new?",
    confirmNewPost: "Are you sure you want to start a new post? Current text will be lost if not saved.",
    performanceDesc: "Disables some animations and highlights for better performance.",
    allSettings: "All Settings",
    widgetNoBorder: "No Border",
    saved: "Saved",
    load: "Load",
    newPost: "New Post",
    aboutDesc: "Professional editor for Steem with Web Crypto (AES-GCM) security, double encryption, and PIN protection.",
    aboutApp: "About App",
    packagesUsed: "Packages Used (NPM)",
    externalLibs: "External Libraries (CDN)",
    credits: "Credits & Development",
    aiCredits: "AI (Gemini AI)",
    humanCredits: "Human",
    aiTasks: "Code writing, tech optimization, logic implementation",
    humanTasks: "Idea, creative direction, testing, assisting",
    appAgentDesc: "Meta string added to your posts.",
    version: "Version",
    developer: "Developer",
    license: "License",
    confirmDeleteAccount: "Delete account @{acc}?",
    confirmResetVault: "Reset Vault? All accounts will be removed.",
    confirmClearApiKeys: "Clear all API keys?",
    general: "General",
    about: "About",
    vault: "Vault",
    enterPin: "Enter PIN",
    sessionActive: "SESSION ACTIVE",
    vaultClosed: "VAULT CLOSED",
    addMention: "Add user (no @):",
    performanceMode: "Performance Mode",
    widgetSettings: "Widget Settings",
    appearance: "Appearance",
    theme: "Theme",
    font: "Font",
    widgetPos: "Widget Position",
    posFloating: "Floating",
    posBottom: "Bottom",
    posPreview: "Preview Pane",
    widgetMinimal: "Minimal Mode",
    widgetOpacity: "Opacity",
    activeToolsSort: "Tools Sort",
    settingsToolsDesc: "Configure floating widget tools.",
    gallerySettings: "Gallery Settings",
    vaultSecurity: "Vault Security",
    accounts: "Accounts",
    importBtn: "IMPORT",
    cacheCleared: "Gallery cache cleared",
    editor: "Editor",
    preview: "Preview",
    gallery: "Gallery",
    settings: "Settings",
    publish: "Publish",
    drafts: "Drafts",
    templates: "Templates",
    tags: "Tags",
    mentions: "Mentions",
    tagGroups: "Tag Groups",
    addTagGroup: "Add Group",
    importTable: "Import Table",
    schedule: "Schedule",
    saveDraft: "Save Draft",
    insert: "Insert",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    username: "Username",
    title: "Title",
    tagsPlaceholder: "tags by space",
    pexelsSearch: "Pexels Search",
    noDrafts: "No drafts",
    noTemplates: "No templates",
    wordsLabel: "Words",
    cleanWordsLabel: "Clean",
    charsLabel: "Chars",
    words: "words",
    chars: "chars",
    clean: "clean",
    editorTools: "Tools",
    steemitSetup: "Steemit Setup",
    themeCyan: "Cyan",
    themeEmerald: "Emerald",
    themeOrange: "Orange",
    themeRose: "Rose",
    fontSans: "Sans (Inter)",
    fontSerif: "Serif (PT Serif)",
    fontMono: "Mono (JetBrains)",
    advanced: "Advanced",
    appAgent: "App Agent",
    rewardType: "Reward Type",
    rewardsSP: "100% SP",
    rewards50: "50/50",
    trafficOptimization: "Load Speed",
    trafficDesc: "Gallery Thumbnails",
    darkMode: "Dark",
    lightMode: "Light",
    exifEnabled: "Read EXIF",
    exifDesc: "Insert camera metadata",
    beneficiaries: "Beneficiaries",
    addBeneficiary: "Add",
    weight: "%",
    fromMentions: "From mentions",
    noBeneficiaries: "Empty",
    mentionsList: "Mentions",
    signaturePolicy: "Sig. Check",
    signatureMissing: "Missing signature!",
    signatureFound: "Signature Found",
    twoTapPublish: "Fast Pub.",
    applyGroup: "Apply",
    importTableTitle: "Import Table",
    importTableDesc: "Paste from Excel/Sheets.",
    importTablePlaceholder: "Paste here...",
    tableFormat: "Format",
    loadDraftConfirm: "Load draft?",
    parts: "parts",
    splitPost: "Split Post",
    splitPostDesc: "Split long text.",
    minWordsPerPart: "Min words",
    splitBtn: "SPLIT",
    steemitOptions: "Options",
    clearfix: "Clearfix",
    imageFormat: "Img Format",
    additional: "Additional",
    pexelsAttribution: "Pexels Attr.",
    pexelsLink: "Pexels Link",
    pexelsKey: "Pexels Key",
    vaultPin: "Vault PIN",
    unlock: "Unlock",
    lock: "Lock",
    keys: "Keys",
    mobileEditor: "Ed",
    mobilePreview: "Pre",
    queue: "Queue",
    addToQueue: "To Queue",
    queueEmpty: "Queue empty",
    publishNext: "Pub. Next",
    autoPublish: "Auto Pub.",
    status: "Status",
    pending: "Pending",
    published: "Published",
    gridWithCaptions: "Captions",
    placeholder: "Start typing...",
    fillRequired: "Fill required fields.",
    publishing: "⏳ Publishing...",
    publishedSuccess: "✅ Published!",
    noKeychain: "Keychain not found.",
    pinRequired: "PIN required",
    saveSuccess: "Saved!",
    fillAll: "Fill all!",
    noAccount: "Select account!",
    pinShort: "PIN short",
    vaultInit: "Initialized!",
    accountAdded: "Added!",
    bold: "Bold",
    italic: "Italic",
    strike: "Strike",
    h1: "H1",
    h2: "H2",
    h3: "H3",
    quote: "Quote",
    link: "Link",
    hr: "HR",
    justify: "Justify",
    center: "Center",
    table: "Table",
    downloadMd: "Down .md",
    tagPresets: "Presets",
    commonTags: "Pop. Tags",
    communities: "Communities",
    indent: "Indent",
    escape: "Escape",
    codeBlock: "Code Block",
    inlineCode: "Inline Code",
    addTags: "Add Tags",
    attribution: "Attr.",
    linkInImg: "Link in Img",
    createGrid: "Grid",
    account: "Account",
    leftText: "LeftText",
    rightText: "RightText",
    asIs: "As Is",
    uploadToSteemit: "To Steemit",
    pexelsError: "Pexels Error",
    linkPrompt: "Link text:",
    urlPrompt: "URL:",
    leftContent: " ✍️ ",
    rightContent: " ✍️ ",
    loadingParser: "Loading...",
    previewError: "Render error",
    untitled: "Untitled",
    needVaultAccount: "Select account in Vault!",
    pinError: "PIN Error: ",
    preparingUpload: "⏳ Preparing...",
    proxyAttempt: "⏳ Proxy...",
    proxyError: "CORS Error",
    signingImage: "⏳ Signing...",
    uploadingSteemit: "⏳ Uploading...",
    serverError: "Server Error: ",
    uploadSuccess: "✅ Done!",
    uploadProgress: "⏳ {current}/{total}...",
    uploadComplete: "✅ Uploaded {count}.",
    pasteUrl: "Paste link...",
    fullScreen: "FS",
    enterNewPin: "New PIN",
    enterPinPlaceholder: "Enter PIN",
    addAccount: "Add Acc",
    usernameNoAt: "Username",
    vaultUnlocked: "Unlocked",
    vaultLocked: "Locked",
    templateName: "Name...",
    vaultTitle: "Vault",
    vaultWarning: "PIN protects MK.",
    pinSetup: "PIN Setup",
    pinSetupDesc: "Set PIN.",
    createVault: "CREATE",
    unlockBtn: "UNLOCK",
    yourAccounts: "Accounts",
    newAccount: "New",
    postingKeyPlaceholder: "Key",
    done: "Done",
    publishToSteem: "To Steem",
    vaultNotConfigured: "Vault not set.",
    setupVaultBtn: "Setup",
    vaultActive: "Active",
    vaultActiveDesc: "Ready.",
    selectAccount: "Account...",
    autosaveActive: "Autosave",
    clear: "Clear",
    saveToVault: "SAVE",
    protectedByMK: "Safe",
    vaultEmpty: "Empty",
    resetVault: "Reset All",
    save: "SAVE",
    links: "LINKS",
    text: "TEXT",
    keys_mobile: "KEYS",
    formatting: "Formatting",
    rowLayout: "Row",
    colImgText: "Col Img-Txt",
    colTextImg: "Col Txt-Img",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    align: "Align",
    gridLayout: "Grid",
    redText: "Red",
    loadMore: "More",
    saveUnencrypted: "No PIN",
    unsplashAppId: "Unsplash ID",
    unsplashAccessKey: "Unsplash Key",
    unsplashSecretKey: "Unsplash Sec",
    clearCache: "Clear Cache",
    keysCleared: "Cleared!",
    clearApiKeys: "Clear Keys",
  },
  es: {
    editor: "Editor",
    preview: "Previsualización",
    gallery: "Galería",
    settings: "Ajustes",
    publish: "Publicar",
    drafts: "Borradores",
    templates: "Plantillas",
    tags: "Etiquetas",
    mentions: "Menciones",
    tagGroups: "Grupos de etiquetas",
    addTagGroup: "Añadir grupo",
    importTable: "Importar tabla",
    schedule: "Programar",
    saveDraft: "Guardar borrador",
    insert: "Insertar",
    delete: "Eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    username: "Usuario",
    title: "Título",
    tagsPlaceholder: "etiquetas separadas por espacios",
    pexelsSearch: "Buscar en Pexels",
    noDrafts: "No hay borradores",
    noTemplates: "No hay plantillas",
    wordsLabel: "Palabras",
    cleanWordsLabel: "Palabras limpias",
    charsLabel: "Caracteres",
    words: "palabras",
    chars: "caracteres",
    clean: "limpio",
    formatting: "Formato",
    steemitOptions: "Opciones Steemit",
    clearfix: "Limpiar flotado (Clearfix)",
    imageFormat: "Formato de imagen",
    additional: "Adicional",
    pexelsAttribution: "Atribución Pexels",
    pexelsLink: "Enlace en foto",
    pexelsKey: "Clave Pexels",
    vaultPin: "PIN de Bóveda",
    unlock: "Desbloquear",
    lock: "Bloquear",
    keys: "Claves",
    mobileEditor: "Ed",
    mobilePreview: "Pre",
    queue: "Cola",
    addToQueue: "A la cola",
    queueEmpty: "La cola está vacía",
    publishNext: "Publicar siguiente",
    autoPublish: "Auto Publicar",
    status: "Estado",
    pending: "Pendiente",
    published: "Publicado",
    error: "Error",
    placeholder: "Comience a escribir su obra maestra aquí...",
    fillRequired: "Por favor complete todos los campos requeridos.",
    publishing: "⏳ Publicando...",
    publishedSuccess: "✅ ¡Publicado!",
    noKeychain: "Steem Keychain no encontrado.",
    enterPin: "Ingrese el PIN para desbloquear la bóveda:",
    pinRequired: "PIN requerido",
    saveSuccess: "¡Guardado!",
    fillAll: "¡Complete todos los campos!",
    noAccount: "¡Seleccione cuenta!",
    pinShort: "PIN demasiado corto (mín. 4)",
    vaultInit: "¡Bóveda inicializada!",
    accountAdded: "¡Cuenta añadida!",
    sessionActive: "SESIÓN ACTIVA",
    vaultClosed: "BÓVEDA CERRADA",
    bold: "Negrita",
    italic: "Cursiva",
    strike: "Tachado",
    h1: "Título 1",
    h2: "Título 2",
    h3: "Título 3",
    quote: "Cita",
    link: "Enlace",
    hr: "Línea horizontal",
    justify: "Justificar",
    center: "Centrar",
    table: "Tabla",
    downloadMd: "Descargar .md",
    tagPresets: "Ajustes de etiquetas",
    commonTags: "Etiquetas comunes",
    communities: "Comunidades",
    indent: "Sangría",
    escape: "Escapar",
    codeBlock: "Bloque de código",
    inlineCode: "Código en línea",
    addTags: "Añadir etiquetas",
    attribution: "Atribución",
    linkInImg: "Enlace en imagen",
    createGrid: "Crear cuadrícula",
    account: "Cuenta",
    leftText: "Izquierda + texto",
    rightText: "Derecha + texto",
    asIs: "Como está",
    uploadToSteemit: "Subir a Steemit",
    pexelsError: "Error de Pexels",
    linkPrompt: "Enlace:",
    urlPrompt: "URL:",
    leftContent: " ✍️ ",
    rightContent: " ✍️ ",
    loadingParser: "Cargando...",
    previewError: "Error de vista previa",
    untitled: "Sin título",
    needVaultAccount: "¡Necesitas una cuenta en la Bóveda!",
    pinError: "Error de PIN: ",
    preparingUpload: "⏳ Preparando...",
    proxyAttempt: "⏳ Intento por proxy...",
    proxyError: "Error de carga",
    signingImage: "⏳ Firmando...",
    uploadingSteemit: "⏳ Subiendo...",
    serverError: "Error de servidor",
    uploadSuccess: "✅ ¡Subida con éxito!",
    uploadProgress: "⏳ Subiendo {current} de {total}...",
    uploadComplete: "✅ Subida completada.",
    pasteUrl: "Pegar URL aquí...",
    fullScreen: "Pantalla completa",
    enterNewPin: "Nuevo PIN",
    enterPinPlaceholder: "PIN",
    addAccount: "Añadir cuenta",
    usernameNoAt: "Usuario (sin @)",
    confirmResetVault: "¡Esto borrará TODO!",
    vaultUnlocked: "Bóveda desbloqueada",
    vaultLocked: "Bóveda bloqueada",
    templateName: "Nombre de plantilla...",
    vaultTitle: "Bóveda de Cuentas",
    vaultWarning: "El PIN protege la Llave Maestra.",
    pinSetup: "Configuración de PIN",
    pinSetupDesc: "Establece un PIN.",
    createVault: "CREAR BÓVEDA",
    unlockBtn: "DESCIFRAR",
    yourAccounts: "Tus Cuentas",
    newAccount: "Nueva Cuenta",
    postingKeyPlaceholder: "Posting Key",
    done: "Hecho",
    publishToSteem: "Publicar en Steem",
    vaultNotConfigured: "Bóveda no configurada.",
    setupVaultBtn: "Configurar Bóveda",
    vaultActive: "Bóveda Activa",
    vaultActiveDesc: "Puedes publicar posts.",
    selectAccount: "Seleccionar cuenta...",
    autosaveActive: "Autoguardado activo",
    clear: "Limpiar",
    saveToVault: "GUARDAR EN BÓVEDA",
    protectedByMK: "Protegido por MK",
    confirmDeleteAccount: "¿Borrar cuenta @{acc}?",
    vaultEmpty: "Bóveda vacía",
    resetVault: "Reiniciar bóveda",
    save: "GUARDAR",
    links: "ENLACES",
    text: "TEXTO",
    keys_mobile: "CLAVES",
    importTableTitle: "Importar Tabla",
    importTableDesc: "Pegue datos de Excel, Google Sheets o CSV. Los convertiremos a Markdown.",
    importTablePlaceholder: "Pegue los datos aquí...",
    importBtn: "IMPORTAR",
    settingsToolsDesc: "Seleccione las herramientas que desea ver en el menú flotante.",
    loadDraftConfirm: "¿Cargar este borrador? El texto actual será reemplazado.",
    tableFormat: "Formato de tabla",
    importTableSuccess: "¡Tabla importada con éxito!",
    pexelsKeyRequired: "Agregue su clave API de Pexels en los ajustes primero.",
    pixabayKeyRequired: "Agregue su clave API de Pixabay en los ajustes primero.",
    unsplashKeyRequired: "Agregue su clave API de Unsplash en los ajustes primero.",
    pixabayError: "Error de Pixabay: Verifique la clave API o la conexión.",
    unsplashError: "Error de Unsplash: Verifique la clave API o la conexión.",
    widgetSettings: "Ajustes del Widget",
    widgetPos: "Posición del Widget",
    posFloating: "Flotante (cerca del cursor)",
    posBottom: "Fondo del Editor (fijo)",
    posPreview: "En el panel de vista previa",
    widgetOpacity: "Opacidad del Widget",
    widgetMinimal: "Minimalista (sin bordes)",
    activeToolsSort: "Orden de herramientas activas",
    working: "Trabajando",
    ready: "Listo",
    pixabayKey: "Clave Pixabay",
    unsplashKey: "Clave Unsplash",
    performanceMode: "Modo rendimiento",
    enableThumbnails: "Miniaturas de galería",
    caption: "Subtítulo",
    addCaption: "Añadir subtítulo",
    typeHere: " ✍️ ",
    image: "Imagen",
    description: "Descripción",
    color: "Color",
    rowLayout: "Diseño en fila",
    colImgText: "Img → Texto",
    colTextImg: "Texto → Img",
    alignLeft: "Izquierda",
    alignCenter: "Centro",
    alignRight: "Derecha",
    align: "Alineación",
    gridLayout: "Diseño de cuadrícula",
    applyGroup: "Aplicar Grupo",
    redText: "Texto rojo",
    loadMore: "Cargar más",
    saveUnencrypted: "Guardar sin PIN",
    unsplashAppId: "Unsplash Application ID",
    unsplashAccessKey: "Unsplash Access Key",
    unsplashSecretKey: "Unsplash Secret Key",
    clearCache: "Limpiar caché de galería",
    cacheCleared: "Caché de galería limpia",
    appearance: "Apariencia",
    theme: "Tema",
    font: "Fuente",
    editorTools: "Herramientas",
    vaultSecurity: "Seguridad de Bóveda",
    steemitSetup: "Configuración Steemit",
    themeCyan: "Cian",
    themeEmerald: "Esmeralda",
    themeOrange: "Naranja",
    themeRose: "Cuarzo",
    fontSans: "Sans",
    fontSerif: "Serif",
    fontMono: "Mono",
    advanced: "Avanzado",
    appAgent: "Agente de App",
    rewardType: "Tipo de recompensa",
    rewardsSP: "100% SP",
    rewards50: "50/50",
    rewards0: "Sin recompensas",
    beneficiaries: "Beneficiarios",
    addBeneficiary: "Añadir beneficiario",
    weight: "Peso (%)",
    mentionsList: "Menciones",
    parts: "partes",
    splitPost: "Dividir post",
    splitPostDesc: "Dividir texto largo.",
    minWordsPerPart: "Mín. palabras por parte",
    splitBtn: "DIVIDIR",
    splitSuccess: "¡Post dividido!",
    newPost: "Nueva publicación",
    confirmNewPost: "¿Iniciar una nueva publicación? (Se perderán los cambios no guardados)",
    gridWithCaptions: "Cuadrícula con subtítulos",
    clearfixDesc: "Evita que el texto rodee imágenes.",
    signaturePolicy: "Política de firma",
    signatureMissing: "Falta firma",
    signatureFound: "Firma encontrada",
    twoTapPublish: "Publicación rápida",
    noBeneficiaries: "Sin beneficiarios",
    confirmClearApiKeys: "¿Limpiar claves API?",
    keysCleared: "¡Claves limpias!",
    clearApiKeys: "Limpiar claves API",
  },
  ko: {
    editor: "에디터",
    preview: "미리보기",
    gallery: "갤러리",
    settings: "설정",
    publish: "게시하기",
    drafts: "초안",
    templates: "템플릿",
    tags: "태그",
    mentions: "멘션",
    tagGroups: "태그 그룹",
    addTagGroup: "그룹 추가",
    importTable: "표 가져오기",
    schedule: "예약",
    saveDraft: "초안 저장",
    insert: "삽입",
    delete: "삭제",
    cancel: "취소",
    confirm: "확인",
    username: "사용자 이름",
    title: "제목",
    tagsPlaceholder: "여백으로 태그 구분",
    pexelsSearch: "Pexels 검색",
    noDrafts: "저장된 초안이 없습니다",
    noTemplates: "템플릿이 없습니다",
    wordsLabel: "단어 수",
    cleanWordsLabel: "순수 단어 수",
    charsLabel: "글자 수",
    words: "단어",
    chars: "자",
    clean: "정제",
    formatting: "서식",
    steemitOptions: "스팀잇 옵션",
    clearfix: "텍스트 줄바꿈 방지 (Clearfix)",
    imageFormat: "이미지 형식",
    additional: "추가 설정",
    pexelsAttribution: "Pexels 출처 표기",
    pexelsLink: "사진에 링크 포함",
    pexelsKey: "Pexels 키",
    vaultPin: "Vault PIN",
    unlock: "잠금 해제",
    lock: "잠금",
    keys: "키 설정",
    mobileEditor: "편집",
    mobilePreview: "보기",
    queue: "대기열",
    addToQueue: "대기열에 추가",
    queueEmpty: "대기열이 비어 있습니다",
    publishNext: "다음 게시물 게시",
    autoPublish: "자동 게시",
    status: "상태",
    pending: "대기 중",
    published: "게시됨",
    error: "오류",
    placeholder: "여기에 당신의 걸작을 작성해 보세요...",
    fillRequired: "모든 필수 항목을 입력해 주세요.",
    publishing: "⏳ 게시 중...",
    publishedSuccess: "✅ 게시 완료!",
    noKeychain: "Steem Keychain을 찾을 수 없습니다.",
    enterPin: "Vault를 잠금 해제하려면 PIN을 입력하세요:",
    pinRequired: "PIN이 필요합니다",
    saveSuccess: "저장되었습니다!",
    fillAll: "모든 항목을 입력하세요!",
    noAccount: "계정을 선택하세요!",
    pinShort: "PIN이 너무 짧습니다 (최소 4자)",
    vaultInit: "Vault가 초기화되었습니다!",
    accountAdded: "계정이 추가되었습니다!",
    sessionActive: "세션 활성",
    vaultClosed: "저장소 닫힘",
    bold: "굵게",
    italic: "기울임",
    strike: "취소선",
    h1: "제목 1",
    h2: "제목 2",
    h3: "제목 3",
    quote: "인용",
    link: "링크",
    hr: "가로 구분선",
    justify: "양쪽 맞춤",
    center: "가운데 맞춤",
    table: "표",
    downloadMd: ".md 다운로드",
    tagPresets: "태그 프리셋",
    commonTags: "일반 태그",
    communities: "커뮤니티",
    indent: "들여쓰기",
    escape: "이스케이프",
    codeBlock: "코드 블록",
    inlineCode: "인라인 코드",
    addTags: "태그 추가",
    attribution: "출처 표기",
    linkInImg: "이미지에 링크",
    createGrid: "그리드 생성",
    account: "계정",
    leftText: "왼쪽 정렬 + 텍스트",
    rightText: "오른쪽 정렬 + 텍스트",
    asIs: "그대로",
    uploadToSteemit: "스팀잇에 업로드",
    pexelsError: "Pexels 오류",
    linkPrompt: "링크 텍스트:",
    urlPrompt: "URL 입력:",
    leftContent: " ✍️ ",
    rightContent: " ✍️ ",
    loadingParser: "로딩 중...",
    previewError: "미리보기 오류",
    untitled: "제목 없음",
    needVaultAccount: "계정을 먼저 선택하세요!",
    pinError: "PIN 오류: ",
    preparingUpload: "⏳ 준비 중...",
    proxyAttempt: "⏳ 프록시 시도 중...",
    proxyError: "업로드 실패",
    signingImage: "⏳ 서명 중...",
    uploadingSteemit: "⏳ 업로드 중...",
    serverError: "서버 오류",
    uploadSuccess: "✅ 업로드 성공!",
    uploadProgress: "⏳ 업로드 중 {current}/{total}...",
    uploadComplete: "✅ 업로드 완료.",
    pasteUrl: "URL 붙여넣기...",
    fullScreen: "전체 화면",
    enterNewPin: "새 PIN 입력",
    enterPinPlaceholder: "PIN 입력",
    addAccount: "계정 추가",
    usernameNoAt: "사용자명 (@ 제외)",
    confirmResetVault: "모든 데이터가 삭제됩니다!",
    vaultUnlocked: "저장소 잠금 해제됨",
    vaultLocked: "저장소 잠금됨",
    templateName: "템플릿 이름...",
    vaultTitle: "계정 저장소",
    vaultWarning: "PIN이 마스터 키를 보호합니다.",
    pinSetup: "PIN 설정",
    pinSetupDesc: "PIN을 설정하세요.",
    createVault: "저장소 생성",
    unlockBtn: "잠금 해제",
    yourAccounts: "내 계정",
    newAccount: "새 계정",
    postingKeyPlaceholder: "포스팅 키",
    done: "완료",
    publishToSteem: "스팀에 게시",
    vaultNotConfigured: "저장소가 설정되지 않았습니다.",
    setupVaultBtn: "저장소 설정",
    vaultActive: "저장소 활성",
    vaultActiveDesc: "게시물을 올릴 수 있습니다.",
    selectAccount: "계정 선택...",
    autosaveActive: "자동 저장 활성",
    clear: "지우기",
    saveToVault: "저장소에 저장",
    protectedByMK: "MK로 보호됨",
    confirmDeleteAccount: "@{acc} 계정을 삭제하시겠습니까?",
    vaultEmpty: "저장소가 비어 있습니다",
    resetVault: "저장소 초기화",
    save: "저장",
    links: "링크",
    text: "텍스트",
    keys_mobile: "키",
    importTableTitle: "표 가져오기",
    importTableDesc: "Excel, Google 시트, CSV 데이터를 붙여넣으세요. Markdown으로 변환됩니다.",
    importTablePlaceholder: "여기에 데이터 붙여넣기...",
    importBtn: "가져오기",
    settingsToolsDesc: "텍스트 편집 시 플로팅 메뉴에 표시할 도구를 선택하세요.",
    loadDraftConfirm: "이 초안을 불러오시겠습니까? 현재 텍스트가 대체됩니다.",
    tableFormat: "표 형식",
    importTableSuccess: "표를 성공적으로 가져왔습니다!",
    pexelsKeyRequired: "설정에서 Pexels API 키를 먼저 추가하세요.",
    pixabayKeyRequired: "설정에서 Pixabay API 키를 먼저 추가하세요.",
    unsplashKeyRequired: "설정에서 Unsplash Access Key를 먼저 추가하세요.",
    pixabayError: "Pixabay 오류: API 키 또는 연결을 확인하세요.",
    unsplashError: "Unsplash 오류: API 키 또는 연결을 확인하세요.",
    widgetSettings: "위젯 설정",
    widgetPos: "위젯 위치",
    posFloating: "플로팅 (커서 근처)",
    posBottom: "에디터 하단 (고정)",
    posPreview: "미리보기 패널",
    widgetOpacity: "위젯 투명도",
    widgetMinimal: "미니멀리스트 (테두리 없음)",
    activeToolsSort: "도구 정렬",
    working: "작업 중",
    ready: "준비됨",
    pixabayKey: "Pixabay 키",
    unsplashKey: "Unsplash 키",
    performanceMode: "성능 모드",
    enableThumbnails: "갤러리 썸네일",
    caption: "캡션",
    addCaption: "캡션 추가",
    typeHere: " ✍️ ",
    image: "이미지",
    description: "설명",
    color: "색상",
    rowLayout: "가로 레이아웃",
    colImgText: "이미지 → 텍스트",
    colTextImg: "텍스트 → 이미지",
    alignLeft: "왼쪽",
    alignCenter: "가운데",
    alignRight: "오른쪽",
    align: "정렬",
    gridLayout: "그리드 레이아웃",
    applyGroup: "그룹 적용",
    redText: "빨간 텍스트",
    loadMore: "더 불러오기",
    saveUnencrypted: "PIN 없이 저장",
    unsplashAppId: "Unsplash Application ID",
    unsplashAccessKey: "Unsplash Access Key",
    unsplashSecretKey: "Unsplash Secret Key",
    clearCache: "갤러리 캐시 삭제",
    cacheCleared: "갤러리 캐시가 삭제되었습니다",
    appearance: "모양",
    theme: "테마",
    font: "글꼴",
    editorTools: "도구",
    vaultSecurity: "보안",
    steemitSetup: "스팀잇 설정",
    themeCyan: "시안",
    themeEmerald: "에메랄드",
    themeOrange: "오렌지",
    themeRose: "로즈",
    fontSans: "Sans",
    fontSerif: "Serif",
    fontMono: "Mono",
    advanced: "고급",
    appAgent: "앱 에이전트",
    rewardType: "보상 유형",
    rewardsSP: "100% SP",
    rewards50: "50/50",
    rewards0: "보상 없음",
    beneficiaries: "수혜자",
    addBeneficiary: "수혜자 추가",
    weight: "가중치 (%)",
    mentionsList: "멘션 리스트",
    parts: "부분",
    splitPost: "포스트 분할",
    splitPostDesc: "긴 텍스트를 나눕니다.",
    minWordsPerPart: "부분당 최소 단어",
    splitBtn: "분할",
    splitSuccess: "포스트가 분할되었습니다!",
    newPost: "새 게시물",
    confirmNewPost: "새 게시물을 시작하시겠습니까? (저장하지 않은 변경 사항은 손실됩니다)",
    gridWithCaptions: "캡션이 있는 그리드",
    clearfixDesc: "이미지 뒤에 텍스트 줄바꿈을 방지합니다.",
    signaturePolicy: "서명 확인",
    signatureMissing: "서명 누락",
    signatureFound: "서명 확인됨",
    twoTapPublish: "빠른 게시",
    noBeneficiaries: "수혜자 없음",
    confirmClearApiKeys: "API 키를 삭제하시겠습니까?",
    keysCleared: "API 키가 삭제되었습니다!",
    clearApiKeys: "API 키 삭제",
  }
};

// Declare globals for TypeScript
declare global {
  interface Window {
    dsteem: any;
    marked: any;
    DOMPurify: any;
  }
}

// Access dsteem from window
const dsteem = (window as any).dsteem;

// Ensure Buffer is available globally for some libraries
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

// Access global libraries from CDN
const getMarked = () => {
  const markedLib = (window as any).marked;
  const purifyLib = (window as any).DOMPurify;
  
  // In modern marked (v4+), we should use marked.use()
  // The global could be 'marked' or 'marked.marked' depending on the bundle
  const targetMarked = markedLib?.marked || markedLib;

  if (targetMarked && targetMarked.use) {
    targetMarked.use({
      breaks: true,
      gfm: true,
      mangle: false,
      headerIds: false
    });
  } else if (targetMarked && targetMarked.setOptions) {
    targetMarked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  return {
    parse: async (text: string) => {
      if (!targetMarked || !targetMarked.parse) return text;
      try {
        // marked.parse can be sync or async
        const html = await targetMarked.parse(text, { breaks: true, gfm: true });
        if (purifyLib) {
          return purifyLib.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr', 'br', 'span', 'strike', 'sup', 'sub', 'center'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'className', 'style', 'title', 'target', 'rel'],
            ADD_CLASSES: {
              div: ['pull-left', 'pull-right', 'text-justify', 'text-right', 'text-center', 'clearfix', 'phishy', 'text-blue', 'text-green'],
              p: ['pull-left', 'pull-right', 'text-justify', 'text-right', 'text-center', 'clearfix', 'phishy', 'text-blue', 'text-green'],
              span: ['phishy', 'text-blue', 'text-green']
            }
          });
        }
        return html;
      } catch (e) {
        console.error('Markdown parse error:', e);
        return text;
      }
    }
  };
};
// --- Constants ---
const STORAGE_KEY_DRAFTS = 'steem_drafts_v2';
const STORAGE_KEY_TEMPLATES = 'steem_templates_v2';
const STORAGE_KEY_USERS = 'steem_users_v2';
const STORAGE_KEY_AUTOSAVE = 'steem_autosave_temp';
const STORAGE_KEY_FLOAT_CONFIG = 'steem_float_config';
const STORAGE_KEY_IMAGES = 'steem_uploaded_images_v2';
const STORAGE_KEY_QUEUE = 'steem_queue_v2';

const DEFAULT_FLOAT_TOOLS = ['B', 'I', 'sub', 'sup', 'Img', 'Caption', 'Mentions', 'Table', 'Grid', 'HR'];

// --- Components ---

const IconButton = ({ 
  icon: Icon, 
  onClick, 
  title, 
  className, 
  active = false 
}: { 
  icon: any, 
  onClick: () => void, 
  title?: string, 
  className?: string,
  active?: boolean
}) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-md transition-all duration-200 flex items-center justify-center shrink-0",
      "hover:bg-slate-700/50 active:scale-95",
      active ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400",
      className
    )}
  >
    <Icon size={18} />
  </button>
);

function App() {
  // --- State ---
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('steem_lang');
    return (saved as Language) || 'uk';
  });

  const t = useCallback((key: keyof typeof translations['uk']) => (translations[lang] as any)[key] || key, [lang]);

  const [content, setContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [widgetOpacity, setWidgetOpacity] = useState(() => Number(localStorage.getItem('widget_opacity')) || 0.5);
  const [widgetNoBorder, setWidgetNoBorder] = useState(() => {
    const saved = localStorage.getItem('widget_no_border');
    return saved === null ? true : saved === 'true';
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const isImagesLoaded = useRef(false);
  const [sourceInput, setSourceInput] = useState('');
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!previewRef.current) return;
    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number, y: number } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
    return saved ? JSON.parse(saved) : [];
  });
  const [scheduledTime, setScheduledTime] = useState('');
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [isGallerySettingsCollapsed, setIsGallerySettingsCollapsed] = useState(() => window.innerHeight <= 650);
  const lastShowTime = useRef(0);
  const [isUploading, setIsUploading] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryView, setGalleryView] = useState<'grid' | 'list'>('grid');
  const [galleryMode, setGalleryMode] = useState<'local' | 'pexels' | 'unsplash' | 'pixabay'>('local');
  const [pexelsApiKey, setPexelsApiKey] = useState<string | null>(null);
  const [pixabayApiKey, setPixabayApiKey] = useState<string | null>(() => localStorage.getItem('steem_pixabay_key'));
  const [unsplashAccessKey, setUnsplashAccessKey] = useState<string | null>(() => localStorage.getItem('steem_unsplash_access_key'));
  
  const [pexelsPage, setPexelsPage] = useState(1);
  const [pexelsResults, setPexelsResults] = useState<any[]>(() => {
    const cached = localStorage.getItem('steem_gallery_cache_results');
    if (!cached) return [];
    try {
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      return parsed.filter(p => {
        const key = p.id + p.source;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch { return []; }
  });
  const [isSearchingPexels, setIsSearchingPexels] = useState(false);
  
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('steem_performance_mode') === 'true');
  const [tempPexelsKey, setTempPexelsKey] = useState('');
  const [tempPixabayKey, setTempPixabayKey] = useState('');
  const [tempUnsplashAccessKey, setTempUnsplashAccessKey] = useState('');
  const [savePexelsUnencrypted, setSavePexelsUnencrypted] = useState(() => {
    return localStorage.getItem('steem_pexels_unencrypted') === 'true';
  });
  
  const [gridWithCaptions, setGridWithCaptions] = useState(false);
  const [singleCaptionAlign, setSingleCaptionAlign] = useState<'center' | 'left' | 'right'>('center');
  const [gridLayout, setGridLayout] = useState<'row' | 'grid-2' | 'col-img-text' | 'col-text-img'>('grid-2');

  const [pexelsSettings, setPexelsSettings] = useState(() => {
    const saved = localStorage.getItem('steem_pexels_settings');
    return saved ? JSON.parse(saved) : {
      withAttribution: true,
      linkEmbedded: true
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const lastWidth = useRef(window.innerWidth);
  const [widgetPos, setWidgetPos] = useState<'floating' | 'bottom'>(() => {
    const saved = localStorage.getItem('steem_widget_pos');
    return (saved === 'bottom' ? 'bottom' : 'floating');
  });
  const [widgetShowMinimal, setWidgetShowMinimal] = useState<boolean>(() => {
    return localStorage.getItem('steem_widget_minimal') === 'true';
  });
  const [enabledTools, setEnabledTools] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FLOAT_CONFIG);
    const initial = saved ? JSON.parse(saved) : DEFAULT_FLOAT_TOOLS;
    // ensure unique
    return Array.from(new Set(initial));
  });

  // Configure marked for Steem-like behavior
  useEffect(() => {
    const configMarked = () => {
      const m = (window as any).marked;
      if (m) {
        const options = {
          breaks: true,
          gfm: true,
          headerIds: false,
          mangle: false,
          silent: true
        };
        if (typeof m.setOptions === 'function') {
          m.setOptions(options);
        } else if (typeof m.use === 'function') {
          m.use({ breaks: true, gfm: true });
        }
      } else {
        // Retry in case CDN is slow
        setTimeout(configMarked, 500);
      }
    };
    configMarked();
  }, []);
  
  const [previewHtml, setPreviewHtml] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('steem_dark_mode') !== 'false');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'general' | 'gallery' | 'vault' | 'keys' | 'about'>('general');
  const [systemDialog, setSystemDialog] = useState<{
    type: 'confirm' | 'prompt' | 'alert',
    title: string,
    message: string,
    resolve: (val: any) => void,
    defaultValue?: string,
    placeholder?: string
  } | null>(null);

  useEffect(() => {
    if (activeModal === null && !systemDialog) {
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  }, [activeModal, systemDialog]);

  const confirmDialog = (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      setSystemDialog({ 
        type: 'confirm', 
        title: title || t('confirm'), 
        message, 
        resolve 
      });
    });
  };

  const promptDialog = (message: string, defaultValue: string = "", title?: string) => {
    return new Promise<string | null>((resolve) => {
      setSystemDialog({ 
        type: 'prompt', 
        title: title || t('link'), 
        message, 
        resolve, 
        defaultValue 
      });
    });
  };

  const [tableImportText, setTableImportText] = useState('');
  const [tableImportFormat, setTableImportFormat] = useState<'markdown' | 'html'>('markdown');

  // Memoized filtered lists to reduce processing during each render
  const filteredLocalImages = useMemo(() => {
    return images.filter(img => img.name.toLowerCase().includes(gallerySearch.toLowerCase()));
  }, [images, gallerySearch]);

  // Update preview HTML when content or marked changes
  useEffect(() => {
    const updatePreview = async () => {
      const m = getMarked();
      if (!m) {
        setPreviewHtml(`<p class="text-slate-500 italic">${t('loadingParser')}</p>`);
        return;
      }
      try {
        const processed = processContentForSteem(content);
        let finalHtml = await m.parse(processed);
        
        // Add referrerpolicy="no-referrer" to all img tags for better compatibility
        finalHtml = finalHtml.replace(/<img /g, '<img referrerpolicy="no-referrer" ');
        
        const preview = previewPaneRef.current;
        let isAtBottom = false;
        if (preview) {
          isAtBottom = preview.scrollHeight > 0 && preview.scrollHeight - preview.scrollTop - preview.clientHeight <= 20;
        }
        
        setPreviewHtml(finalHtml);

        if (preview && syncScrollEnabled && isAtBottom) {
          requestAnimationFrame(() => {
            preview.scrollTop = preview.scrollHeight;
          });
        }
      } catch (e) {
        console.error("Marked parse error", e);
        setPreviewHtml(`<p class="text-red-500">${t('previewError')}</p>`);
      }
    };

    const timer = setTimeout(updatePreview, 300); // Debounce
    return () => clearTimeout(timer);
  }, [content, t]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [newMention, setNewMention] = useState('');
  
  // Auth & Publish
  const [authType, setAuthType] = useState<AuthType | 'VAULT'>('KEYCHAIN');
  const [username, setUsername] = useState('');
  const [vaultPin, setVaultPin] = useState('');
  const [isVaultInitialized, setIsVaultInitialized] = useState(false);
  const [vaultAccounts, setVaultAccounts] = useState<string[]>([]);
  const [selectedVaultUser, setSelectedVaultUser] = useState('');
  const [isSMenuOpen, setIsSMenuOpen] = useState(false);
  const [beautifyEnabled, setBeautifyEnabled] = useState(() => localStorage.getItem('steem_beautify') !== 'false');
  
  const themeAssortment = [
    { name: 'cyan', color: 'bg-cyan-500', border: 'border-cyan-500/50' },
    { name: 'blue', color: 'bg-blue-500', border: 'border-blue-500/50' },
    { name: 'purple', color: 'bg-purple-500', border: 'border-purple-500/50' },
    { name: 'pink', color: 'bg-pink-500', border: 'border-pink-500/50' },
    { name: 'orange', color: 'bg-orange-500', border: 'border-orange-500/50' },
    { name: 'emerald', color: 'bg-emerald-500', border: 'border-emerald-500/50' },
    { name: 'rose', color: 'bg-rose-500', border: 'border-rose-500/50' },
    { name: 'indigo', color: 'bg-indigo-500', border: 'border-indigo-500/50' },
  ];

  const fontOptions = [
    { id: 'sans', label: 'Inter Sans', class: 'font-sans' },
    { id: 'serif', label: 'Merriweather Serif', class: 'font-serif' },
    { id: 'mono', label: 'JetBrains Mono', class: 'font-mono' },
    { id: 'display', label: 'Playfair Display', class: 'font-serif italic' },
    { id: 'grotesk', label: 'Space Grotesk', class: 'font-sans tracking-tight' },
  ];

  const [imageUploadAccount, setImageUploadAccount] = useState('');
  const [showVaultSetup, setShowVaultSetup] = useState(false);
  const [vaultSetupWif, setVaultSetupWif] = useState('');
  const [vaultSetupPin, setVaultSetupPin] = useState('');
  const [pubTitle, setPubTitle] = useState('');
  const [pubTags, setPubTags] = useState('');
  const [appAgent, setAppAgent] = useState(localStorage.getItem('steem_app_agent') || 'steemeditor/1.0');
  const [rewardType, setRewardType] = useState<'SP' | '50' | '0'>( (localStorage.getItem('steem_reward_type') as any) || '50');
  const [beneficiaries, setBeneficiaries] = useState<{account: string, weight: number}[]>([]);
  const [benName, setBenName] = useState('');
  const [benWeight, setBenWeight] = useState('5');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAdvancedPublish, setShowAdvancedPublish] = useState(false);
  const [themeColor, setThemeColor] = useState<string>(localStorage.getItem('steem_theme_color') || 'cyan');
  const [editorFont, setEditorFont] = useState<string>(localStorage.getItem('steem_editor_font') || 'sans');
  const [isExifEnabled, setIsExifEnabled] = useState(() => localStorage.getItem('steem_exif_enabled') === 'true');
  const [pubLog, setPubLog] = useState<{ msg: string, type: 'success' | 'error' | 'loading' | null }>({ msg: '', type: null });

  const getExifTableFromBlob = async (file: File | Blob): Promise<string> => {
    if (!isExifEnabled) return '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer);
      if (!tags) return '';

      const make = tags['Make']?.description || '';
      const model = tags['Model']?.description || '';
      const fNumber = tags['FNumber']?.description ? `f/${tags['FNumber'].description}` : '';
      const iso = tags['ISOSpeedRatings']?.description ? `ISO ${tags['ISOSpeedRatings'].description}` : '';
      const shutter = tags['ExposureTime']?.description || '';
      const focal = tags['FocalLength']?.description || '';

      if (!make && !model && !iso) return '';

      let table = '\n| Param | Camera Info |\n| --- | --- |\n';
      if (make || model) table += `| 📸 | ${make} ${model} |\n`;
      if (fNumber) table += `| 🔘 | ${fNumber} |\n`;
      if (shutter) table += `| ⏲️ | ${shutter} |\n`;
      if (iso) table += `| 🎞️ | ${iso} |\n`;
      if (focal) table += `| 🔍 | ${focal} |\n`;
      
      return table + '\n';
    } catch (e) {
      console.error('Exif error:', e);
      return '';
    }
  };

  useEffect(() => {
    if (activeModal === 'publish' && !pubTitle) {
      const firstLine = content.split('\n')[0].replace(/[#*`]/g, '').trim();
      if (firstLine) setPubTitle(firstLine.substring(0, 70));
    }
  }, [activeModal, content]);

  const extractMentions = (text: string) => {
    // 1. Remove markdown links [Label](url)
    // 2. Remove standard URLs
    // 3. Remove what looks like a path or query part of a URL (if still some left)
    const cleanText = text
      .replace(/\[.*?\]\(.*?\)/g, ' ')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/[a-z0-9.-]+\/[a-z0-9.-]+/gi, ' ');
      
    const matches = cleanText.match(/@([a-z0-9.-]+)/gi);
    if (!matches) return [];
    
    return Array.from(new Set(matches.map(m => m.substring(1).toLowerCase())))
      .filter(m => /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(m))
      .filter(m => !m.includes('.') || m.split('.').every(p => p.length >= 1));
  };

  const createPermlinkUA = (title: string): string => {
    let text = title.toLowerCase().trim();
    text = text.replace(/зг/g, 'zgh'); // Правило "зг"
    const specialStart: Record<string, string> = { 'є': 'ye', 'ї': 'yi', 'й': 'y', 'ю': 'yu', 'я': 'ya' };
    const specialMid: Record<string, string> = { 'є': 'ye', 'ї': 'yi', 'й': 'y', 'ю': 'yu', 'я': 'ya' };
    const standardMap: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'y', 'і': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', '’': '', "'": '', 'ʼ': ''
    };
    const result = text.split(/([\s-]+)/).map(part => {
        if (/[\s-]+/.test(part)) return part;
        let word = "";
        for (let i = 0; i < part.length; i++) {
            const char = part[i];
            if (i === 0 && specialStart[char]) word += specialStart[char];
            else if (i > 0 && specialMid[char]) word += specialMid[char];
            else if (standardMap[char] !== undefined) word += standardMap[char];
            else word += char;
        }
        return word;
    }).join('');
    
    return result
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 150) || 'post-' + Math.random().toString(36).substring(2, 7);
  };
  const sanitizeFilename = (name: string): string => {
    const ukrToLatin: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
      'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
      'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ь': '', 'ю': 'yu', 'я': 'ya', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E',
      'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
      'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
    };
    
    const parts = name.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const base = parts.join('.');
    const result = base.split('').map(char => ukrToLatin[char] || char).join('');
    
    return result
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_.-]/g, '')
      .substring(0, 40) + (ext ? '.' + ext : '');
  };

  const notify = useCallback((msg: string, type: 'success' | 'error' | 'loading' = 'success') => {
    setPubLog({ msg, type });
    if (type !== 'loading') {
      const timeout = type === 'success' ? 3000 : 5000;
      setTimeout(() => {
        setPubLog(prev => prev.msg === msg ? { msg: '', type: null } : prev);
      }, timeout);
    } else {
      // Auto-clear loading after 15s to prevent stuck notifications
      setTimeout(() => {
        setPubLog(prev => prev.type === 'loading' && prev.msg === msg ? { msg: '', type: null } : prev);
      }, 15000);
    }
  }, []);
  const [isUnlocked, setIsUnlocked] = useState(!SecurityService.isLocked());
  const [isTableMode, setIsTableMode] = useState(() => {
    return localStorage.getItem('steem_table_mode') === 'true';
  });
  const [isTrafficOptimized, setIsTrafficOptimized] = useState(() => {
    return localStorage.getItem('steem_traffic_optimized') === 'true';
  });
  const [imageInsertFormat, setImageInsertFormat] = useState<'html' | 'markdown'>(() => {
    return (localStorage.getItem('steem_image_format') as 'html' | 'markdown') || 'html';
  });
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');
  
  const [cleanStats, setCleanStats] = useState({ words: 0, chars: 0 });
  const [tagGroups, setTagGroups] = useState<TagGroup[]>(() => {
    const saved = localStorage.getItem('steem_tag_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(() => localStorage.getItem('steem_sync_scroll') !== 'false');

  const handleEditorScroll = () => {
    if (!syncScrollEnabled) return;
    const editor = editorRef.current;
    const preview = previewPaneRef.current;
    if (editor && preview) {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
  };

  // --- Effects ---
  // Save images and links when they change
  useEffect(() => {
    if (isImagesLoaded.current) {
      localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));
      localStorage.setItem('steem_editor_source_links', sourceInput);
      localStorage.setItem('steem_image_format', imageInsertFormat);
      localStorage.setItem('steem_table_mode', String(isTableMode));
    }
  }, [images, sourceInput, imageInsertFormat, isTableMode]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
    if (saved) setContent(saved);
    
    const savedUser = localStorage.getItem('steem_username');
    if (savedUser) setUsername(savedUser);

    const savedTpls = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (savedTpls) setTemplates(JSON.parse(savedTpls));

    const savedMentions = localStorage.getItem(STORAGE_KEY_USERS);
    if (savedMentions) setMentions(JSON.parse(savedMentions));

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth.current) {
        if (currentWidth < 1024) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
        lastWidth.current = currentWidth;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTOSAVE, content);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setStats({ words, chars: content.length });
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Clean stats calculation - moved to separate debounced effect
      const calculateCleanStats = (text: string) => {
        // 1. Remove attribution footers but count them as a few words
        let cleanText = text.replace(/<hr>[\s\S]*?Photo by[\s\S]*?<\/footer>/gi, ' Attribution ');
        cleanText = cleanText.replace(/<hr>[\s\S]*?Source:[\s\S]*?<\/footer>/gi, ' Source ');
        
        // 2. Remove HTML tags
        cleanText = cleanText.replace(/<[^>]*>/g, ' ');
        
        // 3. Remove Markdown links [text](url) -> text
        cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        // 4. Remove Markdown images ![alt](url) -> alt (shortened)
        cleanText = cleanText.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt) => {
          return alt.split(/\s+/).slice(0, 3).join(' '); // Keep only first 3 words of alt
        });
        
        // 5. Remove Blockquotes (lines starting with >)
        cleanText = cleanText.split('\n').filter(line => !line.trim().startsWith('>')).join('\n');
        
        // 6. Remove Markdown formatting symbols
        cleanText = cleanText.replace(/[#*`_~]/g, '');
        
        const cleanWords = cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;
        return { words: cleanWords, chars: cleanText.length };
      };
      setCleanStats(calculateCleanStats(content));
    }, 1000); // More aggressive debounce for expensive calculation
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    localStorage.setItem('steem_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('steem_tag_groups', JSON.stringify(tagGroups));
  }, [tagGroups]);

  // --- Logic ---
  const getSelectionOrWord = useCallback(() => {
    if (!editorRef.current) return { s: 0, e: 0, text: '' };
    const s = editorRef.current.selectionStart;
    const e = editorRef.current.selectionEnd;
    if (s !== e) return { s, e, text: content.substring(s, e) };
    
    let start = s;
    let end = e;
    while (start > 0 && !/[\s\n]/.test(content[start - 1])) start--;
    while (end < content.length && !/[\s\n]/.test(content[end])) end++;
    return { s: start, e: end, text: content.substring(start, end) };
  }, [content]);

  const insertAtCursor = useCallback((text: string, selectionMode: 'end' | 'select' = 'end', isBlock: boolean = false) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    
    let finalText = text;

    if (isBlock) {
      // Find start of current line to detect indentation or list markers
      const lastNewline = content.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLine = content.substring(lineStart, start);
      
      // Detect list indentation: matches markers like "* ", "1. ", or just spaces
      const listMatch = currentLine.match(/^(\s*(?:[*-+]|\d+\.|>)\s+)/);
      const indentation = listMatch ? ' '.repeat(listMatch[0].length) : (currentLine.match(/^(\s*)/)?.[0] || '');
      
      const lines = text.trim().split('\n');
      // Preindent lines (except the first one as prefix handles it or it's inserted directly on current line)
      const indentedBody = lines.map((l, i) => (i === 0 ? l : indentation + l)).join('\n');

      let prefix = '';
      const textBefore = content.substring(0, start);
      if (textBefore.length > 0) {
        if (textBefore.endsWith('\n\n')) {
          prefix = indentation;
        } else if (textBefore.endsWith('\n')) {
          // If we are on a new line, check if it already has the indentation
          if (currentLine === indentation) {
            prefix = '\n' + indentation; // Adds one blank line (properly indented) before content
          } else {
            prefix = indentation + '\n' + indentation;
          }
        } else {
          // We are at the end of a line with content
          prefix = '\n' + indentation + '\n' + indentation; 
        }
      } else {
        prefix = indentation;
      }
      
      let suffix = '\n';
      const textAfter = content.substring(end);
      if (textAfter.length > 0) {
        if (textAfter.startsWith('\n\n')) suffix = '\n';
        else if (textAfter.startsWith('\n')) suffix = '\n';
        else suffix = '\n\n';
      }
      
      finalText = prefix + indentedBody + suffix;
    }

    const newContent = content.substring(0, start) + finalText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      if (selectionMode === 'select') {
        editorRef.current.setSelectionRange(start, start + finalText.length);
      } else {
        editorRef.current.setSelectionRange(start + finalText.length, start + finalText.length);
      }
    }, 0);
  }, [content]);

  useEffect(() => {
    // Timer removed as per user request to hide only on typing
  }, [isEditorFocused, isWidgetVisible]);

  const widgetRef = useRef<HTMLDivElement>(null);
  const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('up');
  const [lockedToolsWidth, setLockedToolsWidth] = useState<number | null>(null);

  useEffect(() => {
    if (isWidgetMenuOpen && widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setMenuDirection(rect.top < 350 ? 'down' : 'up');
    }
  }, [isWidgetMenuOpen]);

  const showWidget = useCallback((x: number, y: number) => {
    if (widgetPos !== 'floating') {
      if (!isWidgetVisible) setIsWidgetVisible(true);
      return;
    }

    // Do not jump around if already visible
    if (isWidgetVisible) return;

    setFloatingPos({ x, y });
    setIsWidgetVisible(true);
  }, [widgetPos, isWidgetVisible]);

  const fmt = useCallback((prefix: string, suffix: string = prefix) => {
    if (!editorRef.current) return;
    const range = getSelectionOrWord();
    
    if (range.text.length === 0) {
      const textToInsert = prefix + suffix;
      const newContent = content.substring(0, range.s) + textToInsert + content.substring(range.e);
      setContent(newContent);
      setTimeout(() => {
        if (!editorRef.current) return;
        editorRef.current.setSelectionRange(range.s + prefix.length, range.s + prefix.length);
      }, 0);
    } else {
      const newText = prefix + range.text + suffix;
      const newContent = content.substring(0, range.s) + newText + content.substring(range.e);
      setContent(newContent);
      setTimeout(() => {
        if (!editorRef.current) return;
        editorRef.current.setSelectionRange(range.s, range.s + newText.length);
      }, 0);
    }
  }, [content, getSelectionOrWord]);

  const fmtLine = useCallback((prefix: string) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    
    if (start === end) {
      const lastNewline = content.lastIndexOf('\n', start - 1) + 1;
      const newContent = content.substring(0, lastNewline) + prefix + content.substring(lastNewline);
      setContent(newContent);
    } else {
      // Multi-line selection
      const selectedText = content.substring(start, end);
      const lines = selectedText.split('\n');
      const newText = lines.map(line => line.trim() ? prefix + line : line).join('\n');
      const newContent = content.substring(0, start) + newText + content.substring(end);
      setContent(newContent);
    }
  }, [content]);

  const handleLink = useCallback(async () => {
    const selection = getSelectionOrWord();
    const trimmed = selection.text.trim();
    const isUrl = /^(https?:\/\/|www\.)\S+$/i.test(trimmed);
    
    if (isUrl) {
      const label = await promptDialog(t('linkPrompt'), "");
      if (label !== null) {
        const newText = label ? `[${label}](${trimmed})` : `[${trimmed}](${trimmed})`;
        const newContent = content.substring(0, selection.s) + newText + content.substring(selection.e);
        setContent(newContent);
      }
    } else {
      const url = await promptDialog(t('urlPrompt'), "https://");
      if (url) fmt('[', `](${url})`);
    }
  }, [content, t, getSelectionOrWord, fmt]);

  const importTable = useCallback(() => {
    setActiveModal('tableImport');
  }, []);

  const processTableImport = useCallback(() => {
    const data = tableImportText;
    if (!data) {
      setActiveModal(null);
      return;
    }

    // Split by lines, handle all newline types
    // We don't trim lines here because it would remove leading tabs (empty first cells)
    const lines = data.split(/\r\n|\r|\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) {
      setActiveModal(null);
      return;
    }

    // Detect delimiter
    const delimiters = ['\t', ';', ',', '|'];
    let bestDelimiter = '\t';
    let maxConsistency = -1;

    delimiters.forEach(d => {
      const colCounts = lines.map(l => l.split(d).length);
      const avg = colCounts.reduce((a, b) => a + b, 0) / colCounts.length;
      if (avg > 1.1) { // Reduced threshold to allow simple 2-col tables
        const mostFrequent = colCounts.reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const frequency = Math.max(...Object.values(mostFrequent));
        if (frequency > maxConsistency) {
          maxConsistency = frequency;
          bestDelimiter = d;
        }
      }
    });

    const rows = lines.map(line => {
      let parts: string[];
      if (bestDelimiter === '|') {
        // For Markdown tables, we trim the line itself but keep empty cells
        const trimmedLine = line.trim();
        parts = trimmedLine.split('|').map(p => p.trim());
        if (parts[0] === '') parts.shift();
        if (parts[parts.length - 1] === '') parts.pop();
      } else if (bestDelimiter === ',') {
        // Simple CSV parsing (handles quotes)
        const partsArray = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            partsArray.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        partsArray.push(current.trim());
        parts = partsArray;
      } else {
        // For TSV (Excel), we do NOT trim the line before split to keep \t at start
        parts = line.split(bestDelimiter).map(p => p.trim());
      }
      return parts;
    });

    // Determine the true number of columns (max found in any row to be safe)
    const maxCols = Math.max(...rows.map(r => r.length));
    
    // Normalize rows: ensure every row has exact same number of columns
    const normalizedRows = rows.map(r => {
      const newRow = [...r];
      while (newRow.length < maxCols) {
        newRow.push(''); // Pad missing cells
      }
      if (newRow.length > maxCols) {
        return newRow.slice(0, maxCols); // Crop extra
      }
      return newRow;
    });

    let resultTable = '';
    if (tableImportFormat === 'markdown') {
      normalizedRows.forEach((cols, i) => {
        const cleanCols = cols.map(c => {
          // Replace newlines with <br/> but try to avoid breaking markdown link syntax [text](url)
          // If a cell is purely a markdown link, we might want to keep it on one line.
          // For now, standard <br/> is mostly fine, but let's ensure we don't have leading/trailing garbage.
          return c.replace(/\|/g, '\\|').replace(/\r\n|\r|\n/g, '<br/>').trim();
        });
        resultTable += '| ' + cleanCols.join(' | ') + ' |\n';
        if (i === 0) {
          resultTable += '| ' + cleanCols.map(() => '---').join(' | ') + ' |\n';
        }
      });
    } else {
      resultTable = '<table style="width:100%">\n';
      normalizedRows.forEach((cols, i) => {
        resultTable += '  <tr>\n';
        cols.forEach(col => {
          const tag = i === 0 ? 'th' : 'td';
          resultTable += `    <${tag}>${col}</${tag}>\n`;
        });
        resultTable += '  </tr>\n';
      });
      resultTable += '</table>';
    }
    
    insertAtCursor('\n\n' + resultTable, 'end', true);
    setTableImportText('');
    setActiveModal(null);
    notify(t('importTableSuccess'), 'success');
  }, [tableImportText, insertAtCursor, tableImportFormat, t, notify]);

  const parseImages = useCallback((input: string) => {
    setSourceInput(input);
    const urlPattern = /(https?:\/\/[^[\]\s<>"'()]+?\.(?:jpg|jpeg|png|webp|gif|svg))/gi;
    const matches = input.match(urlPattern) || [];
    const uniqueUrls = Array.from(new Set(matches));
    
    setImages(prev => {
      const existingUrls = new Set(prev.map(img => img.url));
      const newImages = uniqueUrls.map(url => ({
        url,
        name: url.split('/').pop()?.split('?')[0] || 'image',
        selected: false
      })).filter(img => !existingUrls.has(img.url));
      
      const keptImages = prev.filter(img => uniqueUrls.includes(img.url));
      return [...keptImages, ...newImages];
    });
  }, []);

  const toggleImageSelection = (index: number) => {
    const newImages = [...images];
    newImages[index].selected = !newImages[index].selected;
    setImages(newImages);
  };

  // Load data on mount
  const initVault = useCallback(async () => {
    const initialized = await SecurityService.isInitialized();
    setIsVaultInitialized(initialized);
    
    const accounts = await SecurityService.getAccounts();
    const usernames = accounts.map(a => a.username);
    setVaultAccounts(usernames);
    
    if (usernames.length > 0) {
      const firstUser = usernames[0];
      setSelectedVaultUser(prev => prev || firstUser);
      setUsername(prev => prev || firstUser);
    }
    
    const rawPxKey = localStorage.getItem('steem_pexels_key_raw');
    if (rawPxKey) {
      setPexelsApiKey(rawPxKey);
    } else {
      const pxKey = await SecurityService.getPexelsKey();
      if (pxKey) setPexelsApiKey(pxKey);
    }
    const encryptedPixabay = await SecurityService.getApiKey('pixabay');
    if (encryptedPixabay) setPixabayApiKey(encryptedPixabay);
    const encryptedUnsplashAccess = await SecurityService.getApiKey('unsplashAccess');
    if (encryptedUnsplashAccess) setUnsplashAccessKey(encryptedUnsplashAccess);
  }, []);

  useEffect(() => {
    initVault();

    // Load saved images and links
    const savedLinks = localStorage.getItem('steem_editor_source_links');
    if (savedLinks) {
      parseImages(savedLinks);
    } else {
      const savedImages = localStorage.getItem(STORAGE_KEY_IMAGES);
      if (savedImages) {
        try {
          const parsed = JSON.parse(savedImages);
          if (Array.isArray(parsed)) {
            setImages(parsed);
          }
        } catch (e) {
          console.error("Failed to load images", e);
        }
      }
    }

    // Додаємо невелику затримку перед активацією збереження
    setTimeout(() => {
      isImagesLoaded.current = true;
    }, 1000);

    SecurityService.setStatusCallback((unlocked) => {
      setIsUnlocked(unlocked);
    });

    const handleKeyboardResize = () => {
      // Prevents gallery/sidebar from closing when mobile keyboard pops up
      // Keyboard usually only affects height, not width
    };
    window.addEventListener('resize', handleKeyboardResize);
    
    return () => {
      SecurityService.setStatusCallback(() => {});
      window.removeEventListener('resize', handleKeyboardResize);
    };
  }, [parseImages, initVault]);

  useEffect(() => {
    localStorage.setItem('steem_pexels_settings', JSON.stringify(pexelsSettings));
  }, [pexelsSettings]);

  useEffect(() => {
    localStorage.setItem('steem_gallery_cache_results', JSON.stringify(pexelsResults));
  }, [pexelsResults]);

  const toggleGalleryMode = (mode: 'local' | 'pexels' | 'unsplash' | 'pixabay') => {
    setGalleryMode(mode);
    setGallerySearch('');
    // No longer clearing results here to support caching
  };

  const handleExternalSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    let apiKey = '';
    if (galleryMode === 'pexels') apiKey = pexelsApiKey || '';
    if (galleryMode === 'pixabay') apiKey = pixabayApiKey || '';
    if (galleryMode === 'unsplash') apiKey = unsplashAccessKey || '';

    if (!apiKey) {
      if (!isUnlocked && isVaultInitialized) {
        setVaultPin('');
        setActiveModal('unlock-pin');
        return;
      }
      const msg = galleryMode === 'pexels' ? t('pexelsKeyRequired') : 
                  galleryMode === 'pixabay' ? t('pixabayKeyRequired') : t('unsplashKeyRequired');
      notify(msg, 'error');
      return;
    }

    setIsSearchingPexels(true);
    try {
      let results: any[] = [];
      const trimmedKey = apiKey.trim();

      const fetchWithRetry = async (url: string, options: RequestInit) => {
        try {
          const resp = await fetch(url, options);
          if (resp.ok) return resp;
          throw new Error(`${resp.status} ${resp.statusText}`);
        } catch (err: any) {
          if (err.name === 'TypeError' || err.message.includes('fetch')) {
            // Try proxy as fallback if network/CORS error
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyResp = await fetch(proxyUrl, options);
            if (proxyResp.ok) return proxyResp;
          }
          throw err;
        }
      };

      if (galleryMode === 'pexels') {
        const pRes = await PexelsService.searchPhotos(query, trimmedKey, page);
        results = pRes.map(p => ({
          id: p.id,
          url: p.src.large2x || p.src.large,
          thumb: performanceMode ? p.src.medium : (p.src.large2x || p.src.large),
          alt: p.alt || 'Pexels Photo',
          author: p.photographer,
          authorUrl: p.photographer_url,
          source: 'pexels'
        }));
      } else if (galleryMode === 'pixabay') {
        const url = `https://pixabay.com/api/?key=${trimmedKey}&q=${encodeURIComponent(query)}&page=${page}&image_type=photo&per_page=30`;
        const resp = await fetchWithRetry(url, {});
        const data = await resp.json();
        results = (data.hits || []).map((h: any) => ({
          id: h.id,
          url: h.largeImageURL,
          thumb: performanceMode ? h.webformatURL : h.largeImageURL,
          alt: h.tags || 'Pixabay Photo',
          author: h.user,
          authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
          source: 'pixabay'
        }));
      } else if (galleryMode === 'unsplash') {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=30&client_id=${trimmedKey}`;
        const resp = await fetchWithRetry(url, {});
        const data = await resp.json();
        results = (data.results || []).map((r: any) => ({
          id: r.id,
          url: r.urls.regular,
          thumb: performanceMode ? r.urls.small : r.urls.regular,
          alt: r.alt_description || 'Unsplash Photo',
          author: r.user.name,
          authorUrl: r.user.links.html,
          source: 'unsplash'
        }));
      }

      const mapped = results.map(r => ({ ...r, selected: false }));
      if (page === 1) setPexelsResults(mapped);
      else setPexelsResults(prev => {
        const existingIds = new Set(prev.map(p => p.id + p.source));
        const uniqueNew = mapped.filter(p => !existingIds.has(p.id + p.source));
        return [...prev, ...uniqueNew];
      });
      setPexelsPage(page);
    } catch (e: any) {
      console.error(e);
      notify(t('pexelsError'), 'error');
    } finally {
      setIsSearchingPexels(false);
    }
  };

  const shortenName = (name: string, max: number = 30) => {
    if (name.length <= max) return name;
    return name.substring(0, max) + '...';
  };

  const insertExternalImage = (photo: any, position: 'left' | 'right' | 'center' | 'plain') => {
    const url = photo.url.split('?')[0];
    const name = shortenName(photo.alt || 'Photo');
    const photographer = photo.author;
    const photographerUrl = photo.authorUrl;

    let attribution = '';
    if (pexelsSettings.withAttribution) {
      const source = (photo.source || 'pexels').toLowerCase();
      const sourceName = source === 'unsplash' ? 'Unsplash' : source === 'pixabay' ? 'Pixabay' : 'Pexels';
      attribution = `<div align="${singleCaptionAlign}"><sup>By <a href="${photographerUrl}">${photographer}</a> on <a href="https://${source}.com">${sourceName}</a></sup></div>`;
    }

    if (imageInsertFormat === 'markdown') {
      const externalLinkUrl = photo.pageURL || photo.url.split('?')[0];
      let md = `![${name}](${url})`;
      if (pexelsSettings.linkEmbedded) {
        md = `[${md}](${externalLinkUrl})`;
      }
      
      let finalMd: string;
      if (position === 'plain') {
        finalMd = md + (attribution ? '\n\n' + attribution : '');
      } else if (position === 'center') {
        finalMd = `<center>\n\n${md}\n\n${attribution ? attribution + '\n\n' : ''}</center>`;
      } else {
        finalMd = `<div class="pull-${position}">\n\n${md}\n\n${attribution ? attribution + '\n\n' : ''}</div>`;
      }

      if (isTableMode && (position === 'left' || position === 'right')) finalMd += '\n<div class="clearfix"></div>\n';
      insertAtCursor('\n' + finalMd + '\n');
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      return;
    }

    const imgHtml = `<img src="${url}" alt="${name}">`;
    let html = '';
    if (position === 'plain') html = imgHtml + (attribution ? '<br/>' + attribution : '');
    else if (position === 'left' || position === 'right') html = `<div class="pull-${position}">${imgHtml}<br/>${attribution}</div>`;
    else if (position === 'center') html = `<center>${imgHtml}<br/>${attribution}</center>`;

    if (isTableMode && (position === 'left' || position === 'right')) html += '\n<div class="clearfix"></div>\n';
    insertAtCursor('\n' + html + '\n');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const insertImage = (url: string, name: string, position: 'left' | 'right' | 'center' | 'plain') => {
    const sName = shortenName(name);
    // Find exif if it exists in local gallery
    const localImg = images.find(i => i.url === url);
    const exifTable = localImg?.exif || '';
    
    let attribution = '';
    if (gridWithCaptions) {
      attribution = `<div align="${singleCaptionAlign}"><sup> ✍️ </sup></div>`;
    }

    if (imageInsertFormat === 'markdown') {
      const md = `![${sName}](${url})`;
      let finalMd: string;
      if (position === 'plain') {
        finalMd = md + (attribution ? '\n\n' + attribution : '');
      } else if (position === 'center') {
        finalMd = `<center>\n\n${md}\n\n${attribution ? attribution + '\n\n' : ''}</center>`;
      } else {
        finalMd = `<div class="pull-${position}">\n\n${md}\n\n${attribution ? attribution + '\n\n' : ''}</div>`;
      }

      if (isTableMode && (position === 'left' || position === 'right')) {
        finalMd += '\n<div class="clearfix"></div>\n';
      }

      insertAtCursor('\n' + finalMd + exifTable + '\n', 'end', true);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      return;
    }

    const imgHtml = `<img src="${url}" alt="${sName}">`;
    let html = '';

    if (position === 'plain') {
      html = imgHtml + (attribution ? '<br/>' + attribution : '');
    } else if (position === 'left' || position === 'right') {
      html = `<div class="pull-${position}">${imgHtml}<br/>${attribution}</div>`;
    } else if (position === 'center') {
      html = `<center>${imgHtml}<br/>${attribution}</center>`;
    }

    if (isTableMode && (position === 'left' || position === 'right')) {
      html += '\n<div class="clearfix"></div>\n';
    }

    insertAtCursor('\n' + html + exifTable + '\n', 'end', true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const insertGrid = () => {
    const selected = galleryMode === 'local' 
      ? images.filter(img => img.selected)
      : pexelsResults.filter(p => p.selected);

    if (selected.length === 0) return;
    
    let result = '';

    const getCaption = (item: any, index: number, isLocal: boolean, htmlMode: boolean = false) => {
      if (isLocal) return ` ✍️ `;
      
      const photo = item as any;
      const author = photo.photographer || item.author || 'Author';
      const source = (photo.source || 'pexels').toLowerCase();
      const authorUrl = photo.photographer_url || item.authorUrl || '#';
      
      // Officially capitalized
      const sourceName = source === 'unsplash' ? 'Unsplash' : source === 'pixabay' ? 'Pixabay' : 'Pexels';
      
      if (pexelsSettings.withAttribution) {
        if (htmlMode) {
           return `By <a href="${authorUrl}">${author}</a> on <a href="https://${source}.com">${sourceName}</a>`;
        }
        return `By [${author}](${authorUrl}) on [${sourceName}](https://${source}.com)`;
      }
      return ` ✍️ `;
    };

    const getMarkdownImg = (item: any, isLocal: boolean) => {
      if (isLocal) return `![${(item as ImageItem).name}](${item.url})`;
      const photo = item as PexelsPhoto;
      let url = photo.src?.large2x || photo.src?.large || item.url;
      if (url?.includes('?')) url = url.split('?')[0];
      return `![Photo by ${photo.photographer || item.author || 'Author'}](${url})`;
    };

    const getHtmlImg = (item: any, isLocal: boolean) => {
      if (isLocal) return `<img src="${item.url}" style="width:100%">`;
      const photo = item as PexelsPhoto;
      let url = photo.src?.large2x || photo.src?.large || item.url;
      if (url?.includes('?')) url = url.split('?')[0];
      return `<img src="${url}" style="width:100%">`;
    };

    const generateCell = (item: any, idx: number, isLocal: boolean, isHtml: boolean) => {
      const photo = item as any;
      const externalLinkUrl = item.url || item.pageURL || photo?.photographer_url || item.url;
      const shouldLink = pexelsSettings.linkEmbedded || !isLocal;
      
      const img = isHtml ? getHtmlImg(item, isLocal) : getMarkdownImg(item, isLocal);
      let wrapped = img;
      if (shouldLink && externalLinkUrl) {
        wrapped = isHtml ? `<a href="${externalLinkUrl}">${img}</a>` : `[${img}](${externalLinkUrl})`;
      }
      
      const shouldShowCaption = gridWithCaptions || (pexelsSettings.withAttribution && !isLocal);
      if (shouldShowCaption) {
        const cap = getCaption(item, idx, isLocal, isHtml);
        const capHtml = `<br/><div align="${singleCaptionAlign}"><sup>${cap}</sup></div>`;
        const capMd = `<br/><sub>${cap}</sub>`;
        return wrapped + (isHtml ? capHtml : capMd);
      }
      
      return wrapped;
    }

    if (gridLayout === 'col-img-text' || gridLayout === 'col-text-img') {
      const isImgFirst = gridLayout === 'col-img-text';
      if (imageInsertFormat === 'markdown') {
        const header = isImgFirst 
          ? `| ${t('image') || 'Зображення'} | ${t('description') || 'Опис'} |\n|---|---|\n`
          : `| ${t('description') || 'Опис'} | ${t('image') || 'Зображення'} |\n|---|---|\n`;
        let rows = '';
        selected.forEach((item, index) => {
          const imgCell = generateCell(item, index, galleryMode === 'local', false);
          const descCell = `${t('typeHere') || ' ✍️ '}`;
          rows += isImgFirst ? `| ${imgCell} | ${descCell} |\n` : `| ${descCell} | ${imgCell} |\n`;
        });
        result = '\n' + header + rows + '\n';
      } else {
        result = `<table style="width:100%">\n`;
        selected.forEach((item, index) => {
          const imgCell = generateCell(item, index, galleryMode === 'local', true);
          const descCell = `${t('typeHere') || ' ✍️ '}`;
          result += `  <tr>\n`;
          if (isImgFirst) {
            result += `    <td style="width:50%">${imgCell}</td>\n    <td style="width:50%">${descCell}</td>\n`;
          } else {
            result += `    <td style="width:50%">${descCell}</td>\n    <td style="width:50%">${imgCell}</td>\n`;
          }
          result += `  </tr>\n`;
        });
        result += `</table>\n\n`;
      }
    } else if (gridLayout === 'grid-2') {
      const cols = 2;
      if (imageInsertFormat === 'markdown') {
        const numCols = Math.min(selected.length, cols);
        const header = '|' + Array(numCols).fill(' ').join('|') + '|\n';
        const separator = '|' + Array(numCols).fill('---').join('|') + '|\n';
        result += '\n' + header + separator;

        for (let i = 0; i < selected.length; i += cols) {
          let row = '|';
          for (let j = 0; j < cols; j++) {
            const idx = i + j;
            if (idx < selected.length) {
              row += ` ${generateCell(selected[idx], idx, galleryMode === 'local', false)} |`;
            } else {
              row += ` |`;
            }
          }
          result += row + '\n';
        }
      } else {
        result = `<table style="width:100%">\n`;
        for (let i = 0; i < selected.length; i += cols) {
          result += `  <tr>\n`;
          for (let j = 0; j < cols; j++) {
            const idx = i + j;
            if (idx < selected.length) {
              result += `    <td style="width:${100/cols}%">${generateCell(selected[idx], idx, galleryMode === 'local', true)}</td>\n`;
            } else {
              result += `    <td style="width:${100/cols}%"></td>\n`;
            }
          }
          result += `  </tr>\n`;
        }
        result += `</table>\n\n`;
      }
    } else {
      // Row layout
      if (imageInsertFormat === 'markdown') {
        const header = '|' + selected.map(() => ' ').join('|') + '|\n';
        const separator = '|' + selected.map(() => '---').join('|') + '|\n';
        let row = '|';
        selected.forEach((item, index) => {
          row += ` ${generateCell(item, index, galleryMode === 'local', false)} |`;
        });
        result = '\n' + header + separator + row + '\n';
      } else {
        result = `<table style="width:100%">\n  <tr>`;
        selected.forEach((item, index) => {
          result += `\n    <td>${generateCell(item, index, galleryMode === 'local', true)}</td>`;
        });
        result += `\n  </tr>\n</table>\n\n`;
      }
    }
    
    if (galleryMode === 'local') {
      setImages(images.map(img => ({ ...img, selected: false })));
    } else {
      setPexelsResults(pexelsResults.map(p => ({ ...p, selected: false })));
    }
    
    if (isTableMode) {
      result += '\n<div class="clearfix"></div>\n';
    }
    
    insertAtCursor(result, 'end', true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const processContentForSteem = (raw: string) => {
    // Ensure blank lines before Markdown tables if missing
    const lines = raw.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const prevLine = i > 0 ? lines[i-1] : null;
        
        const trimmed = currentLine.trim();
        const isTableStart = trimmed.startsWith('|') && trimmed.includes('|', 1) && !trimmed.slice(1).startsWith('---');
        
        const nextLine = i + 1 < lines.length ? lines[i+1].trim() : null;
        const isSeparatorNext = nextLine && nextLine.startsWith('|') && nextLine.includes('---');

        if (isTableStart && isSeparatorNext && prevLine !== null && prevLine.trim() !== '') {
            processedLines.push('');
        }
        processedLines.push(currentLine);
    }
    
    return processedLines.join('\n');
  };

  const performBroadcast = async (
    author: string, 
    title: string, 
    body: string, 
    tags: string, 
    auth: AuthType,
    rewardType: 'SP' | '50' | '0' = '50',
    beneficiaries: {account: string, weight: number}[] = []
  ) => {
    const finalBody = processContentForSteem(body);
    const tagsArray = tags.split(' ').map(t => t.trim()).filter(t => t);
    const parentPermlink = tagsArray[0] || 'blog';
    const permlink = createPermlinkUA(title);
    
    const meta = JSON.stringify({ 
      tags: tagsArray, 
      app: appAgent, 
      format: 'markdown' 
    });

    const options = {
      allow_curation_rewards: true,
      allow_votes: true,
      author: author,
      permlink: permlink,
      max_accepted_payout: rewardType === '0' ? '0.000 SBD' : '1000000.000 SBD',
      percent_steem_dollars: rewardType === 'SP' ? 0 : 10000,
      extensions: beneficiaries.length > 0 ? [[0, {
        beneficiaries: beneficiaries.sort((a, b) => a.account.localeCompare(b.account)).map(b => ({
          account: b.account,
          weight: Math.floor(b.weight * 100) // Steem weight is in percent * 100
        }))
      }]] : []
    };

    const client = new dsteem.Client('https://api.steemit.com');

    if (auth === 'KEYCHAIN') {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        if (!window.steem_keychain) return reject(new Error(t('noKeychain')));
        // @ts-ignore
        window.steem_keychain.requestPost(author, title, finalBody, parentPermlink, '', meta, permlink, JSON.stringify(options), (res: any) => {
          if (res.success) resolve(res);
          else reject(new Error(res.message));
        });
      });
    } else {
      if (SecurityService.isLocked()) {
        const pin = vaultPin || await promptDialog(t('enterPin'));
        if (!pin) throw new Error(t('pinRequired'));
        await SecurityService.unlock(pin);
        initVault();
      }
      const comment = {
        author,
        title,
        body: finalBody,
        parent_author: '',
        parent_permlink: parentPermlink,
        permlink,
        json_metadata: meta
      };
      return SecurityService.broadcastPost(client, comment, author, options);
    }
  };

  const handleSplitPost = () => {
    if (!content.trim()) return;
    
    const lines = content.split('\n');
    const originalTitle = lines[0].replace(/[#*`]/g, '').trim() || t('untitled');
    const bodyLines = lines.slice(1);
    const bodyText = bodyLines.join('\n').trim();
    
    if (!bodyText) {
      notify(t('fillRequired'), 'error');
      return;
    }

    const words = bodyText.split(/\s+/).filter(w => w.length > 0);
    const targetWordsPerPart = 300;
    const parts: string[] = [];
    
    let currentPartWords: string[] = [];
    
    words.forEach(word => {
      currentPartWords.push(word);
      if (currentPartWords.length >= targetWordsPerPart) {
        parts.push(currentPartWords.join(' '));
        currentPartWords = [];
      }
    });
    
    if (currentPartWords.length > 0) {
      if (parts.length > 0 && currentPartWords.length < 100) {
        parts[parts.length - 1] += ' ' + currentPartWords.join(' ');
      } else {
        parts.push(currentPartWords.join(' '));
      }
    }

    const existingDrafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
    const newDrafts: Draft[] = parts.map((partContent, index) => ({
      id: (Date.now() + index).toString(),
      title: `${originalTitle} №${index + 1}`,
      body: `# ${originalTitle} №${index + 1}\n\n${partContent}`,
      date: new Date().toLocaleString(),
      status: 'working',
      tags: pubTags
    }));

    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify([...newDrafts, ...existingDrafts]));
    notify(t('splitSuccess').replace('{count}', parts.length.toString()), 'success');
    setActiveModal(null);
  };

  const toggleTag = (tag: string) => {
    setPubTags(prev => {
      const tags = prev.split(' ').filter(t => t.trim());
      if (tags.includes(tag)) {
        return tags.filter(t => t !== tag).join(' ');
      }
      return [...tags, tag].join(' ');
    });
  };
  const handlePublish = async () => {
    const lines = content.split('\n');
    const firstLine = lines[0].trim();
    let finalTitle = pubTitle;
    let actualContent = content;

    if (!finalTitle) {
      finalTitle = firstLine.replace(/[#*`]/g, '').trim().substring(0, 100);
      // Remove the first line from content if it was used as title
      actualContent = lines.slice(1).join('\n').trim();
    }

    const processedContent = processContentForSteem(actualContent);
    const activeUser = authType === 'VAULT' ? selectedVaultUser : username;

    if (!activeUser || !finalTitle || !pubTags) {
      setPubLog({ msg: t('fillRequired'), type: 'error' });
      return;
    }

    setPubLog({ msg: t('publishing'), type: 'loading' });
    
    try {
      await performBroadcast(activeUser, finalTitle, processedContent, pubTags, authType, rewardType, beneficiaries);
      setPubLog({ msg: t('publishedSuccess'), type: 'success' });
      setTimeout(() => setActiveModal(null), 2000);
    } catch (err: any) {
      setPubLog({ msg: `❌ ${t('error')}: ${err.message}`, type: 'error' });
    }
  };

  const publishFromQueue = async (id: string) => {
    const item = queue.find(i => i.id === id);
    if (!item) return;

    setPubLog({ msg: `${t('publishing')} ${item.title}...`, type: 'loading' });
    
    try {
      const author = item.authType === 'VAULT' ? item.selectedVaultUser : item.username;
      await performBroadcast(author, item.title, item.body, item.tags, item.authType);
      
      const updated = queue.map(i => i.id === id ? { ...i, status: 'published' as const } : i);
      setQueue(updated);
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
      setPubLog({ msg: t('publishedSuccess'), type: 'success' });
    } catch (err: any) {
      const updated = queue.map(i => i.id === id ? { ...i, status: 'error' as const, error: err.message } : i);
      setQueue(updated);
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
      setPubLog({ msg: `❌ ${t('error')}: ${err.message}`, type: 'error' });
    }
  };

  const addToQueue = () => {
    const activeUser = authType === 'VAULT' ? selectedVaultUser : username;
    if (!activeUser || !pubTitle || !pubTags) {
      setPubLog({ msg: t('error'), type: 'error' });
      return;
    }

    const newItem: QueueItem = {
      id: Date.now().toString(),
      title: pubTitle,
      body: content,
      tags: pubTags,
      authType,
      username: username,
      selectedVaultUser: selectedVaultUser,
      scheduledTime: scheduledTime,
      status: 'pending'
    };

    const updated = [...queue, newItem];
    setQueue(updated);
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
    setPubLog({ msg: t('published'), type: 'success' });
    setTimeout(() => setActiveModal(null), 1000);
  };

  const saveDraft = (status: 'working' | 'ready' = 'working') => {
    const title = content.split('\n')[0].replace(/[#*`]/g, '').trim().substring(0, 50) || t('untitled');
    const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
    
    if (currentDraftId) {
      // Update existing draft
      const updated = drafts.map((d: Draft) => {
        if (d.id === currentDraftId) {
          return { ...d, title, body: content, date: new Date().toLocaleString(), status };
        }
        return d;
      });
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(updated));
    } else {
      // Create new draft
      const newId = Date.now().toString();
      const newDraft: Draft = {
        id: newId,
        title,
        body: content,
        date: new Date().toLocaleString(),
        status
      };
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify([newDraft, ...drafts]));
      setCurrentDraftId(newId);
    }
    notify(t('saveSuccess'));
  };

  const [draftFilter, setDraftFilter] = useState<'all' | 'working' | 'ready'>('all');

  // ... (inside the activeModal === 'drafts' block later)


  const toggleDraftStatus = (id: string) => {
    const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
    const updated = drafts.map((d: Draft) => {
      if (d.id === id) {
        return { ...d, status: d.status === 'ready' ? 'working' : 'ready' };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(updated));
    // Hack to re-render:
    const current = activeModal;
    setActiveModal(null);
    setTimeout(() => setActiveModal(current), 10);
  };

  const addMention = () => {
    const name = newMention.trim().replace('@', '');
    if (!name || mentions.includes(name)) return;
    const updated = [name, ...mentions];
    setMentions(updated);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    setNewMention('');
  };

  const toggleTool = (key: string) => {
    const newTools = enabledTools.includes(key)
      ? enabledTools.filter(t => t !== key)
      : [...enabledTools, key];
    setEnabledTools(newTools);
    localStorage.setItem(STORAGE_KEY_FLOAT_CONFIG, JSON.stringify(newTools));
  };

  const moveTool = (key: string, dir: 'up' | 'down') => {
    const idx = enabledTools.indexOf(key);
    if (idx === -1) return;
    const newTools = [...enabledTools];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newTools.length) return;
    [newTools[idx], newTools[targetIdx]] = [newTools[targetIdx], newTools[idx]];
    setEnabledTools(newTools);
    localStorage.setItem(STORAGE_KEY_FLOAT_CONFIG, JSON.stringify(newTools));
  };

  const downloadFile = () => {
    const finalBody = processContentForSteem(content);
    const element = document.createElement("a");
    const file = new Blob([finalBody], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `steem-post-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const uploadExternalImage = async (url: string, fileName: string = 'image.jpg') => {
    const uploadAuthType = imageUploadAccount ? 'VAULT' : 'KEYCHAIN';
    let activeUser = imageUploadAccount || username;
    
    if (!activeUser) {
      if (uploadAuthType === 'VAULT') {
        notify(t('needVaultAccount'), 'error');
        setActiveModal('keys');
        return;
      } else {
        const inputUser = await promptDialog(t('username'));
        if (!inputUser) return;
        activeUser = inputUser.replace('@', '');
        setUsername(activeUser);
        localStorage.setItem('steem_username', activeUser);
      }
    }

    if (uploadAuthType === 'VAULT' && SecurityService.isLocked()) {
      const pass = await promptDialog(t('enterPin'));
      if (!pass) return;
      try {
        await SecurityService.unlock(pass);
        initVault();
      } catch (e: any) {
        notify(t('pinError') + e.message, 'error');
        return;
      }
    } else if (uploadAuthType === 'KEYCHAIN') {
      // @ts-ignore
      if (!window.steem_keychain) {
        notify(t('noKeychain'), 'error');
        return;
      }
    }

    setIsUploading(true);
    setPubLog({ msg: t('preparingUpload').replace('{name}', fileName), type: 'loading' });
    
    try {
      let blob: Blob;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        blob = await res.blob();
      } catch {
        setPubLog({ msg: t('proxyAttempt'), type: 'loading' });
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(t('proxyError'));
        blob = await res.blob();
      }

      const file = new File([blob], fileName, { type: blob.type });
      const arrayBuffer = await blob.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const prefix = Buffer.from("ImageSigningChallenge", 'utf8');
      const dataToSign = Buffer.concat([prefix, fileBuffer]);
      
      let signature = '';
      if (uploadAuthType === 'VAULT') {
        signature = await SecurityService.signBuffer(dataToSign, activeUser);
      } else {
        signature = await new Promise((resolve, reject) => {
          (window as any).steem_keychain.requestSignBuffer(
            activeUser,
            JSON.stringify(dataToSign),
            'Posting',
            (response: any) => {
              if (response.success) resolve(response.result);
              else reject(new Error(response.message));
            }
          );
        });
      }

      const formData = new FormData();
      formData.append("file", file);
      const uploadUrl = `https://steemitimages.com/${activeUser}/${signature}`;
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      
      if (!response.ok) throw new Error(t('serverError') + response.status);
      const data = await response.json();
      const finalUrl = data.url || data.link || data.data?.url;
      
      if (finalUrl) {
        const newImg: ImageItem = { url: finalUrl, name: fileName, selected: false };
        setImages(prev => [newImg, ...prev]);
        setSourceInput(prev => finalUrl + "\n" + prev);
      }
    } catch (err: any) {
      console.error(err);
      setPubLog({ msg: `❌ ${t('error')}: ${err.message}`, type: 'error' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setPubLog({ msg: '', type: null }), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const uploadAuthType = imageUploadAccount ? 'VAULT' : 'KEYCHAIN';
    let activeUser = imageUploadAccount || username;
    
    if (!activeUser) {
      if (uploadAuthType === 'VAULT') {
        notify(t('needVaultAccount'), 'error');
        setActiveModal('keys');
        return;
      } else {
        const inputUser = await promptDialog(t('username'));
        if (!inputUser) return;
        activeUser = inputUser.replace('@', '');
        setUsername(activeUser);
        localStorage.setItem('steem_username', activeUser);
      }
    }

    if (uploadAuthType === 'VAULT' && SecurityService.isLocked()) {
      const pass = await promptDialog(t('enterPin'));
      if (!pass) return;
      try {
        await SecurityService.unlock(pass);
        initVault();
      } catch (e: any) {
        notify(t('pinError') + e.message, 'error');
        return;
      }
    } else if (uploadAuthType === 'KEYCHAIN') {
      if (!(window as any).steem_keychain) {
        notify(t('noKeychain'), 'error');
        return;
      }
    }

    setIsUploading(true);
    let successCount = 0;
    
    // Спеціальна функція завантаження З ПРОГРЕСОМ для VAULT (XHR)
    const uploadVaultWithProgress = (file: File, signature: string, user: string, index: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        const uploadUrl = `https://steemitimages.com/${user}/${signature}`;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setPubLog({ 
              msg: t('uploadProgress')
                .replace('{current}', (index + 1).toString())
                .replace('{total}', files.length.toString())
                .replace('{name}', `${file.name} (${percent}%)`), 
              type: 'loading' 
            });
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(t('serverError') + xhr.status));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.timeout = 300000; // Increased to 5 minutes for slow networks
        xhr.send(formData);
      });
    };

    // СТРОГА ПОСЛІДОВНА ЧЕРГА
    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      const sanitizedName = sanitizeFilename(originalFile.name);
      const file = new File([originalFile], sanitizedName, { type: originalFile.type });
      
      const exifTable = await getExifTableFromBlob(originalFile);

      if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const prefix = Buffer.from("ImageSigningChallenge", 'utf8');
        const dataToSign = Buffer.concat([prefix, fileBuffer]);

        if (uploadAuthType === 'VAULT') {
          // ШЛЯХ VAULT: з прогресом та спробами
          let attempt = 0;
          let uploaded = false;
          while (attempt < 3 && !uploaded) {
            attempt++;
            try {
              setPubLog({ 
                msg: `[${i + 1}/${files.length}] ` + t('signingImage').replace('{name}', file.name) + (attempt > 1 ? ` (спроба ${attempt})` : ''), 
                type: 'loading' 
              });
              const signature = await SecurityService.signBuffer(dataToSign, activeUser);
              const data = await uploadVaultWithProgress(file, signature, activeUser, i);
              const url = data.url || data.link || data.data?.url;
              if (url) {
                setImages(prev => [{ url, name: file.name, selected: false, exif: exifTable }, ...prev]);
                setSourceInput(prev => url + "\n" + prev);
                successCount++;
                uploaded = true;
              }
            } catch (err) {
              if (attempt >= 3) throw err;
              await new Promise(r => setTimeout(r, 1500 * attempt));
            }
          }
        } else {
          // ШЛЯХ KEYCHAIN: чистий fetch
          setPubLog({ 
            msg: `[${i + 1}/${files.length}] ` + t('uploadProgress').replace('{current}', (i + 1).toString()).replace('{total}', files.length.toString()).replace('{name}', file.name), 
            type: 'loading' 
          });

          // ПРЯМИЙ ВИКЛИК БЕЗ ЗАЙВИХ ПЕРЕТВОРЕНЬ
          const signature = await new Promise<string>((resolve, reject) => {
            (window as any).steem_keychain.requestSignBuffer(activeUser, JSON.stringify(dataToSign), 'Posting', (resp: any) => {
              if (resp.success) resolve(resp.result);
              else reject(new Error(resp.message));
            });
          });
          
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch(`https://steemitimages.com/${activeUser}/${signature}`, { method: "POST", body: formData });
          if (!resp.ok) throw new Error(t('serverError') + resp.status);
          const data = await resp.json();
          const url = data.url || data.link || data.data?.url;
          if (url) {
            setImages(prev => [{ url, name: file.name, selected: false, exif: exifTable }, ...prev]);
            setSourceInput(prev => url + "\n" + prev);
            successCount++;
          }
        }
      } catch (err: any) {
        console.error(err);
        setPubLog({ msg: `❌ Помилка у файлі ${i + 1}: ${file.name} - ${err.message}`, type: 'error' });
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (successCount > 0) {
      setPubLog({ 
        msg: t('uploadComplete').replace('{count}', successCount.toString()).replace('{total}', files.length.toString()), 
        type: 'success' 
      });
      setTimeout(() => setPubLog({ msg: '', type: null }), 3000);
    }
  };

  const TOOLS_MAP: Record<string, { label: string | React.ReactNode, action: () => void }> = {
    'B': { label: 'B', action: () => fmt('**') },
    'I': { label: 'I', action: () => fmt('*') },
    'S': { label: '~~', action: () => fmt('~~') },
    'sub': { label: 'sub', action: () => fmt('<sub>', '</sub>') },
    'sup': { label: 'sup', action: () => fmt('<sup>', '</sup>') },
    'H1': { label: 'H1', action: () => fmtLine('# ') },
    'H2': { label: 'H2', action: () => fmtLine('## ') },
    'H3': { label: 'H3', action: () => fmtLine('### ') },
    'Link': { label: <LinkIcon size={14} />, action: handleLink },
    'Quote': { label: <Quote size={14} />, action: () => fmtLine('> ') },
    'List': { label: '•', action: () => fmtLine('- ') },
    'Num': { label: '1.', action: () => fmtLine('1. ') },
    'Task': { label: '☑', action: () => fmtLine('- [ ] ') },
    'Table': { label: <LayoutGrid size={14} />, action: () => insertAtCursor('\n\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n') },
    'Import': { label: <TableIcon size={14} />, action: () => importTable() },
    'Code': { label: <Code size={14} />, action: () => fmt('```\n', '\n```') },
    'Inline': { label: <Terminal size={14} />, action: () => fmt('`') },
    'Indent': { label: <Indent size={14} />, action: () => {
      if (!editorRef.current) return;
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      const lines = selectedText.split('\n');
      const newText = lines.map(line => '    ' + line).join('\n');
      const newContent = content.substring(0, start) + newText + content.substring(end);
      setContent(newContent);
    }},
    'Esc': { label: '\\', action: () => fmt('\\', '') },
    'HR': { label: '—', action: () => insertAtCursor('\n---\n') },
    'Color': { label: <span className="text-red-500 font-bold">A</span>, action: () => fmt('<div class="phishy">', '</div>') },
    'Caption': { label: 'Підп', action: async () => {
      const url = await promptDialog(t('urlPrompt'));
      if (!url) return;
      const cap = await promptDialog(t('caption'), '');
      insertAtCursor(`\n<center>\n\n| <center>![image](${url})</center> |\n|:---:|\n| <center><sub>${cap || ' ✍️ '}</sub></center> |\n\n</center>\n`);
    }},
    'Left': { label: '⬅', action: () => fmt('<div class="text-left">\n', '\n</div>') },
    'Center': { label: 'Центр', action: () => fmt('<center>\n', '\n</center>') },
    'Right': { label: '➡', action: () => fmt('<div class="text-right">\n', '\n</div>') },
    'Justify': { label: 'Вирів', action: () => fmt('<div class="text-justify">\n', '\n</div>') },
    'Grid': { label: 'Сітка', action: () => insertAtCursor(`\n<div class="pull-left">\n${t('leftContent')}\n</div>\n<div class="pull-right">\n${t('rightContent')}\n</div>\n<div class="clearfix"></div>\n`) },
    'Templates': { label: <FileText size={14} />, action: () => setActiveModal('templates') },
    'Mentions': { label: <AtSign size={14} />, action: async () => {
      const extracted = extractMentions(content);
      if (extracted.length === 0) {
        const name = await promptDialog(t('usernameNoAt'));
        if (name) insertAtCursor(`@${name}`);
      } else {
        const name = await promptDialog(`${t('mentionsList')}: ${extracted.join(', ')}\n${t('usernameNoAt')}`);
        if (name) insertAtCursor(`@${name}`);
      }
    }},
    'Img': { label: <ImageIcon size={14} />, action: () => {
      fileInputRef.current?.click();
    }}
  };

  // --- Render ---

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans overflow-hidden transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-slate-100" : "theme-light bg-white text-slate-900 border-slate-200",
      themeColor === 'emerald' && "selection:bg-emerald-500/30",
      themeColor === 'orange' && "selection:bg-orange-500/30",
      themeColor === 'rose' && "selection:bg-rose-500/30",
      themeColor === 'cyan' && "selection:bg-cyan-500/30"
    )}>
      {/* Dynamic Theme Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --accent: ${
            themeColor === 'blue' ? '#3b82f6' : 
            themeColor === 'purple' ? '#a855f7' : 
            themeColor === 'pink' ? '#ec4899' : 
            themeColor === 'orange' ? '#f97316' : 
            themeColor === 'emerald' ? '#10b981' : 
            themeColor === 'rose' ? '#f43f5e' : 
            themeColor === 'indigo' ? '#6366f1' : 
            '#06b6d4'
          };
          --accent-hover: ${
            themeColor === 'blue' ? '#2563eb' : 
            themeColor === 'purple' ? '#9333ea' : 
            themeColor === 'pink' ? '#db2777' : 
            themeColor === 'orange' ? '#ea580c' : 
            themeColor === 'emerald' ? '#059669' : 
            themeColor === 'rose' ? '#e11d48' : 
            themeColor === 'indigo' ? '#4f46e5' : 
            '#0891b2'
          };
        }
        .bg-cyan-600, .bg-cyan-500 { background-color: var(--accent) !important; }
        .hover\\:bg-cyan-600:hover, .hover\\:bg-cyan-500:hover { background-color: var(--accent-hover) !important; }
        .text-cyan-400, .text-cyan-500 { color: var(--accent) !important; }
        .border-cyan-500, .border-cyan-400 { border-color: var(--accent) !important; }
        .from-cyan-500 { --tw-gradient-from: var(--accent) !important; }
        .to-blue-600 { --tw-gradient-to: var(--accent-hover) !important; }
        .shadow-cyan-500\\/20 { --tw-shadow-color: var(--accent) !important; }
      `}} />
      {/* Header / Toolbar */}
      <header 
        className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-nowrap items-center px-2 sm:px-4 py-2 h-14 gap-2 sm:gap-4 z-40 overflow-x-auto no-scrollbar"
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <IconButton 
            icon={Menu} 
            onClick={() => {
              const newState = !isSidebarOpen;
              setIsSidebarOpen(newState);
              if (newState && window.innerWidth < 1024) {
                setIsWidgetVisible(false);
              }
            }} 
            className="lg:hidden"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSMenuOpen(true)}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all text-xl"
            >
              S
            </button>
            <div className="flex flex-col">
              <span className="font-black text-lg hidden sm:inline-block tracking-tighter leading-none shrink-0 italic">Steem<span className="text-cyan-400">Editor</span></span>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase hidden sm:block">Professional Pro</span>
            </div>
          </div>
              {isVaultInitialized && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all shrink-0",
                  isUnlocked ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-slate-800 border-slate-700 text-slate-400"
                )}>
                  {isUnlocked ? <Lock size={10} className="text-green-400 shrink-0" /> : <ShieldCheck size={10} className="shrink-0" />}
                  <span className="hidden sm:inline shrink-0">{isUnlocked ? t('sessionActive') : t('vaultClosed')}</span>
                </div>
              )}
        </div>

        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 shrink-0">
          <IconButton icon={Bold} onClick={() => fmt('**')} title={t('bold')} className="shrink-0" />
          <IconButton icon={Italic} onClick={() => fmt('*')} title={t('italic')} className="shrink-0" />
          <IconButton icon={Strikethrough} onClick={() => fmt('~~')} title={t('strike')} className="shrink-0" />
          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
          <button onClick={() => fmtLine('# ')} title={t('h1')} className="p-1.5 hover:bg-slate-700 rounded text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors shrink-0">H1</button>
          <button onClick={() => fmtLine('## ')} title={t('h2')} className="p-1.5 hover:bg-slate-700 rounded text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors shrink-0">H2</button>
          <button onClick={() => fmtLine('### ')} title={t('h3')} className="p-1.5 hover:bg-slate-700 rounded text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors shrink-0">H3</button>
          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
          <IconButton icon={Quote} onClick={() => fmtLine('> ')} title={t('quote')} className="shrink-0" />
          <IconButton icon={LinkIcon} onClick={handleLink} title={t('link')} className="shrink-0" />
          <IconButton icon={Minus} onClick={() => insertAtCursor('---', 'end', true)} title={t('hr')} className="shrink-0" />
          <IconButton icon={AlignJustify} onClick={() => fmt('<div class="text-justify">\n', '\n</div>')} title={t('justify')} className="shrink-0" />
          <IconButton icon={AlignCenter} onClick={() => fmt('<center>\n', '\n</center>')} title={t('center')} className="shrink-0" />
          <button onClick={() => fmt('<div class="phishy">', '</div>')} title={t('redText')} className="p-1.5 hover:bg-slate-700 rounded text-xs font-bold text-red-500 hover:text-red-400 transition-colors shrink-0">A</button>
          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
          <IconButton icon={Terminal} onClick={() => fmt('`')} title={t('inlineCode')} className="shrink-0" />
          <IconButton icon={Code} onClick={() => fmt('```\n', '\n```')} title={t('codeBlock')} className="shrink-0" />
          <IconButton icon={ImageIcon} onClick={() => fileInputRef.current?.click()} title={t('image')} className="shrink-0" />
          <IconButton icon={Indent} onClick={() => {
            if (!editorRef.current) return;
            const start = editorRef.current.selectionStart;
            const end = editorRef.current.selectionEnd;
            const selectedText = content.substring(start, end);
            const lines = selectedText.split('\n');
            const newText = lines.map(line => '    ' + line).join('\n');
            const newContent = content.substring(0, start) + newText + content.substring(end);
            setContent(newContent);
          }} title={t('indent')} className="shrink-0" />
          <button onClick={() => fmt('\\', '')} title={t('escape')} className="p-1.5 hover:bg-slate-700 rounded text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors shrink-0">\</button>
          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
          <IconButton icon={LayoutGrid} onClick={() => insertAtCursor('| Header | Header |\n| --- | --- |\n| Cell | Cell |', 'end', true)} title={t('table')} className="shrink-0" />
          <IconButton icon={TableIcon} onClick={importTable} title={t('importTable')} className="shrink-0" />
          <IconButton icon={Download} onClick={downloadFile} title={t('downloadMd')} className="shrink-0" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 shrink-0">
            <button 
              onClick={() => {
                const next = !isDarkMode;
                setIsDarkMode(next);
                localStorage.setItem('steem_dark_mode', next.toString());
              }}
              className={cn(
                "p-1.5 rounded transition-all shrink-0", 
                isDarkMode ? "text-slate-500 hover:text-white" : "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"
              )}
              title={isDarkMode ? t('lightMode') : t('darkMode')}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            {(['uk', 'en', 'es', 'ko'] as const).map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-1.5 py-1 text-[9px] font-bold rounded transition-all shrink-0 uppercase", 
                  lang === l ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <IconButton icon={Key} onClick={() => setActiveModal('keys')} title={t('keys')} className="shrink-0" />
          <IconButton icon={Rocket} onClick={() => setActiveModal('publish')} title={t('publish')} className="shrink-0 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/40" />
          <IconButton icon={AtSign} onClick={() => setActiveModal('mentions')} title={t('mentions')} className="shrink-0 text-slate-400 hover:text-cyan-400" />
          <IconButton icon={Layers} onClick={() => setActiveModal('splitPost')} title={t('splitPost')} className="shrink-0" />
          <IconButton icon={FolderOpen} onClick={() => setActiveModal('drafts')} title={t('drafts')} className="shrink-0" />
          <IconButton icon={FileText} onClick={() => setActiveModal('templates')} title={t('templates')} className="shrink-0 text-slate-400 hover:text-cyan-400" />
          <IconButton icon={ListIcon} onClick={() => setActiveModal('queue')} title={t('queue')} className="shrink-0" />
          <div className="h-6 w-px bg-slate-800 mx-1 shrink-0" />
          
          <div className="flex items-center gap-2">
            <IconButton 
              icon={FilePlus} 
              onClick={async () => {
                if (content.trim() !== '') {
                  const saveFirst = await confirmDialog(t('saveDraftBeforeNew') || "Save the current post as a draft before starting a new one?");
                  if (saveFirst) {
                    saveDraft();
                  } else {
                    if (!await confirmDialog(t('confirmNewPost'))) return;
                  }
                }
                setPubTitle('');
                setContent('');
                setPubTags('');
                setCurrentDraftId(null);
              }} 
              title={t('newPost') || 'Новий допис'} 
              className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300"
            />
            
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shrink-0">
              <button 
                onClick={() => saveDraft('working')}
                className="p-2 hover:bg-slate-700 text-slate-300 transition-all border-r border-slate-700"
                title={t('saveDraft')}
              >
                <Save size={16} />
              </button>
              <button 
                onClick={() => saveDraft('ready')}
                className={cn(
                  "p-2 hover:bg-cyan-600/20 transition-all",
                  "text-cyan-400"
                )}
                title={t('ready')}
              >
                <CheckCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col z-30 absolute lg:relative h-full pb-16 lg:pb-0 shadow-2xl lg:shadow-none"
            >
              <div className="flex flex-col flex-1 overflow-hidden landscape:overflow-y-auto custom-scrollbar">
                <section className="p-3 border-b border-slate-800 shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-800/50 p-0.5 rounded border border-slate-700/50">
                        <button 
                          onClick={() => setImageInsertFormat('html')}
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-black rounded transition-all",
                            imageInsertFormat === 'html' ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          HTML
                        </button>
                        <button 
                          onClick={() => setImageInsertFormat('markdown')}
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-black rounded transition-all",
                            imageInsertFormat === 'markdown' ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          MD
                        </button>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer group px-1" title="Fix table layout issues">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isTableMode} 
                            onChange={e => setIsTableMode(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-3.5 h-3.5 border border-slate-700 rounded bg-slate-950 peer-checked:bg-cyan-600 peer-checked:border-cyan-400 transition-all flex items-center justify-center">
                            {isTableMode && <Check size={10} className="text-white" strokeWidth={4} />}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-400 truncate">FIX TEXT</span>
                      </label>
                    </div>

                    <div className="flex bg-slate-800/50 p-0.5 rounded border border-slate-700/50">
                      <button 
                        onClick={() => setPexelsSettings((prev: any) => ({ ...prev, withAttribution: !prev.withAttribution }))}
                        className={cn(
                          "px-1.5 py-0.5 text-[8px] font-bold rounded uppercase transition-all",
                          pexelsSettings.withAttribution ? "bg-slate-700 text-green-400" : "text-slate-600 hover:text-slate-400"
                        )}
                        title={t('attribution')}
                      >
                        ATTR
                      </button>
                      <button 
                        onClick={() => setPexelsSettings((prev: any) => ({ ...prev, linkEmbedded: !prev.linkEmbedded }))}
                        className={cn(
                          "px-1.5 py-0.5 text-[8px] font-bold rounded uppercase transition-all",
                          pexelsSettings.linkEmbedded ? "bg-slate-700 text-blue-400" : "text-slate-600 hover:text-slate-400"
                        )}
                        title={t('linkInImg')}
                      >
                        LINK
                      </button>
                    </div>
                  </div>
                </section>
                
                <section className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 py-2 landscape:overflow-visible landscape:min-h-[300px]">
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 shrink-0 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => toggleGalleryMode('local')}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-colors shrink-0",
                        galleryMode === 'local' ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {t('gallery')}
                    </button>
                    <div className="w-px h-3 bg-slate-800 shrink-0" />
                    {[
                      { id: 'pexels', label: 'Pexels', key: pexelsApiKey },
                      { id: 'pixabay', label: 'Pixabay', key: pixabayApiKey },
                      { id: 'unsplash', label: 'Unsplash', key: unsplashAccessKey }
                    ].map(srv => (
                      <button 
                        key={srv.id}
                        onClick={() => toggleGalleryMode(srv.id as any)}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 shrink-0",
                          galleryMode === srv.id ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {srv.label}
                        {!srv.key && <Lock size={8} className="text-slate-600" />}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => setGalleryView('grid')} 
                        className={cn("p-1 rounded", galleryView === 'grid' ? "text-cyan-400 bg-cyan-400/10" : "text-slate-600")}
                      >
                        <LayoutGrid size={10} />
                      </button>
                      <button 
                        onClick={() => setGalleryView('list')} 
                        className={cn("p-1 rounded", galleryView === 'list' ? "text-cyan-400 bg-cyan-400/10" : "text-slate-600")}
                      >
                        <ListIcon size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-2 shrink-0">
                    <div 
                      onClick={() => setIsGallerySettingsCollapsed(!isGallerySettingsCollapsed)}
                      className="flex items-center justify-between mb-0.5 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none group-hover:text-cyan-400 transition-colors">{galleryMode === 'local' ? t('insert') : t('pexelsSearch')}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGallerySettingsCollapsed(!isGallerySettingsCollapsed);
                        }}
                        className={cn("p-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-all", isGallerySettingsCollapsed ? "text-slate-500" : "text-cyan-400")}
                        title={t('settings')}
                      >
                        {isGallerySettingsCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                      </button>
                    </div>
                  
                    <AnimatePresence>
                      {!isGallerySettingsCollapsed && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="md:max-h-none overflow-y-auto custom-scrollbar pr-1 pb-1">
                            {galleryMode === 'local' ? (
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => {
                                      fileInputRef.current?.click();
                                      if (window.innerWidth < 1024) setIsWidgetVisible(false);
                                    }}
                                    disabled={isUploading}
                                    className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 border border-cyan-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    {isUploading ? (
                                      <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : <ImageIcon size={12} />}
                                    {t('insert')}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      insertGrid();
                                      if (window.innerWidth < 1024) setIsWidgetVisible(false);
                                    }}
                                    disabled={images.filter(i => i.selected).length === 0}
                                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5"
                                    title={t('createGrid')}
                                  >
                                    <LayoutGrid size={12} /> ({images.filter(i => i.selected).length})
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {vaultAccounts.length > 0 && (
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                      <span className="text-[8px] text-slate-500 uppercase font-bold shrink-0">{t('account')}:</span>
                                      <select 
                                        value={imageUploadAccount || ''}
                                        onChange={(e) => setImageUploadAccount(e.target.value)}
                                        className="flex-1 bg-transparent text-[10px] text-cyan-400 outline-none cursor-pointer truncate"
                                      >
                                        <option value="" className="bg-slate-900 text-slate-300">@keychain / default</option>
                                        {vaultAccounts.map(acc => (
                                          <option key={acc} value={acc} className="bg-slate-900 text-slate-300">
                                            @{acc} {!SecurityService.isLocked() ? '✓' : '🔒'}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg border border-slate-700/30 px-2 leading-none">
                                    <div className="flex items-center gap-2">
                                      <Maximize2 size={10} className={cn(isTrafficOptimized ? "text-cyan-400" : "text-slate-500")} />
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight leading-none">{t('trafficOptimization')?.substring(0, 7) || "Traffic"}..</span>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const newState = !isTrafficOptimized;
                                        setIsTrafficOptimized(newState);
                                        localStorage.setItem('steem_traffic_optimized', newState.toString());
                                      }}
                                      className={cn(
                                        "w-7 h-3.5 rounded-full relative transition-colors shrink-0",
                                        isTrafficOptimized ? "bg-cyan-600" : "bg-slate-700"
                                      )}
                                    >
                                      <div className={cn(
                                        "absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all",
                                        isTrafficOptimized ? "right-0.5" : "left-0.5"
                                      )} />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg border border-slate-700/30 px-2 leading-none">
                                    <div className="flex items-center gap-2">
                                      <Camera size={10} className={cn(isExifEnabled ? "text-cyan-400" : "text-slate-500")} />
                                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{t('exifEnabled') || "EXIF"}</span>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const newState = !isExifEnabled;
                                        setIsExifEnabled(newState);
                                        localStorage.setItem('steem_exif_enabled', newState.toString());
                                      }}
                                      className={cn(
                                        "w-7 h-3.5 rounded-full relative transition-colors shrink-0",
                                        isExifEnabled ? "bg-cyan-600" : "bg-slate-700"
                                      )}
                                    >
                                      <div className={cn(
                                        "absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all",
                                        isExifEnabled ? "right-0.5" : "left-0.5"
                                      )} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-1.5 shrink-0">
                                <div className="flex-1 flex flex-col justify-center">
                                  <p className="text-[8px] text-slate-500">
                                    {galleryMode === 'pexels' ? t('pexelsSearch') : 
                                    `Search ${galleryMode === 'unsplash' ? 'Unsplash' : 'Pixabay'}`}
                                  </p>
                                </div>
                                {pexelsResults.length > 0 && (
                                  <button 
                                    onClick={() => {
                                      setPexelsResults([]);
                                      notify(t('cacheCleared'));
                                    }}
                                    className="px-2 py-1.5 bg-slate-800/50 hover:bg-red-900/30 text-red-400 border border-red-900/20 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                                    title={t('clearCache')}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    insertGrid();
                                    if (window.innerWidth < 1024) setIsWidgetVisible(false);
                                  }}
                                  disabled={pexelsResults.filter(p => p.selected).length === 0}
                                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5"
                                  title={t('createGrid')}
                                >
                                  <LayoutGrid size={12} /> ({pexelsResults.filter(p => p.selected).length})
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1.5 mb-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/50 shrink-0 select-none">
                              <label className="flex items-center gap-1.5 cursor-pointer group ml-1">
                                <div className="relative flex items-center justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={gridWithCaptions}
                                    onChange={e => setGridWithCaptions(e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <div className="w-3.5 h-3.5 border border-slate-700 rounded bg-slate-950 peer-checked:bg-cyan-600 peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                                    {gridWithCaptions && <Check size={8} className="text-white" strokeWidth={4} />}
                                  </div>
                                </div>
                                <span className="text-[8px] text-slate-500 font-bold uppercase group-hover:text-slate-400 transition-colors">{t('addCaption')?.substring(0, 6) || "Підпис"}</span>
                              </label>

                              <div className="h-4 w-px bg-slate-800 mx-0.5" />

                              <div className="flex items-center gap-1 ml-auto">
                                <div className="flex bg-slate-950/50 rounded-lg p-0.5 border border-slate-800/50">
                                  {(['left', 'center', 'right'] as const).map(p => (
                                    <button
                                      key={p}
                                      onClick={() => setSingleCaptionAlign(p)}
                                      className={cn(
                                        "p-1 rounded transition-all", 
                                        singleCaptionAlign === p ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-400"
                                      )}
                                      disabled={!gridWithCaptions}
                                    >
                                      {p === 'left' ? <AlignLeft size={10} /> : p === 'center' ? <AlignCenter size={10} /> : <AlignRight size={10} />}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex bg-slate-950/50 rounded-lg p-0.5 border border-slate-800/50">
                                  {(['grid-2', 'row', 'col-img-text', 'col-text-img'] as const).map(l => (
                                    <button
                                      key={l}
                                      onClick={() => setGridLayout(l)}
                                      className={cn(
                                        "p-1 rounded transition-all", 
                                        gridLayout === l ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-400"
                                      )}
                                      title={l === 'grid-2' ? 'Плитка (2x2)' : l === 'row' ? 'Один рядок' : l}
                                    >
                                      {l === 'grid-2' ? <LayoutGrid size={10} /> : l === 'row' ? <Rows size={10} /> : l === 'col-img-text' ? <PanelLeft size={10} /> : <PanelRight size={10} />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative mb-2 shrink-0">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      placeholder={
                        galleryMode === 'local' ? t('gallery') + "..." : 
                        galleryMode === 'pexels' ? t('pexelsSearch') + " (Enter)..." : 
                        `Search ${galleryMode === 'unsplash' ? 'Unsplash' : 'Pixabay'} (Enter)...`
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1 pl-7 pr-2 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500"
                      value={gallerySearch}
                      onChange={e => setGallerySearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && galleryMode !== 'local') {
                          handleExternalSearch(gallerySearch);
                        }
                      }}
                    />
                    {galleryMode !== 'local' && isSearchingPexels && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-2.5 h-2.5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "overflow-y-auto custom-scrollbar flex-1 min-h-0 -mx-1 px-1 landscape:overflow-visible landscape:flex-none",
                    galleryView === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] auto-rows-min gap-3 content-start" : "flex flex-col gap-2"
                  )}>
                    {galleryMode === 'local' ? (
                      filteredLocalImages.map((img: ImageItem, idx: number) => (
                          <ImageItemComp
                            key={img.url + idx}
                            img={img}
                            idx={idx}
                            galleryView={galleryView}
                            isTrafficOptimized={isTrafficOptimized}
                            onToggle={toggleImageSelection}
                            onInsert={(url, name, pos) => {
                              insertImage(url, name, pos);
                              if (window.innerWidth < 1024) setIsWidgetVisible(false);
                            }}
                            onHost={uploadExternalImage}
                            onDelete={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))}
                            t={t}
                          />
                        ))
                    ) : (
                      pexelsResults.length > 0 ? (
                        pexelsResults.map((photo: any, idx: number) => (
                          <ExternalImageItem
                            key={photo.id + '-' + (photo.source || 'ext') + '-' + idx}
                            photo={photo}
                            idx={idx}
                            galleryView={galleryView}
                            onToggle={(i) => setPexelsResults(prev => prev.map((p, j) => i === j ? { ...p, selected: !p.selected } : p))}
                            onInsert={(photo, pos) => {
                              insertExternalImage(photo, pos);
                              if (window.innerWidth < 1024) setIsWidgetVisible(false);
                            }}
                            t={t}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-600 gap-2">
                          <Search size={24} />
                          <p className="text-[10px] text-center">
                            {t('pexelsSearch')}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  
                  {galleryMode !== 'local' && pexelsResults.length > 0 && !isSearchingPexels && (
                    <div className="mt-2 flex justify-center">
                      <button 
                        onClick={() => handleExternalSearch(gallerySearch, pexelsPage + 1)}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium rounded-full transition-colors"
                      >
                        {t('loadMore')}
                      </button>
                    </div>
                  )}

                  <div className="mt-2 shrink-0 border-t border-slate-800 pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('links')}</span>
                      {(sourceInput || images.length > 0) && (
                        <button 
                          onClick={() => { setSourceInput(''); setImages([]); }}
                          className="text-[9px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={8} /> {t('clear')}
                        </button>
                      )}
                    </div>
                    <textarea 
                      className="w-full h-16 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-[9px] focus:ring-1 focus:ring-cyan-500 outline-none resize-none custom-scrollbar"
                      placeholder={t('pasteUrl')}
                      value={sourceInput}
                      onChange={e => parseImages(e.target.value)}
                    />
                  </div>
                </section>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative pb-16 lg:pb-0">
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Pane */}
            <div 
              ref={editorPaneRef}
              className={cn(
                "flex-1 flex flex-col min-w-0 border-r border-slate-800 transition-all relative",
                activeMobileTab !== 'editor' && "hidden lg:flex"
              )}
            >
              <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[10px] font-medium text-slate-500 uppercase tracking-widest shrink-0">
                <div className="flex gap-4">
                  <span>{t('wordsLabel')}: {stats.words}</span>
                  <span className="text-cyan-400">{t('cleanWordsLabel')}: {cleanStats.words}</span>
                  <span>{t('charsLabel')}: {stats.chars}</span>
                </div>
              </div>
              <textarea
                ref={editorRef}
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  if (widgetPos === 'floating' && isWidgetVisible && !isWidgetMenuOpen) {
                    setIsWidgetVisible(false);
                  }
                }}
                onScroll={handleEditorScroll}
                onFocus={() => setIsEditorFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsEditorFocused(false), 200);
                }}
                onKeyDown={(e) => {
                  if (widgetPos === 'floating' && !e.ctrlKey && !e.metaKey && e.key !== 'Shift') {
                    if (isWidgetVisible && !isWidgetMenuOpen) {
                      setIsWidgetVisible(false);
                    }
                  }
                }}
                onMouseUp={(e) => {
                  showWidget(e.clientX, e.clientY);
                }}
                className={cn(
                  "flex-1 w-full bg-transparent p-6 text-slate-300 text-base outline-none resize-none custom-scrollbar transition-all duration-700",
                  widgetPos === 'bottom' ? "mb-20 lg:mb-16 pb-12" : "pb-16 lg:pb-12",
                  editorFont === 'serif' ? 'font-serif leading-relaxed' : 
                  editorFont === 'mono' ? 'font-mono text-sm leading-normal' : 
                  editorFont === 'display' ? 'font-serif italic leading-loose tracking-wide' :
                  editorFont === 'grotesk' ? 'font-sans tracking-tight leading-snug font-medium' :
                  'font-sans leading-relaxed',
                  beautifyEnabled && "p-10 max-w-4xl mx-auto selection:bg-cyan-500/30"
                )}
                placeholder={t('placeholder')}
              />

              {/* Tamed Widget - Now with arrow navigation and smart positioning */}
              <AnimatePresence>
                {isWidgetVisible && (window.innerWidth >= 1024 || !isSidebarOpen) && (
                  <motion.div 
                    key="steem-widget"
                    ref={widgetRef}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={(() => {
                      const style: React.CSSProperties = { opacity: widgetOpacity };
                      
                      if (widgetPos === 'floating' && window.innerWidth >= 1024 && floatingPos && editorPaneRef.current) {
                        const rect = editorPaneRef.current.getBoundingClientRect();
                        style.position = 'fixed';
                        
                        // Width estimation for 8 tools + navigation + settings + paddings (~420px)
                        const widgetWidth = 400; 

                        // Standard floating
                        const leftBound = rect.left + 10;
                        const rightBound = rect.right - widgetWidth - 10;
                        style.left = Math.min(rightBound, Math.max(leftBound, floatingPos.x));
                        style.top = floatingPos.y < 150 ? floatingPos.y + 40 : floatingPos.y - 80;
                      }
                      
                      return style;
                    })()}
                    className={cn(
                      "z-50 p-1 flex items-center gap-1 backdrop-blur-xl transition-all duration-300",
                      cn(
                        "transition-all duration-700",
                        widgetNoBorder 
                          ? "bg-slate-900/40 backdrop-blur-3xl shadow-none border-none border-transparent py-0 px-0" 
                          : "bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-1"
                      ),
                      widgetPos === 'floating' ? (
                        "fixed lg:absolute " + (window.innerWidth < 1024 ? "bottom-[4.5rem] left-4 right-4 rounded-3xl" : "")
                      ) : (
                        "absolute bottom-4 left-4 right-4 rounded-3xl mx-auto max-w-2xl"
                      )
                    )}
                  >
                    <button 
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => scrollRef.current?.scrollBy({ left: -100, behavior: 'smooth' })}
                      className="w-8 h-10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div 
                      ref={scrollRef}
                      className="flex items-center gap-1 overflow-x-auto custom-scrollbar scroll-smooth no-scrollbar px-1"
                      style={{ 
                        scrollbarWidth: 'none',
                        minWidth: isWidgetMenuOpen && lockedToolsWidth ? `${lockedToolsWidth}px` : undefined,
                        width: isWidgetMenuOpen && lockedToolsWidth ? `${lockedToolsWidth}px` : undefined
                      }}
                    >
                      {enabledTools.map((key) => {
                        const tool = TOOLS_MAP[key];
                        if (!tool) return null;
                        return (
                          <button 
                            key={key}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={tool.action} 
                            className={cn(
                              "w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-cyan-600 hover:text-white rounded-xl transition-all font-bold text-sm",
                              !widgetNoBorder ? "bg-slate-700/50 border border-slate-600/50 shadow-sm" : "bg-transparent text-slate-400 hover:bg-white/10"
                            )}
                          >
                            {tool.label}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => scrollRef.current?.scrollBy({ left: 100, behavior: 'smooth' })}
                      className="w-7 h-10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>

                    <div className="w-px h-8 bg-slate-700/50 mx-1 flex-shrink-0" />
                    
                    <div className="relative">
                      <button 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (!isWidgetMenuOpen && scrollRef.current) {
                            setLockedToolsWidth(scrollRef.current.offsetWidth);
                          } else {
                            setTimeout(() => setLockedToolsWidth(null), 300); // Wait for transition
                          }
                          setIsWidgetMenuOpen(!isWidgetMenuOpen);
                        }} 
                        className={cn(
                          "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all",
                          isWidgetMenuOpen ? "bg-cyan-600 text-white" : 
                          !widgetNoBorder ? "bg-slate-700/50 hover:bg-cyan-600 hover:text-white border border-slate-600/50" : "bg-transparent text-slate-400 hover:bg-white/10"
                        )}
                      >
                        <Settings size={15} />
                      </button>

                      <AnimatePresence mode="popLayout">
                        {isWidgetMenuOpen && (
                          <motion.div
                            key="widget-settings-menu"
                            initial={{ opacity: 0, y: menuDirection === 'down' ? -10 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            className={cn(
                              "absolute right-0 w-72 bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-[100] flex flex-col max-h-[80vh]",
                              menuDirection === 'down' ? "top-full mt-3" : "bottom-full mb-3"
                            )}
                          >
                            <div className="p-4 border-b border-white/5 bg-slate-800/20 flex items-center justify-between shrink-0">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Zap size={12} className="text-cyan-400" /> {t('widgetSettings')}
                                </h3>
                                <button onClick={() => {
                                  setTimeout(() => setLockedToolsWidth(null), 300);
                                  setIsWidgetMenuOpen(false);
                                }} className="p-1.5 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                                  <X size={14} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-8">
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('widgetOpacity')}</label>
                                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{Math.round(widgetOpacity * 100)}%</span>
                                  </div>
                                  <input 
                                    type="range" min="0.1" max="1" step="0.05" value={widgetOpacity}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setWidgetOpacity(val);
                                      localStorage.setItem('widget_opacity', val.toString());
                                    }}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 opacity-80 hover:opacity-100 transition-opacity"
                                  />
                                </div>

                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full transition-all duration-500", widgetNoBorder ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "bg-slate-600")} />
                                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight">{t('widgetNoBorder') || 'Без рамок'}</span>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const next = !widgetNoBorder;
                                      setWidgetNoBorder(next);
                                      localStorage.setItem('widget_no_border', next.toString());
                                    }}
                                    className={cn(
                                      "w-9 h-5 rounded-full transition-all duration-300 relative",
                                      widgetNoBorder ? "bg-cyan-600" : "bg-slate-700"
                                    )}
                                  >
                                    <div className={cn(
                                      "absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300",
                                      widgetNoBorder ? "left-5" : "left-1"
                                    )} />
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">{t('widgetPos')}</label>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                      { id: 'floating', label: 'FLOAT' },
                                      { id: 'bottom', label: 'BOTTOM' }
                                    ].map(pos => (
                                      <button
                                        key={pos.id}
                                        onClick={() => {
                                          setWidgetPos(pos.id as any);
                                          localStorage.setItem('steem_widget_pos', pos.id);
                                        }}
                                        className={cn(
                                          "text-[9px] py-2 rounded-xl border transition-all duration-300 text-center font-bold tracking-tighter",
                                          widgetPos === pos.id ? "bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-900/20" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                                        )}
                                      >
                                        {pos.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('activeToolsSort')}</label>
                                  <span className="text-[9px] text-slate-600 italic">Drag to sort</span>
                                </div>

                                <Reorder.Group 
                                  axis="y" 
                                  values={enabledTools} 
                                  onReorder={(newOrder) => {
                                    setEnabledTools(newOrder);
                                    localStorage.setItem('steem_enabled_tools', JSON.stringify(newOrder));
                                  }} 
                                  className="space-y-2"
                                >
                                  {enabledTools.map((key, idx) => (
                                    <Reorder.Item 
                                      key={key} 
                                      value={key}
                                      transition={{ duration: 0.1 }}
                                      dragListener={true}
                                      whileDrag={{ 
                                        scale: 1, 
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        borderColor: "rgba(6, 182, 212, 0.3)",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                                        zIndex: 200
                                      }}
                                      className="flex items-center justify-between bg-white/5 border border-white/5 px-3 py-2.5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-cyan-500/10 group relative"
                                    >
                                      <div className="flex items-center gap-3">
                                        <MoveVertical size={14} className="text-slate-600 group-hover:text-cyan-500 transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-200">{TOOLS_MAP[key]?.label}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveTool(key, 'up');
                                          }}
                                          disabled={idx === 0}
                                          className="text-slate-500 hover:text-cyan-400 disabled:opacity-0 transition-all p-1"
                                        >
                                          <ChevronUp size={16} />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveTool(key, 'down');
                                          }}
                                          disabled={idx === enabledTools.length - 1}
                                          className="text-slate-500 hover:text-cyan-400 disabled:opacity-0 transition-all p-1"
                                        >
                                          <ChevronDown size={16} />
                                        </button>
                                      </div>
                                    </Reorder.Item>
                                  ))}
                                </Reorder.Group>

                                <div className="grid grid-cols-4 gap-1.5 pt-2">
                                  {Object.keys(TOOLS_MAP).map(key => (
                                    <button
                                      key={`toggle-${key}`}
                                      onClick={() => toggleTool(key)}
                                      className={cn(
                                        "text-[9px] py-1.5 px-2 rounded-lg border text-center transition-all font-medium truncate",
                                        enabledTools.includes(key) 
                                          ? "bg-cyan-600/10 border-cyan-500/50 text-cyan-400" 
                                          : "bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700"
                                      )}
                                    >
                                      {key}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button 
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setIsWidgetVisible(false)} 
                      className={cn(
                        "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all lg:hidden",
                        !widgetNoBorder ? "bg-slate-700/50 hover:bg-red-600 hover:text-white border border-slate-600/50" : "bg-transparent text-slate-400 hover:bg-red-600/20 hover:text-red-400"
                      )}
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Preview Pane */}
            <div 
              ref={previewRef}
              className={cn(
                "flex-1 flex flex-col min-w-0 bg-slate-900/30 transition-all relative",
                activeMobileTab !== 'preview' && "hidden lg:flex",
                isFullScreen && "bg-slate-950 p-4 lg:p-12 overflow-y-auto fixed inset-0 z-[100]"
              )}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="flex p-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 gap-1 shrink-0">
                  <button
                    onClick={() => setSyncScrollEnabled(!syncScrollEnabled)}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      syncScrollEnabled ? "bg-cyan-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                    )}
                    title={t('syncScroll')}
                  >
                    <MoveVertical size={16} />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-0.5 my-auto" />
                  <button 
                    onClick={toggleFullScreen}
                    className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                    title={t('fullScreen')}
                  >
                    {isFullScreen ? <X size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              <div 
                className={cn(
                  "flex-1 p-8 overflow-y-auto prose prose-invert prose-cyan max-w-none custom-scrollbar markdown-body",
                  widgetPos === 'bottom' ? "mb-20 lg:mb-16 pb-12" : "pb-24 lg:pb-8",
                  isFullScreen && "max-w-4xl mx-auto"
                )}
                ref={previewPaneRef}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>

          {/* Mobile Tabs - Merged into Bottom Nav below */}

          {/* Footer Status Bar - Hidden on mobile to save space for tabs */}
          <footer className="hidden lg:flex h-8 border-t border-slate-800 bg-slate-900 items-center px-4 justify-between text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex gap-4">
              <span>{t('wordsLabel')}: {stats.words}</span>
              <span className="text-cyan-400">{t('cleanWordsLabel')}: {cleanStats.words}</span>
              <span>{t('charsLabel')}: {stats.chars}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{t('autosaveActive')}</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'unlock-pin' && (
          <div key="modal-unlock-pin" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-[240px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-5 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-600" />
              
              <div className="w-10 h-10 bg-cyan-600/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
                <Lock className="text-cyan-400" size={18} />
              </div>
              
              <h3 className="text-sm font-bold mb-1 text-slate-100 uppercase tracking-tight">{t('vaultLocked')}</h3>
              <p className="text-[10px] text-slate-500 mb-4">{t('enterPinPlaceholder')}</p>
              
              <input 
                autoFocus
                type="password"
                value={vaultPin}
                onChange={e => setVaultPin(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && vaultPin) {
                    try {
                      await SecurityService.unlock(vaultPin);
                      notify(t('vaultUnlocked'), 'success');
                      setVaultPin('');
                      setActiveModal(null);
                      initVault();
                    } catch (err: any) {
                      notify(t('pinError'), 'error');
                      setVaultPin('');
                      console.error(err);
                    }
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-center text-lg tracking-[0.5em] focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:tracking-normal placeholder:text-[10px] text-cyan-400 font-mono"
                placeholder="••••"
              />
              
              <div className="flex gap-2 mt-5">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold transition-all uppercase"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={async () => {
                    if (!vaultPin) return;
                    try {
                      await SecurityService.unlock(vaultPin);
                      notify(t('vaultUnlocked'), 'success');
                      setVaultPin('');
                      setActiveModal(null);
                      initVault();
                    } catch (err: any) {
                      notify(t('pinError'), 'error');
                      setVaultPin('');
                      console.error(err);
                    }
                  }}
                  className="flex-[2] py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-cyan-900/20 uppercase"
                >
                  {t('unlock')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'keys' && (
          <div key="modal-keys" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Key className="text-cyan-400" /> {t('vaultTitle')}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-sm text-cyan-100/70">
                  <p>{t('vaultWarning')}</p>
                </div>

                {!isVaultInitialized ? (
                  <div className="space-y-4 p-4 bg-slate-800/50 border border-cyan-500/30 rounded-xl">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{t('pinSetup')}</h3>
                    <p className="text-xs text-slate-400">{t('pinSetupDesc')}</p>
                    <input 
                      type="password" 
                      value={vaultSetupPin}
                      onChange={e => setVaultSetupPin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder={t('enterNewPin')}
                    />
                    <button 
                      onClick={async () => {
                        if (vaultSetupPin.length < 4) {
                          notify(t('pinShort'), 'error');
                          return;
                        }
                        await SecurityService.setup(vaultSetupPin);
                        setVaultSetupPin('');
                        initVault();
                        notify(t('vaultInit'));
                      }}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      {t('createVault')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!isUnlocked ? (
                      <div className="space-y-4 p-4 bg-slate-800/50 border border-yellow-500/30 rounded-xl">
                        <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest">{t('vaultLocked')}</h3>
                        <input 
                          type="password" 
                          value={vaultPin}
                          onChange={e => setVaultPin(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-yellow-500"
                          placeholder={t('enterPinPlaceholder')}
                        />
                        <button 
                          onClick={async () => {
                            try {
                              await SecurityService.unlock(vaultPin);
                              setVaultPin('');
                              initVault();
                            } catch (e: any) {
                              notify(e.message, 'error');
                            }
                          }}
                          className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          {t('unlockBtn')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('yourAccounts')}</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { SecurityService.lock(); initVault(); }}
                              className="text-[10px] font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                            >
                              <Lock size={12} /> {t('lock')}
                            </button>
                            <button 
                              onClick={() => setShowVaultSetup(!showVaultSetup)}
                              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              {showVaultSetup ? <X size={12} /> : <Plus size={12} />}
                              {showVaultSetup ? t('cancel') : t('addAccount')}
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {showVaultSetup && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-slate-800/80 border border-cyan-500/30 rounded-xl space-y-3 mb-4">
                                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{t('newAccount')}</p>
                                <input 
                                  type="text" 
                                  value={username}
                                  onChange={e => setUsername(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                                  placeholder={t('usernameNoAt')}
                                />
                                <input 
                                  type="password" 
                                  value={vaultSetupWif}
                                  onChange={e => setVaultSetupWif(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                                  placeholder={t('postingKeyPlaceholder')}
                                />
                                  <button 
                                    onClick={async () => {
                                      if (!username || !vaultSetupWif) {
                                        notify(t('fillAll'), 'error');
                                        return;
                                      }
                                      try {
                                        await SecurityService.saveKey(username, vaultSetupWif);
                                        setVaultSetupWif('');
                                        setShowVaultSetup(false);
                                        initVault();
                                        notify(t('accountAdded'));
                                      } catch (e: any) {
                                        notify(e.message, 'error');
                                      }
                                    }}
                                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
                                >
                                  {t('saveToVault')}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-2">
                          {vaultAccounts.length > 0 ? (
                            vaultAccounts.map(acc => (
                              <div key={acc} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                                    {acc[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-200">@{acc}</p>
                                    <p className="text-[9px] text-green-500 uppercase tracking-wider">{t('protectedByMK')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={async () => {
                                      if (await confirmDialog(t('confirmDeleteAccount').replace('{acc}', acc))) {
                                        await SecurityService.deleteAccount(acc);
                                        initVault();
                                      }
                                    }}
                                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    title={t('delete')}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center">
                              <p className="text-xs text-slate-500">{t('vaultEmpty')}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4">
                          <button 
                            onClick={async () => {
                              if (await confirmDialog(t('confirmResetVault'))) {
                                await SecurityService.clearAll();
                                initVault();
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-400 underline"
                          >
                            {t('resetVault')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon size={16} className="text-cyan-400" /> {t('additional')}
                  </h3>

                  <div className="flex flex-col gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{t('performanceMode')}</span>
                        <span className="text-[10px] text-slate-500">{t('enableThumbnails')}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const next = !performanceMode;
                          setPerformanceMode(next);
                          localStorage.setItem('steem_performance_mode', next.toString());
                        }}
                        className={cn(
                          "w-9 h-5 rounded-full transition-all relative",
                          performanceMode ? "bg-cyan-600" : "bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          performanceMode ? "left-5" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('pexelsKey')}</label>
                        {!savePexelsUnencrypted && !isUnlocked && (
                          <span className="text-[8px] text-amber-500 flex items-center gap-1"><Lock size={8} /> Unlock Vault to save</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                          placeholder={pexelsApiKey ? "••••••••" : t('pexelsKey')}
                          value={tempPexelsKey}
                          onChange={e => setTempPexelsKey(e.target.value)}
                        />
                        <button 
                          onClick={async () => {
                            if (!tempPexelsKey.trim()) return;
                            try {
                              if (savePexelsUnencrypted) {
                                localStorage.setItem('steem_pexels_key_raw', tempPexelsKey.trim());
                              } else {
                                await SecurityService.savePexelsKey(tempPexelsKey.trim());
                              }
                              setPexelsApiKey(tempPexelsKey.trim());
                              setTempPexelsKey('');
                              notify(t('saveSuccess'));
                            } catch (err: any) {
                              notify(err.message, 'error');
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold"
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('pixabayKey')}</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                          placeholder={pixabayApiKey ? "••••••••" : t('pixabayKey')}
                          value={tempPixabayKey}
                          onChange={e => setTempPixabayKey(e.target.value)}
                        />
                        <button 
                          onClick={async () => {
                            if (!tempPixabayKey.trim()) return;
                            try {
                              if (savePexelsUnencrypted) {
                                localStorage.setItem('steem_pixabay_key', tempPixabayKey.trim());
                              } else {
                                await SecurityService.saveApiKey('pixabay', tempPixabayKey.trim());
                              }
                              setPixabayApiKey(tempPixabayKey.trim());
                              setTempPixabayKey('');
                              notify(t('saveSuccess'));
                            } catch (e: any) { notify(e.message, 'error') }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold"
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('unsplashAccessKey')}</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                          placeholder={unsplashAccessKey ? "••••••••" : t('unsplashAccessKey')}
                          value={tempUnsplashAccessKey}
                          onChange={e => setTempUnsplashAccessKey(e.target.value)}
                        />
                        <button 
                          onClick={async () => {
                            if (!tempUnsplashAccessKey.trim()) return;
                            try {
                              if (savePexelsUnencrypted) {
                                localStorage.setItem('steem_unsplash_access_key', tempUnsplashAccessKey.trim());
                              } else {
                                await SecurityService.saveApiKey('unsplashAccess', tempUnsplashAccessKey.trim());
                              }
                              setUnsplashAccessKey(tempUnsplashAccessKey.trim());
                              setTempUnsplashAccessKey('');
                              notify(t('saveSuccess'));
                            } catch (e: any) { notify(e.message, 'error') }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold"
                        >
                          {t('save')}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={savePexelsUnencrypted}
                        onChange={e => {
                          setSavePexelsUnencrypted(e.target.checked);
                          localStorage.setItem('steem_pexels_unencrypted', String(e.target.checked));
                        }}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                      />
                      <span className="text-xs text-slate-400">{t('saveUnencrypted')}</span>
                    </label>

                    <div className="pt-2">
                       <button 
                         onClick={async () => {
                           if (await confirmDialog(t('confirmClearApiKeys') || "Очистити всі API ключі?")) {
                             setPexelsApiKey(null);
                             setPixabayApiKey(null);
                             setUnsplashAccessKey(null);
                             localStorage.removeItem('steem_pexels_key_raw');
                             localStorage.removeItem('steem_pixabay_key');
                             localStorage.removeItem('steem_unsplash_app_id');
                             localStorage.removeItem('steem_unsplash_access_key');
                             localStorage.removeItem('steem_unsplash_secret_key');
                             await SecurityService.clearAllApiKeys();
                             notify(t('keysCleared') || "API ключі очищено!");
                           }
                         }}
                         className="text-[10px] text-red-500 hover:text-red-400 underline"
                       >
                         {t('clearApiKeys') || "Очистити API ключі"}
                       </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {t('done')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'publish' && (
          <div key="modal-publish" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Rocket className="text-cyan-400" /> {t('publishToSteem')}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
                  <button 
                    onClick={() => setAuthType('KEYCHAIN')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all",
                      authType === 'KEYCHAIN' ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <ShieldCheck size={14} /> Keychain
                  </button>
                  <button 
                    onClick={() => setAuthType('VAULT')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all",
                      authType === 'VAULT' ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Lock size={14} /> Vault
                  </button>
                </div>

                <div className="space-y-3">
                  {authType === 'VAULT' && (
                    <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      {!isVaultInitialized ? (
                        <div className="space-y-3 text-center py-2">
                          <p className="text-xs text-slate-400">{t('vaultNotConfigured')}</p>
                          <button 
                            onClick={() => setActiveModal('keys')}
                            className="text-xs font-bold text-cyan-400 hover:underline"
                          >
                            {t('setupVaultBtn')}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={cn(
                              "text-xs flex items-center gap-1",
                              isUnlocked ? "text-green-400" : "text-yellow-400"
                            )}>
                              <ShieldCheck size={14}/> {isUnlocked ? t('vaultUnlocked') : t('vaultLocked')}
                            </span>
                            <div className="flex gap-2">
                              {isUnlocked && (
                                <button 
                                  onClick={() => { SecurityService.lock(); setVaultPin(''); }}
                                  className="text-[10px] text-slate-400 hover:text-white"
                                >
                                  {t('lock')}
                                </button>
                              )}
                            </div>
                          </div>
                          {!isUnlocked && (
                            <div className="space-y-2">
                              <input 
                                type="password" 
                                value={vaultPin}
                                onChange={e => setVaultPin(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder={t('enterPinPlaceholder')}
                              />
                              <button 
                                onClick={async () => {
                                  try {
                                    await SecurityService.unlock(vaultPin);
                                    setVaultPin('');
                                    initVault();
                                  } catch (e: any) {
                                    notify(e.message, 'error');
                                  }
                                }}
                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                {t('unlockBtn')}
                              </button>
                            </div>
                          )}
                          {isUnlocked && (
                            <div className="space-y-2">
                              <select 
                                value={selectedVaultUser}
                                onChange={e => {
                                  setSelectedVaultUser(e.target.value);
                                  setUsername(e.target.value);
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none"
                              >
                                <option value="">{t('selectAccount')}</option>
                                {vaultAccounts.map(acc => (
                                  <option key={acc} value={acc}>@{acc}</option>
                                ))}
                              </select>
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-[11px] text-green-400 flex items-start gap-2">
                                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold mb-0.5">{t('vaultActive')}</p>
                                  <p className="opacity-80">{t('vaultActiveDesc')}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {authType === 'KEYCHAIN' && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('username')}</label>
                      <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        placeholder={t('username')}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('title')}</label>
                    <input 
                      type="text" 
                      value={pubTitle}
                      onChange={e => setPubTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      placeholder={t('title')}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block">{t('tags')}</label>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setActiveModal('tagPresets')}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
                        >
                          <LayoutGrid size={10} /> {t('communities')}
                        </button>
                        <button 
                          onClick={() => setActiveModal('tagGroups')}
                          className="text-[10px] text-slate-400 hover:text-slate-300 font-bold transition-colors"
                        >
                          + {t('tagGroups')}
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={pubTags}
                      onChange={e => setPubTags(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                      placeholder={t('tagsPlaceholder')}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {COMMON_TAGS.slice(0, 8).map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setPubTags(prev => {
                            const existing = prev.split(' ').filter(t => t.trim());
                            if (existing.includes(tag)) return prev;
                            return [...existing, tag].join(' ');
                          })}
                          className={cn(
                            "text-[10px] px-2 py-1 rounded-full border transition-colors",
                            pubTags.includes(tag) 
                              ? "bg-cyan-600 border-cyan-500 text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                          )}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reward Type - Moved Here */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">{t('rewardType')}</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['50', 'SP', '0'] as const).map(type => (
                        <button 
                          key={type}
                          onClick={() => {
                            setRewardType(type);
                            localStorage.setItem('steem_reward_type', type);
                          }}
                          className={cn(
                            "text-[9px] py-2 rounded-lg border transition-all font-bold uppercase",
                            rewardType === type ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/40" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {t(`rewards${type}` as any)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <button 
                      onClick={() => setShowAdvancedPublish(!showAdvancedPublish)}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                    >
                      {showAdvancedPublish ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                      {t('beneficiaries')} & {t('schedule')}
                    </button>

                    <AnimatePresence>
                      {showAdvancedPublish && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          {/* Schedule */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('schedule')}</span>
                            </div>
                            <input 
                              type="datetime-local" 
                              value={scheduledTime}
                              onChange={e => setScheduledTime(e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded p-1 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500 text-slate-300"
                            />
                          </div>

                          {/* Beneficiaries */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                              <div className="flex gap-2 flex-1">
                                <div className="space-y-1 flex-1">
                                  <label className="text-[8px] font-bold text-slate-500 uppercase px-1">{t('username')}</label>
                                  <input 
                                    type="text" 
                                    value={benName}
                                    onChange={e => setBenName(e.target.value.toLowerCase().replace('@', ''))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[11px] outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="nickname"
                                  />
                                </div>
                                <div className="space-y-1 w-16">
                                  <label className="text-[8px] font-bold text-slate-500 uppercase px-1">%</label>
                                  <input 
                                    type="number" 
                                    value={benWeight}
                                    onChange={e => setBenWeight(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[11px] outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button 
                                    onClick={() => {
                                      if (!benName) return;
                                      const weight = parseFloat(benWeight);
                                      if (isNaN(weight)) return;
                                      setBeneficiaries([...beneficiaries, { account: benName.trim(), weight }]);
                                      setBenName('');
                                    }}
                                    className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Fav Mentions Picker */}
                            {mentions.length > 0 && (
                              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider">{t('mentions')}</label>
                                  <button onClick={() => setActiveModal('mentions')} className="text-[8px] text-cyan-400 hover:underline px-1 uppercase font-bold">Редагувати список</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[1rem]">
                                  {mentions.map(m => (
                                    <button
                                      key={m}
                                      onClick={() => {
                                        if (beneficiaries.some(b => b.account === m)) return;
                                        setBeneficiaries([...beneficiaries, { account: m, weight: 5 }]);
                                      }}
                                      disabled={beneficiaries.some(b => b.account === m)}
                                      className={cn(
                                        "text-[9px] px-2.5 py-1 rounded-full border transition-all font-medium",
                                        beneficiaries.some(b => b.account === m)
                                          ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                                          : "bg-cyan-500/5 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40"
                                      )}
                                    >
                                      @{m}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mentions in text Picker */}
                            {extractMentions(content).filter(m => !mentions.includes(m)).length > 0 && (
                              <div className="px-1">
                                <span className="text-[8px] text-slate-600 uppercase font-bold mb-1 block opacity-60">{t('fromMentions')}:</span>
                                <div className="flex flex-wrap gap-1">
                                  {extractMentions(content).filter(m => !mentions.includes(m)).map(m => (
                                    <button
                                      key={m}
                                      onClick={() => {
                                        if (beneficiaries.some(b => b.account === m)) return;
                                        setBeneficiaries([...beneficiaries, { account: m, weight: 5 }]);
                                      }}
                                      disabled={beneficiaries.some(b => b.account === m)}
                                      className={cn(
                                        "text-[8px] px-2 py-0.5 rounded border transition-all",
                                        beneficiaries.some(b => b.account === m)
                                          ? "bg-slate-800 border-slate-700 text-slate-600"
                                          : "bg-slate-800/50 border-slate-700 text-slate-500 hover:text-cyan-400"
                                      )}
                                    >
                                      @{m}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-2">
                              <label className="text-[8px] font-bold text-slate-600 uppercase px-1">{t('beneficiaries')}</label>
                              {beneficiaries.map((b, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50 text-[10px] hover:border-slate-600 transition-colors">
                                  <span className="text-slate-200 font-bold tracking-tight">@{b.account}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg border border-slate-700/50">
                                      <input 
                                        type="number"
                                        className="w-8 bg-transparent text-center outline-none text-cyan-400 font-mono text-[11px]"
                                        value={b.weight}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value);
                                          if (isNaN(val)) return;
                                          setBeneficiaries(beneficiaries.map((ben, i) => i === idx ? { ...ben, weight: val } : ben));
                                        }}
                                      />
                                      <span className="text-slate-500 text-[9px] font-bold">%</span>
                                    </div>
                                    <button 
                                      onClick={() => setBeneficiaries(beneficiaries.filter((_, i) => i !== idx))}
                                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {beneficiaries.length === 0 && (
                                <div className="text-center py-4 bg-slate-800/20 rounded-xl border border-dashed border-slate-800 text-[10px] text-slate-600 italic">
                                  {t('noBeneficiaries')}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Signature Check - Simplified */}
                <div className="px-4 py-2 bg-slate-800/10 border border-slate-800 rounded-xl flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-2">
                      <AtSign size={12} className={cn(
                        "transition-colors",
                        (content.includes('✍️') || content.includes('center') || content.toLowerCase().includes('signature')) ? "text-green-500" : "text-slate-600"
                      )} />
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('signaturePolicy')}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      { (content.includes('✍️') || content.includes('center') || content.toLowerCase().includes('signature')) ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-yellow-600 font-bold uppercase italic">{t('signatureMissing')}.</span>
                          <X size={12} className="text-yellow-600 opacity-50" />
                        </div>
                      )}
                   </div>
                </div>

                {pubLog.type && (
                  <div className={cn(
                    "p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2",
                    pubLog.type === 'success' ? "bg-green-500/10 border-green-500/30 text-green-400" :
                    pubLog.type === 'error' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                    "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  )}>
                    {pubLog.msg}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex flex-col gap-2">
                <button 
                  onClick={handlePublish}
                  disabled={pubLog.type === 'loading'}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {pubLog.type === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Rocket size={20} />}
                  {t('publish')}
                </button>
                <button 
                  onClick={addToQueue}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ListIcon size={18} />
                  {t('addToQueue')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

          {/* Templates Modal */}
          {activeModal === 'templates' && (
            <div key="modal-templates" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setActiveModal(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('templates')}</h2>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{templates.length} {t('saved') || 'збережено'}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="flex gap-2 mb-6">
                    <button 
                      onClick={async () => {
                        const name = await promptDialog(t('templateName'));
                        if (name) {
                          const newT: Template = {
                            id: Date.now().toString(),
                            name,
                            content,
                            tags: pubTags,
                            title: pubTitle
                          };
                          const updated = [...templates, newT];
                          setTemplates(updated);
                          localStorage.setItem('steem_templates', JSON.stringify(updated));
                          notify(t('templateSaved'));
                        }
                      }}
                      className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                    >
                      <Plus size={18} />
                      {t('saveAsTemplate')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {templates.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">
                        <FileText size={40} className="mx-auto mb-4 opacity-20" />
                        <p>{t('templatesEmpty')}</p>
                      </div>
                    ) : (
                      templates.map(tmp => (
                        <div key={tmp.id} className="group p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-cyan-500/50 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-200">{tmp.name}</h4>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setContent(tmp.content);
                                  if (tmp.tags) setPubTags(tmp.tags);
                                  if (tmp.title) setPubTitle(tmp.title);
                                  setActiveModal(null);
                                }}
                                className="p-1.5 hover:bg-cyan-600/20 text-cyan-400 rounded-lg transition-colors"
                                title={t('load')}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (await confirmDialog(t('confirmDeleteTemplate').replace('{name}', tmp.name))) {
                                    const updated = templates.filter(t => t.id !== tmp.id);
                                    setTemplates(updated);
                                    localStorage.setItem('steem_templates', JSON.stringify(updated));
                                    notify(t('templateDeleted'));
                                  }
                                }}
                                className="p-1.5 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 italic">{tmp.content.substring(0, 100)}...</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        {activeModal === 'tagPresets' && (
          <div key="modal-tag-presets" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal('publish')}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30 shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Tags className="text-cyan-400" /> {t('tagPresets')}
                </h2>
                <button onClick={() => setActiveModal('publish')} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LayoutGrid size={14} /> {t('communities')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMUNITIES.map(comm => (
                      <div 
                        key={comm.id}
                        onClick={() => {
                          const allSelected = comm.tags.every(t => pubTags.includes(t));
                          if (allSelected) {
                            setPubTags(prev => {
                              const tags = prev.split(' ').filter(t => t.trim());
                              return tags.filter(t => !comm.tags.includes(t)).join(' ');
                            });
                          } else {
                            setPubTags(prev => {
                              const tags = prev.split(' ').filter(t => t.trim());
                              comm.tags.forEach(t => {
                                if (!tags.includes(t)) tags.push(t);
                              });
                              return tags.join(' ');
                            });
                          }
                        }}
                        className={cn(
                          "flex flex-col items-start p-4 border rounded-xl transition-all bg-slate-800/50 border-slate-700 cursor-pointer hover:border-cyan-500/50",
                          comm.tags.every(t => pubTags.includes(t)) ? "border-cyan-500 bg-cyan-500/10" : (comm.tags.some(t => pubTags.includes(t)) && "border-cyan-500/50 bg-cyan-500/5")
                        )}
                      >
                        <span className="font-bold text-sm text-slate-200 mb-2">{comm.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {comm.tags.map(tag => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTag(tag);
                              }}
                              className={cn(
                                "text-[9px] px-2 py-0.5 rounded-full border transition-all",
                                pubTags.includes(tag)
                                  ? "bg-cyan-600 border-cyan-500 text-white"
                                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
                              )}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus size={14} /> {t('commonTags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TAGS.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          pubTags.includes(tag) 
                            ? "bg-cyan-600 border-cyan-500 text-white" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
                <button 
                  onClick={() => setPubTags('')}
                  className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  {t('clear')}
                </button>
                <button 
                  onClick={() => setActiveModal('publish')}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-sm transition-all"
                >
                  {t('done')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'splitPost' && (
          <div key="modal-split" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="text-cyan-400" /> {t('splitPost')}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t('splitPostDesc')}
                </p>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                    <span>{t('minWordsPerPart')}</span>
                    <span className="text-cyan-400">300</span>
                  </div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    {Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 300)}
                    <span className="text-xs text-slate-500 font-medium">{t('parts')}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex gap-3">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleSplitPost}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
                >
                  {t('splitBtn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'drafts' && (
          <div key="modal-drafts" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FolderOpen className="text-cyan-400" /> {t('drafts')}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    {(['all', 'working', 'ready'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setDraftFilter(f)}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                          draftFilter === f ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                        )}
                      >
                        {t(f as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={async () => {
                      const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
                      if (allDrafts.length === 0) {
                        notify('Немає чернеток для експорту', 'error');
                        return;
                      }
                      const zip = new JSZip();
                      const folder = zip.folder("Steem_Editor_Drafts");
                      if (folder) {
                        allDrafts.forEach((draft: Draft, index: number) => {
                          const date = draft.date ? draft.date.split('T')[0] : new Date().toISOString().split('T')[0];
                          const safeTitle = (draft.title || `допис_${index + 1}`).replace(/[/\\?%*:|"<>]/g, '-').substring(0, 50);
                          const status = draft.status === 'ready' ? '[Готово]' : '[Чернетка]';
                          const fileName = `${status} ${date} - ${safeTitle}.md`;
                          
                          let content = `# ${draft.title || 'Без назви'}\n\n`;
                          if (draft.tags) {
                            content += `**Tags:** ${draft.tags}\n\n`;
                          }
                          content += `---\n\n${draft.body}`;
                          
                          folder.file(fileName, content);
                        });
                        const content = await zip.generateAsync({ type: "blob" });
                        saveAs(content, "steem_drafts.zip");
                        notify('Чернетки експортовано успішно!');
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-cyan-400 bg-slate-800/50 hover:bg-cyan-900/30 rounded border border-slate-700 hover:border-cyan-500/50 transition-colors flex items-center justify-center group"
                    title="Експортувати всі чернетки у ZIP-архів"
                  >
                    <Download size={16} />
                  </button>
                  <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white p-1"><X size={20} /></button>
                </div>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2">
                {(() => {
                  const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
                  const filtered = allDrafts.filter((d: Draft) => draftFilter === 'all' || d.status === draftFilter);
                  
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('noDrafts')}</p>
                      </div>
                    );
                  }

                  return filtered.map((draft: Draft) => (
                    <div 
                      key={draft.id}
                      className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                      onClick={async () => {
                        if (await confirmDialog(t('loadDraftConfirm'))) {
                          setContent(draft.body);
                          setCurrentDraftId(draft.id);
                          setActiveModal(null);
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200 truncate">{draft.title}</h4>
                          {draft.status === 'ready' && (
                            <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded border border-green-500/30 uppercase font-bold tracking-tighter">
                              {t('ready')}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{draft.date}</p>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setContent(draft.body);
                            setPubTitle(draft.title);
                            setActiveModal('publish');
                          }}
                          title={t('publish')}
                          className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Rocket size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDraftStatus(draft.id);
                          }}
                          title={draft.status === 'ready' ? t('working') : t('ready')}
                          className={cn(
                            "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                            draft.status === 'ready' ? "text-green-400 hover:bg-green-400/10" : "text-slate-500 hover:bg-slate-500/10"
                          )}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (await confirmDialog(t('delete') + '?')) {
                              const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY_DRAFTS) || "[]");
                              localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts.filter((d: Draft) => d.id !== draft.id)));
                              setActiveModal('drafts_refresh'); // Hack to re-render
                              setTimeout(() => setActiveModal('drafts'), 0);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'mentions' && (
          <div key="modal-mentions" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AtSign className="text-cyan-400" /> {t('mentions')}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMention}
                    onChange={e => setNewMention(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder={t('username')}
                  />
                  <button 
                    onClick={addMention}
                    className="p-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  {mentions.map(user => (
                    <div key={user} className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 group">
                      <button 
                        onClick={() => { insertAtCursor(`@${user} `); setActiveModal(null); }}
                        className="text-sm font-bold hover:text-cyan-400 transition-colors"
                      >
                        @{user}
                      </button>
                      <button 
                        onClick={async () => {
                          if (await confirmDialog(t('delete') + '?')) {
                            const updated = mentions.filter(u => u !== user);
                            setMentions(updated);
                            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

          <AnimatePresence>
            {isSMenuOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                  onClick={() => setIsSMenuOpen(false)}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-slate-900 border border-white/5 rounded-[2rem] shadow-2xl p-6 max-w-sm w-full overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setIsSMenuOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-cyan-500/20">S</div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-white leading-none">Settings <span className="text-cyan-400">Hub</span></h2>
                      <p className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-widest">Personalize experience</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Assortment */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={10} className="text-yellow-400" /> Interface Accent
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {themeAssortment.map(t => (
                          <button
                            key={t.name}
                            onClick={() => {
                              setThemeColor(t.name);
                              localStorage.setItem('steem_theme_color', t.name);
                            }}
                            className={cn(
                              "w-6 h-6 rounded-lg transition-all border flex items-center justify-center",
                              themeColor === t.name ? "border-cyan-500 scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                          >
                            <div className={cn("w-3 h-3 rounded-md", t.color)} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Configuration */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Edit3 size={10} className="text-cyan-400" /> Typography
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {fontOptions.map(f => (
                          <button
                            key={f.id}
                            onClick={() => {
                              setEditorFont(f.id);
                              localStorage.setItem('steem_editor_font', f.id);
                            }}
                            className={cn(
                              "px-2 py-1 rounded-lg border text-center transition-all flex items-center gap-1.5",
                              editorFont === f.id ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/[0.08]"
                            )}
                          >
                            <span className={cn("text-sm font-bold", f.class)}>Aa</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">{f.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Beautification */}
                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                          <Eye size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-200 block">Beautification</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Enhanced styling</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const next = !beautifyEnabled;
                          setBeautifyEnabled(next);
                          localStorage.setItem('steem_beautify', next.toString());
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all duration-500 relative",
                          beautifyEnabled ? "bg-cyan-500" : "bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white shadow-xl transition-all duration-500",
                          beautifyEnabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => {
                          setIsDarkMode(!isDarkMode);
                          localStorage.setItem('steem_dark_mode', (!isDarkMode).toString());
                        }}
                        className="py-4 bg-white/5 hover:bg-white/10 rounded-3xl text-sm font-black text-slate-300 flex items-center justify-center gap-3 transition-all"
                      >
                        {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-400" />} 
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                      </button>
                      <button 
                        onClick={() => {
                          setIsSMenuOpen(false);
                          setActiveModal('about');
                        }}
                        className="py-4 bg-cyan-600 hover:bg-cyan-500 rounded-3xl text-sm font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-600/20"
                      >
                        <Info size={18} /> About App
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* About Modal */}
          {activeModal === 'about' && (
            <div key="modal-about" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setActiveModal(null)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute top-6 right-6 text-slate-500 hover:text-white"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-2xl shadow-cyan-500/20">S</div>
                  <h2 className="text-3xl font-bold mb-2 tracking-tight">SteemEditor <span className="text-cyan-400">Pro</span></h2>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-4">{t('aboutDesc')}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    <Shield size={10} /> Web Crypto AES-GCM Secured
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {/* Credits Section */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle size={14} /> {t('credits')}
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                          <Zap size={14} className="text-yellow-400" /> {t('aiCredits')}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t('aiTasks')}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                          <AtSign size={14} className="text-cyan-400" /> {t('humanCredits')}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{t('humanTasks')}</p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-slate-500">{t('version')}</span>
                        <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md font-mono font-bold">3.2.2-stable</span>
                      </div>
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-slate-500">{t('license')}</span>
                        <span className="text-slate-300 font-bold">GNU AGPL v3</span>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('appAgent')}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={appAgent} 
                            onChange={(e) => {
                              setAppAgent(e.target.value);
                              localStorage.setItem('steem_app_agent', e.target.value);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <p className="text-[9px] text-slate-600 italic">{t('appAgentDesc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Terminal size={14} /> {t('packagesUsed')}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[120px] p-1">
                        {['dsteem', 'react', 'motion', 'marked', 'dompurify', 'lucide-react', 'buffer', 'jszip', 'idb-keyval'].map(pkg => (
                          <span key={pkg} className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-md text-[10px] text-slate-300 font-mono">
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Globe size={14} /> {t('externalLibs')}
                      </h3>
                      <div className="space-y-2">
                        {[
                          { name: 'Lucide', desc: 'Іконки' },
                          { name: 'Motion', desc: 'Анімації' },
                          { name: 'Tailwind', desc: 'Стилі' },
                          { name: 'DSteem', desc: 'Блокчейн PHP' },
                          { name: 'Marked', desc: 'Парсер MD' }
                        ].map(lib => (
                          <div key={lib.name} className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-300 font-bold">{lib.name}</span>
                            <span className="text-slate-500 font-medium italic">{lib.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => window.open('https://github.com/ultrapositivecode/steem-editor-pro-react', '_blank')}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700/50 group"
                      >
                         GitHub <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        {activeModal === 'tagGroups' && (
          <div key="modal-tag-groups" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal('publish')}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Tags className="text-cyan-400" /> {t('tagGroups')}
                </h2>
                <button onClick={() => setActiveModal('publish')} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-6 space-y-4">
                <button 
                  onClick={async () => {
                    const name = await promptDialog(t('addTagGroup'));
                    if (!name) return;
                    const tags = await promptDialog(t('tagsPlaceholder'));
                    if (!tags) return;
                    const newGroup: TagGroup = {
                      id: Date.now().toString(),
                      name,
                      tags: tags.split(/\s+/).filter(Boolean)
                    };
                    setTagGroups([...tagGroups, newGroup]);
                  }}
                  className="w-full py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors font-bold text-sm"
                >
                  {t('addTagGroup')}
                </button>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  {tagGroups.map(group => (
                    <div key={group.id} className="p-3 bg-slate-800 rounded-lg group">
                      <div className="flex justify-between items-center mb-1">
                        <button 
                          onClick={() => {
                            const currentTags = pubTags.split(/\s+/).filter(Boolean);
                            const nextTags = [...currentTags];
                            group.tags.forEach(tag => {
                              if (!nextTags.includes(tag)) nextTags.push(tag);
                            });
                            setPubTags(nextTags.join(' '));
                          }}
                          className="font-bold text-sm hover:text-cyan-400 transition-colors"
                        >
                          {group.name} ({t('applyGroup')})
                        </button>
                        <button 
                          onClick={async () => {
                          if (await confirmDialog(t('delete') + '?')) {
                            setTagGroups(tagGroups.filter(g => g.id !== group.id));
                          }
                        }}
                          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => {
                              const currentTags = pubTags.split(/\s+/).filter(Boolean);
                              if (currentTags.includes(tag)) {
                                setPubTags(currentTags.filter(t => t !== tag).join(' '));
                              } else {
                                setPubTags([...currentTags, tag].join(' '));
                              }
                            }}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded transition-colors",
                              pubTags.includes(tag) ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            )}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'queue' && (
          <div key="modal-queue" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ListIcon className="text-cyan-400" /> {t('queue')}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-6 space-y-4">
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 italic">{t('queueEmpty')}</div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {queue.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl group hover:border-cyan-500/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-200 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">@{item.authType === 'VAULT' ? item.selectedVaultUser : item.username}</span>
                              {item.scheduledTime && (
                                <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                                  <Calendar size={10} /> {new Date(item.scheduledTime).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                          onClick={async () => {
                            if (await confirmDialog(t('delete') + '?')) {
                              const updated = queue.filter(i => i.id !== item.id);
                              setQueue(updated);
                              localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
                            }
                          }}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                              item.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                              item.status === 'published' ? "bg-green-500/10 text-green-500" :
                              "bg-red-500/10 text-red-500"
                            )}>
                              {t(item.status)}
                            </span>
                          </div>
                          {item.status !== 'published' && (
                            <button 
                              onClick={() => publishFromQueue(item.id)}
                              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <Rocket size={14} /> {t('publish')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'tableImport' && (
        <div key="modal-table" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TableIcon className="text-cyan-400" /> {t('importTableTitle')}
                </h2>
                <div className="flex items-center gap-2">
                  {tableImportText && (
                    <button 
                      onClick={() => setTableImportText('')}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2 py-1"
                    >
                      <Trash2 size={12} /> {t('clear')}
                    </button>
                  )}
                  <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
                </div>
              </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400">{t('importTableDesc')}</p>
              <textarea 
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500 custom-scrollbar resize-none"
                placeholder={t('importTablePlaceholder')}
                value={tableImportText}
                onChange={e => setTableImportText(e.target.value)}
                autoFocus
              />

              <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase ml-2">{t('tableFormat')}</span>
                <div className="flex bg-slate-900 p-1 rounded-md gap-1">
                  <button 
                    onClick={() => setTableImportFormat('markdown')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded transition-all", 
                      tableImportFormat === 'markdown' ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Markdown
                  </button>
                  <button 
                    onClick={() => setTableImportFormat('html')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded transition-all", 
                      tableImportFormat === 'html' ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    HTML
                  </button>
                </div>
              </div>

              <button 
                onClick={processTableImport}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
              >
                {t('importBtn')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'settings' && (
        <div key="modal-settings" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg bg-[var(--bg-sidebar)] border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden container-theme"
          >
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-800/10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                <Settings className="text-cyan-400" /> {t('settings')}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
              <div className="flex border-b border-[var(--border-color)] bg-slate-800/10 overflow-x-auto no-scrollbar shrink-0">
                {(['general', 'gallery', 'vault', 'keys', 'about'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    className={cn(
                      "px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
                      settingsTab === tab 
                        ? "border-cyan-500 text-cyan-400 bg-cyan-500/5" 
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
                    )}
                  >
                    {t(tab)}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {settingsTab === 'general' && (
                  <section className="space-y-6">
                    {/* Performance Mode */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"><Zap size={18} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{t('performanceMode')}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{t('performanceDesc') || 'Вимикає деякі анімації'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setPerformanceMode(!performanceMode)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          performanceMode ? "bg-cyan-600" : "bg-slate-700"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          performanceMode ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>

                    {/* Font Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('font')}</label>
                      <div className="grid grid-cols-3 gap-2">
                         {[
                           { id: 'sans', label: t('fontSans'), class: 'font-sans' },
                           { id: 'serif', label: t('fontSerif'), class: 'font-serif' },
                           { id: 'mono', label: t('fontMono'), class: 'font-mono' }
                         ].map(f => (
                           <button 
                             key={f.id}
                             onClick={() => {
                               setEditorFont(f.id);
                               localStorage.setItem('steem_editor_font', f.id);
                             }}
                             className={cn(
                               "py-2 rounded-xl border text-xs transition-all",
                               editorFont === f.id ? "bg-slate-800 border-cyan-500/30 text-cyan-400 shadow-lg" : "bg-slate-900 border-slate-800 text-slate-500"
                             )}
                           >
                             <span className={f.class}>Aa</span>
                             <span className="ml-2">{f.label.split(' ')[0]}</span>
                           </button>
                         ))}
                      </div>
                    </div>

                    {/* Theme Colors */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('theme')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'cyan', label: t('themeCyan'), color: '#06b6d4' },
                          { id: 'emerald', label: t('themeEmerald'), color: '#10b981' },
                          { id: 'orange', label: t('themeOrange'), color: '#f97316' },
                          { id: 'rose', label: t('themeRose'), color: '#f43f5e' }
                        ].map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => {
                              setThemeColor(theme.id);
                              localStorage.setItem('steem_theme_color', theme.id);
                            }}
                            className={cn(
                              "text-[9px] p-2 rounded-xl border transition-all text-center flex flex-col items-center gap-1.5",
                              themeColor === theme.id ? "bg-slate-800 border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-900/10" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                            )}
                          >
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }} />
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Editor Options */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{"Синхронне пролистування"}</span>
                        <button 
                          onClick={() => {
                            const next = !syncScrollEnabled;
                            setSyncScrollEnabled(next);
                            localStorage.setItem('steem_sync_scroll', next.toString());
                          }}
                          className={cn(
                            "w-9 h-5 rounded-full transition-all relative",
                            syncScrollEnabled ? "bg-cyan-600" : "bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                            syncScrollEnabled ? "left-5" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {settingsTab === 'gallery' && (
                  <section className="space-y-6">
                    <div className="space-y-4 pt-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('gallerySettings') || "Gallery"}</label>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <span className="text-[10px] font-bold text-slate-400 block">{t('imageFormat')}</span>
                           <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg">
                              <button onClick={() => setImageInsertFormat('html')} className={cn("px-2 py-1 text-[9px] rounded", imageInsertFormat === 'html' ? "bg-cyan-600 text-white" : "text-slate-500")}>HTML</button>
                              <button onClick={() => setImageInsertFormat('markdown')} className={cn("px-2 py-1 text-[9px] rounded", imageInsertFormat === 'markdown' ? "bg-cyan-600 text-white" : "text-slate-500")}>MD</button>
                           </div>
                         </div>

                         <div className="space-y-2">
                           <span className="text-[10px] font-bold text-slate-400 block">{t('trafficOptimization')}</span>
                           <button 
                             onClick={() => setIsTrafficOptimized(!isTrafficOptimized)}
                             className={cn(
                               "w-full py-1 text-[9px] rounded font-bold border transition-all",
                               isTrafficOptimized ? "border-cyan-500 text-cyan-400 bg-cyan-400/5" : "border-slate-800 text-slate-600"
                             )}
                           >
                             {isTrafficOptimized ? "ON" : "OFF"}
                           </button>
                         </div>
                      </div>

                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('pexelsAttribution')}</span>
                           <button 
                            onClick={() => setPexelsSettings((prev: any) => ({ ...prev, withAttribution: !prev.withAttribution }))}
                            className={cn("w-8 h-4 rounded-full relative transition-all", pexelsSettings.withAttribution ? "bg-cyan-600" : "bg-slate-700")}
                           >
                              <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", pexelsSettings.withAttribution ? "left-4.5" : "left-0.5")} />
                           </button>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('pexelsLink')}</span>
                           <button 
                            onClick={() => setPexelsSettings((prev: any) => ({ ...prev, linkEmbedded: !prev.linkEmbedded }))}
                            className={cn("w-8 h-4 rounded-full relative transition-all", pexelsSettings.linkEmbedded ? "bg-cyan-600" : "bg-slate-700")}
                           >
                              <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", pexelsSettings.linkEmbedded ? "left-4.5" : "left-0.5")} />
                           </button>
                         </div>
                      </div>
                    </div>
                  </section>
                )}

                {settingsTab === 'vault' && (
                  <section className="space-y-6">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{t('vaultSecurity')}</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                            {isUnlocked ? t('sessionActive') : t('vaultClosed')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={async () => {
                            if (isUnlocked) SecurityService.lock();
                            else {
                               const pin = await promptDialog(t('enterPin'));
                               if (pin) {
                                 try {
                                   await SecurityService.unlock(pin);
                                   initVault();
                                 } catch {
                                   notify(t('error'), 'error');
                                 }
                               }
                            }
                          }}
                          className={cn(
                            "py-2 rounded-lg font-bold text-xs transition-all border",
                            isUnlocked ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-green-500/10 border-green-500/30 text-green-500"
                          )}
                        >
                           {isUnlocked ? t('lock') : t('unlock')}
                        </button>
                        <button 
                          onClick={async () => {
                            if (await confirmDialog(t('confirmResetVault'))) {
                               await SecurityService.clearAll();
                               initVault();
                               notify(t('saveSuccess'));
                            }
                          }}
                          className="py-2 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg font-bold text-xs hover:bg-slate-700"
                        >
                           {t('confirmResetVault') || "Reset"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">{t('accounts') || "Accounts"}</label>
                      <div className="space-y-2">
                        {vaultAccounts.map(acc => (
                          <div key={acc} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <span className="font-bold text-cyan-400">@{acc}</span>
                            <button 
                              onClick={async () => {
                                if (await confirmDialog(t('confirmDeleteAccount').replace('{acc}', acc))) {
                                   await SecurityService.deleteAccount(acc);
                                   initVault();
                                }
                              }}
                              className="p-1.5 text-slate-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {settingsTab === 'keys' && (
                  <section className="space-y-6">
                    <div className="space-y-4">
                       <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t('pexelsKey')}</label>
                          <div className="relative">
                            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                            <input 
                              type="password"
                              value={pexelsApiKey || ''}
                              onChange={async (e) => {
                                const val = e.target.value;
                                setPexelsApiKey(val);
                                if (!isUnlocked) {
                                   localStorage.setItem('steem_pexels_key_raw', val);
                                } else {
                                   await SecurityService.savePexelsKey(val);
                                }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                              placeholder="Pexels API Key"
                            />
                          </div>
                          <p className="text-[9px] text-slate-600 leading-tight">
                            {isUnlocked ? "Stored securely in vault" : "Stored unencrypted in local storage"}
                          </p>
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pixabay</label>
                            <input 
                              type="password"
                              value={pixabayApiKey || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPixabayApiKey(val);
                                SecurityService.saveApiKey('pixabay', val);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-3 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Unsplash</label>
                            <input 
                              type="password"
                              value={unsplashAccessKey || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUnsplashAccessKey(val);
                                SecurityService.saveApiKey('unsplashAccess', val);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-3 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                       </div>
                    </div>
                  </section>
                )}

                {settingsTab === 'about' && (
                  <section className="space-y-6">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                       <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 font-black text-2xl shadow-xl shadow-cyan-500/10">S</div>
                       <div>
                         <h3 className="text-xl font-black tracking-tight">SteemEditor <span className="text-cyan-400">Pro</span></h3>
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] pt-1">Version 1.0.0 "Platinum"</p>
                       </div>
                       
                       <div className="pt-4 space-y-2">
                         <div className="py-2 px-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center group hover:border-cyan-500/50 transition-all">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">Author</span>
                            <span className="text-xs text-cyan-400 font-black tracking-widest">UA_DEVS</span>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Package Audit</label>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { n: 'React', v: '19.0' },
                            { n: 'Lucide', v: '0.47' },
                            { n: 'Motion', v: '12.0' },
                            { n: 'JSZip', v: '3.10' },
                            { n: 'DSteem', v: '0.11' },
                            { n: 'Vite', v: '6.0' }
                          ].map(pkg => (
                            <div key={pkg.n} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                               <span className="text-[11px] font-black text-slate-300 uppercase leading-none">{pkg.n}</span>
                               <span className="text-[9px] text-cyan-500/80 font-mono tracking-tighter">v.{pkg.v} (STABLE)</span>
                            </div>
                          ))}
                       </div>
                       <p className="text-[9px] text-slate-600 italic px-2 text-center pt-2">All assets & dependencies verified as part of the Secure Desktop Suite.</p>
                    </div>

                    <section className="space-y-4 border-t border-slate-800 pt-6">
                      <button 
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <ChevronDown className={cn("text-slate-500 transition-transform", showAdvancedSettings && "rotate-180")} size={16} />
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <Terminal size={16} className="text-cyan-400" /> {t('advanced')}
                        </h3>
                      </button>

                      <AnimatePresence>
                        {showAdvancedSettings && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 bg-slate-800/30 p-4 rounded-xl border border-slate-800 overflow-hidden"
                          >
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">{t('appAgent')}</label>
                              <input 
                                type="text" 
                                value={appAgent}
                                onChange={e => {
                                  setAppAgent(e.target.value);
                                  localStorage.setItem('steem_app_agent', e.target.value);
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="steemeditor/1.0"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  </section>
                )}
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <AnimatePresence>
        {pubLog.msg && !activeModal && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-8 lg:top-8 lg:bottom-auto lg:w-80 z-[100]"
            >
              <div className={cn(
                "p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3",
                pubLog.type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-400" :
                pubLog.type === 'error' ? "bg-red-500/20 border-red-500/30 text-red-400" :
                "bg-slate-800/90 border-cyan-500/30 text-cyan-400"
              )}>
                {pubLog.type === 'loading' && <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin shrink-0" />}
                <p className="text-sm font-medium">{pubLog.msg}</p>
                <button onClick={() => setPubLog({ msg: '', type: null })} className="ml-auto text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 grid grid-cols-5 items-center px-1 z-[70] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => setActiveMobileTab('editor')}
            className={cn("flex flex-col items-center justify-center gap-1 h-full transition-colors", activeMobileTab === 'editor' ? "text-cyan-400 bg-cyan-400/5" : "text-slate-500")}
          >
            <Edit3 size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{t('text')}</span>
          </button>
          <button 
            onClick={() => setActiveMobileTab('preview')}
            className={cn("flex flex-col items-center justify-center gap-1 h-full transition-colors", activeMobileTab === 'preview' ? "text-cyan-400 bg-cyan-400/5" : "text-slate-500")}
          >
            <Eye size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{t('preview')}</span>
          </button>
          
          <div className="relative flex justify-center items-center">
            <button 
              onClick={() => {
                if (!pubTitle) {
                  const firstLine = content.split('\n')[0].replace(/[#*`]/g, '').trim().substring(0, 100);
                  setPubTitle(firstLine);
                }
                setActiveModal('publish');
              }}
              className="w-14 h-14 bg-cyan-600 text-white rounded-full shadow-lg shadow-cyan-900/40 active:scale-95 transition-all flex items-center justify-center border-4 border-slate-950 -mt-10"
            >
              <Rocket size={24} />
            </button>
          </div>

          <button 
            onClick={() => {
              setActiveMobileTab('editor');
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className={cn("flex flex-col items-center justify-center gap-1 h-full transition-colors", isSidebarOpen ? "text-cyan-400 bg-cyan-400/5" : "text-slate-500")}
          >
            <ImageIcon size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{t('gallery')}</span>
          </button>
          <button 
            onClick={() => setActiveModal('keys')}
            className={cn("flex flex-col items-center justify-center gap-1 h-full transition-colors", activeModal === 'keys' ? "text-cyan-400 bg-cyan-400/5" : "text-slate-500")}
          >
            <Key size={18} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{t('keys_mobile')}</span>
          </button>
        </nav>

        <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        
        .prose img {
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .pull-left {
          float: left;
          margin-right: 1.5rem;
          margin-bottom: 1rem;
          max-width: 45%;
        }
        .pull-right {
          float: right;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          max-width: 45%;
        }
        .text-center {
          text-align: center;
        }
        .text-justify {
          text-align: justify;
        }
        .clearfix::after {
          content: "";
          clear: both;
          display: table;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={handleFileUpload} 
      />
      {/* SystemDialog */}
      <AnimatePresence>
        {systemDialog && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{systemDialog.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{systemDialog.message}</p>
                
                {systemDialog.type === 'prompt' && (
                  <input
                    autoFocus
                    type="text"
                    defaultValue={systemDialog.defaultValue}
                    placeholder={systemDialog.placeholder}
                    className="w-full px-4 py-2 mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        systemDialog.resolve((e.target as HTMLInputElement).value);
                        setSystemDialog(null);
                      }
                      if (e.key === 'Escape') {
                        systemDialog.resolve(null);
                        setSystemDialog(null);
                      }
                    }}
                    id="system-dialog-input"
                  />
                )}
                
                <div className="flex justify-end gap-3">
                  {systemDialog.type !== 'alert' && (
                    <button 
                      onClick={() => {
                        systemDialog.resolve(null);
                        setSystemDialog(null);
                      }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {t('cancel') || 'Скасувати'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (systemDialog.type === 'prompt') {
                        const val = (document.getElementById('system-dialog-input') as HTMLInputElement)?.value;
                        systemDialog.resolve(val);
                      } else {
                        systemDialog.resolve(true);
                      }
                      setSystemDialog(null);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                  >
                    {systemDialog.type === 'alert' ? 'OK' : (t('confirm') || 'OK')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

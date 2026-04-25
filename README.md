# SteemEditor Pro

Професійний текстовий редактор для екосистеми Steem, розроблений для авторів, які цінують приватність, швидкість та зручність.

## 🚀 Основні можливості

- **Подвійна безпека**: Використання Web Crypto API (AES-GCM 256-bit) для локального шифрування ваших ключів.
- **Сховище (Vault)**: Захист ПІН-кодом, який не зберігається на сервері — ваші дані належать лише вам.
- **Розумна галерея зображень**:
  - Інтеграція з Pexels, Pixabay та Unsplash.
  - Автоматичне вивантаження на SteemitImages.
  - Створення сіток (Grid) та зручне вирівнювання (Pull-left/Pull-right).
  - Підтримка зчитування EXIF-даних для авторів фотоконтенту.
- **Інструменти публікації**:
  - Підтримка Steem Keychain та Private Posting Key.
  - Налаштування бенефіціарів.
  - Вибір типу винагороди (100% SP або 50/50).
  - Поділ довгих дописів на частини.
- **Зручність написання**:
  - Набір Markdown-інструментів.
  - Користувацькі шаблони та "Згадки" (@mentions) для швидкого вводу.
  - Автозбереження та чернетки.
  - Темна та світла теми, вибір шрифтів (Sans/Serif/Mono).

## 🛠 Технології

- **Frontend**: React 19, Vite, Tailwind CSS.
- **Анімації**: Framer Motion.
- **Іконки**: Lucide React.
- **Шифрування**: AES-GCM (Web Crypto).
- **Бібліотеки**: Steem JS, Marked.js.

## 📥 Встановлення та запуск

Якщо ви хочете запустити редактор локально:

1. Клонуйте репозиторій:
   ```bash
   git clone https://github.com/ultrapositivecode/steem-editor-pro-react.git
   ```
2. Перейдіть у директорію:
   ```bash
   cd steem-editor-pro-react
   ```
3. Встановіть залежності:
   ```bash
   npm install
   ```
4. Запустіть сервер розробки:
   ```bash
   npm run dev
   ```

## 🔒 Безпека

Застосунок працює локально у вашому браузері. Введені ключі (Posting Key) шифруються вашим ПІН-кодом за допомогою алгоритму AES-GCM перед збереженням у `localStorage`. ПІН-код використовується для створення Майстер-ключа і нікуди не передається.

## 📄 Ліцензія

Цей проект розповсюджується під ліцензією GNU AGPL v3.

---
© 2026 SteemEditor Pro. Розроблено для спільноти Steem.

___
___

# SteemEditor Pro

A professional text editor for the Steem ecosystem, built for authors who value privacy, speed, and convenience.

## 🚀 Key Features

- **Dual security:** Uses the Web Crypto API (AES-GCM 256-bit) for local encryption of your keys.  
- **Vault:** PIN-protected storage — the PIN is not stored on the server, so your data belongs only to you.  
- **Smart image gallery:**
  - Integration with Pexels, Pixabay, and Unsplash.
  - Automatic uploads to SteemitImages.
  - Grid creation and easy alignment (Pull-left / Pull-right).
  - EXIF reading support for photo authors.
- **Publishing tools:**
  - Support for Steem Keychain and Private Posting Key.
  - Beneficiary configuration.
  - Reward type selection (100% SP or 50/50).
  - Split long posts into parts.
- **Writing convenience:**
  - Markdown toolset.
  - Custom templates and @mentions for quick input.
  - Autosave and drafts.
  - Dark and light themes, font choices (Sans / Serif / Mono).

## 🛠 Technologies

- **Frontend:** React 19, Vite, Tailwind CSS.  
- **Animations:** Framer Motion.  
- **Icons:** Lucide React.  
- **Encryption:** AES-GCM (Web Crypto).  
- **Libraries:** Steem JS, Marked.js.

## 📥 Installation and Run

To run the editor locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/ultrapositivecode/steem-editor-pro-react.git
   ```
2. Change into the directory:
   ```bash
   cd steem-editor-pro-react
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security

The app runs locally in your browser. Entered keys (Posting Key) are encrypted with your PIN using AES-GCM before being saved to `localStorage`. The PIN is used to derive a master key and is not transmitted anywhere.

## 📄 License

This project is distributed under the GNU AGPL v3 license.

---
© 2026 SteemEditor Pro. Made for the Steem community.

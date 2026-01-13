# 🌙 Diário de Sono - Setup Guide

## Passo 1: Criar Firebase Project

1. Vai a **[Firebase Console](https://console.firebase.google.com/)**
2. Clica em **"Add project"**
3. Nome do projeto: `sleep-diary` (ou outro nome)
4. Desativa Google Analytics (não precisamos)
5. Clica **"Create project"**

---

## Passo 2: Ativar Authentication

1. No menu lateral, clica em **Build → Authentication**
2. Clica **"Get started"**
3. Tab **"Sign-in method"**

### Ativar Google Sign-in:
1. Clica em **Google**
2. Toggle para **Enable**
3. Escolhe um email de suporte (o teu)
4. Clica **Save**

### Ativar Email/Password:
1. Clica em **Email/Password**
2. Toggle para **Enable**
3. Clica **Save**

---

## Passo 3: Criar Firestore Database

1. No menu lateral, clica em **Build → Firestore Database**
2. Clica **"Create database"**
3. Escolhe **"Start in production mode"**
4. Escolhe a localização mais próxima (ex: `europe-west1`)
5. Clica **"Enable"**

### Configurar Regras de Segurança:

1. Vai ao tab **"Rules"**
2. Substitui as regras por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clica **"Publish"**

---

## Passo 4: Obter Credenciais

1. Clica no ⚙️ (Settings) → **Project settings**
2. Scroll down até **"Your apps"**
3. Clica no ícone **Web** (`</>`)
4. App nickname: `sleep-diary-web`
5. ❌ NÃO ativas Firebase Hosting
6. Clica **"Register app"**

7. Copia os valores do `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Passo 5: Atualizar config.js

Abre o ficheiro `config.js` e substitui os placeholders:

```javascript
const firebaseConfig = {
    apiKey: "COLA_AQUI_O_TEU_apiKey",
    authDomain: "COLA_AQUI_O_TEU_authDomain",
    projectId: "COLA_AQUI_O_TEU_projectId",
    storageBucket: "COLA_AQUI_O_TEU_storageBucket",
    messagingSenderId: "COLA_AQUI_O_TEU_messagingSenderId",
    appId: "COLA_AQUI_O_TEU_appId"
};
```

---

## Passo 6: Configurar Google OAuth (IMPORTANTE!)

Para o Google Login funcionar no GitHub Pages:

1. Vai a **[Google Cloud Console](https://console.cloud.google.com/)**
2. Seleciona o projeto do Firebase
3. Menu lateral → **APIs & Services → Credentials**
4. Clica no **OAuth 2.0 Client ID** que o Firebase criou
5. Em **"Authorized JavaScript origins"**, adiciona:
   - `https://tomasbb0.github.io`
6. Em **"Authorized redirect URIs"**, adiciona:
   - `https://tomasbb0.github.io/__/auth/handler`
7. Clica **Save**

---

## Passo 7: Deploy no GitHub Pages

### Criar repositório:
```bash
cd /Users/tomasbatalha/Downloads/sleep-diary
git init
git add .
git commit -m "Initial commit - Sleep Diary App"
git branch -M main
git remote add origin https://github.com/tomasbb0/sleep-diary.git
git push -u origin main
```

### Ativar GitHub Pages:
1. Vai ao repositório no GitHub
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / **(root)**
5. Clica **Save**

O site estará disponível em: **https://tomasbb0.github.io/sleep-diary/**

---

## Passo 8: Criar Ícone (Opcional)

Para um ícone personalizado, cria:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Podes usar uma lua 🌙 ou estrela ⭐ simples.

Ferramentas gratuitas:
- [Canva](https://canva.com)
- [Figma](https://figma.com)
- [Favicon.io](https://favicon.io/emoji-favicons/)

---

## Teste Final

1. Abre https://tomasbb0.github.io/sleep-diary/
2. Faz login com Google ou Email/Password
3. Responde às perguntas do dia
4. Verifica se os dados aparecem no histórico
5. Testa no telemóvel - deve funcionar como app!

---

## Problemas Comuns

### "Error loading Firebase"
- Verifica se o `config.js` tem as credenciais corretas

### Google Login não funciona
- Verifica se adicionaste `https://tomasbb0.github.io` nos Authorized origins

### Dados não guardam
- Verifica se as regras do Firestore estão corretas
- Verifica a consola do browser (F12) para erros

---

## Estrutura de Ficheiros

```
sleep-diary/
├── index.html       # Página principal
├── styles.css       # Estilos
├── app.js           # Lógica da aplicação
├── questions.js     # Perguntas do diário
├── config.js        # Configuração Firebase (EDITAR!)
├── sw.js            # Service Worker (PWA)
├── manifest.json    # Manifest (PWA)
├── SETUP.md         # Este guia
├── icon-192.png     # Ícone pequeno
└── icon-512.png     # Ícone grande
```

---

**Pronto! 🎉** Agora tens um diário de sono digital que funciona no telemóvel e sincroniza com a cloud!

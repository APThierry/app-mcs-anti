# 📱 MonteCarmo Shopping - App Mobile Nativo (React Native / Expo)

Este é o projeto móvel nativo do **MonteCarmo Shopping**, construído com **Expo (React Native)** para Android e iOS.

---

## 🚀 Como Rodar no Celular (Modo de Teste Instantâneo via Expo Go)

Você pode testar o aplicativo diretamente no seu celular em menos de 2 minutos:

1. **No seu Celular (Android ou iPhone)**:
   * Baixe o aplicativo **Expo Go** na Google Play Store ou App Store.

2. **No seu Computador**:
   * Abra o terminal dentro da pasta `app-mobile`:
   ```bash
   cd app-mobile
   npm install
   npx expo start
   ```
3. **Escaneie o QR Code**:
   * Aponte a câmera do seu celular para o QR Code gerado no terminal.
   * O app do MonteCarmo Shopping abrirá nativamente no seu aparelho, com leitor de câmera real e navegação fluida a 60fps!

---

## 📦 Como Gerar o Arquivo `.apk` para Instalar no Android

Para compilar um instalador `.apk` real sem precisar configurar o Android Studio:

1. Instale a ferramenta oficial da nuvem do Expo:
   ```bash
   npm install -g eas-cli
   ```

2. Crie uma conta gratuita em [expo.dev](https://expo.dev) e faça login no terminal:
   ```bash
   eas login
   ```

3. Inicie a geração do APK na nuvem:
   ```bash
   eas build -p android --profile preview
   ```
4. Ao final do processo (leva cerca de 3 a 5 minutos), você receberá um link direto e um QR Code para baixar o arquivo `.apk` e instalar no seu smartphone!

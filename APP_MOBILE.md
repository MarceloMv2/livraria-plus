# 📱 App Android e iOS — Livraria Plus

O site vira app nativo usando **Capacitor** (invólucro que carrega o site já publicado em
`https://www.livrariaplus.com.br`). Nada do código do site precisa mudar.

## O que já foi preparado no projeto

- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` instalados (v7)
- `capacitor.config.ts` — appId `com.livrariaplus.app`, nome "Livraria Plus", aponta para o site
- `android/` — projeto nativo gerado (`npx cap add android`), com ícones e splash nas cores do site (#2549EB)
- `public/icons/` — ícones gerados (16 a 1024px) + splash 1242×2436
- `app-web/index.html` — página placeholder (capa de inicialização)

## Requisitos para compilar (faltam na sua máquina)

| Ferramenta | Onde baixar | Usado para |
|---|---|---|
| **Android Studio** (inclui Android SDK + JDK 17) | https://developer.android.com/studio | Build e assinatura do APK/AAB Android |
| **Xcode** | Mac App Store (gratuito) | Build e assinatura do app iOS |
| **CocoaPods** | `sudo gem install cocoapods` (ou via Homebrew) | Dependências iOS |

> Obs: o Capacitor v7 exige Node ≥ 20 (você tem 20.20.2 via nvm — OK). A versão v8 exigiria Node 22.

## Passo a passo — Android

```bash
npx cap add android          # se a pasta android/ não existir
npx cap sync android         # atualiza web assets e plugins
npx cap open android         # abre no Android Studio
```

No Android Studio:
1. Aguarde o Gradle sincronizar (baixa dependências na 1ª vez)
2. Conecte um celular com **Depuração USB** ativada, ou use um emulador
3. Clique no botão **Run ▶** — o app instala no aparelho e abre o site

### Gerar o APK/AAB para a Google Play

```bash
cd android
./gradlew bundleRelease   # gera .aab (recomendado para a Play Store)
./gradlew assembleRelease # gera .apk (para distribuir fora da Play)
```

O arquivo sai em `android/app/build/outputs/`. Você precisará criar uma **keystore**
(assinatura) — o Android Studio tem um assistente, ou rode:

```bash
keytool -genkey -v -keystore livraria-plus.keystore -alias livrariaplus -keyalg RSA -keysize 2048 -validity 10000
```

### Publicar na Google Play
1. Pague US$ 25 (taxa única) em https://play.google.com/console
2. Crie o app → preencha ficha (nome, descrição, imagens, política de privacidade)
3. Envie o `.aab` assinado em "Produção" → "Liberação"

## Passo a passo — iOS

```bash
npx cap add ios             # exige CocoaPods instalado
npx cap sync ios
npx cap open ios            # abre no Xcode
```

No Xcode:
1. Selecione o projeto, configure o **Team** (precisa da conta Apple Developer — US$ 99/ano)
2. Ajuste o Bundle Identifier se desejar
3. Clique em **Run ▶** com um iPhone conectado ou simulador

### Publicar na App Store
1. `Product → Archive` no Xcode
2. **Distribute App** → App Store Connect → carregar
3. Preencha a ficha em https://appstoreconnect.apple.com e envie para revisão

## Dicas

- Toda mudança no site é refletida no app automaticamente (ele carrega a URL publicada) — **não precisa recompilar** o app para cada alteração
- Para push notifications, depois, adicionaríamos o plugin `@capacitor/push-notifications`
- Para funcionar offline, seria preciso gerar capas/PDFs no R2 e usar cache — não é necessário para a versão 1
- O webDir atual é o placeholder `app-web/` (o app usa `server.url`), então o `npx cap sync` não copia o build

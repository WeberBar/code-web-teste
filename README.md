# Code Web Teste (`code-web-teste`)

Simulador estático leve do Hub Web PiCode, **pipeline automático de build dos dois iframes** (`picode-palco` e `code_hub`) e **proxy de referência da API do Compilador 2.0 (`hub-code-compiler`)** para rodar localmente ou na Vercel.

## Repositórios relacionados

- **PiCode Palco (`picode-palco`)** — Editor em modo palco (sprites, animações e placas em tempo real): https://github.com/WeberBar/picode-palco
- **Code Hub (`code_hub`)** — Editor em modo upload/embarcado (C++/Arduino e MicroPython): https://github.com/WeberBar/code_hub
- **Web Teste Frame Hub (`web-teste-frame-hub`)** — Protótipo Next.js que espelha a estrutura real do `hub-web` (Pages Router + fluxo de Pastas/Projetos + S3 mocado): https://github.com/WeberBar/web-teste-frame-hub
- **Hub Code Compiler (`hub-code-compiler` — API 2.0)** — Backend da API do Compilador **2.0** (`/compilePiboard`, `/compileEsp32`, `/checkPythonSyntax`).

---

## O que este repositório faz

1. **Build unificado dos dois editores (`scripts/build-iframes.js` + `scripts/build.js`):**
   - Localiza os repositórios irmãos `../picode-palco` e `../code_hub` (ou clona em `.cache-repos/` se não existirem localmente).
   - Executa o Webpack com `BUILD_MODE=standalone` e `COMPILER_API_URL=""` / `COMPILER_API_KEY=""` (garantindo que nenhum segredo vá para o bundle do navegador).
   - Copia os builds estáticos para `public/iframes/palco/` e `public/iframes/code/` e monta a saída final em `dist/`.
2. **Simulador SPA em `<iframe>` (`public/` + `scripts/server.js`):**
   - Permite alternar rapidamente entre **Palco** e **Code Hub**, ouvindo eventos `postMessage` (`source: 'pcode-engine'`) enviados pela barra superior dos editores (`ready`, `loaded`, `exported`, `home`, `exit`, `error`).
3. **Proxy server-side da API do Compilador 2.0 (`api/` + `vercel.json`):**
   - Rotas `api/compiler.js`, `api/compilePiboard.js`, `api/compileEsp32.js` e `api/checkPythonSyntax.js` encaminham requisições `POST` (JSON ou `multipart/form-data` com bibliotecas `.zip`) para `${COMPILER_API_URL}${endpoint}` adicionando o header `X-API-KEY: ${COMPILER_API_KEY}` no servidor.
   - O `vercel.json` mapeia `/compilePiboard`, `/compileEsp32` e `/checkPythonSyntax` diretamente para essas funções serverless.

---

## Como rodar localmente

```bash
npm start
```

Acesse `http://localhost:3000`.

### Scripts disponíveis (`package.json`)

| Comando | O que faz |
| --- | --- |
| `npm start` / `npm run dev` | Compila os dois iframes (`picode-palco` e `code_hub`) e inicia o servidor local na porta `3000` (ou `PORT`) |
| `npm run serve:fast` | Inicia o servidor imediatamente com `--skip-build` usando os builds já existentes em `public/iframes/` |
| `npm run build:iframes` | Recompila apenas os builds estáticos dos dois editores para `public/iframes/{palco,code}` |
| `npm run build` | Compila os dois iframes e gera a pasta completa `dist/` pronta para deploy estático / Vercel |

### Variáveis de ambiente (`.env`)

Configure no `.env` deste repositório (em desenvolvimento local, se não existir `.env` aqui, o servidor também lê `../code_hub/.env` como fallback):

```env
# Porta opcional do servidor local (padrão: 3000)
PORT=3000

# API do Compilador 2.0 (hub-code-compiler)
COMPILER_API_URL=http://localhost:8081
COMPILER_API_KEY=seu_token_da_api_2_0
```

Na Vercel, cadastre `COMPILER_API_URL` e `COMPILER_API_KEY` nas *Environment Variables* do projeto.

---

## Integração com o `web-teste-frame-hub`

O protótipo Next.js **`web-teste-frame-hub`** pode consumir os builds gerados aqui automaticamente:

1. Gere os builds dos dois motores neste repositório:
   ```bash
   npm run build
   ```
2. No repositório irmão `web-teste-frame-hub`, execute:
   ```bash
   yarn sync:mock-s3
   ```
   O script copia os builds para `public/mock-s3/picode-engines/{palco,code}/` (priorizando `../picode-palco/build` e `../code_hub/build`, e usando `../code-web-teste/public/iframes` como fallback).

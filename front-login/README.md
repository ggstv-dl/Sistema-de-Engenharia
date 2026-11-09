# Front-end — Sistema de Engenharia (login)

## Como rodar

```bash
npm install
cp .env.example .env   # no Windows: copy .env.example .env
npm run dev
```

Abra http://localhost:5173. O back-end precisa estar rodando no endereço de `VITE_API_URL`.

## O que ajustar para casar com o back-end

Tudo fica em `src/services/authService.js`:

- `LOGIN_PATH` — rota de login (padrão `/api/auth/login`)
- `buildLoginBody` — nomes dos campos enviados (padrão `email` e `senha`)
- `extractToken` — onde vem o token na resposta (padrão `data.token`)

Se o back-end estiver em outra porta ou bloquear o front por CORS, habilite o pacote `cors` no Express.

## Estrutura

- `src/services/` — chamadas à API (reaproveitável no React Native)
- `src/hooks/` — modo de alto contraste
- `src/pages/Login.jsx` — tela de login
- `src/styles/login.css` — estilos e temas

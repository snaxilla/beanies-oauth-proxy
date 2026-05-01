# Beanies OAuth Proxy

A minimal self-hosted OAuth token proxy for [Beanies Family](https://github.com/gparker97/beanies-family).

This side-car service enables Google Drive sync for self-hosted Beanies deployments by securely handling OAuth token exchange and refresh operations.

---

## 🚀 What this does

This proxy exposes:

- `POST /oauth/google/token`
- `POST /oauth/google/refresh`

It receives requests from the Beanies frontend, securely exchanges OAuth codes with Google, and returns tokens to the client.

---

## 🧠 Why this exists

Beanies cannot safely perform OAuth token exchange directly in the browser because it requires a **client secret**.

This service keeps the client secret on the server and performs the exchange securely.

---

## ⚙️ Features

- Minimal Node.js implementation
- Docker-ready
- Exact-origin CORS enforcement
- Google redirect URI validation
- Designed for self-hosted Beanies deployments
- Works with Dokploy, Traefik, Caddy, Nginx, etc.

---

## 📦 Requirements

- Google OAuth client
- Google OAuth client secret
- Self-hosted Beanies frontend
- Public HTTPS endpoint for this service

---

## 🔐 Environment Variables

| Variable | Required | Description |
|--------|----------|------------|
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `CORS_ORIGIN` | Yes | Allowed frontend origin (your Beanies URL) |
| `PORT` | No | Defaults to `3000` |

---

## 📄 Example `.env`

```env
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=https://your-beanies-domain.com
PORT=3000
```

---

# 🧱 Quick Setup (10 minutes)

## 1. Clone the repo

```bash
git clone https://github.com/YOURUSER/beanies-oauth-proxy.git
cd beanies-oauth-proxy
```

---

## 2. Build and run with Docker

```bash
docker build -t beanies-oauth-proxy .
docker run -d \
  -p 3000:3000 \
  -e GOOGLE_CLIENT_SECRET=your-secret \
  -e CORS_ORIGIN=https://your-beanies-domain.com \
  beanies-oauth-proxy
```

---

## 3. Expose it with a domain

Example:

```
https://beanies-auth.your-domain.com
```

Point your reverse proxy to port `3000`.

---

## 4. Configure Beanies frontend

Add this environment variable to your Beanies app:

```env
VITE_OAUTH_PROXY_URL=https://beanies-auth.your-domain.com
```

Rebuild the Beanies frontend after adding it.

---

## 5. Configure Google OAuth

### Authorized JavaScript origins

```
https://your-beanies-domain.com
http://localhost:5173
```

---

### Authorized redirect URIs

```
https://your-beanies-domain.com/oauth/callback
http://localhost:5173/oauth/callback
```

---

## 🧪 Test the proxy

Open:

```
https://beanies-auth.your-domain.com/oauth/google/token
```

Expected result:

```json
{"error":"method_not_allowed"}
```

That confirms the service is running correctly.

---

# 🧭 How it works

```
Beanies frontend
        ↓
OAuth Proxy (this service)
        ↓
Google OAuth API
```

- Frontend requests token exchange
- Proxy adds client secret
- Google returns tokens
- Frontend stores them securely

---

# ⚠️ Notes

- This service does **not store any user data**
- This service does **not replace Beanies storage**
- It only handles OAuth token exchange and refresh
- Your `.beanpod` remains in your chosen storage location

---

# 🧩 Compatibility

Tested with:

- Self-hosted Beanies frontend
- Docker deployments
- Reverse proxies (Traefik, etc.)

---

# 📊 Status

Working and stable for:

- Google Drive sync
- Self-hosted deployments
- Multi-device use

---

# 📜 License

MIT

---

# 🙏 Credits

- [Beanies Family](https://github.com/gparker97/beanies-family) by Greg Parker
- This project provides a minimal self-hosted companion service

# Beanies OAuth Proxy

A minimal self-hosted OAuth token proxy for [Beanies Family](https://github.com/gparker97/beanies-family).

This side-car implements the Google OAuth token exchange and refresh endpoints needed for self-hosted Beanies deployments using Google Drive sync.

It is intended to be run as a separate lightweight service alongside a self-hosted Beanies frontend.

## What it does

This proxy exposes:

- `POST /oauth/google/token`
- `POST /oauth/google/refresh`

It accepts requests from the Beanies frontend, forwards token exchange and refresh requests to Google's OAuth endpoint, and returns the response to the client.

## Why it exists

For self-hosted Beanies setups, the frontend cannot securely exchange Google OAuth authorization codes directly because that requires the Google client secret.

This proxy keeps the client secret on the server and performs the exchange safely.

## Features

- Minimal Node.js implementation
- Docker-ready
- Exact-origin CORS support
- Google redirect URI allowlisting
- Compatible with self-hosted Beanies deployments
- Easy to run behind Dokploy, Traefik, Caddy, or Nginx

## Requirements

- A Google OAuth client
- A Google OAuth client secret
- A self-hosted Beanies frontend
- A public HTTPS endpoint for this proxy

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_SECRET` | Yes | Your Google OAuth client secret |
| `CORS_ORIGIN` | Yes | Allowed frontend origin, e.g. `https://family.theledouxs.com` |
| `PORT` | No | Server port, defaults to `3000` |

## Example `.env`

```env
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=https://yoursubdomain.yourdomain.com    (example - family.thejohnsons.com)
PORT=3000
_____________________________________________________________________________________________________________________

Beanies frontend configuration

Set the following env vars in your Beanies frontend:

VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_OAUTH_PROXY_URL=https://beanies-auth.yourdomain.com
______________________________________________________________________________
If you want Google Picker support too:

VITE_GOOGLE_API_KEY=your-google-api-key
VITE_GOOGLE_PROJECT_NUMBER=your-google-project-number
______________________________________________________________________________

Google OAuth configuration

In Google Cloud Console, configure your OAuth client with:

Authorized JavaScript origins
https://your-subdomain.yourdomain.com
http://localhost:5173

Authorized redirect URIs
https://your-subdomain.yourdomain.com/oauth/callback
http://localhost:5173/oauth/callback
______________________________________________________________________________
Run locally
docker build -t beanies-oauth-proxy .
docker run --rm -p 3000:3000 \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e CORS_ORIGIN=https://yoursubdomain.yourdomain.com \
  beanies-oauth-proxy

Deploy with Dokploy
Create a new application from this repo
Expose port 3000
Set these env vars:
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGIN=https://family.theledouxs.com
PORT=3000
______________________________________________________________________________

Attach a domain such as:
https://beanies-auth.yourdomain.com

In your Beanies frontend, set:
VITE_OAUTH_PROXY_URL=https://beanies-auth.yourdomain.com

Rebuild the Beanies frontend
______________________________________________________________________________

Health check / quick test

Open this URL in a browser:

https://beanies-auth.theledouxs.com/oauth/google/token

A working deployment should return a JSON error such as:

{"error":"method_not_allowed"}

That confirms the route exists and the proxy is running.
______________________________________________________________________________


Notes
This service does not store Beanies data
This service does not replace Beanies storage or registry features
It only handles Google OAuth code exchange and token refresh
Your .beanpod data remains wherever your Beanies setup stores it
Compatibility

This was built to support self-hosted Beanies deployments using the OAuth proxy contract documented in the upstream project.

Credits
Beanies Family
 by Greg Parker

This proxy was built as a minimal self-hosted companion service for Beanies by Snaxilla






import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

if (!GOOGLE_CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_SECRET");
  process.exit(1);
}
if (!CORS_ORIGIN) {
  console.error("Missing CORS_ORIGIN");
  process.exit(1);
}

const allowedOrigins = new Set(
  CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean),
);

const allowedRedirectUris = new Set(
  Array.from(allowedOrigins).map((origin) =>
    `${origin.replace(/\/+$/, "")}/oauth/callback`,
  ),
);

function sendJson(res, statusCode, body, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(body));
}

function sendNoContent(res, origin) {
  const headers = {};
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  res.writeHead(204, headers);
  res.end();
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function exchangeToken(body) {
  const { code, code_verifier, redirect_uri, client_id } = body;

  if (!code || !code_verifier || !redirect_uri || !client_id) {
    return {
      status: 400,
      body: { error: "invalid_request", message: "Missing required fields" },
    };
  }

  if (!allowedRedirectUris.has(redirect_uri)) {
    return {
      status: 400,
      body: { error: "invalid_request", message: "redirect_uri not allowed" },
    };
  }

  const params = new URLSearchParams({
    code,
    code_verifier,
    redirect_uri,
    client_id,
    client_secret: GOOGLE_CLIENT_SECRET,
    grant_type: "authorization_code",
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await resp.json().catch(() => ({
    error: "google_token_error",
    message: "Failed to parse Google token response",
  }));

  return { status: resp.status, body: data };
}

async function refreshToken(body) {
  const { refresh_token, client_id } = body;

  if (!refresh_token || !client_id) {
    return {
      status: 400,
      body: { error: "invalid_request", message: "Missing required fields" },
    };
  }

  const params = new URLSearchParams({
    refresh_token,
    client_id,
    client_secret: GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await resp.json().catch(() => ({
    error: "google_refresh_error",
    message: "Failed to parse Google refresh response",
  }));

  return { status: resp.status, body: data };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    return sendNoContent(res, origin);
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" }, origin);
  }

  if (origin && !allowedOrigins.has(origin)) {
    return sendJson(res, 403, { error: "forbidden_origin" }, origin);
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const body = await readJson(req);

    if (url.pathname === "/oauth/google/token") {
      const result = await exchangeToken(body);
      return sendJson(res, result.status, result.body, origin);
    }

    if (url.pathname === "/oauth/google/refresh") {
      const result = await refreshToken(body);
      return sendJson(res, result.status, result.body, origin);
    }

    return sendJson(res, 404, { error: "not_found" }, origin);
  } catch (error) {
    console.error(error);
    return sendJson(
      res,
      500,
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      origin,
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Beanies OAuth proxy listening on port ${PORT}`);
});

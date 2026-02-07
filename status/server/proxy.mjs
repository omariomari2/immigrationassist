import http from 'node:http';
import { URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const PORT = Number(process.env.DEEPSEEK_PROXY_PORT || process.env.PORT || 8787);
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const ALLOWED_ORIGIN = process.env.DEEPSEEK_PROXY_CORS_ORIGIN || '*';
const TARGET_URL = 'https://api.deepseek.com/chat/completions';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST' || url.pathname !== '/api/deepseek/chat/completions') {
    sendJson(res, 404, { error: { message: 'Not found' } });
    return;
  }

  if (!API_KEY) {
    sendJson(res, 500, { error: { message: 'DEEPSEEK_API_KEY not configured' } });
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf-8');

    if (!body) {
      sendJson(res, 400, { error: { message: 'Missing request body' } });
      return;
    }

    const upstream = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const text = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: { message: error instanceof Error ? error.message : 'Upstream error' } });
  }
});

server.listen(PORT, () => {
  console.log(`DeepSeek proxy listening on http://localhost:${PORT}`);
});

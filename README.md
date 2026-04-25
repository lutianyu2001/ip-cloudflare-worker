# ip-cloudflare-worker

A minimal Cloudflare Worker that returns your public IP address as plain text.

## Features

- Returns IPv4 or IPv6 depending on how the client connects
- TXT-record-based filtering: restrict responses to IPv4-only or IPv6-only via DNS

## Repo Structure

```
ip-worker/
├── src/
│   └── index.js         # Worker source
├── wrangler.toml        # Cloudflare config
├── package.json
└── README.md
```

## Filter

```javascript
const FILTER_DOMAIN = `_ip_filter.${new URL(req.url).hostname.split(".").slice(1).join(".")}`;
```

The worker queries `FILTER_DOMAIN` for a TXT record to decide behavior:

| TXT value | Behavior |
|-----------|----------|
| `ipv4` | Only respond to IPv4 clients, reject IPv6 with 403 |
| `ipv6` | Only respond to IPv6 clients, reject IPv4 with 403 |
| `none` | Respond to all clients (default if no TXT record exists) |

By default it queries `_ip_filter.<base_domain>`, e.g. for `ip.example.com` it checks `_ip_filter.example.com`. You can override `FILTER_DOMAIN` in `src/index.js` to point anywhere.

## How It Works

The worker reads `CF-Connecting-IP` (injected by Cloudflare) and returns it as plain text. Before responding, it queries `FILTER_DOMAIN` via Cloudflare's DNS-over-HTTPS API (`cloudflare-dns.com/dns-query`) to check the TXT record. If the client's IP version doesn't match the filter, a `403` is returned.

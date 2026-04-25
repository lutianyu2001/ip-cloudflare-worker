export default {
  async fetch(req) {
    const ip = req.headers.get("CF-Connecting-IP");
    const isIPv6 = ip.includes(":");
    const FILTER_DOMAIN = `_ip_filter.${new URL(req.url).hostname.split(".").slice(1).join(".")}`;
    const filter = await queryTXT(FILTER_DOMAIN);

    if (filter === "ipv4" && isIPv6) {
      return new Response("IPv4 only\n", { status: 403 });
    }
    if (filter === "ipv6" && !isIPv6) {
      return new Response("IPv6 only\n", { status: 403 });
    }

    return new Response(ip);
  },
};

async function queryTXT(domain) {
  const resp = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${domain}&type=TXT`,
    { headers: { Accept: "application/dns-json" } }
  );
  const data = await resp.json();
  return data.Answer?.[0]?.data?.replace(/"/g, "").trim() ?? "none";
}

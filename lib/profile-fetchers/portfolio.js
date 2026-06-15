function normalizeUrl(input) {
  const raw = (input || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

function parseUrls(text) {
  return (text || "")
    .split(/[\n,]+/)
    .map((line) => normalizeUrl(line.trim()))
    .filter(Boolean);
}

function stripHtml(html) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, "i"),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match) return match[1];
  }
  return "";
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripHtml(match[1]).slice(0, 300) : "";
}

async function fetchPageData(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CareerCoachBot/1.0; +https://career-coach.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return { url, error: `HTTP ${res.status}`, title: url };
    }

    const html = (await res.text()).slice(0, 150000);
    const title = extractMeta(html, "title") || extractTitle(html);
    const description =
      extractMeta(html, "description") ||
      extractMeta(html, "og:description");
    const h1 = extractH1(html);
    const textSnippet = stripHtml(html).slice(0, 1500);

    return {
      url,
      title,
      description,
      h1,
      textSnippet,
    };
  } catch (err) {
    return {
      url,
      error: err.name === "AbortError" ? "Request timeout" : err.message,
      title: url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchPortfolioProfile({ portfolioSiteUrl, projectUrlsText }) {
  const siteUrl = normalizeUrl(portfolioSiteUrl);
  const projectUrls = parseUrls(projectUrlsText);

  if (!siteUrl && projectUrls.length === 0) {
    throw new Error("Add your portfolio site URL or at least one deployed project link.");
  }

  const fetches = [];
  if (siteUrl) fetches.push(fetchPageData(siteUrl));
  for (const url of projectUrls.slice(0, 8)) {
    fetches.push(fetchPageData(url));
  }

  const results = await Promise.all(fetches);

  const siteData = siteUrl ? results[0] : null;
  const projectData = siteUrl ? results.slice(1) : results;

  const hero = siteData
    ? `${siteData.h1 || siteData.title || ""}\n${siteData.description || ""}`.trim()
    : "";

  const about = siteData?.textSnippet?.slice(0, 2000) || "";

  const projects = projectData
    .map((p) => {
      if (p.error) {
        return `Project URL: ${p.url}\nStatus: Could not fetch (${p.error})`;
      }
      return [
        `Project: ${p.title || p.url}`,
        `URL: ${p.url}`,
        p.description ? `Description: ${p.description}` : "",
        p.h1 ? `Headline: ${p.h1}` : "",
        p.textSnippet ? `Content excerpt: ${p.textSnippet.slice(0, 500)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  const contact = [
    siteUrl ? `Portfolio: ${siteUrl}` : "",
    ...projectUrls.map((u) => `Project: ${u}`),
  ]
    .filter(Boolean)
    .join("\n");

  const formData = {
    hero,
    about,
    projects,
    contact,
  };

  const failedCount = projectData.filter((p) => p.error).length;

  return {
    source: "portfolio",
    identifier: siteUrl || projectUrls[0],
    profileUrl: siteUrl || projectUrls[0],
    fetchedAt: new Date().toISOString(),
    fetchNote:
      failedCount > 0
        ? `${failedCount} project link(s) could not be fetched. Optimization uses available data.`
        : null,
    preview: {
      siteTitle: siteData?.title,
      projectCount: projectData.length,
      fetchedProjects: projectData.filter((p) => !p.error).length,
    },
    formData,
    rawSummary: `Portfolio — ${siteData?.title || "Projects"} | ${projectData.length} deployed link(s) analyzed`,
  };
}

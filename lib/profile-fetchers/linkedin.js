function parseLinkedInSlug(input) {
  const raw = (input || "").trim();
  if (!raw) throw new Error("LinkedIn username or profile URL is required");

  const patterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i,
    /linkedin\.com\/pub\/([a-zA-Z0-9\-_%]+)/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return decodeURIComponent(match[1]).replace(/\/$/, "");
  }

  return raw.replace(/^@/, "").replace(/\/$/, "");
}

function extractMeta(html, property) {
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return decodeHtml(match[1]);

  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    "i"
  );
  const match2 = html.match(regex2);
  return match2 ? decodeHtml(match2[1]) : "";
}

function extractJsonLdPerson(html) {
  const scripts = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  );
  if (!scripts) return null;

  for (const script of scripts) {
    try {
      const json = JSON.parse(
        script.replace(/<script type="application\/ld\+json">/i, "").replace(/<\/script>/i, "")
      );
      const items = Array.isArray(json) ? json : [json];
      const person = items.find((item) => item["@type"] === "Person");
      if (person) return person;
    } catch {
      continue;
    }
  }
  return null;
}

function decodeHtml(text) {
  return (text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function fetchLinkedInProfile(input) {
  const slug = parseLinkedInSlug(input);
  const profileUrl = `https://www.linkedin.com/in/${slug}`;

  let headline = "";
  let about = "";
  let name = "";
  let fetchNote = "";
  let fetchFailed = false;

  try {
    const res = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const html = await res.text();

      if (html.includes("authwall") || html.includes("Join LinkedIn")) {
        fetchNote =
          "LinkedIn login wall detected. Limited public data only — add your details manually below for better results.";
        fetchFailed = true;
      } else {
        const ogTitle = extractMeta(html, "og:title");
        const ogDescription = extractMeta(html, "og:description");
        const person = extractJsonLdPerson(html);

        name = person?.name || ogTitle?.split("|")[0]?.trim() || "";
        headline = person?.jobTitle || ogTitle || "";
        about = person?.description || ogDescription || "";

        if (person?.knowsAbout?.length) {
          about += `\nSkills/areas: ${person.knowsAbout.join(", ")}`;
        }
      }
    } else {
      fetchNote = `Could not fetch LinkedIn page (HTTP ${res.status}). Please add your headline, about, and experience manually below.`;
      fetchFailed = true;
    }
  } catch {
    fetchNote =
      "Could not reach LinkedIn. Please fill in your headline, about, and experience manually below for full optimization.";
    fetchFailed = true;
  }

  // If we couldn't pull any real data, keep formData empty so the user fills it in
  const formData = fetchFailed
    ? { headline: "", about: "", experience: "", skills: "" }
    : {
        headline: (headline || `LinkedIn profile: ${slug}`).slice(0, 500),
        about: about.slice(0, 4000),
        experience: `Profile URL: ${profileUrl}\n${name ? `Name: ${name}\n` : ""}Fetched public summary only.`,
        skills: "",
      };

  if (!fetchFailed && !headline && !about) {
    fetchNote =
      fetchNote ||
      "Public LinkedIn data is limited without API access. Paste additional sections below or we optimize from your resume.";
  }

  return {
    source: "linkedin",
    identifier: slug,
    profileUrl,
    fetchedAt: new Date().toISOString(),
    fetchNote,
    fetchFailed,
    preview: {
      name: name || slug,
      headline: fetchFailed ? "Manual entry required" : formData.headline,
      aboutPreview: formData.about.slice(0, 200),
    },
    formData,
    rawSummary: `LinkedIn /in/${slug} — ${formData.headline || "manual entry"}`,
  };
}

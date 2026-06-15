const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "Career-Coach-AI",
};

function cleanUsername(input) {
  const raw = (input || "").trim();
  if (!raw) throw new Error("GitHub username is required");

  const urlMatch = raw.match(/github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?)/i);
  if (urlMatch) return urlMatch[1];

  return raw.replace(/^@/, "");
}

async function githubFetch(url) {
  const res = await fetch(url, {
    headers: GITHUB_HEADERS,
    next: { revalidate: 300 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${text.slice(0, 120)}`);
  }

  return res;
}

export async function fetchGitHubProfile(input) {
  const username = cleanUsername(input);

  const userRes = await githubFetch(`https://api.github.com/users/${username}`);
  if (!userRes) throw new Error(`GitHub user "${username}" not found`);

  const user = await userRes.json();

  const reposRes = await githubFetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`
  );
  const repos = reposRes ? await reposRes.json() : [];

  let readme = "";
  try {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${username}/${username}/readme`,
      { headers: { ...GITHUB_HEADERS, Accept: "application/vnd.github.raw" } }
    );
    if (readmeRes.ok) {
      readme = (await readmeRes.text()).slice(0, 8000);
    }
  } catch {
    // No profile README repo
  }

  const topRepos = repos
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  const pinnedRepos = topRepos
    .map(
      (r) =>
        `- ${r.name}: ${r.description || "No description"} | ⭐ ${r.stargazers_count} | ${r.language || "N/A"} | ${r.html_url}`
    )
    .join("\n");

  const topProjects = topRepos
    .map((r) => {
      const topics = r.topics?.length ? `Topics: ${r.topics.join(", ")}` : "";
      return `${r.name} (${r.language || "unknown"}): ${r.description || "No description"}. ${topics} URL: ${r.html_url}`;
    })
    .join("\n\n");

  // Fallback bio: if GitHub user has no bio set, synthesize one from public profile data
  // so that buildProfileInput always has at least one non-empty field.
  const bioFallback =
    user.bio ||
    [
      user.name ? `Name: ${user.name}` : null,
      user.company ? `Company: ${user.company}` : null,
      user.location ? `Location: ${user.location}` : null,
      user.blog ? `Website: ${user.blog}` : null,
      `Public repos: ${user.public_repos}`,
      `Followers: ${user.followers}`,
    ]
      .filter(Boolean)
      .join(" | ") ||
    `GitHub profile: ${user.html_url}`;

  const formData = {
    bio: bioFallback,
    readme,
    pinnedRepos,
    topProjects,
  };

  return {
    source: "github",
    identifier: username,
    profileUrl: user.html_url,
    fetchedAt: new Date().toISOString(),
    preview: {
      name: user.name || username,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
      repoCount: repos.length,
    },
    formData,
    rawSummary: `GitHub @${username} — ${user.name || ""} | ${user.bio || ""} | ${user.public_repos} repos | ${user.followers} followers`,
  };
}

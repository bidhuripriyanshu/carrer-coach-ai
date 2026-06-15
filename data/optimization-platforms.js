export const OPTIMIZATION_PLATFORMS = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    tagline: "Enter username — we fetch & optimize your profile",
    description:
      "Paste your LinkedIn username or profile URL. We pull public profile data and AI optimizes headline, about, and keywords.",
    color: "from-blue-600/20 to-blue-400/10",
    fetch: {
      type: "username",
      label: "LinkedIn username or URL",
      placeholder: "johndoe or linkedin.com/in/johndoe",
      hint: "Example: janedoe or https://www.linkedin.com/in/janedoe",
    },
    fields: [
      { key: "headline", label: "Headline", placeholder: "Auto-filled after fetch…" },
      {
        key: "about",
        label: "About / Summary",
        placeholder: "Auto-filled after fetch…",
        multiline: true,
      },
      {
        key: "experience",
        label: "Experience (add if not fetched)",
        placeholder: "Paste roles & bullets for better optimization…",
        multiline: true,
      },
      {
        key: "skills",
        label: "Skills",
        placeholder: "e.g. JavaScript, Leadership, Product Management",
      },
    ],
  },
  github: {
    id: "github",
    name: "GitHub",
    tagline: "Enter username — we fetch repos, bio & README",
    description:
      "Enter your GitHub username. We fetch your bio, profile README, and top repositories automatically via GitHub API.",
    color: "from-zinc-600/20 to-zinc-400/10",
    fetch: {
      type: "username",
      label: "GitHub username",
      placeholder: "octocat or github.com/octocat",
      hint: "Example: torvalds or https://github.com/torvalds",
    },
    fields: [
      { key: "bio", label: "Bio", placeholder: "Auto-filled from GitHub…" },
      {
        key: "readme",
        label: "Profile README",
        placeholder: "Auto-filled from your profile repo…",
        multiline: true,
      },
      {
        key: "pinnedRepos",
        label: "Top repositories",
        placeholder: "Auto-filled from your repos…",
        multiline: true,
      },
      {
        key: "topProjects",
        label: "Projects & tech stack",
        placeholder: "Auto-filled project details…",
        multiline: true,
      },
    ],
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio / Projects",
    tagline: "Paste deployed project links — we fetch & analyze",
    description:
      "Add your portfolio site URL and deployed project links (Vercel, Netlify, etc.). We fetch each site and optimize your presentation.",
    color: "from-violet-600/20 to-violet-400/10",
    fetch: {
      type: "urls",
      siteLabel: "Portfolio / personal site URL (optional)",
      sitePlaceholder: "https://yourname.dev",
      projectsLabel: "Deployed project links (one per line)",
      projectsPlaceholder:
        "https://my-app.vercel.app\nhttps://project2.netlify.app",
      hint: "Add live demo URLs — we extract titles, descriptions, and content from each.",
    },
    fields: [
      {
        key: "hero",
        label: "Hero / intro",
        placeholder: "Auto-filled from portfolio site…",
        multiline: true,
      },
      {
        key: "about",
        label: "About section",
        placeholder: "Auto-filled from site content…",
        multiline: true,
      },
      {
        key: "projects",
        label: "Projects analyzed",
        placeholder: "Auto-filled from deployed links…",
        multiline: true,
      },
      {
        key: "contact",
        label: "Links & contact",
        placeholder: "Auto-filled URLs…",
      },
    ],
  },
};

export const PLATFORM_LIST = Object.values(OPTIMIZATION_PLATFORMS);

export function getPlatform(id) {
  return OPTIMIZATION_PLATFORMS[id] || null;
}

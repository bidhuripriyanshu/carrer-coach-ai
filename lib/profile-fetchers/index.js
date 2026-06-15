import { fetchGitHubProfile } from "./github";
import { fetchLinkedInProfile } from "./linkedin";
import { fetchPortfolioProfile } from "./portfolio";

export async function fetchProfileByPlatform(platform, options) {
  switch (platform) {
    case "github":
      return fetchGitHubProfile(options.identifier);
    case "linkedin":
      return fetchLinkedInProfile(options.identifier);
    case "portfolio":
      return fetchPortfolioProfile({
        portfolioSiteUrl: options.portfolioSiteUrl,
        projectUrlsText: options.projectUrlsText,
      });
    default:
      throw new Error("Unsupported platform");
  }
}

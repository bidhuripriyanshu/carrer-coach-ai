"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Loader2, Sparkles, ExternalLink, AlertTriangle, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  fetchProfileData,
  optimizeProfileFromSource,
  optimizeProfile,
  getProfileOptimizationById,
} from "@/actions/profile-optimize";
import OptimizeResults from "./optimize-results";
import OptimizeHistory from "./optimize-history";

export default function PlatformOptimizer({ platform, initialHistory = [] }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [portfolioSiteUrl, setPortfolioSiteUrl] = useState("");
  const [projectUrlsText, setProjectUrlsText] = useState("");
  const [formData, setFormData] = useState(
    Object.fromEntries(platform.fields.map((f) => [f.key, ""]))
  );
  const [fetchInfo, setFetchInfo] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [useResume, setUseResume] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [historyLoadingId, setHistoryLoadingId] = useState(null);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetch = async () => {
    setFetching(true);
    setFetchInfo(null);
    try {
      const fetched = await fetchProfileData({
        platform: platform.id,
        identifier,
        portfolioSiteUrl,
        projectUrlsText,
      });
      setFormData((prev) => ({ ...prev, ...fetched.formData }));
      setFetchInfo(fetched);
      // Auto-open manual fields if fetch failed so user can fill them in
      if (fetched.fetchFailed) {
        setShowManual(true);
        toast.warning("LinkedIn couldn't be reached — please fill in your details manually.", { duration: 6000 });
      } else {
        toast.success(`Fetched ${platform.name} data successfully`);
        if (fetched.fetchNote) toast.info(fetched.fetchNote, { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch profile data");
    } finally {
      setFetching(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setResult(null);
    try {
      let data;

      const hasIdentifier =
        platform.id === "portfolio"
          ? portfolioSiteUrl || projectUrlsText.trim()
          : identifier.trim();

      if (hasIdentifier && fetchInfo) {
        data = await optimizeProfileFromSource({
          platform: platform.id,
          identifier,
          portfolioSiteUrl,
          projectUrlsText,
          useResume,
          extraFormData: formData,
        });
      } else if (hasIdentifier) {
        data = await optimizeProfileFromSource({
          platform: platform.id,
          identifier,
          portfolioSiteUrl,
          projectUrlsText,
          useResume,
          extraFormData: formData,
        });
      } else {
        data = await optimizeProfile({
          platform: platform.id,
          formData,
          useResume,
        });
      }

      setResult(data);
      setSelectedId(data.id);
      if (data.fetchInfo) setFetchInfo(data.fetchInfo);
      toast.success(`${platform.name} profile optimized`);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id) => {
    if (!id) {
      setSelectedId(null);
      setResult(null);
      return;
    }
    setHistoryLoadingId(id);
    try {
      const data = await getProfileOptimizationById(id);
      setResult(data);
      setSelectedId(id);
    } catch (err) {
      toast.error(err.message || "Failed to load report");
    } finally {
      setHistoryLoadingId(null);
    }
  };

  const fetchConfig = platform.fetch;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Fetch & optimize
          </CardTitle>
          <CardDescription>{platform.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fetchConfig?.type === "username" && (
            <div className="space-y-2">
              <Label htmlFor="identifier">{fetchConfig.label}</Label>
              <Input
                id="identifier"
                placeholder={fetchConfig.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{fetchConfig.hint}</p>
            </div>
          )}

          {fetchConfig?.type === "urls" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="portfolioSite">{fetchConfig.siteLabel}</Label>
                <Input
                  id="portfolioSite"
                  placeholder={fetchConfig.sitePlaceholder}
                  value={portfolioSiteUrl}
                  onChange={(e) => setPortfolioSiteUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrls">{fetchConfig.projectsLabel}</Label>
                <Textarea
                  id="projectUrls"
                  rows={5}
                  placeholder={fetchConfig.projectsPlaceholder}
                  value={projectUrlsText}
                  onChange={(e) => setProjectUrlsText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{fetchConfig.hint}</p>
              </div>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={fetching}
            onClick={handleFetch}
          >
            {fetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Fetch profile data
          </Button>

          {fetchInfo && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">Fetched</Badge>
                {fetchInfo.profileUrl && (
                  <a
                    href={fetchInfo.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {fetchInfo.preview && (
                <div className="text-muted-foreground text-xs space-y-1">
                  {Object.entries(fetchInfo.preview).map(([k, v]) =>
                    v != null && v !== "" ? (
                      <p key={k}>
                        <span className="font-medium capitalize">{k}:</span> {String(v)}
                      </p>
                    ) : null
                  )}
                </div>
              )}
              {fetchInfo.fetchNote && (
                fetchInfo.fetchFailed ? (
                  <div className="mt-2 rounded-md border border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Manual entry required
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">{fetchInfo.fetchNote}</p>
                    <p className="text-xs text-muted-foreground">Fill in the fields below and click <strong>Fetch &amp; optimize</strong> to continue.</p>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {fetchInfo.fetchNote}
                  </p>
                )
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <PencilLine className="h-3.5 w-3.5" />
            {showManual ? "Hide" : "Show"} manual edit / add more details
          </button>

          {showManual && (
            <div className="space-y-4 pt-2 border-t">
              {platform.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea
                      id={field.key}
                      rows={3}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={useResume}
              onChange={(e) => setUseResume(e.target.checked)}
              className="rounded"
            />
            Include saved resume for better suggestions
          </label>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            className="w-full gap-2"
            disabled={loading || fetching}
            onClick={handleOptimize}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Fetch & optimize {platform.name}
          </Button>
        </CardFooter>
      </Card>

      <div className="min-w-0">
        {result ? (
          <div className="overflow-y-auto max-h-[calc(100vh-10rem)] pr-1">
            <OptimizeResults result={result} platformName={platform.name} />
          </div>
        ) : (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex min-h-[320px] items-center justify-center text-center p-8">
              <p className="text-sm text-muted-foreground">
                Enter your {platform.id === "portfolio" ? "project links" : "username"},
                fetch data, then optimize to see scores and AI suggestions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <OptimizeHistory
        history={initialHistory}
        selectedId={selectedId}
        loadingId={historyLoadingId}
        onSelect={handleSelectHistory}
      />
    </div>
  );
}

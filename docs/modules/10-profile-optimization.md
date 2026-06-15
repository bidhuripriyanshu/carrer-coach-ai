# Module 10 — Profile Optimization

## Purpose

AI-powered optimization for professional profiles on LinkedIn, GitHub, and personal portfolio sites. Users paste profile content, get scores, rewritten copy, keywords, and action items.

## Routes

| Route | Description |
|-------|-------------|
| `/profile-optimize` | Platform hub (LinkedIn, GitHub, Portfolio) |
| `/profile-optimize/linkedin` | LinkedIn optimizer |
| `/profile-optimize/github` | GitHub optimizer |
| `/profile-optimize/portfolio` | Portfolio optimizer |

## Data Model

```prisma
model ProfileOptimization {
  id           String
  userId       String
  platform     String   // linkedin | github | portfolio
  profileLabel String?
  overallScore Float    // 0-100
  result       Json     // sections, keywords, actionItems
  createdAt    DateTime
}
```

## Server Actions (`actions/profile-optimize.js`)

| Function | Description |
|----------|-------------|
| `optimizeProfile({ platform, formData, useResume })` | AI analyze + save |
| `getProfileOptimizationHistory(platform?)` | List history |
| `getProfileOptimizationById(id)` | Full report |
| `deleteProfileOptimization(id)` | Delete report |

## Result JSON Shape

```json
{
  "overallScore": 78,
  "summary": "Overall assessment",
  "sections": [
    {
      "name": "Headline",
      "score": 80,
      "current": "Current state note",
      "suggested": "Improved copy",
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "actionItems": ["action 1", "action 2"]
}
```

## Future Enhancements

- [ ] Import from LinkedIn/GitHub URL (scraping or API)
- [ ] Side-by-side before/after preview
- [ ] Export optimized copy as PDF
- [ ] Twitter/X and LeetCode profile types
- [ ] Compare score progress over time per platform

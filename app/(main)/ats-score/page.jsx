import { getAtsAnalysisHistory } from "@/actions/ats-score";
import AtsScoreView from "./_components/ats-score-view";

export default async function AtsScorePage() {
  let history = [];

  try {
    history = await getAtsAnalysisHistory();
  } catch {
    history = [];
  }

  return <AtsScoreView initialHistory={history} />;
}

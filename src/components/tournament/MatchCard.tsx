import { Clock, Check, Swords, Timer, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MatchWithManagers } from "@/types/tournament.types";

interface MatchCarProps {
  match: MatchWithManagers;
  canEdit: boolean;
  onLogScore: () => void;
}

const DECIDED_BY_LABELS = {
  NORMAL: "",
  EXTRA_TIME: "AET",
  PENALTIES: "PEN",
};

export function MatchCard({ match, canEdit, onLogScore }: MatchCarProps) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";

  const homeName = match.home_manager?.team_name ?? "TBD";
  const awayName = match.away_manager?.team_name ?? "TBD";
  const homeScore = match.home_score;
  const awayScore = match.away_score;

  const winnerId = match.winner_id;
  const homeWon = winnerId === match.home_manager_id;
  const awayWon = winnerId === match.away_manager_id;

  return (
    <div
      className={`
      bg-slate-800 rounded-lg border p-4 transition-colors
      ${isLive ? "border-green-500 bg-green-500/5" : "border-slate-700"}
    `}
    >
      <div className="flex items-center">
        <div
          className={`flex-1 text-right pr-4 ${homeWon ? "text-white" : "text-slate-300"}`}
        >
          <p className={`font-medium ${homeWon ? "font-bold" : ""}`}>
            {homeName}
          </p>
          {match.home_manager?.profile?.display_name && (
            <p className="text-xs text-slate-500">
              {match.home_manager.profile.display_name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 px-4">
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <span
                className={`
                text-2xl font-bold tabular-nums
                ${homeWon ? "text-white" : "text-slate-400"}
              `}
              >
                {homeScore}
              </span>
              <span className="text-slate-600">-</span>
              <span
                className={`
                text-2xl font-bold tabular-nums
                ${awayWon ? "text-white" : "text-slate-400"}
              `}
              >
                {awayScore}
              </span>
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {homeScore ?? 0}
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-2xl font-bold text-white tabular-nums">
                {awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">vs</span>
            </div>
          )}
        </div>

        <div
          className={`flex-1 pl-4 ${awayWon ? "text-white" : "text-slate-300"}`}
        >
          <p className={`font-medium ${awayWon ? "font-bold" : ""}`}>
            {awayName}
          </p>
          {match.away_manager?.profile?.display_name && (
            <p className="text-xs text-slate-500">
              {match.away_manager.profile.display_name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {match.group_number && (
            <span className="px-2 py-0.5 bg-slate-700 rounded">
              Group {match.group_number}
            </span>
          )}
          {match.knockout_round && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
              {match.knockout_round.replace(/_/g, " ")}
            </span>
          )}
          {match.decided_by && match.decided_by !== "NORMAL" && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
              {DECIDED_BY_LABELS[match.decided_by]}
            </span>
          )}
          {match.played_at && (
            <span>{new Date(match.played_at).toLocaleDateString()}</span>
          )}
        </div>

        {canEdit &&
          !isCompleted &&
          match.home_manager_id &&
          match.away_manager_id && (
            <Button size="sm" variant="outline" onClick={onLogScore}>
              <Swords className="w-3 h-3 mr-1" />
              Log Score
            </Button>
          )}
      </div>
    </div>
  );
}

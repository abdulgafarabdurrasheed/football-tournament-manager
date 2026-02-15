import { useMemo } from "react";
import type {
  MatchWithManagers,
  TournamentManager,
  Tournament,
} from "@/types/tournament.types";

interface BracketTabProps {
  matches: MatchWithManagers[];
  managers: TournamentManager[];
  tournament: Tournament;
}

interface BracketMatch {
  match: MatchWithManagers;
  roundIndex: number;
  position: number;
}

export function BracketTab({ matches, managers, tournament }: BracketTabProps) {
  const knockoutMatches = useMemo(() => {
    return matches
      .filter(
        (m) =>
          m.match_type === "KNOCKOUT" ||
          m.match_type === "FINAL" ||
          m.match_type === "THIRD_PLACE",
      )
      .sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return (a.bracket_position ?? 0) - (b.bracket_position ?? 0);
      });
  }, [matches]);

  const rounds = useMemo(() => {
    const grouped = new Map<number, MatchWithManagers[]>();

    knockoutMatches.forEach((match) => {
      if (match.match_type === "THIRD_PLACE") return;
      const round = match.round;
      if (!grouped.has(round)) grouped.set(round, []);
      grouped.get(round)!.push(match);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([round, roundMatches]) => roundMatches);
  }, [knockoutMatches]);

  const thirdPlaceMatch = knockoutMatches.find(
    (m) => m.match_type === "THIRD_PLACE",
  );

  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">
          Brackets will appear when Knockout stage Begins
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {rounds.map((roundMatches, roundIndex) => {
          const roundName = getRoundName(roundMatches[0]);

          return (
            <div key={roundIndex} className="flex flex-col">
              <h4 className="text-sm font-medium text-slate-400 text-center mb-4 whitespace-nowrap">
                {roundName}
              </h4>

              <div
                className="flex flex-col justify-around flex-1 gap-4"
                style={{
                  paddingTop:
                    roundIndex > 0 ? `${Math.pow(2, roundIndex) * 16}px` : 0,
                }}
              >
                {roundMatches.map((match) => (
                  <BracketMatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {thirdPlaceMatch && (
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3">
            3rd Place Match
          </h4>
          <BracketMatchCard match={thirdPlaceMatch} />
        </div>
      )}
    </div>
  );
}

function BracketMatchCard({ match }: { match: MatchWithManagers }) {
  const isCompleted = match.status === "COMPLETED";
  const isFinal = match.match_type === "FINAL";

  const homeName = match.home_manager?.team_name ?? "TBD";
  const awayName = match.away_manager?.team_name ?? "TBD";

  const homeWon = match.winner_id === match.home_manager_id;
  const awayWon = match.winner_id === match.away_manager_id;

  return (
    <div
      className={`
      w-52 rounded-lg border overflow-hidden
      ${isFinal ? "border-yellow-500/50 bg-yellow-500/5" : "border-slate-700 bg-slate-800"}
    `}
    >
      <div
        className={`
        flex items-center justify-between px-3 py-2 border-b border-slate-700
        ${homeWon ? "bg-green-500/10" : ""}
      `}
      >
        <span
          className={`text-sm truncate ${
            !match.home_manager_id
              ? "text-slate-500 italic"
              : homeWon
                ? "text-white font-bold"
                : "text-slate-300"
          }`}
        >
          {homeName}
        </span>
        {isCompleted && (
          <span
            className={`text-sm font-bold ml-2 ${homeWon ? "text-white" : "text-slate-500"}`}
          >
            {match.home_score}
          </span>
        )}
      </div>

      <div
        className={`
        flex items-center justify-between px-3 py-2
        ${awayWon ? "bg-green-500/10" : ""}
      `}
      >
        <span
          className={`text-sm truncate ${
            !match.away_manager_id
              ? "text-slate-500 italic"
              : awayWon
                ? "text-white font-bold"
                : "text-slate-300"
          }`}
        >
          {awayName}
        </span>
        {isCompleted && (
          <span
            className={`text-sm font-bold ml-2 ${awayWon ? "text-white" : "text-slate-500"}`}
          >
            {match.away_score}
          </span>
        )}
      </div>

      {match.decided_by && match.decided_by !== "NORMAL" && (
        <div className="px-3 py-1 bg-slate-900 text-center">
          <span className="text-[10px] text-yellow-400 font-medium">
            {match.decided_by === "EXTRA_TIME" ? "AET" : "PENS"}
          </span>
        </div>
      )}
    </div>
  );
}

function getRoundName(match: MatchWithManagers): string {
  const labels: Record<string, string> = {
    ROUND_OF_64: "Round of 64",
    ROUND_OF_32: "Round of 32",
    ROUND_OF_16: "Round of 16",
    QUARTER_FINAL: "Quarter Finals",
    SEMI_FINAL: "Semi Finals",
    FINAL: "Final",
  };
  return labels[match.knockout_round ?? ""] ?? `Round ${match.round}`;
}
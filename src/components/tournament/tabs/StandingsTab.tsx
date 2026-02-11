import { useMemo } from "react";
import {
  calculateStandings,
  calculateGroupStandings,
  getFormGuide,
} from "@/utils/analytics";
import type {
  MatchWithManagers,
  TournamentManager,
  Tournament,
} from "@/types/tournament.types";

interface StandingsTabProps {
  matches: MatchWithManagers[];
  managers: TournamentManager[];
  tournament: Tournament;
}

export function StandingsTab({
  matches,
  managers,
  tournament,
}: StandingsTabProps) {
  const settings = tournament.settings as any;
  const pointsForWin = settings?.pointsForWin ?? 3;
  const pointsForDraw = settings?.pointsForDraw ?? 1;

  const isGroupFormat = tournament.format === "HYBRID_MULTI_GROUP";

  const standings = useMemo(() => {
    if (isGroupFormat) {
      return calculateGroupStandings(
        managers,
        matches,
        pointsForWin,
        pointsForDraw,
      );
    }
    return new Map([
      [0, calculateStandings(managers, matches, pointsForWin, pointsForDraw)],
    ]);
  }, [managers, matches, pointsForWin, pointsForDraw, isGroupFormat]);

  if (matches.filter((m) => m.status === "COMPLETED").length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No matches have been completed yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {Array.from(standings.entries()).map(([groupNumber, groupStandings]) => (
        <div key={groupNumber}>
          {isGroupFormat && (
            <h3 className="text-lg font-semibold text-white mb-4">
              Group {groupNumber}
            </h3>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 px-2 w-8">#</th>
                  <th className="text-left py-3 px-2">Team</th>
                  <th className="text-center py-3 px-2 w-10">P</th>
                  <th className="text-center py-3 px-2 w-10">W</th>
                  <th className="text-center py-3 px-2 w-10">D</th>
                  <th className="text-center py-3 px-2 w-10">L</th>
                  <th className="text-center py-3 px-2 w-12">GF</th>
                  <th className="text-center py-3 px-2 w-12">GA</th>
                  <th className="text-center py-3 px-2 w-12">GD</th>
                  <th className="text-center py-3 px-2 w-12 font-bold">Pts</th>
                  <th className="text-center py-3 px-2 w-24">Form</th>
                </tr>
              </thead>
              <tbody>
                {groupStandings.map((entry, index) => {
                  const form = getFormGuide(entry.manager.id, matches, 5);
                  const isQualifying =
                    isGroupFormat && index < (settings?.teamsAdvancing ?? 2);

                  return (
                    <tr
                      key={entry.manager.id}
                      className={`
                        border-b border-slate-800 hover:bg-slate-800/50 transition-colors
                        ${isQualifying ? "bg-green-500/5" : ""}
                      `}
                    >
                      <td className="py-3 px-2">
                        <span
                          className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${
                            index === 0
                              ? "bg-yellow-500 text-slate-900"
                              : index === 1
                                ? "bg-slate-500 text-white"
                                : index === 2
                                  ? "bg-amber-700 text-white"
                                  : "text-slate-400"
                          }
                        `}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-white">
                          {entry.manager.team_name}
                        </p>
                      </td>
                      <td className="text-center py-3 px-2 text-slate-300">
                        {entry.played}
                      </td>
                      <td className="text-center py-3 px-2 text-green-400">
                        {entry.won}
                      </td>
                      <td className="text-center py-3 px-2 text-slate-400">
                        {entry.drawn}
                      </td>
                      <td className="text-center py-3 px-2 text-red-400">
                        {entry.lost}
                      </td>
                      <td className="text-center py-3 px-2 text-slate-300">
                        {entry.goalsFor}
                      </td>
                      <td className="text-center py-3 px-2 text-slate-300">
                        {entry.goalsAgainst}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span
                          className={
                            entry.goalDifference > 0
                              ? "text-green-400"
                              : entry.goalDifference < 0
                                ? "text-red-400"
                                : "text-slate-400"
                          }
                        >
                          {entry.goalDifference > 0 ? "+" : ""}
                          {entry.goalDifference}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 font-bold text-white">
                        {entry.points}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-1">
                          {form.map((result, i) => (
                            <span
                              key={i}
                              className={`
                                w-5 h-5 rounded-full flex items-center justify-center 
                                text-[10px] font-bold text-white
                                ${
                                  result === "W"
                                    ? "bg-green-500"
                                    : result === "D"
                                      ? "bg-slate-500"
                                      : "bg-red-500"
                                }
                              `}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isGroupFormat && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <div className="w-3 h-3 bg-green-500/20 border border-green-500/40 rounded" />
              <span>Qualifies for knockout stage</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Trophy, Shield, Target, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryClient";
import {
  getTournamentStats,
  getTopAssists,
  getTopScorers,
} from "@/utils/analytics";
import type {
  MatchWithManagers,
  TournamentManager,
} from "@/types/tournament.types";

interface StatsTabProps {
  matches: MatchWithManagers[];
  managers: TournamentManager[];
  tournamentId: string;
}

export function StatsTab({ matches, managers, tournamentId }: StatsTabProps) {
  const { data: playerStats } = useQuery({
    queryKey: queryKeys.playerStats.tournament(tournamentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_stats")
        .select("*")
        .eq("tournament_id", tournamentId);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60,
  });

  const stats = useMemo(
    () => getTournamentStats(matches, managers),
    [matches, managers],
  );

  const topScorers = useMemo(
    () => (playerStats ? getTopScorers(playerStats, managers) : []),
    [playerStats, managers],
  );

  const topAssists = useMemo(
    () => (playerStats ? getTopAssists(playerStats, managers) : []),
    [playerStats, managers],
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-5 h-5 text-yellow-500" />}
          label="Matches Played"
          value={stats.completedMatches}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-green-500" />}
          label="Total Goals"
          value={stats.totalGoals}
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
          label="Avg Goals/Match"
          value={stats.avgGoalsPerMatch.toFixed(1)}
        />
        <StatCard
          icon={<Shield className="w-5 h-5 text-purple-500" />}
          label="Remaining"
          value={stats.pendingMatches}
        />
      </div>

      {stats.highestScoringMatch && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            🔥 Highest Scoring Match
          </h3>
          <p className="text-white font-medium">
            {
              managers.find(
                (m) => m.id === stats.highestScoringMatch!.home_manager_id,
              )?.team_name
            }{" "}
            <span className="text-yellow-500">
              {stats.highestScoringMatch.home_score}
            </span>
            {" - "}
            <span className="text-yellow-500">
              {stats.highestScoringMatch.away_score}
            </span>{" "}
            {
              managers.find(
                (m) => m.id === stats.highestScoringMatch!.away_manager_id,
              )?.team_name
            }
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-500" />
            Top Scorers
          </h3>
          {topScorers.length > 0 ? (
            <div className="space-y-2">
              {topScorers.map((scorer, index) => (
                <div
                  key={`${scorer.managerId}-${scorer.playerName}`}
                  className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${
                        index === 0
                          ? "bg-yellow-500 text-slate-900"
                          : index === 1
                            ? "bg-slate-400 text-slate-900"
                            : index === 2
                              ? "bg-amber-700 text-white"
                              : "bg-slate-700 text-slate-400"
                      }
                    `}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {scorer.playerName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {scorer.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-500">
                    {scorer.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No player stats recorded yet
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            Top Assists
          </h3>
          {topAssists.length > 0 ? (
            <div className="space-y-2">
              {topAssists.map((assist, index) => (
                <div
                  key={`${assist.managerId}-${assist.playerName}`}
                  className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${
                        index === 0
                          ? "bg-blue-500 text-white"
                          : index === 1
                            ? "bg-slate-400 text-slate-900"
                            : index === 2
                              ? "bg-amber-700 text-white"
                              : "bg-slate-700 text-slate-400"
                      }
                    `}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {assist.playerName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {assist.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-500">
                    {assist.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No player stats recorded yet
            </p>
          )}
        </div>
      </div>

      {stats.cleanSheets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Clean Sheets
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.cleanSheets.slice(0, 5).map((cs) => {
              const manager = managers.find((m) => m.id === cs.managerId);
              return (
                <div
                  key={cs.managerId}
                  className="bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-white font-medium">
                    {manager?.team_name}
                  </span>
                  <span className="text-green-500 font-bold">{cs.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScoreModal } from "@/stores/tournamentStore";
import { MatchCard } from "@/components/tournament/MatchCard";
import { Button } from "@/components/ui/Button";
import type {
  MatchWithManagers,
  TournamentManager,
  Tournament,
} from "@/types/tournament.types";

interface FixturesTabProps {
  matches: MatchWithManagers[];
  managers: TournamentManager[];
  tournament: Tournament;
  isAdmin: boolean;
}

export function FixturesTab({
  matches,
  managers,
  tournament,
  isAdmin,
}: FixturesTabProps) {
  const rounds = useMemo(() => {
    const grouped = new Map<number, MatchWithManagers[]>();

    matches.forEach((match) => {
      const round = match.round;
      if (!grouped.has(round)) grouped.set(round, []);
      grouped.get(round)!.push(match);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([round, roundMatches]) => ({
        round,
        matches: roundMatches,
        label: getRoundLabel(round, roundMatches[0], tournament.format),
        completedCount: roundMatches.filter((m) => m.status === "COMPLETED")
          .length,
        totalCount: roundMatches.length,
      }));
  }, [matches, tournament.format]);

  const firstIncompleteRound = rounds.findIndex(
    (r) => r.completedCount < r.totalCount,
  );
  const [currentRoundIndex, setCurrentRoundIndex] = useState(
    firstIncompleteRound >= 0 ? firstIncompleteRound : 0,
  );
  const currentRound = rounds[currentRoundIndex];
  const { open: openScoreModal } = useScoreModal();

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          No matches available
        </h3>
        <p className="text-slate-400">
          There are currently no matches scheduled for this tournament. Fixtures
          will appear here once the tournament begins.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentRoundIndex((i) => Math.max(0, i - 1))}
          disabled={currentRoundIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {currentRound?.label ?? `Round ${currentRoundIndex + 1}`}
          </h3>
          <p className="text-sm text-slate-400">
            {currentRound?.completedCount}/{currentRound?.totalCount} matches
            completed
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setCurrentRoundIndex((i) => Math.min(rounds.length - 1, i + 1))
          }
          disabled={currentRoundIndex === rounds.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-1.5 mb-6">
        {rounds.map((round, index) => (
          <button
            key={round.round}
            onClick={() => setCurrentRoundIndex(index)}
            className={`
              w-2.5 h-2.5 rounded-full transition-colors
              ${
                index === currentRoundIndex
                  ? "bg-yellow-500"
                  : round.completedCount === round.totalCount
                    ? "bg-green-500"
                    : "bg-slate-600"
              }
            `}
            title={`Round ${round.round}: ${round.completedCount}/${round.totalCount}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoundIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {currentRound?.matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              canEdit={isAdmin && match.status !== "COMPLETED"}
              onLogScore={() => openScoreModal(match.id)}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getRoundLabel(
  round: number,
  sampleMatch: MatchWithManagers,
  format: string,
): string {
  if (sampleMatch.knockout_round) {
    const labels: Record<string, string> = {
      ROUND_OF_64: "Round of 64",
      ROUND_OF_32: "Round of 32",
      ROUND_OF_16: "Round of 16",
      QUARTER_FINAL: "Quarter Finals",
      SEMI_FINAL: "Semi Finals",
      THIRD_PLACE: "3rd Place",
      FINAL: "Final",
    };
    return labels[sampleMatch.knockout_round] || `Round ${round}`;
  }

  if (sampleMatch.group_number && format.includes("HYBRID")) {
    return `Group Stage - Matchday ${round}`;
  }

  if (sampleMatch.leg === 2) {
    return `Round ${round} (2nd Leg)`;
  }

  return `Round ${round}`;
}

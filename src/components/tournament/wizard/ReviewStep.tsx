import { useFormContext } from "react-hook-form";
import { Check, Users, Trophy, Settings } from "lucide-react";
import type { CreateTournamentFormData } from "@/schemas/tournament.schema";

export function ReviewStep() {
  const { getValues } = useFormContext<CreateTournamentFormData>();
  const values = getValues();

  const formatLabels = {
    LEAGUE: "League (Round Robin)",
    KNOCKOUT: "Knockout (Single Elimination)",
    HYBRID_MULTI_GROUP: "Groups + Knockout",
    HYBRID_SINGLE_LEAGUE: "League + Playoffs",
  };

  const visibilityLabels = {
    PUBLIC: "Public",
    PRIVATE: "Private",
    INVITE_ONLY: "Invite Only",
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">Tournament Details</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Name</dt>
                <dd className="text-white">{values.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Visibility</dt>
                <dd className="text-white">
                  {visibilityLabels[values.visibility]}
                </dd>
              </div>
              {values.description && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Description</dt>
                  <dd className="text-white truncate max-w-[200px]">
                    {values.description}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">Format</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Type</dt>
                <dd className="text-white">{formatLabels[values.format]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Max Participants</dt>
                <dd className="text-white">{values.maxParticipants} teams</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">Settings</h3>
            <dl className="mt-2 space-y-1 text-sm">
              {(values.format === "LEAGUE" ||
                values.format.startsWith("HYBRID")) && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Points for Win</dt>
                    <dd className="text-white">{values.pointsForWin}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Points for Draw</dt>
                    <dd className="text-white">{values.pointsForDraw}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-400">Match Format</dt>
                <dd className="text-white">
                  {values.legsPerMatch === 1 ? "Single Leg" : "Home & Away"}
                </dd>
              </div>
              {values.format === "HYBRID_MULTI_GROUP" && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Group Size</dt>
                    <dd className="text-white">{values.groupSize} teams</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Advancing</dt>
                    <dd className="text-white">Top {values.teamsAdvancing}</dd>
                  </div>
                </>
              )}
              {(values.format === "KNOCKOUT" ||
                values.format.startsWith("HYBRID")) && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">3rd Place Match</dt>
                  <dd className="text-white">
                    {values.hasThirdPlace ? "Yes" : "No"}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <Check className="w-5 h-5 text-green-500" />
        <p className="text-green-400 text-sm">
          Everything looks good! Click "Create Tournament" to proceed.
        </p>
      </div>
    </div>
  );
}


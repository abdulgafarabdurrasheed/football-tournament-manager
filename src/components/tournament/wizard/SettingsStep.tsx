import { useFormContext } from "react-hook-form";
import type { CreateTournamentFormData } from "@/schemas/tournament.schema";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export function SettingsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTournamentFormData>();
  const format = watch("format");
  const legsPerMatch = watch("legsPerMatch");
  const hasThirdPlace = watch("hasThirdPlace");

  const showGroupSettings =
    format === "HYBRID_MULTI_GROUP" || format === "HYBRID_SINGLE_LEAGUE";
  const showKnockoutSettings =
    format === "KNOCKOUT" || format.startsWith("HYBRID");

  return (
    <div className="space-y-6">
      {(format === "LEAGUE" || showGroupSettings) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Points System</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pointsForWin">Points for Win</Label>
              <Input
                {...register("pointsForDraw", { valueAsNumber: true })}
                id="pointsForWin"
                type="number"
                min={0}
                max={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsForDraw">Points For Draw</Label>
              <Input
                {...register("pointsForDraw", { valueAsNumber: true })}
                id="pointsForDraw"
                type="number"
                min={0}
                max={10}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Match Format</h3>
        <div className="space-y-2">
          <Label>Legs per Match</Label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setValue("legsPerMatch", 1)}
              className={`
                                flex-1 py-3 rounded-lg border-2 font-medium transition-colors
                                ${
                                  legsPerMatch === 1
                                    ? "border-yellow-500 bg-yellow-500/10 text-white"
                                    : "border-slate-600 text-slate-400 hover:border-slate-500"
                                }
                            `}
            >
              {" "}
              Single Leg{" "}
            </button>
            <button
              type="button"
              onClick={() => setValue("legsPerMatch", 2)}
              className={`
                                flex-1 py-3 rounded-lg border-2 font-medium transition-colors
                                ${
                                  legsPerMatch === 2
                                    ? "border-yellow-500 bg-yellow-500/10 text-white"
                                    : "border-slate-600 text-slate-400 hover:border-slate-500"
                                }
                            `}
            >
              Home & Away
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {legsPerMatch === 1
              ? "Each matchup is played once"
              : "Each matchup is played twice (home and away)"}
          </p>
        </div>
      </div>

      {format === "HYBRID_MULTI_GROUP" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Group Stage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="groupSize">Teams per Group</Label>
              <Input
                {...register("groupSize", { valueAsNumber: true })}
                id="groupSize"
                type="number"
                min={3}
                max={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamsAdvancing">Teams Advancing</Label>
              <Input
                {...register("teamsAdvancing", { valueAsNumber: true })}
                id="teamsAdvancing"
                type="number"
                min={1}
                max={4}
              />
            </div>
          </div>
        </div>
      )}

      {format === "HYBRID_SINGLE_LEAGUE" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            Playoff Qualification
          </h3>
          <div className="space-y-2">
            <Label htmlFor="teamsAdvancing">Teams Advancing to Playoffs</Label>
            <Input
              {...register("teamsAdvancing", { valueAsNumber: true })}
              id="teamsAdvancing"
              type="number"
              min={2}
              max={16}
            />
            <p className="text-sm text-slate-400">
              Top teams from the league phase advance to knockout playoffs
            </p>
          </div>
        </div>
      )}

      {showKnockoutSettings && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium-text-white">Knockout Stage</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setValue("hasThirdPlace", !hasThirdPlace)}
              className={`
                            w-12 h-6 rounded-full transition-colors relative
                            ${hasThirdPlace ? "bg-yellow-500" : "bg-slate-600"}
                        `}
            >
              <span
                className={`
                                absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hasThirdPlace ? "left-7" : "left-1"}
                            `}
              />
            </button>
            <Label
              className="cursor-pointer"
              onClick={() => setValue("hasThirdPlace", !hasThirdPlace)}
            >
              Include 3rd Place Match
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
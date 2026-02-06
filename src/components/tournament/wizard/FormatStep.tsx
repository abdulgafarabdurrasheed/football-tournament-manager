import { useFormContext } from "react-hook-form";
import { Trophy, GitBranch, Layers, Table } from "lucide-react";
import type { CreateTournamentFormData } from "@/schemas/tournament.schema";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/label";

const FORMAT_OPTIONS = [
  {
    value: "LEAGUE",
    label: "League",
    icon: Table,
    description: "Round-robin, everyone plays everyone. Best for 4-12 teams.",
    example: "Like Premier League",
  },
  {
    value: "KNOCKOUT",
    label: "Knockout",
    icon: GitBranch,
    description: "Single elimination bracket. Quick and exciting.",
    example: "Like FA Cup",
  },
  {
    value: "HYBRID_MULTI_GROUP",
    label: "Groups + Knockout",
    icon: Layers,
    description: "Group stage, then knockout. Best for 8-32 teams.",
    example: "Like Champions League",
  },
  {
    value: "HYBRID_SINGLE_LEAGUE",
    label: "League + Knockout",
    icon: Trophy,
    description: "One big league, top teams go to playoffs.",
    example: "Like Conference League",
  },
];

export function FormatStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTournamentFormData>();
  const format = watch("format");

  const getParticipantRange = (format: string) => {
    switch (format) {
      case "LEAGUE":
        return { min: 4, max: 20, recommended: 8 };
      case "KNOCKOUT":
        return { min: 4, max: 64, recommended: 8 };
      case "HYBRID_MULTI_GROUP":
        return { min: 8, max: 32, recommended: 16 };
      case "HYBRID_SINGLE_LEAGUE":
        return { min: 8, max: 24, recommended: 16 };

      default:
        return { min: 4, max: 64, recommended: 8 };
    }
  };

  const range = getParticipantRange(format);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Tournament Format *</Label>
        <div className="grid gap-3">
          {FORMAT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = format === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setValue("format", option.value as any);

                  const newRange = getParticipantRange(option.value);
                  setValue("maxParticipants", newRange.recommended);
                }}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-colors duration-200 ${isSelected ? "border-yellow-500 bg-yellow-500/10" : "border-slate-600 hover:border-slate-500"}`}
              >
                <Icon
                  className={`w-6 h-6 mt-0.5 ${isSelected ? "text-yellow-500" : "text-slate-400"}`}
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${isSelected ? "text-white" : "text-slate-300"}`}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {option.example}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Maximum Participants *</Label>
        <Input
          {...register("maxParticipants", { valueAsNumber: true })}
          id="maxParticipants"
          type="number"
          min={range.min}
          max={range.max}
          className={errors.maxParticipants ? "border-red-500" : ""}
        />
        <p className="text-sm text-slate-400">
          Recommended for {format.replace("_", " ").toLowerCase()}: {range.min}-
          {range.max} teams
        </p>
        {errors.maxParticipants && (
          <p className="text-red-400 text-sm">
            {errors.maxParticipants.message}
          </p>
        )}
      </div>
    </div>
  );
}

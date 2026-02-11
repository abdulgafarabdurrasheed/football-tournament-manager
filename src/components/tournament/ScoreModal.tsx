import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useScoreModal } from "@/stores/tournamentStore";
import {
  matchScoreSchema,
  knockoutScoreSchema,
  type MatchScoreData,
  type KnockoutScoreData,
} from "@/schemas/tournament.schema";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export function ScoreModal() {
  const { isOpen, matchId, close } = useScoreModal();
  const { data: match, isLoading } = useMatch(isOpen ? matchId : null);
  const logScore = useLogScore();

  const isKnockout =
    match?.match_type === "KNOCKOUT" ||
    match?.match_type === "FINAL" ||
    match?.match_type === "THIRD_PLACE";

  const schema = isKnockout ? knockoutScoreSchema : matchScoreSchema;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MatchScoreData | KnockoutScoreData>({
    resolver: zodResolver(schema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
    },
  });

  useEffect(() => {
    if (match) {
      reset({
        homeScore: match.home_score ?? 0,
        awayScore: match.away_score ?? 0,
      });
    }
  }, [match, reset]);

  const onSubmit = async (data: MatchScoreData | KnockoutScoreData) => {
    if (!matchId) return;

    try {
      await logScore.mutateAsync({
        matchId,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        decidedBy: "decidedBy" in data ? data.decidedBy : "NORMAL",
      });

      toast.success("Score logged successfully");
      close();
    } catch (err: any) {
      toast.error(err.message || "An error occurred, Failed to save Score");
    }
  };

  if (!isOpen) return null;

  const homeName = match?.home_manager?.team_name ?? "Home";
  const awayName = match?.away_manager?.team_name ?? "Away";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-white">Log Score</h2>
                </div>
                <button
                  onClick={close}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 text-center">
                      <p className="text-sm font-medium text-slate-300 mb-2 truncate">
                        {homeName}
                      </p>
                      <Input
                        {...register("homeScore", { valueAsNumber: true })}
                        type="number"
                        min={0}
                        max={99}
                        className="text-center text-3xl font-bold h-16"
                      />
                      {errors.homeScore && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.homeScore.message}
                        </p>
                      )}
                    </div>

                    <span className="text-2xl text-slate-500 font-bold mt-6">
                      –
                    </span>

                    <div className="flex-1 text-center">
                      <p className="text-sm font-medium text-slate-300 mb-2 truncate">
                        {awayName}
                      </p>
                      <Input
                        {...register("awayScore", { valueAsNumber: true })}
                        type="number"
                        min={0}
                        max={99}
                        className="text-center text-3xl font-bold h-16"
                      />
                      {errors.awayScore && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.awayScore.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {isKnockout && (
                    <div className="mb-6">
                      <Label className="mb-2 block">Decided By</Label>
                      <div className="flex gap-2">
                        {(["NORMAL", "EXTRA_TIME", "PENALTIES"] as const).map(
                          (option) => {
                            const labels = {
                              NORMAL: "Normal Time",
                              EXTRA_TIME: "Extra Time",
                              PENALTIES: "Penalties",
                            };
                            return (
                              <label key={option} className="flex-1">
                                <input
                                  type="radio"
                                  {...register("decidedBy" as any)}
                                  value={option}
                                  className="sr-only peer"
                                />
                                <div
                                  className="
                                text-center py-2 px-3 rounded-lg border-2 cursor-pointer
                                text-sm font-medium transition-colors
                                border-slate-600 text-slate-400
                                peer-checked:border-yellow-500 peer-checked:bg-yellow-500/10 
                                peer-checked:text-white
                              "
                                >
                                  {labels[option]}
                                </div>
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={close}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={logScore.isPending}
                    >
                      {logScore.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Save Score
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

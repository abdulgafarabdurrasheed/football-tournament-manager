import { useState } from "react";
import {
  Trash2,
  UserMinus,
  Settings,
  AlertTriangle,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  useUpdateTournament,
  useDeleteTournament,
} from "@/hooks/useTournament";
import { useKickPlayer } from "@/hooks/useManager";
import { useUser } from "@/stores/authStores";
import { Button } from "@/components/ui/Button";
import type {
  Tournament,
  TournamentManager,
  MatchWithManagers,
} from "@/types/tournament.types";

interface AdminTabProps {
  tournament: Tournament;
  managers: TournamentManager[];
  matches: MatchWithManagers[];
}

export function AdminTab({ tournament, managers, matches }: AdminTabProps) {
  const navigate = useNavigate();
  const user = useUser();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const kickPlayer = useKickPlayer();

  const [deleting, setDeleting] = useState(false);

  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const canDelete =
    tournament.status === "DRAFT" || tournament.status === "OPEN";
  const canCancel =
    tournament.status === "IN_PROGRESS" ||
    tournament.status === "KNOCKOUT_STAGE";

  const handleKick = async (manager: TournamentManager) => {
    if (manager.user_id === user?.id) {
      toast.error("You cannot kick yourself");
      return;
    }
    if (!confirm(`Remove ${manager.team_name} from the tournament?`)) return;

    try {
      await kickPlayer.mutateAsync({
        managerId: manager.id,
        tournamentId: tournament.id,
      });
      toast.success(
        `${manager.team_name} has been removed from the tournament`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to remove player");
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel the tournament? This cannot be undone",
      )
    )
      return;

    try {
      await updateTournament.mutateAsync({
        tournamentId: tournament.id,
        updates: { status: "CANCELLED" },
      });
      toast.success("Tournament has been cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel tournament");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "DELETE this tournament permanently? All data will be lost, and can never be recovered",
      )
    )
      return;

    setDeleting(true);
    try {
      await deleteTournament.mutateAsync(tournament.id);
      toast.success("Tournament has been deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tournament");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Tournament Info
        </h3>
        <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="text-white font-medium">{tournament.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Format</span>
            <span className="text-white">
              {tournament.format.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Participants</span>
            <span className="text-white">
              {managers.length}/{tournament.max_participants}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Matches Completed</span>
            <span className="text-white">
              {completedMatches}/{matches.length}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Participants ({managers.length})
        </h3>
        <div className="space-y-2">
          {managers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                  px-2 py-0.5 text-[10px] font-bold rounded
                  ${
                    manager.role === "OWNER"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : manager.role === "ADMIN"
                        ? "bg-blue-500/20 text-blue-500"
                        : "bg-slate-700 text-slate-400"
                  }
                `}
                >
                  {manager.role}
                </span>
                <div>
                  <p className="text-white font-medium">{manager.team_name}</p>
                  <p className="text-xs text-slate-500">
                    Joined {new Date(manager.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {manager.role !== "OWNER" && manager.user_id !== user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleKick(manager)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-4">
          {canCancel && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Cancel Tournament</p>
                <p className="text-sm text-slate-400">
                  Stop all matches and mark as cancelled
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-red-500/50 text-red-400"
              >
                Cancel
              </Button>
            </div>
          )}

          {canDelete && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Delete Tournament</p>
                <p className="text-sm text-slate-400">
                  Permanently delete all tournament data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="border-red-500/50 text-red-400"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Delete
              </Button>
            </div>
          )}

          {!canCancel && !canDelete && (
            <p className="text-slate-400 text-sm">
              No destructive actions available for{" "}
              {tournament.status.toLowerCase()} tournaments
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
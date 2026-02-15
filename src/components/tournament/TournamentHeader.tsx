import {
  Trophy,
  Users,
  Calendar,
  Settings,
  Play,
  UserPlus,
  LogOut,
  Loader2,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useJoinTournament, useLeaveTournament } from "@/hooks/useManager";
import {
  useStartTournament,
  useUpdateTournament,
} from "@/hooks/useTournament";
import { useUser } from "@/stores/authStores";
import { useTournamentStore } from "@/stores/tournamentStore";
import { Button } from "@/components/ui/Button";
import { InviteModal } from "@/components/tournament/InviteModal";

import type { Tournament, TournamentManager } from "@/types/tournament.types";

interface TournamentHeaderProps {
  tournament: Tournament;
  managers: TournamentManager[];
  myManager: TournamentManager | null;
}

const STATUS_STYLES = {
  DRAFT: { bg: "bg-slate-600", text: "Draft" },
  OPEN: { bg: "bg-blue-500", text: "Open for Registration" },
  IN_PROGRESS: { bg: "bg-green-500", text: "In Progress" },
  KNOCKOUT_STAGE: { bg: "bg-purple-500", text: "Knockout Stage" },
  COMPLETED: { bg: "bg-slate-500", text: "Completed" },
  CANCELLED: { bg: "bg-red-500", text: "Cancelled" },
};

export function TournamentHeader({
  tournament,
  managers,
  myManager,
}: TournamentHeaderProps) {
  const user = useUser();
  const joinTournament = useJoinTournament();
  const leaveTournament = useLeaveTournament();
  const startTournament = useStartTournament();
  const updateTournament = useUpdateTournament();
  const { openInviteModal } = useTournamentStore();

  const [joining, setJoining] = useState(false);

  const isCreator = tournament.creator_id === user?.id;
  const isAdmin = myManager?.role === "OWNER" || myManager?.role === "ADMIN";
  const isMember = !!myManager;
  const canJoin =
    !isMember &&
    tournament.status === "OPEN" &&
    managers.length < tournament.max_participants;

  const statusStyle = STATUS_STYLES[tournament.status];

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      await joinTournament.mutateAsync({
        tournamentId: tournament.id,
        teamName:
          user.displayName || "Team " + user.id.slice(0, 4),
      });
      toast.success("Joined tournament!");
    } catch (err: any) {
      toast.error(err.message || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this tournament?")) return;
    try {
      await leaveTournament.mutateAsync(tournament.id);
      toast.success("Left tournament");
    } catch (err: any) {
      toast.error(err.message || "Failed to leave");
    }
  };

  const handleStart = async () => {
    if (managers.length < 2) {
      toast.error("Need at least 2 participants to start");
      return;
    }
    if (
      !confirm(
        `Start tournament with ${managers.length} participants? Fixtures will be generated.`,
      )
    )
      return;

    try {
      await startTournament.mutateAsync(tournament.id);
      toast.success("Tournament started! Fixtures generated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to start tournament");
    }
  };

  const handleOpenRegistration = async () => {
    try {
      await updateTournament.mutateAsync({
        tournamentId: tournament.id,
        updates: { status: "OPEN" },
      });
      toast.success("Registration is now open!");
    } catch (err: any) {
      toast.error(err.message || "Failed to open registration");
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full text-white ${statusStyle.bg}`}
            >
              {statusStyle.text}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {tournament.name}
          </h1>

          {tournament.description && (
            <p className="text-slate-400 mb-4">{tournament.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {managers.length}/{tournament.max_participants} players
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                Created {new Date(tournament.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>{tournament.format.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canJoin && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Join Tournament
            </Button>
          )}

          {isMember && !isCreator && tournament.status === "OPEN" && (
            <Button variant="outline" onClick={handleLeave}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          )}

          {isAdmin && tournament.status === "DRAFT" && (
            <Button onClick={handleOpenRegistration}>
              <UserPlus className="w-4 h-4 mr-2" />
              Open Registration
            </Button>
          )}

          {isAdmin && tournament.status === "OPEN" && (
            <Button onClick={handleStart}>
              <Play className="w-4 h-4 mr-2" />
              Start Tournament
            </Button>
          )}

          {isAdmin &&
            (tournament.status === "DRAFT" || tournament.status === "OPEN") && (
              <Button variant="outline" onClick={openInviteModal}>
                <Share2 className="w-4 h-4 mr-2" />
                Invite
              </Button>
            )}
        </div>
      </div>

      <InviteModal tournamentId={tournament.id} />
    </div>
  );
}

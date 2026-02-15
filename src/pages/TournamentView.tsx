import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useTournament } from "@/hooks/useTournament";
import { useMatches } from "@/hooks/useMatches";
import { useManagers, useMyManager, useIsAdmin } from "@/hooks/useManager";
import { useTournamentDetailRealtime } from "@/hooks/useRealtimeSubscription";
import { useTournamentStore, useViewMode } from "@/stores/tournamentStore";
import { AnimatedPage } from "@/components/ui/AnimatedPage";
import { Button } from "@/components/ui/Button";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { TournamentTabs } from "@/components/tournament/TournamentTabs";
import { FixturesTab } from "@/components/tournament/tabs/FixturesTab";
import { StandingsTab } from "@/components/tournament/StandingsTab";
import { StatsTab } from "@/components/tournament/StatsTab";
import { BracketTab } from "@/components/tournament/BracketTab";
import { AdminTab } from "@/components/tournament/AdminTab";
import { ScoreModal } from "@/components/tournament/ScoreModal";

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const viewMode = useViewMode();
  const { setActiveTournament } = useTournamentStore();

  const {
    data: tournament,
    isLoading: tLoading,
    error: tError,
  } = useTournament(id ?? null);
  const { data: matches, isLoading: mLoading } = useMatches(id ?? null);
  const { data: managers, isLoading: mgLoading } = useManagers(id ?? null);
  const myManager = useMyManager(id ?? null);
  const isAdmin = useIsAdmin(id ?? null);

  useTournamentDetailRealtime(id ?? null);

  useEffect(() => {
    if (id) setActiveTournament(id);
  }, [id, setActiveTournament]);

  if (tLoading || mLoading || mgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (tError || !tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">
          Error loading tournament data. Tournament Not Found
        </h2>
        <p className="text-slate-400">
          {tError?.message || "This Tournament may have been deleted"}
        </p>
        <Button variant="ghost" onClick={() => navigate("/tournaments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>
      </div>
    );
  }

  const hasGroupStage =
    tournament.format === "LEAGUE" ||
    tournament.format === "HYBRID_MULTI_GROUP" ||
    tournament.format === "HYBRID_SINGLE_LEAGUE";

  const hasKnockout =
    tournament.format === "KNOCKOUT" || tournament.format.startsWith("HYBRID");

  const renderTabContent = () => {
    switch (viewMode) {
      case "fixtures":
        return (
          <FixturesTab
            matches={matches ?? []}
            managers={managers ?? []}
            tournament={tournament}
            isAdmin={isAdmin}
          />
        );
      case "standings":
        return hasGroupStage ? (
          <StandingsTab
            matches={matches ?? []}
            managers={managers ?? []}
            tournament={tournament}
          />
        ) : null;
      case "bracket":
        return hasKnockout ? (
          <BracketTab
            matches={matches ?? []}
            managers={managers ?? []}
            tournament={tournament}
          />
        ) : null;
      case "stats":
        return (
          <StatsTab
            matches={matches ?? []}
            managers={managers ?? []}
            tournamentId={tournament.id}
          />
        );
      case "admin":
        return isAdmin ? (
          <AdminTab
            tournament={tournament}
            managers={managers ?? []}
            matches={matches ?? []}
          />
        ) : null;

      default:
        return (
          <FixturesTab
            matches={matches ?? []}
            managers={managers ?? []}
            tournament={tournament}
            isAdmin={isAdmin}
          />
        );
    }
  };

  return (
    <AnimatedPage className="max-w-6xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/tournaments")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tournaments
      </Button>

      <TournamentHeader
        tournament={tournament}
        managers={managers ?? []}
        myManager={myManager}
      />
      <TournamentTabs
        format={tournament.format}
        status={tournament.status}
        isAdmin={isAdmin}
      />

      <div className="mt-6">{renderTabContent()}</div>

      <ScoreModal />
    </AnimatedPage>
  );
}

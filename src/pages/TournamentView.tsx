import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useTournament } from "@/hooks/useTournament";
import { useMatches } from "@/hooks/useMatches";
import { useManagers, useMyManager, useIsAdmin } from "@/hooks/useManager";
import { useTournamentDetailRealtime } from "@/hooks/useRealtimeSubscription";
import { useTournamentStore, useViewMode } from "@/stores/tournamentStore";
import { useIsDemoMode } from "@/stores/demoStore";
import { demoTournament, demoMatches, demoManagers, DEMO_TOURNAMENT_ID_CONST } from "@/data/demoData";
import { AnimatedPage } from "@/components/ui/AnimatedPage";
import { Button } from "@/components/ui/Button";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { TournamentTabs } from "@/components/tournament/TournamentTabs";
import { FixturesTab } from "@/components/tournament/tabs/FixturesTab";
import { StandingsTab } from "@/components/tournament/tabs/StandingsTab";
import { StatsTab } from "@/components/tournament/tabs/StatsTab";
import { BracketTab } from "@/components/tournament/tabs/BracketTab";
import { AdminTab } from "@/components/tournament/tabs/AdminTab";
import { ScoreModal } from "@/components/tournament/ScoreModal";

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const viewMode = useViewMode();
  const { setActiveTournament } = useTournamentStore();
  const isDemoMode = useIsDemoMode();

  const isDemoTournament = isDemoMode && id === DEMO_TOURNAMENT_ID_CONST;

  const {
    data: tournament,
    isLoading: tLoading,
    error: tError,
  } = useTournament(isDemoTournament ? null : (id ?? null));
  const { data: matches, isLoading: mLoading } = useMatches(isDemoTournament ? null : (id ?? null));
  const { data: managers, isLoading: mgLoading } = useManagers(isDemoTournament ? null : (id ?? null));
  const myManager = useMyManager(isDemoTournament ? null : (id ?? null));
  const isAdmin = useIsAdmin(isDemoTournament ? null : (id ?? null));

  useTournamentDetailRealtime(isDemoTournament ? null : (id ?? null));
  const activeTournament = isDemoTournament ? demoTournament : tournament;
  const activeMatches = isDemoTournament ? demoMatches : (matches ?? []);
  const activeManagers = isDemoTournament ? demoManagers : (managers ?? []);
  const activeIsAdmin = isDemoTournament ? true : isAdmin;
  const activeMyManager = isDemoTournament ? demoManagers[0] : myManager;

  useEffect(() => {
    if (id) setActiveTournament(id);
  }, [id, setActiveTournament]);

  if (!isDemoTournament && (tLoading || mLoading || mgLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!isDemoTournament && (tError || !tournament)) {
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
    activeTournament!.format === "LEAGUE" ||
    activeTournament!.format === "HYBRID_MULTI_GROUP" ||
    activeTournament!.format === "HYBRID_SINGLE_LEAGUE";

  const hasKnockout =
    activeTournament!.format === "KNOCKOUT" || activeTournament!.format.startsWith("HYBRID");

  const renderTabContent = () => {
    switch (viewMode) {
      case "fixtures":
        return (
          <FixturesTab
            matches={activeMatches}
            managers={activeManagers}
            tournament={activeTournament!}
            isAdmin={activeIsAdmin}
          />
        );
      case "standings":
        return hasGroupStage ? (
          <StandingsTab
            matches={activeMatches}
            managers={activeManagers}
            tournament={activeTournament!}
          />
        ) : null;
      case "bracket":
        return hasKnockout ? (
          <BracketTab
            matches={activeMatches}
            managers={activeManagers}
            tournament={activeTournament!}
          />
        ) : null;
      case "stats":
        return (
          <StatsTab
            matches={activeMatches}
            managers={activeManagers}
            tournamentId={activeTournament!.id}
          />
        );
      case "admin":
        return activeIsAdmin ? (
          <AdminTab
            tournament={activeTournament!}
            managers={activeManagers}
            matches={activeMatches}
          />
        ) : null;

      default:
        return (
          <FixturesTab
            matches={activeMatches}
            managers={activeManagers}
            tournament={activeTournament!}
            isAdmin={activeIsAdmin}
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

      <div data-tour="tournament-header">
        <TournamentHeader
          tournament={activeTournament!}
          managers={activeManagers}
          myManager={activeMyManager}
        />
      </div>
      <TournamentTabs
        format={activeTournament!.format}
        status={activeTournament!.status}
        isAdmin={activeIsAdmin}
      />

      <div className="mt-6">{renderTabContent()}</div>

      {!isDemoTournament && <ScoreModal />}
    </AnimatedPage>
  );
}

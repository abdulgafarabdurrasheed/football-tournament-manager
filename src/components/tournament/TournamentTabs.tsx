import { useTournamentStore, useViewMode } from "@/stores/tournamentStore";
import {
  List,
  BarChart3,
  Trophy,
  GitBranch,
  Shield,
  Table,
} from "lucide-react";

type ViewMode = "fixtures" | "standings" | "stats" | "bracket" | "admin";

interface Tab {
  id: ViewMode;
  label: string;
  icon: React.ElementType;
  show: boolean;
}

interface TournamentTabsProps {
  format: string;
  status: string;
  isAdmin: boolean;
}

export function TournamentTabs({
  format,
  status,
  isAdmin,
}: TournamentTabsProps) {
  const viewMode = useViewMode();
  const { setViewMode } = useTournamentStore();

  const hasGroupStage = format === "LEAGUE" || format.startsWith("HYBRID");
  const hasKnockout = format === "KNOCKOUT" || format.startsWith("HYBRID");
  const isStarted = status !== "DRAFT" && status !== "OPEN";

  const tabs: Tab[] = [
    { id: "fixtures", label: "Fixtures", icon: List, show: true },
    {
      id: "standings",
      label: "Standings",
      icon: Table,
      show: hasGroupStage && isStarted,
    },
    {
      id: "bracket",
      label: "Bracket",
      icon: GitBranch,
      show: hasKnockout && isStarted,
    },
    { id: "stats", label: "Stats", icon: BarChart3, show: isStarted },
    { id: "admin", label: "Admin", icon: Shield, show: isAdmin },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 -mb-px border-b border-slate-700">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = viewMode === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium
              border-b-2 transition-colors whitespace-nowrap
              ${
                isActive
                  ? "border-yellow-500 text-yellow-500"
                  : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

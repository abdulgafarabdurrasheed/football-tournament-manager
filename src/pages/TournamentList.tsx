import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Trophy,
  Users,
  Calendar,
  Loader2,
  School,
} from "lucide-react";
import { easeIn, motion } from "framer-motion";
import { useMyTournaments, usePublicTournaments } from "@/hooks/useTournament";
import { useTournamentListRealtime } from "@/hooks/useRealtimeSubscription";
import {
  useTournamentStore,
  useTournamentFilters,
} from "@/stores/tournamentStore";
import { useUser } from "@/stores/authStores";
import { AnimatedPage } from "@/components/ui/AnimatedPage";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { TournamentFilters } from "@/components/tournament/TournamentFilters";
import { i } from "node_modules/vite/dist/node/chunks/moduleRunnerTransport";

type Tab = "my" | "public";

export default function TournamentList() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filters = useTournamentFilters();
  const { setFilters, resetFilters } = useTournamentStore;

  const { data: myTournaments, isLoading: myLoading } = useMyTournaments();

  const { data: publicTournaments, isLoading: publicLoading } =
    usePublicTournaments(searchQuery);

  useTournamentListRealtime();

  const filteredTournaments = useMemo(() => {
    const source = activeTab === "my" ? myTournaments : publicTournaments;
    if (!source) return [];

    return source.filter((t) => {
      if (
        searchQuery &&
        !t.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.status.length > 0 &&
        !filters.status.includes(t.status as any)
      ) {
        return false;
      }
      if (
        filters.format.length > 0 &&
        !filters.format.includes(t.format as any)
      ) {
        return false;
      }

      return true;
    });
  }, [activeTab, myTournaments, publicTournaments, searchQuery, filters]);

  const isLoading = activeTab === "my" ? myLoading : publicLoading;

  return (
    <AnimatedPage className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          <p className="text-slate-400 mt-1">
            {activeTab === "my"
              ? "Manage your tournaments"
              : "Browse public tournaments to join"}
          </p>
        </div>

        <Link to="/tournament/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("my")}
          className={`
                        px-4 py-2 rounded-lg font-medium transition-colors
                        ${
                          activeTab === "my"
                            ? "bg-yellow-500 text-slate-900"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }
                    `}
        >
          {" "}
          My Tournaments
        </button>
        <button
          onClick={() => setActiveTab("public")}
          className={`
                        px-4 py-2 rounded-lg font-medium transition-colors
                        ${
                          activeTab === "public"
                            ? "bg-yellow-500 text-slate-900"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }
                    `}
        >
          {" "}
          Public Tournaments
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-yellow-500" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {(filters.status.length > 0 || filters.format.length > 0) && (
            <span className="ml-2 px-1 5 py-0 5 text-xs bg-yellow-500 text-slate-900 rounded">
              {filters.status.length + filters.format.length}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <TournamentFilters
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
          />
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            {activeTab === "my"
              ? "No tournaments yet"
              : "No public tournaments found"}
          </h3>
          <p className="text-slate-400 mb-6">
            {activeTab === "my"
              ? "Create your first tournament or join a public one"
              : "Try adjusting your search or filters to find tournaments"}
          </p>
          {activeTab === "my" && (
            <Link to="/tournament/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TournamentCard tournament={tournament} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}

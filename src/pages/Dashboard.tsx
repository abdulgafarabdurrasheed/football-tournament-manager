import { Link } from "react-router-dom";
import {
  Trophy,
  Plus,
  List,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@/stores/authStores";
import { DemoBanner } from "@/components/tour/DemoBanner";

function Dashboard() {
  const user = useUser();
  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Manager";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br via-slate-900 to-slate-900 border border-slate-800 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-yellow-500 text-sm font-semibold mb-2">
            <span>Welcome back</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Hey, {firstName}! 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg max-w-lg">
            Manage your tournaments, track results, and stay on top of your
            league.
          </p>
        </div>
      </section>

      <DemoBanner />

      <section data-tour="quick-actions">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/tournament/new"
            className="group flex items-center gap-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-yellow-500/20"
          >
            <div className="bg-black/10 rounded-lg p-2.5">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">Create Tournament</p>
              <p className="text-black/60 text-sm">Start a new competition</p>
            </div>
            <ArrowRight
              size={18}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </Link>

          <Link
            to="/tournaments"
            className="group flex items-center gap-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all"
          >
            <div className="bg-blue-500/10 rounded-lg p-2.5">
              <List size={22} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">My Tournaments</p>
              <p className="text-slate-500 text-sm">View &amp; manage all</p>
            </div>
            <ArrowRight
              size={18}
              className="text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </Link>

          <Link
            to="/profile"
            className="group flex items-center gap-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all"
          >
            <div className="bg-purple-500/10 rounded-lg p-2.5">
              <TrendingUp size={22} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">My Profile</p>
              <p className="text-slate-500 text-sm">Stats &amp; settings</p>
            </div>
            <ArrowRight
              size={18}
              className="text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
          </Link>
        </div>
      </section>

      <section data-tour="dashboard-stats">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Tournaments",
              value: "0",
              icon: Trophy,
              accent: "text-yellow-500",
              bg: "bg-yellow-500/10",
            },
            {
              label: "Matches Played",
              value: "0",
              icon: Calendar,
              accent: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Goals Scored",
              value: "0",
              icon: TrendingUp,
              accent: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              label: "Avg Goals/Match",
              value: "—",
              icon: Clock,
              accent: "text-orange-400",
              bg: "bg-orange-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className={`${stat.bg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.accent} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Recent Activity
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={20} className="text-slate-500" />
          </div>
          <p className="text-white font-semibold mb-1">No activity yet</p>
          <p className="text-slate-500 text-sm mb-5">
            Create your first tournament to get started
          </p>
          <Link
            to="/tournament/new"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus size={16} />
            Create Tournament
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
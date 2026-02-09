import  Card from '../components/ui/Card'
import { Trophy, Users, Calendar, BarChart3, type LucideIcon } from "lucide-react";
import { useUser } from '@/stores/authStores'

const ICON_COLORS: Record<string, string> = {
  yellow: 'text-yellow-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
}

interface StatItem {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

function Dashboard() {
  const user = useUser()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white">
          Welcome, {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || 'Manager'}!
        </h2>
        <p className="text-slate-400 mt-1">Ready to Manage your Tournaments?</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { label: "Tournaments", value: "3", icon: Trophy, color: "yellow" },
            {
              label: "Matches Played",
              value: "24",
              icon: Calendar,
              color: "blue",
            },
            {
              label: "Win Rate",
              value: "67%",
              icon: BarChart3,
              color: "green",
            },
            { label: "Friends", value: "12", icon: Users, color: "purple" },
          ] as StatItem[]
        ).map((stat) => (
          <Card key={stat.label} className="text-center">
            <stat.icon
              className={`mx-auto mb-2 ${ICON_COLORS[stat.color]}`}
              size={24}
            />
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Coming Soon...." className="text-center">
        <p className="text-slate-400">
          Dashboard features coming in Phase 2...
        </p>
      </Card>
    </div>
  );
}

export default Dashboard;
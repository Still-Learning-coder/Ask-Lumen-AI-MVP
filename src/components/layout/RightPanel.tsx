import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Users } from "lucide-react";

const quickStats = [
  { label: "Messages Today", value: "24", icon: TrendingUp, color: "text-primary" },
  { label: "Tokens Used", value: "12.5K", icon: TrendingUp, color: "text-secondary" },
  { label: "Streak", value: "7 days", icon: Award, color: "text-primary" },
];

const recentAchievements = [
  { name: "Early Adopter", icon: "🌟", date: "Today" },
  { name: "Power User", icon: "⚡", date: "Yesterday" },
  { name: "Community Helper", icon: "💬", date: "2 days ago" },
];

const communityHighlights = [
  { user: "Sarah K.", action: "shared a new prompt", time: "5m ago" },
  { user: "Mike R.", action: "earned Master badge", time: "12m ago" },
  { user: "Alex P.", action: "posted in community", time: "23m ago" },
];

interface RightPanelProps {
  isOpen: boolean;
}

const RightPanel = ({ isOpen }: RightPanelProps) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 h-screen bg-background border-l border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {communityHighlights.map((highlight, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-primary">{highlight.user}</span>
                <span className="text-muted-foreground"> {highlight.action}</span>
                <p className="text-xs text-muted-foreground mt-1">{highlight.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">2,847</p>
              <p className="text-sm opacity-90 mt-1">Active Users Now</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default RightPanel;

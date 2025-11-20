import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Flame, Award, TrendingUp } from "lucide-react";

const userStats = {
  points: 1250,
  level: 5,
  streak: 7,
  rank: "#42",
  nextLevelPoints: 1500,
  badges: [
    { id: 1, name: "Explorer", icon: "🌟", earned: true, description: "Complete your first conversation", date: "Jan 15, 2025" },
    { id: 2, name: "Creator", icon: "🎨", earned: true, description: "Generate 10 images", date: "Jan 18, 2025" },
    { id: 3, name: "Social Butterfly", icon: "🦋", earned: true, description: "Make 5 community posts", date: "Jan 20, 2025" },
    { id: 4, name: "Innovator", icon: "💡", earned: false, description: "Use 5 different AI tools", date: null },
    { id: 5, name: "Master", icon: "👑", earned: false, description: "Reach level 10", date: null },
    { id: 6, name: "Mentor", icon: "🎓", earned: false, description: "Help 10 community members", date: null },
    { id: 7, name: "Consistent", icon: "📅", earned: true, description: "Maintain a 7-day streak", date: "Jan 22, 2025" },
    { id: 8, name: "Pioneer", icon: "🚀", earned: false, description: "Try new features on launch day", date: null },
  ],
};

const leaderboard = [
  { rank: 1, name: "Emma Wilson", points: 5420, avatar: "https://i.pravatar.cc/150?img=4" },
  { rank: 2, name: "David Kim", points: 4890, avatar: "https://i.pravatar.cc/150?img=5" },
  { rank: 3, name: "Sarah Martinez", points: 4560, avatar: "https://i.pravatar.cc/150?img=2" },
  { rank: 4, name: "Mike Roberts", points: 3780, avatar: "https://i.pravatar.cc/150?img=3" },
  { rank: 5, name: "Alex Chen", points: 3210, avatar: "https://i.pravatar.cc/150?img=1" },
];

const activityCalendar = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  activity: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
}));

const Achievements = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const progressToNextLevel = (userStats.points / userStats.nextLevelPoints) * 100;

  const getActivityColor = (activity: number) => {
    if (activity === 0) return "bg-muted";
    if (activity <= 2) return "bg-primary/30";
    if (activity <= 4) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Achievements & Progress
            </h1>
            <p className="text-muted-foreground">
              Track your journey and celebrate your milestones
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.points}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Trophy className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Level {userStats.level}</p>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.streak} days</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.rank}</p>
                    <p className="text-sm text-muted-foreground">Global Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {userStats.nextLevelPoints - userStats.points} points to Level {userStats.level + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressToNextLevel} className="h-3" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{userStats.points} pts</span>
                <span>{userStats.nextLevelPoints} pts</span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userStats.badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`${
                      badge.earned
                        ? "border-primary shadow-lg"
                        : "opacity-50 grayscale"
                    } transition-all hover:scale-105`}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className="text-6xl mb-4 animate-float">{badge.icon}</div>
                      <h3 className="font-bold mb-2">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      {badge.earned ? (
                        <Badge className="bg-primary text-primary-foreground">
                          Earned {badge.date}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Heatmap</CardTitle>
                  <CardDescription>Your activity over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-10 gap-2">
                    {activityCalendar.map((day) => (
                      <div
                        key={day.day}
                        className={`aspect-square rounded ${getActivityColor(day.activity)} transition-all hover:scale-110 cursor-pointer`}
                        title={`Day ${day.day}: ${day.activity} activities`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded bg-muted" />
                    <div className="w-3 h-3 rounded bg-primary/30" />
                    <div className="w-3 h-3 rounded bg-primary/60" />
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle>Global Leaderboard</CardTitle>
                  <CardDescription>Top performers this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((user) => (
                      <div
                        key={user.rank}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          #{user.rank}
                        </div>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.points} points</p>
                        </div>
                        {user.rank <= 3 && (
                          <Trophy
                            className={`h-6 w-6 ${
                              user.rank === 1
                                ? "text-yellow-500"
                                : user.rank === 2
                                ? "text-gray-400"
                                : "text-amber-700"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Achievements;

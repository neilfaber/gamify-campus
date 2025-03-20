
import MainLayout from "@/layouts/MainLayout";
import { Activity, BarChart2, TrendingUp, Calendar, Award, Users, Trophy, ChevronUp, ChevronDown, Clock } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";

// Sample data for the statistics
const statsData = [
  { label: "Games Played", value: 35, change: 14, isIncrease: true },
  { label: "Win Rate", value: "67%", change: 5, isIncrease: true },
  { label: "Avg. Time", value: "68 min", change: 3, isIncrease: false },
  { label: "Teams Joined", value: 3, change: 1, isIncrease: true }
];

// Sample data for the sports breakdown
const sportsData = [
  { name: "Basketball", matches: 15, winRate: 73, active: true },
  { name: "Tennis", matches: 12, winRate: 58, active: true },
  { name: "Volleyball", matches: 8, winRate: 62, active: true },
  { name: "Football", matches: 0, winRate: 0, active: false }
];

// Sample data for recent activities
const recentActivities = [
  {
    type: "match",
    title: "Basketball Match",
    description: "Won against Team Rockets",
    date: "May 15, 2023",
    icon: <Trophy className="h-5 w-5" />
  },
  {
    type: "certificate",
    title: "New Certificate",
    description: "Earned 'MVP' recognition",
    date: "May 12, 2023",
    icon: <Award className="h-5 w-5" />
  },
  {
    type: "team",
    title: "Joined New Team",
    description: "Became member of 'Net Masters'",
    date: "May 10, 2023",
    icon: <Users className="h-5 w-5" />
  },
  {
    type: "match",
    title: "Tennis Match",
    description: "Lost against Jamie Smith",
    date: "May 8, 2023",
    icon: <Trophy className="h-5 w-5" />
  }
];

// Sample data for upcoming matches
const upcomingMatches = [
  {
    opponent: "Team Eagles",
    sport: "Basketball",
    date: "May 20, 2023",
    time: "2:00 PM",
    location: "Main Gym"
  },
  {
    opponent: "Riley Wilson",
    sport: "Tennis",
    date: "May 22, 2023",
    time: "10:30 AM",
    location: "Tennis Courts"
  },
  {
    opponent: "Team Sharks",
    sport: "Volleyball",
    date: "May 25, 2023",
    time: "4:15 PM",
    location: "Indoor Hall"
  }
];

const Analytics = () => {
  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Performance Analytics</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            Track your sports performance, achievements, and progress over time.
            Gain insights to improve your skills and competitiveness.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Key statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-campus-neutral-200 p-5 shadow-sm"
                >
                  <div className="text-sm text-campus-neutral-500 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-campus-neutral-900">{stat.value}</div>
                  <div className={cn(
                    "flex items-center mt-2 text-xs font-medium",
                    stat.isIncrease ? "text-success" : "text-error"
                  )}>
                    {stat.isIncrease ? (
                      <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>{stat.change}% from last month</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Performance chart */}
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-campus-neutral-900">Performance Over Time</h2>
                  <p className="text-sm text-campus-neutral-500">Track your games and win rate for the past 6 months</p>
                </div>
                <select className="text-sm border border-campus-neutral-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue">
                  <option>Last 6 months</option>
                  <option>Last 3 months</option>
                  <option>This year</option>
                </select>
              </div>
              
              <div className="h-60 flex items-center justify-center bg-campus-neutral-50 rounded-lg">
                <p className="text-campus-neutral-500">Performance chart will be displayed here</p>
              </div>
            </div>
            
            {/* Sports breakdown */}
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-campus-neutral-900 mb-6">Sports Breakdown</h2>
              
              <div className="space-y-5">
                {sportsData.map((sport) => (
                  <div key={sport.name} className="border border-campus-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={cn(
                          "h-2 w-2 rounded-full mr-2",
                          sport.active ? "bg-success" : "bg-campus-neutral-300"
                        )}></div>
                        <h3 className="font-medium text-campus-neutral-900">{sport.name}</h3>
                      </div>
                      <div className="text-sm text-campus-neutral-500">{sport.matches} matches</div>
                    </div>
                    
                    {sport.matches > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-campus-neutral-600">Win Rate</span>
                          <span className="font-medium text-campus-neutral-900">{sport.winRate}%</span>
                        </div>
                        <div className="h-2 w-full bg-campus-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full",
                              sport.winRate >= 70 ? "bg-success" : 
                              sport.winRate >= 50 ? "bg-campus-blue" : 
                              "bg-warning"
                            )}
                            style={{ width: `${sport.winRate}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-campus-neutral-500">No matches played yet</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-campus-neutral-900 mb-5">Recent Activity</h2>
              
              <div className="space-y-5">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start"
                  >
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0 mr-3",
                      activity.type === "match" ? "bg-campus-blue-light text-campus-blue" :
                      activity.type === "certificate" ? "bg-success-light text-success" :
                      "bg-warning-light text-warning"
                    )}>
                      {activity.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-campus-neutral-900">{activity.title}</h3>
                      <p className="text-sm text-campus-neutral-600">{activity.description}</p>
                      <p className="text-xs text-campus-neutral-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 pt-5 border-t border-campus-neutral-200">
                <CustomButton variant="outline" className="w-full">
                  View All Activity
                </CustomButton>
              </div>
            </div>
            
            {/* Upcoming matches */}
            <div className="bg-white rounded-xl border border-campus-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-campus-neutral-900 mb-5">Upcoming Matches</h2>
              
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-campus-neutral-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-campus-neutral-900">vs {match.opponent}</h3>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-campus-blue-light text-campus-blue">
                        {match.sport}
                      </div>
                    </div>
                    <div className="text-sm text-campus-neutral-600 space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-campus-neutral-400 mr-2" />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-campus-neutral-400 mr-2" />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-campus-neutral-400 mr-2" />
                        <span>{match.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-5">
                <CustomButton variant="outline" className="w-full">
                  View Full Schedule
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;

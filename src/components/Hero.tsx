
import { ArrowRight, Trophy, Users, Calendar, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomButton } from "./ui/custom-button";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-16">
      {/* Background elements */}
      <div aria-hidden="true" className="absolute inset-y-0 h-full w-full">
        <div className="relative h-full">
          <div className="absolute right-0 top-0 h-96 w-96 -translate-y-16 translate-x-1/3 rounded-full bg-campus-blue opacity-5 blur-3xl"></div>
          <div className="absolute left-0 bottom-0 h-96 w-96 translate-y-16 -translate-x-1/3 rounded-full bg-campus-blue opacity-5 blur-3xl"></div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="text-center">
          <div className="inline-flex items-center px-2.5 py-1 mb-6 rounded-full border border-campus-blue/20 bg-campus-blue-light text-campus-blue text-sm font-medium animate-slide-up">
            <span>Campus Sports Redefined</span>
          </div>
          
          <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-campus-neutral-900 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Play. Connect. Excel.
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-campus-neutral-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "200ms" }}>
            Join matches, form teams, and earn recognition while staying active on campus. Intelligent matchmaking based on your skill level, schedule, and preferences.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Link to="/games">
              <CustomButton 
                variant="primary" 
                size="lg"
                iconRight={<ArrowRight className="h-5 w-5" />}
              >
                Browse Games
              </CustomButton>
            </Link>
            <Link to="/matchmaking">
              <CustomButton variant="outline" size="lg">
                Find Matches
              </CustomButton>
            </Link>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Trophy className="h-6 w-6" />, title: "Smart Matchmaking", desc: "Find perfectly matched opponents" },
              { icon: <Users className="h-6 w-6" />, title: "Team Building", desc: "Create or join competitive teams" },
              { icon: <Calendar className="h-6 w-6" />, title: "Auto Scheduling", desc: "Based on facility availability" },
              { icon: <Award className="h-6 w-6" />, title: "Digital Certificates", desc: "Instant recognition system" }
            ].map((feature, index) => (
              <div 
                key={feature.title} 
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-xl border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-all animate-scale-up",
                )}
                style={{ animationDelay: `${index * 100 + 400}ms` }}
              >
                <div className="p-3 rounded-lg bg-campus-blue-light text-campus-blue mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-campus-neutral-900 mb-1">{feature.title}</h3>
                <p className="text-campus-neutral-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

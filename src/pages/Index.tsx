
import MainLayout from "@/layouts/MainLayout";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import { Trophy, Users, Calendar, Award, ArrowRight, Activity, BarChart } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      
      {/* Feature section */}
      <section className="py-16 md:py-24 bg-campus-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Enhance Your Campus Experience</h2>
            <p className="section-subtitle mx-auto">
              Our platform provides everything you need to participate in campus sports activities,
              from finding matches to tracking your performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:gap-12">
            <FeatureCard 
              title="Smart Matchmaking"
              description="Get matched with opponents of similar skill level. Our AI-powered matchmaking system ensures balanced and competitive games every time."
              icon={<Trophy className="h-6 w-6 text-campus-blue" />}
              image="https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?q=80&w=1000&auto=format&fit=crop"
              linkTo="/matchmaking"
              linkText="Find Matches"
              position="left"
            />
            
            <FeatureCard 
              title="Team Building"
              description="Create your own team or join existing ones. Collaborate with friends and classmates to participate in team-based competitions."
              icon={<Users className="h-6 w-6 text-campus-blue" />}
              image="https://images.unsplash.com/photo-1526232373132-0e4ee643401d?q=80&w=1000&auto=format&fit=crop"
              linkTo="/teams"
              linkText="Explore Teams"
              position="right"
            />
            
            <FeatureCard 
              title="Automated Scheduling"
              description="Never worry about booking venues or equipment. Our system automatically schedules matches based on venue availability and player preferences."
              icon={<Calendar className="h-6 w-6 text-campus-blue" />}
              image="https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=1000&auto=format&fit=crop"
              linkTo="/games"
              linkText="View Schedule"
              position="left"
            />
            
            <FeatureCard 
              title="Recognition System"
              description="Earn digital certificates for your achievements. Share your accomplishments on social media or add them to your resume."
              icon={<Award className="h-6 w-6 text-campus-blue" />}
              image="https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1000&auto=format&fit=crop"
              linkTo="/certificates"
              linkText="View Certificates"
              position="right"
            />
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-campus-blue rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-16 md:p-12 lg:p-16 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to transform your campus sports experience?
                </h2>
                <p className="text-campus-blue-light text-lg mb-8">
                  Join thousands of students already using CampusPlay to stay active, 
                  compete, and connect with peers.
                </p>
                <Link to="/games">
                  <CustomButton 
                    variant="secondary" 
                    size="lg"
                    iconRight={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started Now
                  </CustomButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Analytics preview section */}
      <section className="py-16 md:py-24 bg-campus-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between md:space-x-12">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="inline-flex items-center px-2.5 py-1 mb-6 rounded-full border border-campus-blue/20 bg-campus-blue-light text-campus-blue text-sm font-medium">
                <Activity className="h-4 w-4 mr-1.5" />
                <span>Performance Tracking</span>
              </div>
              <h2 className="section-title mb-4">Track Your Progress</h2>
              <p className="text-lg text-campus-neutral-600 mb-8">
                Get detailed insights into your performance. Track your statistics, progress, 
                and achievements over time with our comprehensive analytics tools.
              </p>
              <Link to="/analytics">
                <CustomButton 
                  variant="outline" 
                  iconRight={<BarChart className="h-5 w-5" />}
                >
                  Explore Analytics
                </CustomButton>
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white border border-campus-neutral-200 p-4">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
                  alt="Analytics Dashboard"
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;

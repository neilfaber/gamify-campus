
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Calendar, Download, Medal, Search, Trophy, Award, Star, Share2 } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { cn } from "@/lib/utils";

// Sample certificates data
const certificatesData = [
  {
    id: 1,
    title: "Basketball Tournament Champion",
    event: "Inter-Department Basketball Tournament",
    issueDate: "May 15, 2023",
    type: "Achievement",
    image: "https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1000&auto=format&fit=crop",
    icon: <Trophy className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Most Valuable Player",
    event: "Spring Football League",
    issueDate: "April 22, 2023",
    type: "Recognition",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000&auto=format&fit=crop",
    icon: <Star className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Tennis Tournament Finalist",
    event: "University Tennis Championship",
    issueDate: "March 10, 2023",
    type: "Achievement",
    image: "https://images.unsplash.com/photo-1595435934847-5ec0dafefa85?q=80&w=1000&auto=format&fit=crop",
    icon: <Medal className="h-5 w-5" />
  },
  {
    id: 4,
    title: "Team Leadership Award",
    event: "Volleyball Tournament",
    issueDate: "February 28, 2023",
    type: "Recognition",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000&auto=format&fit=crop",
    icon: <Award className="h-5 w-5" />
  }
];

const Certificates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "achievements" | "recognitions">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<typeof certificatesData[0] | null>(null);
  
  const filteredCertificates = certificatesData.filter((certificate) => {
    const matchesSearch = certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          certificate.event.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "achievements") {
      return matchesSearch && certificate.type === "Achievement";
    }
    
    if (activeTab === "recognitions") {
      return matchesSearch && certificate.type === "Recognition";
    }
    
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="pt-20 pb-16 bg-gradient-to-b from-campus-blue-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-campus-neutral-900 mb-4">Certificates & Achievements</h1>
          <p className="text-lg text-campus-neutral-600 max-w-2xl">
            View and download your earned certificates and achievements. 
            Share your accomplishments with others.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Tabs and search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="border-b border-campus-neutral-200 w-full md:w-auto">
            <div className="flex -mb-px">
              <button
                className={cn(
                  "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "all"
                    ? "border-campus-blue text-campus-blue"
                    : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
                )}
                onClick={() => setActiveTab("all")}
              >
                All Certificates
              </button>
              <button
                className={cn(
                  "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "achievements"
                    ? "border-campus-blue text-campus-blue"
                    : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
                )}
                onClick={() => setActiveTab("achievements")}
              >
                Achievements
              </button>
              <button
                className={cn(
                  "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "recognitions"
                    ? "border-campus-blue text-campus-blue"
                    : "border-transparent text-campus-neutral-500 hover:text-campus-neutral-700"
                )}
                onClick={() => setActiveTab("recognitions")}
              >
                Recognitions
              </button>
            </div>
          </div>
          
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-campus-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search certificates..."
              className="block w-full pl-10 pr-3 py-2 border border-campus-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-campus-blue focus:border-campus-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Certificate grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="rounded-xl overflow-hidden border border-campus-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCertificate(certificate)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={certificate.image}
                    alt={certificate.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-campus-neutral-900">
                      {certificate.type}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white">{certificate.title}</h3>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-campus-neutral-900">{certificate.event}</div>
                    <div className="flex items-center mt-1 text-xs text-campus-neutral-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Issued on {certificate.issueDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <CustomButton 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      iconLeft={<Download className="h-4 w-4" />}
                    >
                      Download
                    </CustomButton>
                    <CustomButton 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      iconLeft={<Share2 className="h-4 w-4" />}
                    >
                      Share
                    </CustomButton>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-campus-neutral-500 text-lg">No certificates found matching your criteria. Try a different search or filter.</p>
            </div>
          )}
        </div>
        
        {/* Certificate modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-scale-up">
              <div className="relative">
                <img
                  src={selectedCertificate.image}
                  alt={selectedCertificate.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  onClick={() => setSelectedCertificate(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start mb-6">
                  <div className="p-3 rounded-lg bg-campus-blue-light text-campus-blue mr-4">
                    {selectedCertificate.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-campus-neutral-900">{selectedCertificate.title}</h2>
                    <p className="text-campus-neutral-600">{selectedCertificate.event}</p>
                    <div className="flex items-center mt-2 text-sm text-campus-neutral-500">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>Issued on {selectedCertificate.issueDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-campus-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-campus-neutral-900 mb-4">Certificate Details</h3>
                  
                  <div className="p-4 rounded-lg border border-campus-neutral-200 bg-campus-neutral-50 mb-6">
                    <p className="text-center text-campus-neutral-700">
                      This certificate is awarded to <strong>Alex Johnson</strong> for outstanding performance
                      in the {selectedCertificate.event}. This achievement represents dedication, skill, and sportsmanship.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <CustomButton 
                      variant="primary"
                      iconLeft={<Download className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Download Certificate
                    </CustomButton>
                    <CustomButton 
                      variant="outline"
                      iconLeft={<Share2 className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Share Certificate
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Certificates;

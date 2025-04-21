
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Certificate {
  id: string;
  title: string;
  event: string;
  issue_date: string;
  type: string;
  image_url: string | null;
  user_id: string;
  share_token: string;
}

const CertificateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Fetch certificate details
  const { data: certificate, isLoading } = useQuery({
    queryKey: ["certificate", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Certificate;
    },
    enabled: !!id,
  });
  
  // Check if the user is allowed to view this certificate
  const canViewCertificate = certificate && (
    user?.id === certificate.user_id || // User owns the certificate
    certificate.share_token // Certificate has a share token (public)
  );
  
  // Download certificate as PDF
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast({
        title: "Preparing certificate",
        description: "Generating your certificate for download...",
      });
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certificate?.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      
      toast({
        title: "Download complete",
        description: "Your certificate has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download failed",
        description: "There was a problem generating the certificate",
        variant: "destructive",
      });
    }
  };
  
  // Share certificate
  const shareCertificate = async () => {
    if (!certificate) return;
    
    const shareUrl = `${window.location.origin}/certificates/${id}?token=${certificate.share_token}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Certificate share link copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Failed to copy link",
        description: shareUrl,
        variant: "destructive",
      });
    }
  };
  
  // Handle unauthorized access
  useEffect(() => {
    if (!isLoading && certificate && !canViewCertificate) {
      toast({
        title: "Access denied",
        description: "You don't have permission to view this certificate",
        variant: "destructive",
      });
      navigate("/certificates");
    }
  }, [certificate, canViewCertificate, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue mx-auto"></div>
          <p className="mt-4 text-campus-neutral-600">Loading certificate...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!certificate) {
    return (
      <MainLayout>
        <div className="pt-32 pb-16 text-center">
          <p className="text-red-500">Certificate not found.</p>
          <CustomButton 
            variant="outline"
            className="mt-4"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/certificates")}
          >
            Back to Certificates
          </CustomButton>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CustomButton 
              variant="outline"
              size="sm"
              iconLeft={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/certificates")}
            >
              Back to Certificates
            </CustomButton>
            
            <div className="flex gap-2">
              <CustomButton
                variant="outline"
                size="sm"
                iconLeft={<Share2 className="h-4 w-4" />}
                onClick={shareCertificate}
              >
                Share
              </CustomButton>
              
              <CustomButton
                variant="primary"
                size="sm"
                iconLeft={<Download className="h-4 w-4" />}
                onClick={downloadCertificate}
              >
                Download PDF
              </CustomButton>
            </div>
          </div>
          
          {/* Certificate preview */}
          <div className="relative border-8 border-campus-blue-dark rounded-lg overflow-hidden shadow-xl bg-white">
            <div ref={certificateRef} className="p-12 min-h-[500px] text-center">
              {/* Certificate content */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 border-[16px] border-campus-blue rounded-lg"></div>
                <div className="flex h-full">
                  <div className="w-20 h-full bg-campus-blue"></div>
                  <div className="flex-1"></div>
                  <div className="w-20 h-full bg-campus-blue"></div>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-2 text-campus-blue">
                    Certificate of {certificate.type}
                  </h1>
                  <div className="h-1 w-32 bg-campus-blue mx-auto"></div>
                </div>
                
                <div className="mb-8">
                  <p className="text-lg text-campus-neutral-600">This is to certify that</p>
                  <h2 className="text-3xl font-bold mt-2 mb-2 text-campus-neutral-900 italic">
                    {/* User's name would be fetched and displayed here */}
                    John Doe
                  </h2>
                  <p className="text-lg text-campus-neutral-600">has successfully participated in</p>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-campus-neutral-800">
                    {certificate.title}
                  </h3>
                  <p className="text-lg text-campus-neutral-600 mt-1">{certificate.event}</p>
                </div>
                
                <div className="mb-8">
                  <p className="text-base text-campus-neutral-600">
                    Issued on {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mt-16 flex justify-center">
                  <div className="w-48 border-t border-campus-neutral-300 pt-2">
                    <p className="text-campus-neutral-600 text-sm">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CertificateDetail;

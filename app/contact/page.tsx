export const metadata = { 
  title: 'Contact — Barely Functional Co',
  description: 'Get in touch with Barely Functional Co for questions, collaborations, or tool suggestions.'
};

export default function Contact() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#F6FAF9] rounded-2xl p-8 md:p-12 border border-black/5">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0D0F1A] mb-6">
            Contact
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-[#0D0F1A]/80 mb-8">
              Questions, collab ideas, or tool suggestions? We read everything (eventually).
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-lg p-6 border border-black/5">
                <p className="text-sm text-[#0D0F1A]/60 mb-1">General Enquiries</p>
                <p className="text-xl font-semibold text-[#0D0F1A]">
                  <a href="mailto:hello@barelyfunctionalco.com" className="text-[#64C3B0] hover:underline">
                    hello@barelyfunctionalco.com
                  </a>
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-black/5">
                <p className="text-sm text-[#0D0F1A]/60 mb-1">Media & Collaborations</p>
                <p className="text-xl font-semibold text-[#0D0F1A]">
                  <a href="mailto:partnerships@barelyfunctionalco.com" className="text-[#64C3B0] hover:underline">
                    partnerships@barelyfunctionalco.com
                  </a>
                </p>
              </div>
            </div>
            
            <p className="text-sm text-[#0D0F1A]/50 italic">
              Prefer a form? We're considering adding one. For now, email works just fine.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-[#0D0F1A]/60">
            For managers, misfits, and the quietly competent
          </p>
        </div>
      </div>
    </main>
  );
}

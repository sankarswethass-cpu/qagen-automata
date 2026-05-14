import PageShell from "@/components/site/PageShell";
import SEO from "@/components/site/SEO";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Outputs from "@/components/landing/Outputs";
import Integrations from "@/components/landing/Integrations";
import SocialProof from "@/components/landing/SocialProof";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <PageShell>
      <SEO
        title="QAGen AI — AI-Powered QA Test Case Generation"
        description="Generate production-grade test cases plus Playwright UI and API scripts from plain requirements. Catch edge cases, security gaps, and boundary conditions instantly."
        path="/"
      />
      <Hero />
      <Problem />
      <HowItWorks />
      <Outputs />
      <Integrations />
      <SocialProof />
      <FinalCTA />
    </PageShell>
  );
};

export default Index;

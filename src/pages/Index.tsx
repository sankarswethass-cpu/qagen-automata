import PageShell from "@/components/site/PageShell";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Showcase from "@/components/landing/Showcase";
import Outputs from "@/components/landing/Outputs";
import Integrations from "@/components/landing/Integrations";
import SocialProof from "@/components/landing/SocialProof";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <PageShell>
      <Hero />
      <Problem />
      <HowItWorks />
      <Showcase />
      <Outputs />
      <Integrations />
      <SocialProof />
      <FinalCTA />
    </PageShell>
  );
};

export default Index;

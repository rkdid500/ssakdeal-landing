import { createFileRoute } from "@tanstack/react-router";

import {
  Compare,
  Consult,
  Customers,
  FinalCta,
  Footer,
  Hero,
  Moments,
  Reasons,
  Reviews,
  Steps,
  Trust,
  Worry,
} from "@/components/site/landing";
import { QuickBar } from "@/components/site/quick-bar";
import { ToTop } from "@/components/site/to-top";

export const Route = createFileRoute("/")({
  component: Index,
});

// Mobile-first single column (max 480px). On wide screens the column sits
// centered on the brand backdrop.
function Index() {
  return (
    <div className="stage">
      <main className="page">
        <Hero />
        <Trust />
        <Compare />
        <Customers />
        <Consult />
        <Worry />
        <Reasons />
        <Moments />
        <Steps />
        <Reviews />
        <FinalCta />
        <Footer />
      </main>
      <ToTop />
      <QuickBar />
    </div>
  );
}

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

export function App() {
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

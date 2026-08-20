import InvestmentCalculator from "@/components/investment-calculator";
import PublicShell from "@/components/public-shell";

export default function ReturnsCalculatorPage() {
  return (
    <PublicShell
      compact
      eyebrow="Returns calculator"
      title="Model your return before you commit."
      description="Set the vehicle, capital, term, and profit handling to see monthly profit, total profit, and maturity value. Compare the 24% annual Neat Ethical vehicle with the 60% annual Neat Funding vehicle before you place your investment."
    >
      <InvestmentCalculator />
    </PublicShell>
  );
}

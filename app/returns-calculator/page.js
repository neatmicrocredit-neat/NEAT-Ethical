import InvestmentCalculator from "@/components/investment-calculator";
import PublicShell from "@/components/public-shell";

export default function ReturnsCalculatorPage() {
  return (
    <PublicShell
      eyebrow="Returns calculator"
      title="Model Ethical Investments and Ethical Funding returns."
      description="Compare the 24% annual Neat Ethical vehicle with the 60% annual Neat Funding vehicle before you request a placement."
    >
      <InvestmentCalculator />
    </PublicShell>
  );
}

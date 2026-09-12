import LegalDocument from "@/components/legal-document";
import { LAST_UPDATED_ISO, TERMS_OF_USE } from "@/lib/legal";

export const metadata = {
  title: "Terms of Use · NEAT Ethical Investments",
  description:
    "The terms governing your use of the NEAT Ethical Investments website, investor dashboard, calculators, forms and related services.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    title: "Terms of Use · NEAT Ethical Investments",
    description: "The terms governing your use of the NEAT Ethical Investments website and services.",
    type: "article",
    modifiedTime: LAST_UPDATED_ISO,
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      document={TERMS_OF_USE}
      related={{ href: "/privacy-policy", label: "Read the Privacy Policy" }}
    />
  );
}

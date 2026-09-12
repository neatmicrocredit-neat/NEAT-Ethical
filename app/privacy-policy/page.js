import LegalDocument from "@/components/legal-document";
import { LAST_UPDATED_ISO, PRIVACY_POLICY } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy · NEAT Ethical Investments",
  description:
    "How NEAT Ethical Investments collects, uses, stores, protects and discloses personal information — and the rights you have over it.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy · NEAT Ethical Investments",
    description: "How NEAT Ethical Investments handles personal information.",
    type: "article",
    modifiedTime: LAST_UPDATED_ISO,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      document={PRIVACY_POLICY}
      related={{ href: "/terms-of-service", label: "Read the Terms of Use" }}
    />
  );
}

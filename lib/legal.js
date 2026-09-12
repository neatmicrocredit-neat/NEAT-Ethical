/**
 * The Terms of Use and Privacy Policy, as structured content.
 *
 * Held as data rather than JSX so the wording stays readable and reviewable in
 * one place, and so both documents render through the same component — the
 * numbering, anchors and contents list are derived, never hand-maintained.
 *
 * Source of record: resources/Terms of Use.md and resources/Privacy Policy.md.
 * Edit the wording here and keep those files in step.
 *
 * A block is either { text } for a paragraph or { items } for a bullet list.
 */

/** Human-readable for the page; ISO for metadata, which expects a machine date. */
export const LAST_UPDATED = "9 September 2026";
export const LAST_UPDATED_ISO = "2026-09-09";

const p = (text) => ({ text });
const ul = (items) => ({ items });

export const TERMS_OF_USE = {
  slug: "terms-of-service",
  title: "Terms of Use",
  eyebrow: "Terms",
  heading: "The terms that govern your use of NEAT Ethical.",
  summary:
    "These Terms cover our website, investor dashboard, calculators, forms and related services — what you can expect from us, and what we ask of you.",
  intro: [
    p("Welcome to NEAT Ethical Investments."),
    p(
      "These Terms of Use (“Terms”) govern your access to and use of the NEAT Ethical Investments website, investor dashboard, digital platforms, calculators, forms, content, and related services."
    ),
    p(
      "In these Terms, “NEAT Ethical”, “we”, “us”, and “our” refer to NEAT Ethical Investments. “You” and “your” refer to any visitor, user, customer, prospective customer, investor, applicant, or other person accessing our website or services."
    ),
    p("By accessing or using our website or services, you agree to be bound by these Terms and our Privacy Policy."),
    p("If you do not agree with these Terms, you should not use the website or related services."),
  ],
  sections: [
    {
      id: "about-our-website-and-services",
      title: "About Our Website and Services",
      blocks: [
        p(
          "The NEAT Ethical website provides information about our services and offerings, including ethical investment and funding opportunities and related services."
        ),
        p("The website may also provide access to features such as:"),
        ul([
          "Investment information",
          "Funding information",
          "Investment return calculations",
          "Account registration and login",
          "Investor dashboard functionality",
          "Enquiries and contact channels",
          "Applications and related digital services",
        ]),
        p("The availability of any product, service, feature, or offering may change from time to time."),
      ],
    },
    {
      id: "information-on-the-website",
      title: "Information on the Website",
      blocks: [
        p(
          "We aim to ensure that information presented on our website is accurate and useful. However, website content may be updated, corrected, modified, or removed from time to time."
        ),
        p("Information on the website is provided for general informational purposes unless expressly stated otherwise."),
        p("Website content should not automatically be interpreted as:"),
        ul([
          "Personal financial advice",
          "Legal advice",
          "Tax advice",
          "A guarantee of a particular financial outcome",
          "A guarantee that any application will be approved",
        ]),
        p(
          "You should consider obtaining independent professional advice where appropriate before making financial or other significant decisions."
        ),
      ],
    },
    {
      id: "investment-and-return-information",
      title: "Investment and Return Information",
      blocks: [
        p(
          "Where NEAT Ethical presents information regarding investment opportunities, projected returns, profit structures, rates, periods, or calculations, such information must be understood within the specific terms applicable to the relevant product or agreement."
        ),
        p(
          "The availability of an investment opportunity and the terms applicable to it may depend on factors including eligibility, documentation, verification, applicable agreements, and other requirements."
        ),
        p(
          "Any calculator or illustrative tool made available on the website is intended to provide estimates based on the information entered and the assumptions or terms applicable to the relevant offering."
        ),
        p(
          "Calculator results are illustrative and should not, by themselves, be treated as a final contractual statement, guarantee, or confirmation of an investment transaction."
        ),
        p("The applicable investment agreement and officially confirmed terms will govern the relevant transaction."),
      ],
    },
    {
      id: "funding-services",
      title: "Funding Services",
      blocks: [
        p(
          "Information regarding ethical funding or financing services is subject to the terms, eligibility requirements, assessment procedures, documentation, and agreements applicable to the relevant funding arrangement."
        ),
        p("Submitting an enquiry or application does not guarantee approval or the provision of funding."),
        p(
          "NEAT Ethical may assess applications using criteria considered relevant to the applicable service and may request additional information or documentation."
        ),
        p("Any approved arrangement will be governed by the specific terms and agreements applicable to that transaction."),
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility",
      blocks: [
        p(
          "You must be legally capable of entering into binding agreements and must satisfy any applicable eligibility requirements before accessing certain services or entering into a transaction with NEAT Ethical."
        ),
        p("We may require identity verification, documentation, or other information before providing access to certain services."),
        p(
          "We reserve the right, subject to applicable law, to refuse, suspend, or discontinue access where information is inaccurate, incomplete, misleading, fraudulent, or where continued access presents a legal, regulatory, security, or operational concern."
        ),
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      blocks: [
        p("Certain parts of our services may require you to create an account."),
        p("You agree to:"),
        ul([
          "Provide accurate and complete registration information",
          "Keep your information reasonably up to date",
          "Protect your password and account credentials",
          "Avoid sharing your account with unauthorized persons",
          "Notify us promptly of suspected unauthorized access",
        ]),
        p(
          "You are responsible for activities carried out through your account where such activities result from your failure to protect your credentials or otherwise comply with these Terms."
        ),
        p(
          "NEAT Ethical may suspend or restrict access to an account where reasonably necessary for security, compliance, fraud prevention, maintenance, or other legitimate purposes."
        ),
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      blocks: [
        p("You agree not to use our website or services to:"),
        ul([
          "Violate any applicable law or regulation",
          "Commit or facilitate fraud or other unlawful activity",
          "Provide false, misleading, or fraudulent information",
          "Attempt to gain unauthorized access to accounts, systems, databases, or networks",
          "Interfere with the security or operation of our website",
          "Introduce malicious software, code, or harmful materials",
          "Scrape, copy, extract, or systematically collect website data without authorization where prohibited by applicable law",
          "Impersonate another person or organization",
          "Use our services in a manner that infringes the rights of others",
          "Attempt to circumvent security, access controls, or technical restrictions",
        ]),
        p("We may take appropriate action where misuse or unauthorized activity is detected."),
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      blocks: [
        p(
          "Unless otherwise stated, the content available on the NEAT Ethical website, including text, graphics, logos, branding, designs, layouts, software, and other materials, is owned by or licensed to NEAT Ethical and is protected by applicable intellectual property laws."
        ),
        p("You may access and use the website for lawful personal or authorized business purposes."),
        p(
          "You may not reproduce, distribute, modify, commercially exploit, reverse engineer, or create derivative works from protected website content without appropriate authorization, except where permitted by applicable law."
        ),
      ],
    },
    {
      id: "third-party-services-and-links",
      title: "Third-Party Services and Links",
      blocks: [
        p("Our website may provide access to or contain links to third-party websites or services."),
        p(
          "NEAT Ethical does not control all third-party services and is not responsible for their content, availability, security, policies, or practices."
        ),
        p("Your use of third-party websites and services may be subject to their own terms and privacy policies."),
      ],
    },
    {
      id: "website-availability",
      title: "Website Availability",
      blocks: [
        p("We aim to maintain the availability and proper functioning of our website and digital services."),
        p("However, access may occasionally be interrupted due to:"),
        ul([
          "Maintenance",
          "Technical issues",
          "Security measures",
          "Network or infrastructure failures",
          "Updates or system changes",
          "Events outside our reasonable control",
        ]),
        p("We may modify, suspend, restrict, or discontinue all or part of the website or a service where reasonably necessary."),
      ],
    },
    {
      id: "disclaimer-and-limitation-of-liability",
      title: "Disclaimer and Limitation of Liability",
      blocks: [
        p(
          "To the extent permitted by applicable law, NEAT Ethical does not guarantee that the website will always be uninterrupted, error-free, or free from all security vulnerabilities."
        ),
        p("You use the website and publicly available information at your own discretion."),
        p("Nothing in these Terms is intended to exclude or limit any liability that cannot legally be excluded or limited under applicable law."),
        p(
          "Where a specific investment, funding, financial, or other transaction is entered into with NEAT Ethical, the terms of the relevant agreement governing that transaction will apply in addition to these Terms."
        ),
        p(
          "Where there is a conflict between these Terms and a specific signed or accepted transaction agreement, the specific transaction agreement will govern to the extent of the conflict."
        ),
      ],
    },
    {
      id: "suspension-or-termination",
      title: "Suspension or Termination",
      blocks: [
        p("We may suspend, restrict, or terminate access to the website or services where reasonably necessary, including where:"),
        ul([
          "These Terms have been violated",
          "Fraudulent or suspicious activity is detected",
          "Information provided is false or misleading",
          "Continued access creates a security or compliance risk",
          "Required by law, regulation, or a competent authority",
          "Necessary to protect NEAT Ethical, its users, or its systems",
        ]),
        p("Termination or suspension does not affect rights or obligations that arose before the suspension or termination."),
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      blocks: [
        p("Our handling of personal information is governed by our Privacy Policy."),
        p(
          "By using our website or services, you acknowledge that personal information may be processed in accordance with the Privacy Policy and applicable law."
        ),
      ],
    },
    {
      id: "changes-to-these-terms",
      title: "Changes to These Terms",
      blocks: [
        p("NEAT Ethical may update these Terms from time to time."),
        p("Updated Terms will be published on the website with a revised “Last Updated” date."),
        p("Where required by applicable law, we will provide additional notice of material changes."),
        p(
          "Continued use of the website or services after updated Terms become effective may constitute acceptance of the updated Terms, subject to applicable law."
        ),
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law",
      blocks: [
        p(
          "These Terms shall be interpreted and governed in accordance with the applicable laws governing NEAT Ethical Investments and its operations in Nigeria, unless otherwise required by a specific agreement or applicable law."
        ),
        p(
          "Any dispute relating to the use of the website or services shall be handled in accordance with applicable law and the relevant contractual arrangements between the parties."
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact Us",
      blocks: [
        p("If you have questions about these Terms of Use, please contact NEAT Ethical Investments through the official contact channels provided on our website."),
      ],
    },
  ],
};

export const PRIVACY_POLICY = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  eyebrow: "Privacy",
  heading: "How NEAT Ethical handles your information.",
  summary:
    "What we collect, why we collect it, who we share it with, how long we keep it, and the rights you have over it.",
  intro: [
    p(
      "NEAT Ethical Investments (“NEAT Ethical”, “we”, “us”, or “our”) respects your privacy and is committed to protecting the personal information of our website visitors, prospective customers, investors, customers, and other users of our services."
    ),
    p(
      "This Privacy Policy explains how we collect, use, store, protect, and disclose information when you visit our website, use our investor dashboard, apply for or access our services, communicate with us, or otherwise interact with NEAT Ethical Investments."
    ),
    p("By accessing or using our website or services, you acknowledge that you have read and understood this Privacy Policy."),
  ],
  sections: [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      blocks: [
        p("We may collect personal information that you voluntarily provide to us or that is generated when you use our website and services."),
        p("Depending on your interaction with us, this information may include:"),
        ul([
          "Full name",
          "Email address",
          "Phone number",
          "Residential or business address",
          "Date of birth and other identification information where required",
          "Bank account or payment information where applicable",
          "Information submitted through investment, funding, registration, contact, or other application forms",
          "Account and profile information",
          "Communications and correspondence with NEAT Ethical",
          "Information required for identity verification, compliance, risk assessment, or other legitimate business purposes",
        ]),
        p("We may also automatically collect certain technical information when you use our website, including:"),
        ul([
          "IP address",
          "Browser type and version",
          "Device information",
          "Operating system",
          "Pages visited",
          "Time and date of visits",
          "Referring pages or websites",
          "Cookies and similar technologies",
        ]),
      ],
    },
    {
      id: "how-we-use-your-information",
      title: "How We Use Your Information",
      blocks: [
        p("We may use your information to:"),
        ul([
          "Create and manage your account",
          "Provide access to our investor dashboard and other digital services",
          "Process applications, enquiries, investments, funding requests, or other transactions",
          "Communicate with you regarding your account or relationship with us",
          "Respond to enquiries and support requests",
          "Verify identity and information where necessary",
          "Conduct internal assessments, compliance procedures, and risk management",
          "Improve our website, services, systems, and customer experience",
          "Monitor and prevent fraud, misuse, unauthorized access, and other security incidents",
          "Meet legal, regulatory, accounting, and reporting obligations",
          "Send important service-related notices",
          "Send marketing or promotional communications where permitted by law and subject to your communication preferences",
        ]),
        p("We will only process personal information where we have a legitimate legal basis to do so."),
      ],
    },
    {
      id: "information-you-provide",
      title: "Information You Provide Through Applications and Forms",
      blocks: [
        p(
          "When you submit information through an application, enquiry, registration form, calculator, contact form, or other feature on our website, you authorize NEAT Ethical to use that information for the purpose for which it was provided and for other legitimate purposes connected with providing, administering, or improving our services."
        ),
        p("You are responsible for ensuring that information you provide to us is accurate, complete, and up to date."),
        p("Providing false, misleading, incomplete, or fraudulent information may affect your ability to access our services."),
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Similar Technologies",
      blocks: [
        p(
          "Our website may use cookies and similar technologies to improve functionality, understand how visitors use the website, maintain user sessions, enhance security, and improve the overall user experience."
        ),
        p("Cookies may help us remember preferences and understand website traffic and usage patterns."),
        p(
          "You may be able to manage or disable cookies through your browser settings. However, disabling certain cookies may affect the functionality or availability of some parts of our website or services."
        ),
      ],
    },
    {
      id: "how-we-share-information",
      title: "How We Share Information",
      blocks: [
        p("NEAT Ethical does not sell personal information as a business commodity."),
        p("We may disclose or share information where necessary with:"),
        ul([
          "Employees and authorized representatives of NEAT Ethical",
          "Professional advisers, auditors, and consultants",
          "Technology, hosting, payment, communication, identity verification, and other service providers",
          "Financial institutions and other parties involved in processing authorized transactions",
          "Regulatory authorities, government agencies, or law enforcement authorities where required or permitted by law",
          "Other parties where disclosure is necessary to protect our rights, property, customers, or the security of our systems",
          "Any successor, purchaser, or relevant party in connection with a restructuring, merger, acquisition, or transfer of business assets, where legally permitted",
        ]),
        p("We require appropriate parties handling information on our behalf to protect such information and use it only for authorized purposes."),
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      blocks: [
        p(
          "We take reasonable technical, organizational, and administrative measures to protect personal information against unauthorized access, alteration, disclosure, loss, or destruction."
        ),
        p("These measures may include access controls, authentication mechanisms, system monitoring, and other appropriate security practices."),
        p(
          "However, no internet transmission or electronic storage system can be guaranteed to be completely secure. While we take reasonable steps to protect information, we cannot guarantee absolute security."
        ),
        p("You are responsible for protecting your account credentials and should not share your password or login information with unauthorized persons."),
      ],
    },
    {
      id: "account-security",
      title: "Account Security",
      blocks: [
        p(
          "Where you have access to an investor dashboard or other account-based service, you are responsible for maintaining the confidentiality of your login credentials."
        ),
        p("You must notify us promptly if you believe that:"),
        ul([
          "Your account has been accessed without authorization",
          "Your password or credentials have been compromised",
          "You suspect fraudulent activity involving your account",
        ]),
        p("NEAT Ethical may take reasonable steps to protect an account where unauthorized access or suspicious activity is detected."),
      ],
    },
    {
      id: "data-retention",
      title: "Data Retention",
      blocks: [
        p("We retain personal information for as long as reasonably necessary to:"),
        ul([
          "Provide our services",
          "Maintain business and customer records",
          "Meet legal, regulatory, accounting, tax, and compliance obligations",
          "Resolve disputes",
          "Enforce agreements",
          "Protect our legal rights and legitimate interests",
        ]),
        p("The period for which information is retained may vary depending on the nature of the information and the purpose for which it was collected."),
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      blocks: [
        p("Subject to applicable law and any applicable limitations, you may have rights concerning your personal information, including the right to:"),
        ul([
          "Request access to certain personal information we hold about you",
          "Request correction of inaccurate or incomplete information",
          "Request deletion of information where applicable",
          "Object to or restrict certain processing activities",
          "Withdraw consent where processing is based on consent",
          "Request information about how your personal information is processed",
        ]),
        p("Some requests may be subject to legal, regulatory, contractual, security, or operational requirements."),
        p("To exercise applicable privacy rights, please contact us using the contact information provided on our website."),
      ],
    },
    {
      id: "third-party-websites",
      title: "Third-Party Websites and Services",
      blocks: [
        p("Our website may contain links to third-party websites, services, or platforms."),
        p(
          "NEAT Ethical is not responsible for the privacy practices, content, security, or policies of third-party websites or services. You should review the privacy policies of those third parties before providing them with personal information."
        ),
      ],
    },
    {
      id: "childrens-privacy",
      title: "Children’s Privacy",
      blocks: [
        p("Our services are not intended for individuals who are not legally eligible to enter into the relevant agreements or transactions offered by NEAT Ethical."),
        p("We do not knowingly collect personal information from children in connection with services that require legal or contractual capacity."),
      ],
    },
    {
      id: "changes-to-this-policy",
      title: "Changes to This Privacy Policy",
      blocks: [
        p("We may update this Privacy Policy from time to time to reflect changes in our services, operations, legal requirements, or privacy practices."),
        p("Any updated version will be published on our website with a revised “Last Updated” date."),
        p(
          "Your continued use of our website or services after an updated Privacy Policy becomes effective may be subject to the updated policy, to the extent permitted by applicable law."
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact Us",
      blocks: [
        p(
          "If you have questions, concerns, or requests relating to this Privacy Policy or the way NEAT Ethical handles personal information, please contact us through the contact channels provided on our website."
        ),
      ],
    },
  ],
};

import * as React from 'react';
import "@/styles/email-styles.css";





export default function CustomerWelcomeEmail({
  first_name,
  requestId,
  phone,
  submittedOn,
  companyName = "NEAT Ethical",
  supportEmail = "support@neatethical.com",
  websiteLink = "https://neatethical.com",
  linkedinLink = "#",
  twitterLink = "#",
  reviewDays = "2-3",
  decisionDays = "5-7",
}) {
  return (
    <div>
      {/* Preheader */}
      <div
        style={{
          display: "none",
          fontSize: "1px",
          lineHeight: "1px",
          maxHeight: 0,
          maxWidth: 0,
          opacity: 0,
          overflow: "hidden",
          MozHidden: "all",
          fontFamily: "sans-serif",
        }}
      >
        Thanks for joining {companyName} — your investment request has been received. Here&apos;s what happens next.
      </div>

      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ backgroundColor: "#eef1f5" }}
      >
        <tbody>
          <tr>
            <td align="center" style={{ padding: "32px 16px" }}>
              <table
                role="presentation"
                className="email-container"
                width="600"
                cellPadding="0"
                cellSpacing="0"
                border="0"
                style={{
                  width: "600px",
                  maxWidth: "600px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <tbody>
                  {/* Header */}
                  <tr>
                    <td style={{ backgroundColor: "#002b58", padding: "32px" }} className="fluid-padding" align="center">
                      {/* Logo / Company Name — replace with a plain <img> using an absolute URL if you have a logo asset */}
                      <img width={"200px"} height={"150px"} src="https://neat-ethical.vercel.app/img/ethical-logo-nobg.png" alt="Ethical Logo" />
                      <span
                        style={{
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#ffffff",
                          fontSize: "22px",
                          fontWeight: "bold",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {companyName}
                      </span>
                    </td>
                  </tr>

                  {/* Accent bar */}
                  <tr>
                    <td style={{ backgroundColor: "#0057a6", height: "4px", lineHeight: "4px", fontSize: 0 }}>
                      &nbsp;
                    </td>
                  </tr>

                  {/* Hero */}
                  <tr>
                    <td style={{ padding: "40px 32px 8px" }} className="fluid-padding" align="center">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "24px",
                                fontWeight: "bold",
                                color: "#002b58",
                                paddingBottom: "10px",
                              }}
                            >
                              Welcome, {first_name}!
                            </td>
                          </tr>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "15px",
                                lineHeight: "22px",
                                color: "#5b6572",
                              }}
                            >
                              We&apos;re glad to have you on the platform. Your investment request has been successfully submitted.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Confirmation card */}
                  <tr>
                    <td style={{ padding: "24px 32px 8px" }} className="fluid-padding">
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding="0"
                        cellSpacing="0"
                        border="0"
                        style={{ backgroundColor: "#eaf2fa", border: "1px solid #dbe7f2", borderRadius: "6px" }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ padding: "20px 24px" }}>
                              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                        fontSize: "14px",
                                        color: "#002b58",
                                        fontWeight: "bold",
                                        paddingBottom: "10px",
                                      }}
                                    >
                                      ✅ Submission Confirmed
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                        fontSize: "13px",
                                        color: "#333333",
                                        lineHeight: "20px",
                                      }}
                                    >
                                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                        <tbody>
                                          <tr>
                                            <td style={{ padding: "4px 0", width: "45%", color: "#6b7684" }}>
                                              Reference ID
                                            </td>
                                            <td style={{ padding: "4px 0", color: "#002b58", fontWeight: "bold" }}>
                                              {requestId}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "4px 0", color: "#6b7684" }}>Submitted On</td>
                                            <td style={{ padding: "4px 0", color: "#002b58", fontWeight: "bold" }}>
                                              {submittedOn}
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style={{ padding: "4px 0", color: "#6b7684" }}>Status</td>
                                            <td style={{ padding: "4px 0", color: "#0057a6", fontWeight: "bold" }}>
                                              Under Review
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Body copy */}
                  <tr>
                    <td style={{ padding: "28px 32px 8px" }} className="fluid-padding">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "15px",
                                lineHeight: "22px",
                                color: "#333333",
                              }}
                            >
                              <p style={{ margin: "0 0 16px" }}>Hi {first_name},</p>
                              <p style={{ margin: "0 0 16px" }}>
                                Thank you for submitting your investment request with {companyName}. Our team has received your information and will begin reviewing it shortly.
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* What to expect */}
                  <tr>
                    <td style={{ padding: "8px 32px 8px" }} className="fluid-padding">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "15px",
                                fontWeight: "bold",
                                color: "#002b58",
                                paddingBottom: "16px",
                              }}
                            >
                              What happens next
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Step 1 */}
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: "14px" }}>
                        <tbody>
                          <tr>
                            <td width="40" valign="top" style={{ paddingTop: "2px" }}>
                              <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                                <tbody>
                                  <tr>
                                    <td
                                      width="28"
                                      height="28"
                                      align="center"
                                      valign="middle"
                                      style={{
                                        backgroundColor: "#0057a6",
                                        borderRadius: "50%",
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                        fontSize: "13px",
                                        color: "#ffffff",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      1
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td
                              valign="top"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#333333",
                                paddingLeft: "8px",
                              }}
                            >
                              <strong style={{ color: "#002b58" }}>Initial Review</strong>
                              <br />
                              Our team verifies the details of your submission, typically within {reviewDays} business days.
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Step 2 */}
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: "14px" }}>
                        <tbody>
                          <tr>
                            <td width="40" valign="top" style={{ paddingTop: "2px" }}>
                              <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                                <tbody>
                                  <tr>
                                    <td
                                      width="28"
                                      height="28"
                                      align="center"
                                      valign="middle"
                                      style={{
                                        backgroundColor: "#0057a6",
                                        borderRadius: "50%",
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                        fontSize: "13px",
                                        color: "#ffffff",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      2
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td
                              valign="top"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#333333",
                                paddingLeft: "8px",
                              }}
                            >
                              <strong style={{ color: "#002b58" }}>Due Diligence &amp; Assessment</strong>
                              <br />
                              A member of our investment team will evaluate your request and may reach out if additional information is needed.
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Step 3 */}
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ marginBottom: "20px" }}>
                        <tbody>
                          <tr>
                            <td width="40" valign="top" style={{ paddingTop: "2px" }}>
                              <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                                <tbody>
                                  <tr>
                                    <td
                                      width="28"
                                      height="28"
                                      align="center"
                                      valign="middle"
                                      style={{
                                        backgroundColor: "#0057a6",
                                        borderRadius: "50%",
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                        fontSize: "13px",
                                        color: "#ffffff",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      3
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td
                              valign="top"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "14px",
                                lineHeight: "20px",
                                color: "#333333",
                                paddingLeft: "8px",
                              }}
                            >
                              <strong style={{ color: "#002b58" }}>Decision &amp; Next Steps</strong>
                              <br />
                              We&apos;ll follow up by email with a decision or a request for a follow-up call within {decisionDays} business days.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* CTA */}
                  <tr>
                    <td style={{ padding: "8px 32px 32px" }} className="fluid-padding" align="center">
                      <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td style={{ borderRadius: "5px", backgroundColor: "#0057a6" }}>
                              <a
                                href={`https://neatethical.com/investment-request/${requestId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-block",
                                  padding: "14px 30px",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: "#ffffff",
                                  textDecoration: "none",
                                  borderRadius: "5px",
                                }}
                              >
                                View Your Submission
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Divider */}
                  <tr>
                    <td style={{ padding: "0 32px" }}>
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td style={{ borderTop: "1px solid #e3e9f0", fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Support note */}
                  <tr>
                    <td style={{ padding: "24px 32px" }} className="fluid-padding">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "14px",
                                lineHeight: "21px",
                                color: "#5b6572",
                              }}
                            >
                              Have questions in the meantime? Reach our support team at{" "}
                              <a href={`mailto:${supportEmail}`} style={{ color: "#0057a6", textDecoration: "none", fontWeight: "bold" }}>
                                {supportEmail}
                              </a>{" "}
                              or call{" "}
                              <a href={`tel:${phone}`} style={{ color: "#0057a6", textDecoration: "none", fontWeight: "bold" }}>
                                {phone}
                              </a>
                              .
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Footer */}
                  <tr>
                    <td style={{ backgroundColor: "#002b58", padding: "28px 32px" }} className="fluid-padding">
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "13px",
                                color: "#ffffff",
                                fontWeight: "bold",
                                paddingBottom: "6px",
                              }}
                            >
                              NEAT Ethical
                            </td>
                          </tr>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "12px",
                                color: "#8fb6dd",
                                lineHeight: "18px",
                                paddingBottom: "14px",
                              }}
                            >
                              No. 5 Oyo Road, Kaduna central, Kaduna State. Nigeria.
                              <br />
                              {phone} &nbsp;|&nbsp;{" "}
                              <a href={`mailto:${supportEmail}`} style={{ color: "#8fb6dd", textDecoration: "underline" }}>
                                {supportEmail}
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style={{ paddingBottom: "14px" }}>
                              <a
                                href={websiteLink}
                                style={{
                                  color: "#8fb6dd",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: "12px",
                                  textDecoration: "underline",
                                  margin: "0 8px",
                                }}
                              >
                                Website
                              </a>
                              <a
                                href={linkedinLink}
                                style={{
                                  color: "#8fb6dd",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: "12px",
                                  textDecoration: "underline",
                                  margin: "0 8px",
                                }}
                              >
                                LinkedIn
                              </a>
                              <a
                                href={twitterLink}
                                style={{
                                  color: "#8fb6dd",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: "12px",
                                  textDecoration: "underline",
                                  margin: "0 8px",
                                }}
                              >
                                Twitter / X
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td
                              align="center"
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: "11px",
                                color: "#5f85ab",
                                lineHeight: "16px",
                                borderTop: "1px solid #0a3d6e",
                                paddingTop: "14px",
                              }}
                            >
                              &copy; {new Date().getFullYear()} NEAT Ethical. All rights reserved.
                              <br />
                              You&apos;re receiving this email because you submitted a request on our platform.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
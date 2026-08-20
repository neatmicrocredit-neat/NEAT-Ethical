import * as React from 'react';
import "@/styles/email-styles.css"

export function StaffEmailTemplate({
    first_name,
    last_name,
    phone_number,
    email,
    amount,
    referenceId,
    submittedOn,
    vehicle,
    dashboardLink = "https://neat-ethical.vercel.app/dashboard"
}) {
  return (
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <title>New Investment Submitted</title>
        </head>
        <body>
            <div>
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
                    A new investment has just been submitted and is awaiting review.
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
                                <td
                                style={{ backgroundColor: "#002b58", padding: "28px 32px" }}
                                className="fluid-padding"
                                >
                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td align="left" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                        {/* Logo / Company Name */}
                                        <img width={"200px"} height={"150px"} src="https://neat-ethical.vercel.app/img/ethical-logo-nobg.png" alt="Ethical Logo" />
                                        {/* <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", letterSpacing: "0.3px" }}>[Company Name]</span> */}
                                        </td>
                                        <td align="right" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                        <span
                                            style={{
                                            color: "#8fb6dd",
                                            fontSize: "12px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            }}
                                        >
                                            Internal Notice
                                        </span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </td>
                            </tr>

                            <tr>
                                <td style={{ backgroundColor: "#0057a6", height: "4px", lineHeight: "4px", fontSize: 0 }}>
                                &nbsp;
                                </td>
                            </tr>

                            <tr>
                                <td style={{ padding: 0 }}>
                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td
                                        style={{
                                            backgroundColor: "#eaf2fa",
                                            padding: "16px 32px",
                                            borderBottom: "1px solid #dbe7f2",
                                        }}
                                        className="fluid-padding"
                                        >
                                        <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                                            <tbody>
                                            <tr>
                                                <td
                                                style={{
                                                    fontFamily: "Arial, Helvetica, sans-serif",
                                                    fontSize: "14px",
                                                    color: "#002b58",
                                                    fontWeight: "bold",
                                                }}
                                                >
                                                🔔 New Investment Received
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

                            <tr>
                                <td style={{ padding: "32px" }} className="fluid-padding">
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
                                        <p style={{ margin: "0 0 16px" }}>Hi Team,</p>
                                        <p style={{ margin: "0 0 20px" }}>
                                            A new investment has just been submitted through the platform and is awaiting your review. Details are below.
                                        </p>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                                <table
                                    role="presentation"
                                    width="100%"
                                    cellPadding="0"
                                    cellSpacing="0"
                                    border="0"
                                    style={{
                                    backgroundColor: "#f6f8fb",
                                    border: "1px solid #e3e9f0",
                                    borderRadius: "6px",
                                    margin: "8px 0 24px",
                                    }}
                                >
                                    <tbody>
                                    <tr>
                                        <td style={{ padding: "20px 24px" }}>
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellPadding="0"
                                            cellSpacing="0"
                                            border="0"
                                            style={{
                                            fontFamily: "Arial, Helvetica, sans-serif",
                                            fontSize: "14px",
                                            color: "#333333",
                                            }}
                                        >
                                            <tbody>
                                            <tr>
                                                <td style={{ padding: "6px 0", width: "40%", color: "#6b7684", fontWeight: "bold" }}>
                                                Submitted by
                                                </td>
                                                <td style={{ padding: "6px 0", color: "#002b58" }}>
                                                {first_name} {last_name}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style={{ padding: "6px 0", width: "40%", color: "#6b7684", fontWeight: "bold" }}>
                                                Contact Info
                                                </td>
                                                <td style={{ padding: "6px 0", color: "#002b58" }}>Phone Number: {phone_number}</td>
                                                <td style={{ padding: "6px 0", color: "#002b58" }}>Email: {email}</td>
                                            </tr>

                                            <tr>
                                                <td
                                                style={{
                                                    padding: "6px 0",
                                                    borderTop: "1px solid #e3e9f0",
                                                    color: "#6b7684",
                                                    fontWeight: "bold",
                                                }}
                                                >
                                                Vehicle
                                                </td>
                                                <td style={{ padding: "6px 0", borderTop: "1px solid #e3e9f0", color: "#002b58" }}>
                                                {vehicle}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td
                                                style={{
                                                    padding: "6px 0",
                                                    borderTop: "1px solid #e3e9f0",
                                                    color: "#6b7684",
                                                    fontWeight: "bold",
                                                }}
                                                >
                                                Investment Amount
                                                </td>
                                                <td style={{ padding: "6px 0", borderTop: "1px solid #e3e9f0", color: "#002b58" }}>
                                                {amount}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td
                                                style={{
                                                    padding: "6px 0",
                                                    borderTop: "1px solid #e3e9f0",
                                                    color: "#6b7684",
                                                    fontWeight: "bold",
                                                }}
                                                >
                                                Reference ID
                                                </td>
                                                <td style={{ padding: "6px 0", borderTop: "1px solid #e3e9f0", color: "#002b58" }}>
                                                {referenceId}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td
                                                style={{
                                                    padding: "6px 0",
                                                    borderTop: "1px solid #e3e9f0",
                                                    color: "#6b7684",
                                                    fontWeight: "bold",
                                                }}
                                                >
                                                Submitted On
                                                </td>
                                                <td style={{ padding: "6px 0", borderTop: "1px solid #e3e9f0", color: "#002b58" }}>
                                                {submittedOn}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td
                                        style={{
                                            fontFamily: "Arial, Helvetica, sans-serif",
                                            fontSize: "15px",
                                            lineHeight: "22px",
                                            color: "#333333",
                                            paddingBottom: "24px",
                                        }}
                                        >
                                        Please review this investment at your earliest convenience and route it to the appropriate approver.
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                                <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td style={{ borderRadius: "5px", backgroundColor: "#0057a6" }}>
                                        {/* TODO: Add review Dashboard Link */}
                                        <a
                                            href={dashboardLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                            display: "inline-block",
                                            padding: "13px 28px",
                                            fontFamily: "Arial, Helvetica, sans-serif",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            color: "#ffffff",
                                            textDecoration: "none",
                                            borderRadius: "5px",
                                            }}
                                        >
                                            Review Investment
                                        </a>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </td>
                            </tr>

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

                            <tr>
                                <td style={{ padding: "20px 32px 32px" }} className="fluid-padding">
                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td
                                        style={{
                                            fontFamily: "Arial, Helvetica, sans-serif",
                                            fontSize: "12px",
                                            lineHeight: "18px",
                                            color: "#8a939e",
                                        }}
                                        >
                                        This is an automated notification generated by NEAT Ethical's internal investment system. If you were not expecting this notice, please contact IT support.
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                </td>
                            </tr>

                            <tr>
                                <td style={{ backgroundColor: "#002b58", padding: "20px 32px" }} className="fluid-padding">
                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
                                    <tbody>
                                    <tr>
                                        <td style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12px", color: "#8fb6dd" }}>
                                        &copy; {new Date().getFullYear()} NEAT Ethical. All rights reserved.
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
        </body>

    </html>
  );
}

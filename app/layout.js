import { Geist, Geist_Mono, Calistoga } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { WhatsAppFAB } from "@/components/whatsapp-fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const calistoga = Calistoga({
  variable: "--font-calistoga",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "NEAT Ethical Investments",
  description: "Ethical investments for a better future.",
};

export default function RootLayout({ children }) {
  const njt_wa = {"gdprStatus": "","accounts":[{"accountId":9836,"accountName":"Support","avatar":"","number":"+23409096852944","title":"Discuss with Lama","predefinedText":"Hello?","willBeBackText":"I will be back in [njwa_time_work]","dayOffsText":"I will be back soon","isAlwaysAvailable":"ON","daysOfWeekWorking":{"sunday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"monday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"tuesday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"wednesday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"thursday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"friday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]},"saturday":{"isWorkingOnDay":"OFF","workHours":[{"startTime":"08:00","endTime":"17:30"}]}}}],"options":{"display":{"displayCondition":"showAllPage","includePages":[],"excludePages":[],"includePosts":[],"showOnDesktop":"ON","showOnMobile":"ON","time_symbols":"h:m"},"styles":{"title":"Start a Conversation","responseText":"The team typically replies in a few minutes.","description":"Hi! Click one of our member below to chat on \u003Cstrong\u003EWhatsApp\u003C/strong\u003E","backgroundColor":"#2db742","textColor":"#fff","titleSize":18,"accountNameSize":14,"descriptionTextSize":12,"regularTextSize":11,"scrollHeight":500,"isShowScroll":"OFF","isShowResponseText":"ON","btnLabel":"Need Help? \u003Cstrong\u003EChat with us\u003C/strong\u003E","btnLabelWidth":156,"btnPosition":"right","btnLeftDistance":30,"btnRightDistance":30,"btnBottomDistance":30,"isShowBtnLabel":"ON","isShowGDPR":"OFF","gdprContent":"Please accept our \u003Ca href=\"https://ninjateam.org/privacy-policy/\"\u003Eprivacy policy\u003C/a\u003E first to start a conversation."},"analytics":{"enabledGoogle":"OFF","enabledFacebook":"OFF","enabledGoogleGA4":"OFF"}}}


  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${calistoga.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <WhatsAppFAB />
        <Script id="nta-js-popup-js" src="https://neatmicrocredit.com.ng/wp-content/plugins/wp-whatsapp/assets/js/whatsapp-popup.js?ver=3.8.0" />
      </body>
    </html>
  );
}

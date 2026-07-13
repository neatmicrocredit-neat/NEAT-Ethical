"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppFAB() {
  const pathname = usePathname();
  
  // Hide on dashboard pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <Link
      href="https://wa.me/+23409096852944?text=Hello%20NEAT%20Ethical%20Investments"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-6" />
    </Link>
  );
}

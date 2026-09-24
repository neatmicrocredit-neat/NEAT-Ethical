"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowLeftRight, BriefcaseBusiness, CircleDollarSign, Landmark as LandmarkIcon, LogOut, Menu, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  { href: "/portal", label: "Overview", icon: LandmarkIcon }, { href: "/portal/investments", label: "Investments", icon: BriefcaseBusiness },
  { href: "/portal/transactions", label: "Transactions", icon: ArrowLeftRight }, { href: "/portal/loans", label: "Loans", icon: CircleDollarSign }, { href: "/portal/profile", label: "My profile", icon: UserRound },
];

function Landmark() {
  return <Image loading="lazy" src="/img/ethical-logo-nobg.png" alt="NEAT Ethical logo" width={64} height={64} className="size-14 max-w-none rounded-xl bg-white object-contain" />;
}

function profileGaps(customer) {
  const groups = [
    ["Contact information", customer.phone_number && customer.email], ["Personal details", customer.gender && customer.date_of_birth && customer.address && customer.state && customer.lga],
    ["Verification details", customer.id_type && customer.id_number && customer.image_url && customer.id_front_url && customer.id_back_url], ["Next-of-kin details", customer.nok_name && customer.nok_phone_number && customer.nok_relationship && customer.nok_gender && customer.nok_address],
  ];
  return groups.filter(([, complete]) => !complete).map(([label]) => label);
}

function ProfileBanner({ gaps }) {
  return <section className="mb-8 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-[linear-gradient(110deg,#fffaf0,#fff)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertTriangle className="size-5"/></span><div><p className="font-black text-slate-950">Complete your profile</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Add your {gaps.join(", ").toLowerCase()} before making your next request.</p></div></div><Link href="/portal/profile" className="shrink-0 rounded-xl bg-[#075ca8] px-4 py-3 text-center text-sm font-black text-white shadow-[0_10px_22px_rgb(7_92_168_/_0.2)] transition hover:bg-[#004d91]">Complete profile</Link></section>;
}

export function CustomerPortalSection({ customer, eyebrow = "Customer portal", title, description, children, action }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const gaps = profileGaps(customer);

  async function logout() {
    await fetch("/api/customer-auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const nav = () => <nav className="flex-1 px-4 py-7">{navigation.map(({ href, label, icon: Icon }) => {
    const active = pathname === href;
    return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition ${active ? "bg-blue-50 text-[#075ca8]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="size-4"/>{label}</Link>;
  })}</nav>;

  const portalSidebar = (mobile = false) => <>
    <div className="flex h-24 items-center justify-between border-b border-slate-100 px-7">
      <Link href="/portal" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#075ca8] text-white"><Landmark /></span>
        <span><span className="block text-sm font-black tracking-tight text-slate-950">NEAT Ethical</span><span className="block text-[11px] font-bold text-slate-400">Customer portal</span></span>
      </Link>
      {mobile ? <button type="button" onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X className="size-5" /></button> : null}
    </div>
    {nav()}
    <div className="border-t border-slate-100 p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span className="grid size-9 place-items-center rounded-full bg-[#dbeafe] text-sm font-black text-[#075ca8]">{customer.first_name?.slice(0, 1).toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-xs font-black text-slate-900">{customer.first_name} {customer.last_name}</span><span className="block truncate text-[11px] font-semibold text-slate-500">{customer.email}</span></span></div>
      <button onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900"><LogOut className="size-4"/>Sign out</button>
    </div>
  </>;

  return <div className="min-h-screen bg-[#f5f8fc] text-slate-900">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">{portalSidebar()}</aside>
    {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Customer portal navigation">
      <button type="button" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" aria-label="Close navigation" />
      <aside id="customer-mobile-navigation" className="relative flex h-full w-[min(20rem,calc(100vw-3rem))] flex-col bg-white shadow-2xl">{portalSidebar(true)}</aside>
    </div> : null}
    <div className="lg:pl-64"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8"><button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2.5 lg:hidden" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="customer-mobile-navigation"><Menu className="size-5"/></button><div className="hidden sm:block"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#075ca8]">{eyebrow}</p><p className="mt-1 text-sm font-semibold text-slate-500">Manage your NEAT Ethical account</p></div><div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-black text-slate-900">{customer.first_name} {customer.last_name}</p><p className="text-[11px] font-semibold text-slate-500">{customer.account_number || "Account pending"}</p></div><span className="grid size-10 place-items-center rounded-full bg-[#075ca8] text-sm font-black text-white">{customer.first_name?.slice(0, 1).toUpperCase()}</span></div></div></header><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#075ca8]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{description}</p></div>{action || null}</div>{gaps.length ? <ProfileBanner gaps={gaps}/> : null}{children}</main></div>
  </div>;
}

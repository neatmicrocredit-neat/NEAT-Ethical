"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ArrowRight, MenuIcon } from "lucide-react"



export function MenuDrawer() {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  if (!isMobile) {
    return null
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      showSwipeHandle={isMobile}
      swipeDirection={"right"}
    >
      <DrawerTrigger render={<Button variant="ghost"><MenuIcon /></Button>} />

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-3 pl-10 flex flex-col gap-5 text-sm font-bold text-[var(--muted-ink)] ">
            <Link href="/about" className="transition hover:text-[var(--brand)]">
                About
            </Link>
            
            <Link href="/returns-calculator" className="transition hover:text-[var(--brand)]">
                Calculator
            </Link>

            <Link href="/contact" className="transition hover:text-[var(--brand)]">
                Contact
            </Link>
        </div>

        <DrawerFooter>
          <Link
              href="/investment-request"
              className="rounded-full flex content-between bg-[#0057a6] px-4 py-2 text-sm font-black text-white shadow-[0_14px_32px_rgb(44_22_182_/_0.26)] transition hover:-translate-y-0.5"
          >
              Start investing <ArrowRight />
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

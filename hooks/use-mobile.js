import * as React from "react"

const MOBILE_BREAKPOINT = 760

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    onChange()

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])

  return isMobile
}

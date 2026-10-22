import Link from "next/link";
import { cn } from "cn";
import { BrandLogo } from "./brand-logo";
import { PublicMobileMenu } from "./public-mobile-menu";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_NAV_LABELS, PUBLIC_NAV_LINK_CLASS, PUBLIC_NAV_LINKS, PUBLIC_SLANT_BUTTON_CLASS } from "@/shared/constants/public-navigation.constants";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-ink shadow-lg">
      <div className="flex h-20 items-stretch gap-6 pr-6 md:pr-10 lg:h-24">
        <Link href="/" aria-label={PUBLIC_NAV_LABELS.home} className="flex shrink-0 items-center bg-surface pr-14 pl-6 [clip-path:polygon(0_0,100%_0,calc(100%-2.5rem)_100%,0_100%)] md:pl-10"><BrandLogo priority className="w-40 lg:w-56" /></Link>
        <nav aria-label={PUBLIC_NAV_LABELS.navigation} className="hidden flex-1 items-center justify-center gap-2 xl:flex">
          {PUBLIC_NAV_LINKS.map((link) => <Link key={link.href} className={PUBLIC_NAV_LINK_CLASS} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-4 xl:ml-0">
          <Link href="/login" className={cn(PUBLIC_NAV_LINK_CLASS, "hidden lg:inline")}>{PUBLIC_NAV_LABELS.login}</Link>
          <Link href="/request-access" className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "hidden bg-danger text-surface hover:bg-danger/85 lg:inline-flex")}>{PUBLIC_NAV_LABELS.requestAccess}</Link>
          <PublicMobileMenu />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { PUBLIC_FOOTER, PUBLIC_FOOTER_LINK_CLASS, PUBLIC_NAV_LINKS } from "@/shared/constants/public-navigation.constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-surface/10 bg-ink text-surface">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr] md:px-10">
        <div>
          <p className="font-tight text-2xl font-extrabold uppercase">{PUBLIC_FOOTER.name}</p>
          <p className="mt-3 max-w-sm leading-relaxed text-surface/70">{PUBLIC_FOOTER.description}</p>
        </div>
        <nav aria-label={PUBLIC_FOOTER.exploreTitle}>
          <p className="font-tight text-sm font-extrabold tracking-wide uppercase">{PUBLIC_FOOTER.exploreTitle}</p>
          <ul className="mt-5 space-y-3">{PUBLIC_NAV_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={PUBLIC_FOOTER_LINK_CLASS}>{link.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label={PUBLIC_FOOTER.accountTitle}>
          <p className="font-tight text-sm font-extrabold tracking-wide uppercase">{PUBLIC_FOOTER.accountTitle}</p>
          <ul className="mt-5 space-y-3">{PUBLIC_FOOTER.accountLinks.map((link) => <li key={link.href}><Link href={link.href} className={PUBLIC_FOOTER_LINK_CLASS}>{link.label}</Link></li>)}</ul>
        </nav>
      </div>
      <div className="border-t border-surface/10">
        <p className="mx-auto max-w-[1440px] p-6 text-xs text-surface/50 md:px-10">{PUBLIC_FOOTER.copyright}</p>
      </div>
    </footer>
  );
}

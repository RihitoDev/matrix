export const PUBLIC_NAV_LINKS = [
  { href: "/#workshops", label: "Talleres" },
  { href: "/#community", label: "La comunidad" },
  { href: "/#audiences", label: "Para quién es" },
  { href: "/#how-to-join", label: "Cómo unirme" },
] as const;

export const PUBLIC_NAV_LABELS = {
  navigation: "Navegación pública",
  home: "UMSSY, volver al inicio",
  login: "Iniciar sesión",
  requestAccess: "Solicitar acceso",
  openMenu: "Abrir menú",
  menuTitle: "Menú",
} as const;

export const PUBLIC_NAV_LINK_CLASS =
  "px-3 py-2 font-tight text-sm font-extrabold tracking-wide whitespace-nowrap text-surface uppercase underline-offset-8 transition-colors hover:underline focus-visible:underline focus-visible:outline-none";

export const PUBLIC_SLANT_BUTTON_CLASS =
  "h-12 rounded-none px-10 font-tight text-sm font-extrabold tracking-wide uppercase [clip-path:polygon(1rem_0,100%_0,calc(100%-1rem)_100%,0_100%)]";

export const PUBLIC_FOOTER = {
  name: "UMSSY",
  description: "Acreditación y comunidad de la Universidad Mayor de San Simón.",
  exploreTitle: "Explora",
  accountTitle: "Tu cuenta",
  accountLinks: [
    { href: "/login", label: "Iniciar sesión" },
    { href: "/request-access", label: "Solicitar acceso" },
  ],
  copyright: "UMSSY · Universidad Mayor de San Simón",
} as const;

export const PUBLIC_FOOTER_LINK_CLASS = "text-surface/70 transition-colors hover:text-surface";

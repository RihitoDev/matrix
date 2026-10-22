export const HOME_HERO = {
  tag: "Comunidad UMSS",
  titleLines: ["Tu comunidad.", "Tu próximo paso."],
  description: "Conecta con mentores, participa en talleres y encuentra oportunidades profesionales.",
  action: { href: "#workshops", label: "Explorar talleres" },
  slides: [
    { src: "/images/auditorio-umss.webp", alt: "Auditorio de la UMSS con su vitral y estudiantes en una charla", position: "50% 45%" },
    { src: "/images/scesi-umss.webp", alt: "Estudiantes en el stand de la SCESI UMSS", position: "50% 35%" },
    { src: "/images/campus-umss.webp", alt: "Edificio del campus de la UMSS entre árboles", position: "50% 48%" },
  ],
  slideLabel: "Mostrar imagen",
  switchLockMs: 500,
  autoplayMs: 6000,
} as const;

export const HOME_FEATURES = {
  title: "Lo que encuentras en UMSSY",
  items: [
    { tag: "Mentorías", title: "Encuentra orientación", description: "Revisa los horarios libres de los mentores y aprende de su experiencia.", imageSrc: "/images/community-learning.webp" },
    { tag: "Talleres", title: "Sigue aprendiendo", description: "Descubre talleres y actividades de la comunidad.", imageSrc: "/images/workshop-technology.webp" },
    { tag: "Empleo", title: "Explora oportunidades", description: "Consulta vacantes y acerca tu perfil a nuevas opciones laborales.", imageSrc: "/images/workshop-career.webp" },
  ],
} as const;

export const HOME_WORKSHOPS = {
  title: "Talleres de la comunidad",
  gateText: "Solicita acceso para ver todos los talleres e inscribirte.",
  action: { href: "/request-access", label: "Ver todos los talleres" },
} as const;

export const HOME_AUDIENCES = {
  title: "Para quién es",
  items: [
    { role: "Estudiantes", points: ["Consulta horarios de mentores", "Revisa vacantes", "Arma tu perfil profesional"] },
    { role: "Titulados", points: ["Inscríbete en talleres y eventos", "Revisa vacantes", "Postúlate como mentor"] },
    { role: "Mentores", points: ["Publica tu disponibilidad semanal", "Orienta a la comunidad", "Comparte tus áreas técnicas"] },
    { role: "Empresas", points: ["Publica ofertas laborales", "Encuentra perfiles afines", "Gestiona tu portal de empresa"] },
  ],
} as const;

export const HOME_STEPS = {
  title: "Cómo unirme",
  description: "Cinco pasos para unirte a la comunidad verificada de la carrera.",
  items: [
    { number: "01", title: "Solicita acceso", description: "Empieza tu solicitud en línea." },
    { number: "02", title: "Llena tus datos", description: "Quién eres y cómo contactarte." },
    { number: "03", title: "Sube tu documento", description: "Diploma académico o título en provisión nacional." },
    { number: "04", title: "Espera la revisión", description: "La carrera revisa tu solicitud en hasta 48 horas hábiles." },
    { number: "05", title: "Activa tu cuenta", description: "Ingresa el código que llega a tu correo." },
  ],
  action: { href: "/request-access", label: "Solicitar acceso" },
} as const;

export const HOME_SLANT_TAG_CLASS =
  "inline-block bg-danger py-1.5 pr-8 pl-4 font-tight text-base font-extrabold tracking-wide text-surface uppercase italic [clip-path:polygon(0_0,100%_0,calc(100%-1rem)_100%,0_100%)] md:text-lg";

export const HOME_SECTION_TITLE_CLASS = "font-tight text-3xl font-extrabold tracking-tight uppercase md:text-5xl";

export const HOME_SECTION_INNER_CLASS = "mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28";

export const HOME_HERO_SLANT_CLASS = "[--hero-slant:12rem] [--hero-step:3rem] md:[--hero-slant:15.625rem] md:[--hero-step:7rem]";

export const HOME_HERO_SLIDE_CLIP = (index: number, current: number, total: number) => {
  const edge =
    index < current
      ? `calc(var(--hero-step) * ${current - index === 1 ? 1.8 : 0.9})`
      : index === total - 1
        ? "calc(200% + var(--hero-slant))"
        : `calc(100% + var(--hero-slant) - var(--hero-step) * ${total - 1 - index})`;
  return `polygon(0% 0%, ${edge} 0%, calc(${edge} - var(--hero-slant)) 100%, 0% 100%)`;
};

export const HOME_SHIELD_LEFT_CLASS = "[clip-path:polygon(0_0,100%_0,0_100%)]";

export const HOME_SHIELD_RIGHT_CLASS = "[clip-path:polygon(0_0,100%_0,100%_100%)]";

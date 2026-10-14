import Image from "next/image";

export function SidebarBrandIcon() {
  return (
    <Image
      src="/icons/icon-192x192.png"
      alt=""
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-sm"
      aria-hidden="true"
    />
  );
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <SidebarBrandIcon />
      <div className="leading-tight">
        <p className="font-tight text-2xl font-extrabold tracking-wide text-surface">UMSSY</p>
        <p className="text-sm text-surface/80">Universidad para el futuro</p>
      </div>
    </div>
  );
}

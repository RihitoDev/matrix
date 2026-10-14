import { SidebarBrandIcon } from "@/shared/components/layout/sidebar-brand";

export function BackofficeBrand() {
  return (
    <div className="flex items-center gap-3 px-4 py-6">
      <SidebarBrandIcon />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-tight text-[28px] leading-none font-extrabold tracking-tight text-surface">UMSSY</p>
        <p className="text-sm text-surface/70">Backoffice de verificación</p>
      </div>
    </div>
  );
}

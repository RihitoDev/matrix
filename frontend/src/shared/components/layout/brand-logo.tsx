import Image from "next/image";
import { cn } from "cn";

import type { BrandLogoProps } from "@/shared/types/brand-logo-props.types";

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/icons/umssy-logo-web.svg"
      alt="UMSSY, Acreditación y comunidad"
      width={1450}
      height={440}
      priority={priority}
      className={cn("h-auto w-60 shrink-0", className)}
    />
  );
}

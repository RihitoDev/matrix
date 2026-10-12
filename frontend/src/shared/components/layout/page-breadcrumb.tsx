import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { PageBreadcrumbProps } from "@/shared/types/page-breadcrumb-props.types";

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumb aria-label="Ruta de navegación">
      <BreadcrumbList className="gap-2 text-sm text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.label}>
              <BreadcrumbItem className="gap-2">
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-ink">{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink render={<Link href={item.href} />} className="hover:text-ink">
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="[&>svg]:size-4" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

import type { NavigationItem } from "@/shared/types/navigation-item.types";
import type { RoleTag } from "@/shared/types/role-tag.types";

export function filterNavigationByRoles(
  items: readonly NavigationItem[],
  roles: readonly RoleTag[],
): NavigationItem[] {
  return items.flatMap((item) => {
    if (item.roles && !item.roles.some((role) => roles.includes(role)))
      return [];
    if (!item.children) return [item];
    const children = item.children.filter(
      (child) =>
        !child.roles || child.roles.some((role) => roles.includes(role)),
    );
    return children.length ? [{ ...item, children }] : [];
  });
}

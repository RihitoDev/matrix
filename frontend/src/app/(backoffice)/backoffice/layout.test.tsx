import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("rutas del backoffice", () => {
  it("viven fuera del grupo (app), cuyo layout renderiza el shell por defecto", () => {
    const layout = readFileSync(path.resolve(process.cwd(), "src/app/(backoffice)/backoffice/layout.tsx"), "utf8");

    expect(layout).toContain("BackofficeShell");
    expect(layout).not.toContain("AppShell");
    expect(path.resolve(process.cwd(), "src/app/(backoffice)/backoffice/layout.tsx")).not.toContain(`${path.sep}(app)${path.sep}`);
  });
});

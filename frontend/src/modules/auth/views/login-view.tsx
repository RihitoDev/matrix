"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/use-login";
import { NEXT_PARAM } from "../constants/session.constants";
import { resolvePostLoginPath } from "../utils/resolve-post-login-path";
import { startSession } from "../utils/session";
import { validateLoginFields, type LoginFieldErrors } from "../utils/validate-login-fields";

export function LoginView() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const errors = validateLoginFields(email, password);
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    const result = await login({ email, password });
    if (result) {
      startSession(result.accessToken);
      const next = new URLSearchParams(window.location.search).get(NEXT_PARAM);
      router.push(resolvePostLoginPath(result.roles ?? result.roleTag, next));
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-soft px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="font-tight text-3xl font-extrabold tracking-tight text-ink">UMSSY</span>
        <span className="h-6 w-px bg-gold" aria-hidden="true" />
        <span className="text-sm text-text-secondary">Universidad para el futuro</span>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[420px] rounded-[10px] border border-border bg-surface p-6 shadow-sm sm:p-8"
      >
        <h1 className="font-tight text-[26px] font-extrabold text-ink">Iniciar sesión</h1>
        <p className="mb-6 mt-1 text-[15px] text-text-secondary">
          Comunidad verificada de la UMSS
        </p>

        <div className="mb-4">
          <Label htmlFor="login-email" className="mb-1.5 text-[12.5px] font-semibold text-ink">
            Correo electrónico
          </Label>
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className="h-[42px] rounded-lg border-border bg-surface px-3 text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction md:text-[15px]"
            placeholder="nombre@ejemplo.com"
          />
          {fieldErrors.email ? (
            <p id="login-email-error" role="alert" className="mt-1.5 text-[13px] font-medium text-accent">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="mb-6">
          <Label htmlFor="login-password" className="mb-1.5 text-[12.5px] font-semibold text-ink">
            Contraseña
          </Label>
          <Input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            className="h-[42px] rounded-lg border-border bg-surface px-3 text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction md:text-[15px]"
            placeholder="********"
          />
          {fieldErrors.password ? (
            <p id="login-password-error" role="alert" className="mt-1.5 text-[13px] font-medium text-accent">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {error ? (
          <Alert className="mb-4 border-accent/30 bg-interaction text-accent">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="font-medium text-accent">{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-[42px] w-full rounded-lg bg-ink text-[14.5px] font-semibold text-surface hover:bg-ink/90"
        >
          {isLoading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </Button>

        <p className="mt-5 text-center text-sm text-text-secondary">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/request-access"
            className="font-semibold text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Solicita acceso
          </Link>
        </p>
      </form>
    </div>
  );
}

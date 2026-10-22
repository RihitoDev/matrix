"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/shared/components/layout/brand-logo";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle, Eye, EyeOff, ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/use-login";
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated";
import { NEXT_PARAM } from "../constants/session.constants";
import { resolvePostLoginPath } from "../utils/resolve-post-login-path";
import { startSession } from "../utils/session";
import { validateLoginFields, type LoginFieldErrors } from "../utils/validate-login-fields";

export function LoginView() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  useRedirectAuthenticated(!isSigningIn);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const errors = validateLoginFields(email, password);
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    const result = await login({ email, password });
    if (result) {
      setIsSigningIn(true);
      startSession(result.accessToken);
      const next = new URLSearchParams(window.location.search).get(NEXT_PARAM);
      router.push(resolvePostLoginPath(result.roles ?? result.roleTag, next));
    }
  }

  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <aside className="relative hidden lg:block">
        <Image src="/images/campus-fcyt.webp" alt="" fill priority sizes="50vw" className="object-cover" />
      </aside>
      <div className="flex min-h-dvh flex-col px-8 py-9 lg:px-12 xl:px-16">
        <Link href="/" className="flex items-center gap-2 self-start text-sm font-medium text-accent"><ArrowLeft className="size-4" aria-hidden="true" />Volver al inicio</Link>
        <div className="flex flex-1 items-center justify-center py-12">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[440px]"
      >
        <Link href="/" aria-label="UMSSY, volver al inicio" className="mb-8 inline-block"><BrandLogo priority className="w-56" /></Link>
        <h1 className="font-tight text-4xl font-extrabold text-ink">Iniciar sesión</h1>
        <p className="mt-3 mb-8 text-base text-text-secondary">
          Ingresa con tu cuenta de UMSSY.
        </p>

        <div className="mb-4">
          <Label htmlFor="login-email" className="mb-1.5 text-[12.5px] font-semibold text-ink">
            Correo electrónico
          </Label>
          <div className="relative"><Mail className="pointer-events-none absolute top-4 left-4 size-5 text-accent" aria-hidden="true" /><Input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "login-email-hint login-email-error" : "login-email-hint"}
            className="h-13 rounded-lg border-border-strong bg-surface px-12 text-base text-ink focus-visible:border-accent focus-visible:ring-accent/15 md:text-base"
            placeholder="nombre@ejemplo.com"
          /></div>
          <p id="login-email-hint" className="mt-2 text-xs text-text-secondary">Usa el correo con el que solicitaste acceso.</p>
          {fieldErrors.email ? (
            <p id="login-email-error" role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="mb-6">
          <Label htmlFor="login-password" className="mb-1.5 text-[12.5px] font-semibold text-ink">
            Contraseña
          </Label>
          <div className="relative"><LockKeyhole className="pointer-events-none absolute top-4 left-4 size-5 text-accent" aria-hidden="true" /><Input
            id="login-password"
            type={isPasswordVisible ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            className="h-13 rounded-lg border-border-strong bg-surface px-12 text-base text-ink focus-visible:border-accent focus-visible:ring-accent/15 md:text-base"
            placeholder="Tu contraseña"
          />
          <Button type="button" variant="ghost" size="icon" aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={isPasswordVisible} onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute top-1.5 right-1.5">{isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button></div>
          {fieldErrors.password ? (
            <p id="login-password-error" role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {error ? (
          <Alert className="mb-4 border-danger/25 bg-surface text-danger">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="font-medium text-danger">{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-accent text-base font-semibold text-surface hover:bg-brand-hover"
        >
          {isLoading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
          {!isLoading ? <ArrowRight aria-hidden="true" /> : null}
        </Button>

        <p className="mt-8 border-t border-border pt-6 text-center text-sm text-text-secondary">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/request-access"
            className="font-semibold text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            Solicitar acceso
          </Link>
        </p>
        <div className="mt-6 border-t border-border pt-6 text-center"><Link href="/workshops" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">Explorar talleres sin iniciar sesión<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </form></div>
        <p className="text-center text-xs text-text-secondary">UMSSY · Universidad Mayor de San Simón</p>
      </div>
    </main>
  );
}

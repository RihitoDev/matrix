"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReviewDetail } from "../../types/request-review.types";
import { valuesMatch } from "../../utils/compare-values";
import type { ContrastField } from "../../types/contrast-field.types";
import type { DataContrastPanelProps } from "../../types/data-contrast-panel-props.types";

function buildFields(detail: ReviewDetail): ContrastField[] {
  return [
    { key: "firstName", label: "Nombres", declared: detail.firstName },
    { key: "lastName", label: "Apellidos", declared: detail.lastName },
    { key: "idCardNumber", label: "Carnet de identidad", declared: detail.idCardNumber },
    { key: "sisCode", label: "Código SIS", declared: detail.sisCode },
    { key: "career", label: "Carrera", declared: detail.career },
    { key: "graduationYear", label: "Año de titulación", declared: String(detail.graduationYear) },
  ];
}

const HEAD_CLASS = "h-9 px-4 text-[12.5px] font-semibold text-text-secondary";

// Mientras la lectura automática del documento esté fuera de alcance, la persona revisora escribe el valor que ve en él
// TODO: confirmar con la docente cómo se obtiene el valor del documento
export function DataContrastPanel({ detail }: DataContrastPanelProps) {
  const fields = buildFields(detail);
  const [documentValues, setDocumentValues] = useState<Record<string, string>>({});

  const matching = fields.filter((field) => valuesMatch(field.declared, documentValues[field.key] ?? "")).length;
  const pending = fields.length - matching;

  return (
    <section className="overflow-hidden rounded-[10px] border border-border bg-surface" aria-label="Contraste de datos">
      <header className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
        <h2 className="font-tight text-[17px] font-bold text-ink">Contraste de datos</h2>
        <p className="flex items-center gap-4 text-sm text-ink" aria-live="polite">
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="size-4" strokeWidth={1.75} aria-hidden="true" />
            {matching} coinciden
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleAlert className="size-4 text-gold" strokeWidth={1.75} aria-hidden="true" />
            {pending} por verificar
          </span>
        </p>
      </header>

      <Table className="table-fixed">
        <TableHeader className="bg-surface-soft">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${HEAD_CLASS} w-[28%]`}>Dato</TableHead>
            <TableHead className={`${HEAD_CLASS} w-[30%]`}>Declarado</TableHead>
            <TableHead className={HEAD_CLASS}>En el documento</TableHead>
            <TableHead className="w-11 px-2">
              <span className="sr-only">Resultado</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => {
            const matches = valuesMatch(field.declared, documentValues[field.key] ?? "");
            const Icon = matches ? CircleCheck : CircleAlert;
            return (
              <TableRow key={field.key} className="border-border">
                <TableCell className="px-4 py-3 align-middle">
                  <Label htmlFor={`contrast-${field.key}`} className="font-semibold break-words text-ink">
                    {field.label}
                  </Label>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-sm whitespace-normal text-ink">{field.declared}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <Input
                    id={`contrast-${field.key}`}
                    value={documentValues[field.key] ?? ""}
                    onChange={(event) => setDocumentValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    placeholder="Valor en el documento"
                    className="h-[34px] rounded-lg"
                  />
                </TableCell>
                <TableCell className="px-2 align-middle">
                  <Icon className={matches ? "size-5 text-ink" : "size-5 text-gold"} strokeWidth={1.75} aria-hidden="true" />
                  <span className="sr-only">{matches ? "Coincide" : "Por verificar"}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

"use client";

import { useState } from "react";
import { CalendarDaysIcon, CircleAlertIcon } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toBoliviaTime, toUtcIso } from "@/shared/utils/date-time";
import { cn } from "cn";
import { FORM_TEXT, REQUIRED_MESSAGES, TIME_OPTIONS } from "../constants/availability.constants";
import type { BlockFormErrors } from "../types/block-form-errors.types";
import type { BlockFormField } from "../types/block-form-field.types";
import type { BlockFormProps } from "../types/block-form-props.types";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";
import { validateBlock } from "../utils/block-validation";
import { formatDayAndMonth, formatLongDate, getBoliviaToday, toCalendarDate, toDateString } from "../utils/calendar-date";

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  );
}

export function BlockForm({
  mode,
  initialValues,
  isSubmitting = false,
  disabled = false,
  submitError,
  onSubmit,
  onCancel,
}: BlockFormProps) {
  const [today] = useState(getBoliviaToday);
  const [date, setDate] = useState(() =>
    initialValues?.startAt ? toBoliviaTime(initialValues.startAt).date : "",
  );
  const [startTime, setStartTime] = useState(() =>
    initialValues?.startAt ? toBoliviaTime(initialValues.startAt).time : "",
  );
  const [endTime, setEndTime] = useState(() =>
    initialValues?.endAt ? toBoliviaTime(initialValues.endAt).time : "",
  );
  const [errors, setErrors] = useState<BlockFormErrors>({});

  const text = FORM_TEXT[mode];
  const selectedDate = date ? toCalendarDate(date) : undefined;

  const clearErrors = (...fields: BlockFormField[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => delete next[field]);
      return next;
    });
  };

  const handleDateSelect = (day?: Date) => {
    setDate(day ? toDateString(day) : "");
    clearErrors("date", "startAt");
  };

  const handleStartChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStartTime(event.target.value);
    clearErrors("startAt", "endAt");
  };

  const handleEndChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEndTime(event.target.value);
    clearErrors("endAt");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missing: BlockFormErrors = {};
    if (!date) missing.date = REQUIRED_MESSAGES.date;
    if (!startTime) missing.startAt = REQUIRED_MESSAGES.startAt;
    if (!endTime) missing.endAt = REQUIRED_MESSAGES.endAt;
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      return;
    }

    const values: CreateAvailabilityBlockInput = {
      startAt: toUtcIso(date, startTime),
      endAt: toUtcIso(date, endTime),
    };

    const validationErrors = validateBlock(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit(values);
  };

  return (
    <Card
      className={cn(
        "w-full [--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(6)]",
        mode === "edit" && "ring-1 ring-border-strong",
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold">{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate className="contents">
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6">
            <Field data-invalid={errors.date ? true : undefined}>
              <FieldLabel htmlFor="date" className="font-semibold">
                {text.dateLabel}
                <RequiredMark />
              </FieldLabel>
              <div className="relative">
                {mode === "edit" ? (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-10 items-center rounded-lg border border-transparent px-3 text-sm font-medium",
                        "bg-danger/10 text-ink",
                      )}
                    >
                      {date ? formatDayAndMonth(date) : ""}
                    </span>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      min={toDateString(today)}
                      onChange={(event) =>
                        handleDateSelect(event.target.value ? toCalendarDate(event.target.value) : undefined)
                      }
                      aria-invalid={errors.date ? true : undefined}
                      aria-describedby={errors.date ? "date-error" : undefined}
                      className={cn(
                        "absolute inset-0 h-full w-full cursor-pointer opacity-0",
                        "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                      )}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      id="date"
                      readOnly
                      value={date ? formatLongDate(date) : ""}
                      placeholder="Selecciona una fecha en el calendario"
                      aria-invalid={errors.date ? true : undefined}
                      aria-describedby={errors.date ? "date-error" : "date-hint"}
                      className="h-10 pr-10"
                    />
                    <CalendarDaysIcon
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                  </>
                )}
              </div>
              {mode !== "edit" && (
                <>
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    defaultMonth={selectedDate ?? today}
                    disabled={{ before: today }}
                    className="w-full rounded-lg border [--cell-size:--spacing(9)]"
                  />
                  <FieldDescription id="date-hint" className="text-xs">
                    Los días anteriores a hoy no se pueden elegir.
                  </FieldDescription>
                </>
              )}
              {errors.date && <FieldError id="date-error">{errors.date}</FieldError>}
            </Field>

            <FieldGroup
              className="grid grid-cols-2 gap-4"
            >
              <Field data-invalid={errors.startAt ? true : undefined}>
                <FieldLabel htmlFor="startAt" className="font-semibold">
                  {text.startLabel}
                  <RequiredMark />
                </FieldLabel>
                <NativeSelect
                  id="startAt"
                  name="startAt"
                  value={startTime}
                  onChange={handleStartChange}
                  aria-invalid={errors.startAt ? true : undefined}
                  aria-describedby={errors.startAt ? "startAt-error" : undefined}
                  className="w-full [&>select]:h-10"
                >
                  <NativeSelectOption value="">--:--</NativeSelectOption>
                  {TIME_OPTIONS.map((time) => (
                    <NativeSelectOption key={time} value={time}>
                      {time}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors.startAt && <FieldError id="startAt-error">{errors.startAt}</FieldError>}
              </Field>

              <Field data-invalid={errors.endAt ? true : undefined}>
                <FieldLabel htmlFor="endAt" className="font-semibold">
                  {text.endLabel}
                  <RequiredMark />
                </FieldLabel>
                <NativeSelect
                  id="endAt"
                  name="endAt"
                  value={endTime}
                  onChange={handleEndChange}
                  aria-invalid={errors.endAt ? true : undefined}
                  aria-describedby={errors.endAt ? "endAt-error" : undefined}
                  className="w-full [&>select]:h-10"
                >
                  <NativeSelectOption value="">--:--</NativeSelectOption>
                  {TIME_OPTIONS.map((time) => (
                    <NativeSelectOption key={time} value={time}>
                      {time}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors.endAt && <FieldError id="endAt-error">{errors.endAt}</FieldError>}
              </Field>

              {mode !== "edit" && (
                <FieldDescription className="col-span-2 text-xs">
                  La hora de fin debe ser posterior a la de inicio. Horario en hora de Bolivia (GMT-4).
                </FieldDescription>
              )}
            </FieldGroup>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden="true" />
              <AlertTitle>{submitError}</AlertTitle>
            </Alert>
          )}
        </CardContent>

        <CardFooter
          className={cn(
            "flex-col-reverse gap-2 bg-transparent",
            mode === "edit" ? "items-stretch" : "sm:flex-row sm:justify-end",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn("w-full", mode !== "edit" && "sm:w-auto")}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            className={cn(
              "w-full bg-accent text-surface hover:bg-danger",
              mode !== "edit" && "sm:w-auto",
            )}
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? "Guardando..." : text.submit}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

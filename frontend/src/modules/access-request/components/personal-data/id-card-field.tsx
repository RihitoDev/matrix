"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ID_CARD_ISSUED_IN } from "../../constants/id-card-issued-in.constants";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { usePersonalDataBind } from "../../hooks/use-personal-data-bind";
import { FieldError } from "./field-error";
import { PersonalDataField } from "./personal-data-field";
import { RequiredMark } from "./required-mark";

export function IdCardField() {
  const { values, fieldErrors, setValue } = useAccessRequestForm();
  const bind = usePersonalDataBind();

  return (
    <div>
      <div className="flex gap-2">
        <PersonalDataField
          id="idCardNumber"
          {...bind("idCardNumber")}
          label="Carnet de identidad"
          isRequired
          inputMode="numeric"
          maxLength={20}
          placeholder="Ej. 7845123"
          className="min-w-0 flex-1"
        />

        <div className="w-24 shrink-0">
          <Label htmlFor="idCardIssuedIn" className="mb-1.5 text-[12.5px] font-semibold text-ink 2xl:text-base">
            Expedido
            <RequiredMark />
          </Label>
          <Select
            name="idCardIssuedIn"
            value={values.idCardIssuedIn || null}
            onValueChange={(value) => setValue("idCardIssuedIn", value ?? "")}
          >
            <SelectTrigger
              id="idCardIssuedIn"
              aria-required="true"
              aria-invalid={fieldErrors.idCardIssuedIn ? true : undefined}
              aria-describedby={fieldErrors.idCardIssuedIn ? "idCardIssuedIn-error" : undefined}
              className="w-full rounded-md border-border bg-surface px-3 text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction data-[size=default]:h-[42px] 2xl:text-base 2xl:data-[size=default]:h-12"
            >
              <SelectValue placeholder="Elegir" />
            </SelectTrigger>
            <SelectContent>
              {ID_CARD_ISSUED_IN.map((code) => (
                <SelectItem
                  key={code}
                  value={code}
                  className="focus:bg-muted focus:text-foreground"
                >
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FieldError id="idCardIssuedIn-error" message={fieldErrors.idCardIssuedIn} />
    </div>
  );
}

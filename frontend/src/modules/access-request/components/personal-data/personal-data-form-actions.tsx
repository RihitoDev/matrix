"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { ClearDataDialog } from "./clear-data-dialog";

export function PersonalDataFormActions() {
  const { status, notice } = useAccessRequestForm();
  const isSubmitting = status === "submitting";

  return (
    <div className="flex flex-col items-end gap-3 border-t border-border pt-5 md:col-span-2">
      {notice ? (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`self-stretch text-[13.5px] 2xl:text-base ${
            notice.type === "error" ? "text-destructive" : "text-ink"
          }`}
        >
          {notice.text}
        </p>
      ) : null}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <ClearDataDialog />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[42px] 2xl:h-12 rounded-md bg-ink px-5 text-[14.5px] font-semibold text-surface hover:bg-ink/90"
        >
          {isSubmitting ? (
            "Guardando..."
          ) : (
            <>
              Continuar al siguiente paso
              <ChevronRight aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

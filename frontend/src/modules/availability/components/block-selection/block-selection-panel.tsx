import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BOLIVIA_TIME_LABEL } from "@/shared/constants/date-time.constants";
import { formatBlockRange } from "@/shared/utils/date-time";
import { BLOCK_SELECTION_TEXT } from "../../constants/block-selection.constants";
import type { BlockSelectionPanelProps } from "../../types/block-selection-panel-props.types";
import { formatBlockDate, getBlockDurationMinutes } from "../../utils/block-selection.utils";

export function BlockSelectionPanel({
  selectedBlock,
  unavailableBlock,
  isChecking,
  error,
}: BlockSelectionPanelProps) {
  return (
    <Card aria-label={BLOCK_SELECTION_TEXT.title}>
      <CardHeader>
        <CardTitle className="font-semibold">{BLOCK_SELECTION_TEXT.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {unavailableBlock && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>{BLOCK_SELECTION_TEXT.unavailableTitle}</AlertTitle>
            <AlertDescription>
              {formatBlockDate(unavailableBlock.startAt)},{" "}
              {formatBlockRange(unavailableBlock.startAt, unavailableBlock.endAt)}.{" "}
              {BLOCK_SELECTION_TEXT.unavailableDescription}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {isChecking ? (
          <div aria-busy="true" className="flex flex-col gap-2">
            <span className="sr-only">{BLOCK_SELECTION_TEXT.checking}</span>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : selectedBlock ? (
          <Card size="sm" className="bg-accent/5 ring-accent">
            <CardContent className="flex flex-col gap-1">
              <CardTitle className="font-bold">{formatBlockDate(selectedBlock.startAt)}</CardTitle>
              <CardDescription>
                {formatBlockRange(selectedBlock.startAt, selectedBlock.endAt)} ·{" "}
                {getBlockDurationMinutes(selectedBlock.startAt, selectedBlock.endAt)}{" "}
                {BLOCK_SELECTION_TEXT.minutesUnit}
              </CardDescription>
              <CardDescription className="text-xs">{BOLIVIA_TIME_LABEL}</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <CardDescription>{BLOCK_SELECTION_TEXT.empty}</CardDescription>
        )}
      </CardContent>

      <CardFooter className="bg-transparent">
        <Button type="button" className="w-full bg-accent text-surface hover:bg-danger" disabled>
          {BLOCK_SELECTION_TEXT.requestAppointment}
        </Button>
      </CardFooter>
    </Card>
  );
}

import { redirect } from "next/navigation";
import { INBOX_PATH } from "@/modules/request-review/constants/request-review.constants";

export default function BackofficePage() {
  redirect(INBOX_PATH);
}

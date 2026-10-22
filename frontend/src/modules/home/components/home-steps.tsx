import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_SLANT_BUTTON_CLASS } from "@/shared/constants/public-navigation.constants";
import { HOME_SECTION_INNER_CLASS, HOME_SECTION_TITLE_CLASS, HOME_SHIELD_LEFT_CLASS, HOME_SHIELD_RIGHT_CLASS, HOME_STEPS } from "../constants/home.constants";

export function HomeSteps() {
  return (
    <section id="how-to-join" className="relative scroll-mt-20 overflow-hidden bg-accent text-surface lg:scroll-mt-24">
      <div className={cn("absolute top-0 left-0 h-24 w-[46%] bg-danger md:h-40", HOME_SHIELD_LEFT_CLASS)} aria-hidden="true" />
      <div className={cn("absolute top-0 right-0 h-24 w-[46%] bg-danger md:h-40", HOME_SHIELD_RIGHT_CLASS)} aria-hidden="true" />
      <div className={cn(HOME_SECTION_INNER_CLASS, "relative pt-36 md:pt-52")}>
        <div className="text-center">
          <h2 className={cn(HOME_SECTION_TITLE_CLASS, "italic")}>{HOME_STEPS.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-surface/80">{HOME_STEPS.description}</p>
        </div>
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {HOME_STEPS.items.map((step) => (
            <li key={step.number} className="border-l-4 border-surface/25 pl-6">
              <p className="font-tight text-6xl font-extrabold text-surface/35 italic">{step.number}</p>
              <h3 className="mt-4 font-tight text-xl font-extrabold uppercase">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-surface/75">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex justify-center">
          <Link href={HOME_STEPS.action.href} className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "h-14 bg-danger px-12 text-surface hover:bg-danger/85")}>{HOME_STEPS.action.label}<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

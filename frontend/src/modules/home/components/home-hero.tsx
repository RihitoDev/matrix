import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_SLANT_BUTTON_CLASS } from "@/shared/constants/public-navigation.constants";
import { HomeHeroCarousel } from "./home-hero-carousel";
import { HOME_HERO } from "../constants/home.constants";

export function HomeHero() {
  return (
    <section className="bg-accent text-surface">
      <div className="mx-auto max-w-[1440px] px-6 pt-10 pb-20 md:px-10 md:pt-12 md:pb-24">
        <HomeHeroCarousel />
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-surface/80 md:text-xl">{HOME_HERO.description}</p>
          <Link href={HOME_HERO.action.href} className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "shrink-0 self-start bg-danger text-surface hover:bg-danger/85 md:self-auto")}>{HOME_HERO.action.label}<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

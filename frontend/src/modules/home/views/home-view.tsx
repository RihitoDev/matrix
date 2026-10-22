import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_SLANT_BUTTON_CLASS } from "@/shared/constants/public-navigation.constants";
import { PublicHeader, PublicFooter } from "@/shared/components/layout";
import { PublicEventsSection } from "@/modules/events";
import { HomeHero } from "../components/home-hero";
import { HomeFeatures } from "../components/home-features";
import { HomeAudiences } from "../components/home-audiences";
import { HomeSteps } from "../components/home-steps";
import { HomeSectionHeading } from "../components/home-section-heading";
import { HOME_SECTION_INNER_CLASS, HOME_WORKSHOPS } from "../constants/home.constants";

export function HomeView() {
  return (
    <div className="min-h-screen bg-ink text-ink">
      <PublicHeader />
      <main>
        <HomeHero />
        <HomeFeatures />
        <section className="bg-accent text-surface">
          <div className={HOME_SECTION_INNER_CLASS}>
            <div id="workshops" className="mb-14 scroll-mt-28 lg:scroll-mt-32">
              <HomeSectionHeading title={HOME_WORKSHOPS.title} />
            </div>
            <PublicEventsSection />
            <div className="mt-14 flex flex-col items-center gap-6 border-t border-surface/20 pt-10 text-center">
              <p className="max-w-xl text-lg leading-relaxed text-surface/80">{HOME_WORKSHOPS.gateText}</p>
              <Link href={HOME_WORKSHOPS.action.href} className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "bg-danger text-surface hover:bg-danger/85")}>{HOME_WORKSHOPS.action.label}<ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
        <HomeAudiences />
        <HomeSteps />
      </main>
      <PublicFooter />
    </div>
  );
}

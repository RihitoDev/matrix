import { Check } from "lucide-react";
import { HomeSectionHeading } from "./home-section-heading";
import { HOME_AUDIENCES, HOME_SECTION_INNER_CLASS, HOME_SLANT_TAG_CLASS } from "../constants/home.constants";

export function HomeAudiences() {
  return (
    <section id="audiences" className="scroll-mt-28 bg-ink text-surface">
      <div className={HOME_SECTION_INNER_CLASS}>
        <HomeSectionHeading title={HOME_AUDIENCES.title} />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_AUDIENCES.items.map((item) => (
            <article key={item.role} className="border-t-4 border-accent bg-surface/5 p-8">
              <h3 className={HOME_SLANT_TAG_CLASS}>{item.role}</h3>
              <ul className="mt-6 space-y-4">
                {item.points.map((point) => <li key={point} className="flex gap-3 leading-relaxed text-surface/80"><Check className="mt-0.5 size-5 shrink-0 text-surface" aria-hidden="true" />{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

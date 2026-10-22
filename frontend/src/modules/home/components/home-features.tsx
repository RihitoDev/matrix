import Image from "next/image";
import { HomeSectionHeading } from "./home-section-heading";
import { HOME_FEATURES, HOME_SECTION_INNER_CLASS, HOME_SLANT_TAG_CLASS } from "../constants/home.constants";

export function HomeFeatures() {
  return (
    <section id="community" className="scroll-mt-28 bg-ink text-surface">
      <div className={HOME_SECTION_INNER_CLASS}>
        <HomeSectionHeading title={HOME_FEATURES.title} />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {HOME_FEATURES.items.map((item) => (
            <article key={item.tag} className="bg-surface/5">
              <div className="relative aspect-4/3">
                <Image src={item.imageSrc} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <span className={`${HOME_SLANT_TAG_CLASS} absolute bottom-0 left-0`}>{item.tag}</span>
              </div>
              <div className="p-8">
                <h3 className="font-tight text-xl font-extrabold uppercase">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-surface/70">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

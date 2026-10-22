"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { HOME_HERO, HOME_HERO_SLANT_CLASS, HOME_HERO_SLIDE_CLIP, HOME_SLANT_TAG_CLASS } from "../constants/home.constants";

export function HomeHeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const lastSwitch = useRef(0);
  const total = HOME_HERO.slides.length;

  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (paused || reducedMotion || total < 2) return;
    const timer = window.setInterval(() => {
      lastSwitch.current = performance.now();
      setCurrent((index) => (index + 1) % total);
    }, HOME_HERO.autoplayMs);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const showOnHover = (index: number, event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.timeStamp - lastSwitch.current < HOME_HERO.switchLockMs) return;
    lastSwitch.current = event.timeStamp;
    setCurrent(index);
  };

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className={cn("relative h-[460px] overflow-hidden bg-ink md:h-[600px]", HOME_HERO_SLANT_CLASS)}>
        {HOME_HERO.slides.map((slide, index) => {
          const isCurrent = index === current;
          return (
            <div key={slide.src} style={{ clipPath: HOME_HERO_SLIDE_CLIP(index, current, total), zIndex: total - index }} className="absolute inset-0 transition-[clip-path] duration-500 ease-in-out motion-reduce:transition-none">
              <Image src={slide.src} alt={isCurrent ? slide.alt : ""} fill priority={index === 0} sizes="(min-width: 1440px) 1360px, 100vw" style={{ objectPosition: slide.position }} className="object-cover" />
              <div className={cn("pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500", isCurrent ? "opacity-0" : "opacity-50")} aria-hidden="true" />
              {!isCurrent && <div aria-hidden="true" onPointerEnter={(event) => showOnHover(index, event)} onPointerMove={(event) => showOnHover(index, event)} className="absolute inset-0" />}
            </div>
          );
        })}

        <div className="pointer-events-none absolute bottom-0 left-0 z-10 max-w-[85%] pb-5 md:pb-7">
          <span className={HOME_SLANT_TAG_CLASS}>{HOME_HERO.tag}</span>
          <h1 className="mt-3 pl-4 font-tight text-3xl leading-[0.95] font-extrabold tracking-tight text-surface uppercase drop-shadow-[0_2px_14px_rgb(11_31_46/0.9)] sm:text-5xl md:pl-6 xl:text-6xl">
            {HOME_HERO.titleLines[0]}<br /><span className="text-surface/80">{HOME_HERO.titleLines[1]}</span>
          </h1>
        </div>
      </div>

      {total > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          {HOME_HERO.slides.map((slide, index) => (
            <Button key={slide.src} variant="ghost" aria-label={`${HOME_HERO.slideLabel} ${index + 1}`} aria-current={index === current} onClick={() => setCurrent(index)} className="h-6 rounded-none p-0 hover:bg-transparent focus-visible:ring-surface">
              <span className={cn("block h-1.5 transition-all duration-300", index === current ? "w-16 bg-danger" : "w-8 bg-surface/40 hover:bg-surface/70")} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

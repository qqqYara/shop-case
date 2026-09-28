"use client";

import { useRef } from "react";
import { StepCard, type StepCardProps } from "@/components/StepCard";
import { useStackedCards } from "./useStackedCards";
import "./Steps.scss";

const STEPS: StepCardProps[] = [
  {
    number: "01",
    title: "Cleanse",
    tagline: "Start with a fresh canvas.",
    description:
      "Gently remove makeup, SPF and daily impurities without stripping your skin.",
    cta: "Shop cleansers",
    image: "/images/step1.png",
    imageWidth: 320,
    imageHeight: 214,
    imageAlt: "Pouring cleanser onto a cotton pad",
    variant: "cleanse",
  },
  {
    number: "02",
    title: "Treat",
    tagline: "Target what your skin needs.",
    description:
      "Serums and treatments deliver targeted ingredients to help with dryness, dullness, texture and blemishes.",
    cta: "Shop treatments",
    image: "/images/step2.png",
    imageWidth: 389,
    imageHeight: 160,
    imageAlt: "Pouring treatment onto a cotton pad",
    variant: "treat",
  },
  {
    number: "03",
    title: "Moisturise",
    tagline: "Lock in lasting hydration.",
    description:
      "Moisturisers help strengthen the skin barrier, lock in hydration and leave skin soft and balanced.",
    cta: "Shop moisturisers",
    image: "/images/step3.png",
    imageWidth: 300,
    imageHeight: 156,
    imageAlt: "Woman applying moisturiser in a mirror",
    variant: "moisturise",
  },
  {
    number: "04",
    title: "Protect",
    tagline: "Your essential final step.",
    description:
      "Daily SPF helps protect your skin from UV damage and keeps it looking healthy every day.",
    cta: "Shop SPF",
    image: "/images/step4.png",
    imageWidth: 391,
    imageHeight: 194,
    imageAlt: "Woman applying SPF with a cotton pad",
    variant: "protect",
  },
];

export function Steps() {
  const listRef = useRef<HTMLOListElement>(null);

  useStackedCards(listRef);

  return (
    <ol className="steps" ref={listRef}>
      {STEPS.map((step) => (
        <StepCard key={step.number} {...step} />
      ))}
    </ol>
  );
}

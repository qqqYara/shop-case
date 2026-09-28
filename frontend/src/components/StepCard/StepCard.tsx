"use client";

import { Button } from "@/components/Button";
import {
  useCategoriesPopup,
  type PopupStepId,
} from "@/components/Categories/CategoriesPopup";
import "./StepCard.scss";

export type StepCardVariant = PopupStepId;

export type StepCardProps = {
  number: string;
  title: string;
  tagline: string;
  description: string;
  cta: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  variant: StepCardVariant;
};

function StepCta({ label, stepId }: { label: string; stepId: PopupStepId }) {
  const { open } = useCategoriesPopup();

  return (
    <>
      <Button
        variant="cta"
        className="step-card__open"
        onClick={() => open(stepId)}
      >
        {label}
      </Button>
      <Button variant="cta" className="step-card__link" href="#">
        {label}
      </Button>
    </>
  );
}

export function StepCard({
  number,
  title,
  tagline,
  description,
  cta,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  variant,
}: StepCardProps) {
  return (
    <li className={`step-card step-card--${variant}`}>
      <div className="step-card__content">
        <div className="step-card__heading">
          <div className="step-card__title-row">
            <span className="step-card__number" aria-hidden="true">
              <span className="step-card__number-text">{number}</span>
            </span>
            <h3 className="step-card__title">{title}</h3>
          </div>
          <p className="step-card__tagline">{tagline}</p>
        </div>
        <p className="step-card__description">{description}</p>
        <StepCta label={cta} stepId={variant} />
      </div>
      <div className="step-card__image-wrap">
        <img
          className="step-card__image"
          src={image}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
        />
      </div>
    </li>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./Categories.scss";

const LAPTOP_QUERY = "(min-width: 1024px)";

const POPUP_STEPS = [
  { id: "cleanse", number: "01", title: "Cleanse" },
  { id: "treat", number: "02", title: "Treat" },
  { id: "moisturise", number: "03", title: "Moisturise" },
  { id: "protect", number: "04", title: "Protect" },
] as const;

export type PopupStepId = (typeof POPUP_STEPS)[number]["id"];

type CategoriesPopupContextValue = {
  open: (stepId: PopupStepId) => void;
};

const CategoriesPopupContext = createContext<CategoriesPopupContextValue | null>(
  null,
);

export function useCategoriesPopup() {
  const value = useContext(CategoriesPopupContext);

  if (!value) {
    throw new Error("useCategoriesPopup must be used within CategoriesPopup");
  }

  return value;
}

type CategoriesPopupProps = {
  steps: ReactNode;
  categories: ReactNode;
};

export function CategoriesPopup({ steps, categories }: CategoriesPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<PopupStepId>("cleanse");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((stepId: PopupStepId) => {
    if (window.matchMedia(LAPTOP_QUERY).matches) {
      return;
    }

    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setActiveStep(stepId);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const media = window.matchMedia(LAPTOP_QUERY);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const onMediaChange = () => {
      if (media.matches) {
        setIsOpen(false);
      }
    };

    closeButtonRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  return (
    <CategoriesPopupContext.Provider value={{ open }}>
      <div className="how-it-works__content">
        {steps}
        <div
          className={`categories-popup${isOpen ? " is-open" : ""}`}
          role={isOpen ? "dialog" : undefined}
          aria-modal={isOpen ? true : undefined}
          aria-labelledby={isOpen ? "categories-title" : undefined}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="categories-popup__close"
            aria-label="Close"
            onClick={close}
          >
            <img src="/icons/close_btn.svg" alt="" width={32} height={32} />
          </button>
          <div className="categories-popup__body">{categories}</div>
          <div className="categories-popup__steps">
            <p className="categories-popup__steps-label">Shop products for:</p>
            <div
              className="categories-popup__steps-grid"
              role="radiogroup"
              aria-label="Shop products for"
            >
              {POPUP_STEPS.map((step) => {
                const isActive = step.id === activeStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`categories-popup__step${isActive ? " is-active" : ""}`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <span className="categories-popup__step-number" aria-hidden="true">
                      <span className="categories-popup__step-number-text">
                        {step.number}
                      </span>
                    </span>
                    <span className="categories-popup__step-title">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CategoriesPopupContext.Provider>
  );
}

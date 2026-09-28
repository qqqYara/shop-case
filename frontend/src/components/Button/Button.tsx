import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

export type ButtonVariant = "find" | "shop" | "add-to-cart" | "cta";

type ButtonSharedProps = {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = ButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonSharedProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonSharedProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const FIND_ORBS = ["a", "b", "c", "d"] as const;
const CART_ORBS = ["a", "b", "c", "d"] as const;

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={24}
      height={24}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={22}
      height={22}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
    </svg>
  );
}

function ButtonContent({
  variant,
  children,
}: {
  variant: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <>
      {variant !== "cta" && (
        <span className="button__glow" aria-hidden="true">
          <span className="button__glow-group">
            {variant === "find" &&
              FIND_ORBS.map((orb) => (
                <span
                  key={orb}
                  className={`button__orb button__orb--find button__orb--${orb}`}
                />
              ))}
            {variant === "shop" && (
              <span className="button__orb button__orb--shop" />
            )}
            {variant === "add-to-cart" &&
              CART_ORBS.map((orb) => (
                <span
                  key={orb}
                  className={`button__orb button__orb--add-to-cart button__orb--${orb}`}
                />
              ))}
          </span>
        </span>
      )}
      <span className="button__label">{children}</span>
      {variant === "cta" ? (
        <>
          <span className="button__icon button__icon--right">
            <ArrowRightIcon />
          </span>
          <span className="button__icon button__icon--up-right">
            <ArrowUpRightIcon />
          </span>
        </>
      ) : (
        <span className="button__icon">
          <ArrowUpRightIcon />
        </span>
      )}
    </>
  );
}

export function Button({
  variant = "find",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = ["button", `button--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  const content = (
    <ButtonContent variant={variant}>{children}</ButtonContent>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonProps } =
    props as ButtonAsButton;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}

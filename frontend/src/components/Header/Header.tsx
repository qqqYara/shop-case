"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { Announcement } from "@/components/Announcement";
import "./Header.scss";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop" },
  { href: "/skincare", label: "Skincare" },
  { href: "/sets", label: "Sets" },
  { href: "/about", label: "About" },
] as const;

const HEADER_ICONS = {
  list: "/icons/List.svg",
  heart: "/icons/Heart.svg",
  cart: "/icons/ShoppingCart.svg",
  search: "/icons/MagnifyingGlass.svg",
} as const;

type HeaderIconName = keyof typeof HEADER_ICONS | "x";

function HeaderIcon({ name }: { name: HeaderIconName }) {
  if (name === "x") {
    return (
      <span className="header__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 22 22"
          width={22}
          height={22}
          fill="none"
          focusable="false"
        >
          <path
            d="M5.5 5.5L16.5 16.5"
            stroke="currentColor"
            strokeWidth="0.6875"
            strokeLinecap="round"
          />
          <path
            d="M16.5 5.5L5.5 16.5"
            stroke="currentColor"
            strokeWidth="0.6875"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="header__icon" aria-hidden="true">
      <img src={HEADER_ICONS[name]} alt="" width={22} height={22} />
    </span>
  );
}

type HeaderProps = {
  cartCount?: number;
  announcements?: string[];
};

export function Header({ cartCount = 2, announcements }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 992px)");
    const onChange = () => {
      if (media.matches) {
        setMenuOpen(false);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const getThreshold = () => {
      const chrome = header.querySelector(".header__chrome");
      const announcement = header.querySelector(".announcement");
      const bar = header.querySelector(".header__bar");
      if (
        !(chrome instanceof HTMLElement) ||
        !(announcement instanceof HTMLElement) ||
        !(bar instanceof HTMLElement)
      ) {
        return header.offsetHeight;
      }

      const chromeStyles = getComputedStyle(chrome);
      const padTop = Number.parseFloat(chromeStyles.paddingTop);
      const gap =
        Number.parseFloat(chromeStyles.rowGap) || Number.parseFloat(chromeStyles.gap) || 0;
      const announcementVisible = getComputedStyle(announcement).display !== "none";
      const announcementHeight = announcementVisible ? announcement.offsetHeight : 44;

      return padTop + announcementHeight + gap + bar.offsetHeight;
    };

    const onScroll = () => {
      setStuck(window.scrollY >= getThreshold());

      const howItWorks = document.querySelector(".how-it-works");
      setHidden(
        howItWorks instanceof HTMLElement && howItWorks.getBoundingClientRect().top <= 0,
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);

    if (pathname !== "/") {
      return;
    }

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <header
      ref={headerRef}
      className={[
        "header",
        menuOpen ? "header--menu-open" : "",
        stuck ? "header--stuck" : "",
        hidden ? "header--hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={hidden && !menuOpen}
    >
      <div className="header__chrome">
        <Announcement messages={announcements} />
        <div className="header__bar">
          <Link
            href="/"
            className="header__logo"
            aria-label="LUMEA"
            onClick={onLogoClick}
          >
            <img src="/images/logo.svg" alt="" width={223} height={78} />
          </Link>

          <nav className="header__nav" id={menuId} aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="header__nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <button type="button" className="header__btn header__btn--search" aria-label="Search">
              <HeaderIcon name="search" />
            </button>
            <button
              type="button"
              className="header__btn header__btn--menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <HeaderIcon name={menuOpen ? "x" : "list"} />
            </button>
            <Link href="/wishlist" className="header__btn header__btn--heart" aria-label="Wishlist">
              <HeaderIcon name="heart" />
            </Link>
            <Link href="/cart" className="header__btn header__btn--cart" aria-label="Cart">
              <HeaderIcon name="cart" />
              {cartCount > 0 && (
                <span className="header__cart-count">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

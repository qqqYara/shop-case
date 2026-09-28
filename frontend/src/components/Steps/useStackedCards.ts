"use client";

import { useEffect, type RefObject } from "react";

const LAPTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

const PEEK_SELECTOR = ".step-card__heading";
const MIN_PEEK_SELECTOR = ".step-card__title-row";
const ALIGN_SELECTOR = "[data-steps-align]";

// Viewport distance (px) the finished stack keeps from the top edge.
const STACK_TOP_MIN = 16;
const STACK_TOP_MAX = 160;
// Extra px under the heading so tagline descenders aren't clipped by the next card.
const PEEK_BLEED = 4;
// How far peeks may grow past the heading to reach the companion's bottom edge.
const MAX_PEEK_GROWTH = 24;
// Mobile browser toolbars resize the viewport while scrolling; ignore those.
const TOOLBAR_RESIZE_TOLERANCE = 150;

/*
 * Stacking model: cards stay in normal flow and only get a translateY, so the
 * page never reflows. Each card behaves like `position: sticky` with its own
 * `top` (stuck[i]), but all cards leave together once the last one arrives,
 * which plain CSS sticky can't do. Everything is a pure function of scroll
 * position, so scrolling up replays the same states in reverse.
 *
 * Only the last card changes real layout (--stack-compact shrinks its padding
 * and gaps). Its own height never feeds back into its top offset, and
 * `.steps { overflow-anchor: none }` stops scroll anchoring from reacting.
 * Covered cards fake the same padding reduction with --stack-shift.
 */
type StackLayout = {
  // Untransformed card tops relative to the list, and card heights.
  offsets: number[];
  heights: number[];
  // Visible strip left for each covered card (all cards except the last).
  peeks: number[];
  // Viewport y where each card stops: top, top + peek0, top + peek0 + peek1, …
  stuck: number[];
  // Max upward content shift (px) for covered cards.
  shift: number;
  // Max compaction (0–1) of the last card needed to align with the companion.
  compact: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

function bottomWithin(card: HTMLElement, selector: string) {
  const target = card.querySelector(selector);

  if (!target) {
    return card.offsetHeight;
  }

  return target.getBoundingClientRect().bottom - card.getBoundingClientRect().top;
}

export function useStackedCards(listRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const cards = Array.from(list.children) as HTMLElement[];
    const last = cards.length - 1;

    if (last < 1) {
      return;
    }

    const laptop = window.matchMedia(LAPTOP_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const coarsePointer = window.matchMedia(COARSE_POINTER_QUERY);
    const covered = cards.map(() => false);
    let layout: StackLayout | null = null;
    let disposed = false;
    let frame = 0;
    let measuredWidth = 0;
    let measuredHeight = 0;

    const reset = () => {
      for (const card of cards) {
        card.style.transform = "";
        card.style.removeProperty("--stack-shift");
        card.style.removeProperty("--stack-compact");
      }
    };

    const update = () => {
      frame = 0;

      if (!layout) {
        return;
      }

      const { offsets, heights, peeks, stuck, shift, compact } = layout;
      const listTop = list.getBoundingClientRect().top;
      // Negative once the last card scrolls past its stop: the whole stack then
      // moves up by this amount, so the cards exit together.
      const release = Math.min(0, listTop + offsets[last] - stuck[last]);
      const visual = cards.map((card, index) => {
        const natural = listTop + offsets[index];
        const position = Math.max(natural, stuck[index] + release);
        const offset = position - natural;

        card.style.transform = offset > 0 ? `translate3d(0, ${offset}px, 0)` : "";

        return position;
      });

      let lastProgress = 0;

      // progress 0 → next card still at its natural distance below this one,
      // progress 1 → next card has reached its stop, leaving only the peek.
      for (let index = 0; index < last; index += 1) {
        const travel = Math.max(1, offsets[index + 1] - offsets[index] - peeks[index]);
        const distance = listTop + offsets[index + 1] - stuck[index + 1];
        const progress = clamp(1 - distance / travel);
        const isCovered = visual[index] + heights[index] - visual[index + 1] > 1;

        cards[index].style.setProperty("--stack-shift", `${shift * progress}px`);

        if (covered[index] !== isCovered) {
          covered[index] = isCovered;
          cards[index].toggleAttribute("data-covered", isCovered);
        }

        lastProgress = progress;
      }

      // The last card compacts while it slides over the one before it.
      cards[last].style.setProperty("--stack-compact", String(compact * lastProgress));
    };

    // Reads layout once per resize/font/content change; per scroll frame update()
    // only reads the list's rect and writes transforms/CSS vars.
    const measure = () => {
      // Measure the untransformed, uncompacted state.
      reset();

      const viewport = window.innerHeight;
      const offsets = cards.map((card) => card.offsetTop);
      const heights = cards.map((card) => card.offsetHeight);
      const roomBelow =
        document.documentElement.scrollHeight -
        (list.getBoundingClientRect().top + window.scrollY + offsets[last] + heights[last]);
      const headings = cards.map((card) => bottomWithin(card, PEEK_SELECTOR));
      const titles = cards.map((card) => bottomWithin(card, MIN_PEEK_SELECTOR));

      // Sample the last card fully compacted to learn what the CSS actually
      // removes at this breakpoint (0 on mobile, where no compaction rules exist).
      const lastCard = cards[last];
      const paddingTop = parseFloat(getComputedStyle(lastCard).paddingTop);
      lastCard.style.setProperty("--stack-compact", "1");
      const compactHeight = lastCard.offsetHeight;
      const paddingReduce = paddingTop - parseFloat(getComputedStyle(lastCard).paddingTop);
      lastCard.style.removeProperty("--stack-compact");

      // Heights are linear in the compaction amount (only vertical padding and
      // gaps change, text never re-wraps), so two samples describe every state.
      const basePeek = (index: number, amount: number) =>
        headings[index] + PEEK_BLEED - amount * paddingReduce;
      const lastHeight = (amount: number) =>
        heights[last] - amount * (heights[last] - compactHeight);
      const stackAt = (amount: number) => {
        let total = lastHeight(amount);

        for (let index = 0; index < last; index += 1) {
          total += basePeek(index, amount);
        }

        return total;
      };

      // Laptop+: the finished stack should be as tall as the Categories block so
      // their bottom edges line up. Mobile: it only has to fit the viewport.
      const companion = laptop.matches
        ? list.parentElement?.querySelector<HTMLElement>(ALIGN_SELECTOR) ?? null
        : null;
      const available = viewport - STACK_TOP_MIN * 2;
      const target = companion
        ? Math.min(companion.offsetHeight, available)
        : available;
      // 1) Compact only as much as needed to hit the target height.
      const full = stackAt(0);
      const compacted = stackAt(1);
      const compact =
        full > target && full > compacted
          ? clamp((full - target) / (full - compacted))
          : 0;
      // 2) Spread the leftover difference over the peeks: shrink them (never
      //    below the title row) if still too tall, grow them slightly if short.
      const spare = (target - stackAt(compact)) / last;
      const growth = companion ? MAX_PEEK_GROWTH : 0;

      const peeks = cards.slice(0, last).map((_, index) => {
        const base = basePeek(index, compact);
        const floor = Math.min(
          base,
          titles[index] + PEEK_BLEED - compact * paddingReduce,
        );

        return Math.max(floor, base + Math.min(spare, growth));
      });

      // 3) Centre the stack vertically. The finished stack also has to be
      //    reachable when little page is left below it, which can push it lower.
      const stackHeight = peeks.reduce((sum, peek) => sum + peek, lastHeight(compact));
      const top = Math.max(
        clamp((viewport - stackHeight) / 2, STACK_TOP_MIN, STACK_TOP_MAX),
        viewport - roomBelow - stackHeight,
      );
      const stuck = [top];

      for (let index = 0; index < last; index += 1) {
        stuck.push(stuck[index] + peeks[index]);
      }

      // The sticky Categories column (HowItWorks.scss) stops at the same top.
      companion?.style.setProperty("--steps-stack-top", `${top}px`);

      layout = {
        offsets,
        heights,
        peeks,
        stuck,
        shift: compact * paddingReduce,
        compact,
      };
      measuredWidth = window.innerWidth;
      measuredHeight = viewport;
      update();
    };

    const requestUpdate = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      const toolbarOnly =
        coarsePointer.matches &&
        window.innerWidth === measuredWidth &&
        Math.abs(window.innerHeight - measuredHeight) < TOOLBAR_RESIZE_TOLERANCE;

      if (toolbarOnly) {
        requestUpdate();
        return;
      }

      measure();
    };

    const reveal = (index: number) => {
      if (!layout || !covered[index]) {
        return;
      }

      // Scroll to where this card has just reached its stop: the next card is
      // still a full gap below it, so the card is completely uncovered.
      const listTop = list.getBoundingClientRect().top;

      window.scrollTo({
        top: window.scrollY + listTop + layout.offsets[index] - layout.stuck[index],
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    };

    const cardIndexOf = (target: EventTarget | null) =>
      target instanceof Element
        ? cards.findIndex((card) => card.contains(target))
        : -1;

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      // Leave the card's own CTA (link / popup button) alone.
      if (target instanceof Element && target.closest("a, button")) {
        return;
      }

      reveal(cardIndexOf(target));
    };

    // Keyboard users tabbing into a covered card get it revealed too.
    const onFocusIn = (event: FocusEvent) => {
      reveal(cardIndexOf(event.target));
    };

    const observer = new ResizeObserver(() => measure());
    const companion = list.parentElement?.querySelector(ALIGN_SELECTOR);

    // The last card is left out on purpose: it resizes on every scroll frame
    // while compacting, which would re-measure constantly.
    cards.slice(0, last).forEach((card) => observer.observe(card));

    if (companion) {
      observer.observe(companion);
    }

    measure();
    // Web fonts change heading heights, and with them the peeks.
    document.fonts?.ready.then(() => {
      if (!disposed) {
        measure();
      }
    });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    laptop.addEventListener("change", measure);
    list.addEventListener("click", onClick);
    list.addEventListener("focusin", onFocusIn);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      laptop.removeEventListener("change", measure);
      list.removeEventListener("click", onClick);
      list.removeEventListener("focusin", onFocusIn);
      layout = null;
      reset();
      cards.forEach((card) => card.removeAttribute("data-covered"));
    };
  }, [listRef]);
}

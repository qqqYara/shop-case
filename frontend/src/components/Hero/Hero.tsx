import { Button } from "@/components/Button";
import "./Hero.scss";

const HERO_PORTRAIT = "/images/portrait.png";
const HERO_OIL = "/images/oil-dropper.png";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <h1 className="hero__title" id="hero-title">
          <span className="hero__title-line">Skincare made</span>
          <span className="hero__title-accent">simple</span>
        </h1>

        <p className="hero__subtitle">
          Thoughtful formulas for healthy, glowing skin
        </p>

        <div className="hero__cta">
          <p className="hero__cta-label">Not sure what your skin needs?</p>
          <Button variant="find">Find your routine</Button>
        </div>

        <div className="hero__visual">
          <img
            className="hero__portrait"
            src={HERO_PORTRAIT}
            alt="Portrait of a woman with glowing skin"
            width={562}
            height={375}
          />
          <img
            className="hero__dropper"
            src={HERO_OIL}
            alt="Applying facial oil"
            width={184}
            height={129}
          />
          <aside className="hero__essentials">
            <h2 className="hero__essentials-title">LUMEA essentials</h2>
            <p className="hero__essentials-text">
              Simple formulas. Thoughtful ingredients. Everyday results.
            </p>
            <Button variant="shop" className="hero__essentials-btn">
              Shop now
            </Button>
          </aside>
          <p className="hero__trust">Dermatologist-inspired care</p>
        </div>
      </div>
    </section>
  );
}

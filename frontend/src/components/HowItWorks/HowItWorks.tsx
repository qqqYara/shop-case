import { Categories } from "@/components/Categories";
import { CategoriesPopup } from "@/components/Categories/CategoriesPopup";
import { Steps } from "@/components/Steps";
import "./HowItWorks.scss";

const STAR = "/icons/Star.svg";

export function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="how-it-works__inner">
        <div className="how-it-works__title-group">
          <h2 className="how-it-works__title" id="how-it-works-title">
            <span>How it</span>
            <img
              className="how-it-works__star"
              src={STAR}
              alt=""
              width={27}
              height={26}
              aria-hidden="true"
            />
            <span className="how-it-works__title-accent">works</span>
          </h2>
          <p className="how-it-works__subtitle">
            {"4 simple steps to healthier\u2011looking skin"}
          </p>
        </div>
        <CategoriesPopup steps={<Steps />} categories={<Categories />} />
      </div>
    </section>
  );
}

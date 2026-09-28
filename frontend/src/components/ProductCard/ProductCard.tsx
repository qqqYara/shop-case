"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { Product, ProductOption } from "@/lib/catalog";
import "./ProductCard.scss";

type OptionGroup = {
  id: string;
  label: string;
  layout: "stack" | "chips" | "rows";
  options: ProductOption[];
};

type ProductCardProps = {
  product: Product;
};

function salePrice(price: number, discount: number | null) {
  if (!discount) {
    return price;
  }

  return Math.round(price * (100 - discount)) / 100;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function optionGroups(product: Product): OptionGroup[] {
  const groups: OptionGroup[] = [
    {
      id: "formulas",
      label: "Choose formula:",
      layout: "stack",
      options: product.showFormulas === "enable" ? product.formulas : [],
    },
    {
      id: "skinTypes",
      label: "Skin type:",
      layout: "chips",
      options: product.showSkinType === "enable" ? product.skinTypes : [],
    },
    {
      id: "sizes",
      label: "Size:",
      layout: "chips",
      options: product.showSize === "enable" ? product.sizes : [],
    },
    {
      id: "setIncludes",
      label: "Set includes:",
      layout: "rows",
      options: product.showSetInclude === "enable" ? product.setIncludes : [],
    },
    {
      id: "finishes",
      label: "Choose finish:",
      layout: "rows",
      options: product.showChooseFinish === "enable" ? product.finishes : [],
    },
  ];

  return groups.filter((group) => group.options.length > 0);
}

export function ProductCard({ product }: ProductCardProps) {
  const groups = optionGroups(product);
  const [selected, setSelected] = useState<Record<string, number>>(() =>
    Object.fromEntries(groups.map((group) => [group.id, group.options[0].id])),
  );
  const [saved, setSaved] = useState(false);
  const currentPrice = salePrice(product.price, product.discount);
  const hasDiscount = Boolean(product.discount);

  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.image ? (
          <img
            src={product.image.url}
            alt={product.image.alternativeText ?? ""}
          />
        ) : null}
        {product.badges.length > 0 ? (
          <ul className="product-card__badges">
            {product.badges.map((badge) => (
              <li key={badge.id}>{badge.label}</li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          className={`product-card__favorite${saved ? " is-saved" : ""}`}
          aria-pressed={saved}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name}`}
          onClick={() => setSaved((current) => !current)}
        >
          <svg viewBox="0 0 22 22" aria-hidden="true">
            <path d="M11.001 18.5625C11.001 18.5625 2.40723 13.75 2.40723 7.90626C2.4074 6.8734 2.76529 5.87249 3.42004 5.07368C4.07479 4.27488 4.98599 3.7275 5.99872 3.5246C7.01145 3.3217 8.06319 3.47581 8.97513 3.96072C9.88708 4.44564 10.6029 5.23143 11.001 6.1845L11.001 6.18451C11.399 5.23144 12.1149 4.44564 13.0268 3.96073C13.9388 3.47581 14.9905 3.3217 16.0032 3.5246C17.016 3.7275 17.9272 4.27488 18.5819 5.07368C19.2367 5.87249 19.5946 6.8734 19.5947 7.90626C19.5947 13.75 11.001 18.5625 11.001 18.5625Z" />
          </svg>
        </button>
      </div>

      <div className="product-card__body">
        <div className="product-card__details">
          <h3 className="product-card__title">
            {product.name}
            {product.volume ? (
              <>
                <br />
                {product.volume}
              </>
            ) : null}
          </h3>

          {groups.map((group) => (
            <fieldset key={group.id} className="product-card__group">
              <legend>{group.label}</legend>
              <div className={`product-card__options product-card__options--${group.layout}`}>
                {group.options.map((option) => {
                  const isSelected = selected[group.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={isSelected ? "is-selected" : undefined}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelected((current) => ({
                          ...current,
                          [group.id]: option.id,
                        }))
                      }
                    >
                      {option.image ? (
                        <img
                          src={option.image.url}
                          alt=""
                          width={28}
                          height={28}
                        />
                      ) : null}
                      <span>{option.label}</span>
                      {option.discount ? (
                        <span className="product-card__option-discount">
                          -{option.discount}%
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            {hasDiscount ? (
              <p className="product-card__price-was">{formatPrice(product.price)}</p>
            ) : null}
            <p className="product-card__price-now">
              <span>Price</span>
              <strong>{formatPrice(currentPrice)}</strong>
            </p>
            {hasDiscount ? (
              <span className="product-card__discount">-{product.discount}%</span>
            ) : null}
          </div>
          <button type="button" className="product-card__details-link">
            View details
          </button>
          <Button variant="add-to-cart">Add to bag</Button>
        </div>
      </div>
    </article>
  );
}

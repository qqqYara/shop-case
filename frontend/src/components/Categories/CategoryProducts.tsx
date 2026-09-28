"use client";

import { useState } from "react";
import { CategorysMenu } from "@/components/CategorysMenu";
import { ProductList } from "@/components/ProductList";
import type { Category, Product } from "@/lib/catalog";

type CategoryProductsProps = {
  categories: Category[];
  products: Product[];
};

export function CategoryProducts({ categories, products }: CategoryProductsProps) {
  const [activeId, setActiveId] = useState(categories[0]?.documentId ?? "");
  const visibleProducts = products.filter((product) =>
    product.categories.some((category) => category.documentId === activeId),
  );

  return (
    <>
      <div className="categories__intro">
        <p className="categories__title" id="categories-title">
          Shop cleansers
        </p>
        <CategorysMenu
          categories={categories}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>
      <ProductList products={visibleProducts} />
    </>
  );
}

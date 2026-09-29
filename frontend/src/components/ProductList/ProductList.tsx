"use client";

import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "./ProductList.scss";

const DESKTOP_BREAKPOINT = 1200;

type ProductListProps = {
  products: Product[];
};

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="product-list product-list--empty">
        <div className="product-list__empty" role="status">
          <p className="product-list__empty-title">No products yet</p>
          <p className="product-list__empty-text">
            This category is empty. Try another one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <Swiper
        className="product-list__slider"
        modules={[FreeMode]}
        slidesPerView="auto"
        spaceBetween={12}
        freeMode={{ enabled: true, momentum: true }}
        observer
        observeParents
        simulateTouch
        shortSwipes
        grabCursor
        breakpoints={{
          [DESKTOP_BREAKPOINT]: {
            freeMode: { momentum: false },
            shortSwipes: false,
          },
        }}
        role="region"
        aria-label="Products"
      >
        {products.map((product) => (
          <SwiperSlide key={product.documentId}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

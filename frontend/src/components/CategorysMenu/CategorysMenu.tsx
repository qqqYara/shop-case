"use client";

import type { Category } from "@/lib/catalog";
import "./CategorysMenu.scss";

type CategorysMenuProps = {
  categories: Category[];
  activeId: string;
  onSelect: (documentId: string) => void;
};

export function CategorysMenu({ categories, activeId, onSelect }: CategorysMenuProps) {
  return (
    <div className="categories-menu" role="tablist" aria-label="Shop categories">
      {categories.map((category) => {
        const isActive = category.documentId === activeId;

        return (
          <button
            key={category.documentId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "categories-menu__tab categories-menu__tab--active"
                : "categories-menu__tab"
            }
            onClick={() => onSelect(category.documentId)}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

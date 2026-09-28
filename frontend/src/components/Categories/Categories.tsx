import { CategoryProducts } from "./CategoryProducts";
import { getCategories, getProducts } from "@/lib/catalog";
import "./Categories.scss";

export async function Categories() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <div className="categories" data-steps-align>
      <CategoryProducts categories={categories} products={products} />
    </div>
  );
}

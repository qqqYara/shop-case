export type Category = {
  documentId: string;
  name: string;
  order: number;
};

export type ProductMedia = {
  url: string;
  alternativeText: string | null;
};

export type ProductOption = {
  id: number;
  label: string;
  discount: number | null;
  image: ProductMedia | null;
};

export type ProductToggle = "enable" | "disable";

export type Product = {
  documentId: string;
  name: string;
  volume: string | null;
  price: number;
  discount: number | null;
  image: ProductMedia | null;
  badges: { id: number; label: string }[];
  categories: { documentId: string }[];
  showFormulas: ProductToggle;
  showSkinType: ProductToggle;
  showSetInclude: ProductToggle;
  showChooseFinish: ProductToggle;
  showSize: ProductToggle;
  formulas: ProductOption[];
  skinTypes: ProductOption[];
  setIncludes: ProductOption[];
  finishes: ProductOption[];
  sizes: ProductOption[];
};

type StrapiList<T> = {
  data?: T[];
};

const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";

const PRODUCT_POPULATE = [
  "populate[categories]=true",
  "populate[image]=true",
  "populate[badges]=true",
  "populate[formulas][populate]=image",
  "populate[skinTypes][populate]=image",
  "populate[setIncludes][populate]=image",
  "populate[finishes][populate]=image",
  "populate[sizes][populate]=image",
].join("&");

function mediaUrl(media: { url?: string; alternativeText?: string | null } | null) {
  if (!media?.url) {
    return null;
  }

  return {
    url: media.url.startsWith("http") ? media.url : `${strapiUrl}${media.url}`,
    alternativeText: media.alternativeText ?? null,
  };
}

function mapOption(option: {
  id: number;
  label: string;
  discount?: number | null;
  image?: { url?: string; alternativeText?: string | null } | null;
}): ProductOption {
  return {
    id: option.id,
    label: option.label,
    discount: option.discount ?? null,
    image: mediaUrl(option.image ?? null),
  };
}

async function getList<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${strapiUrl}${path}`, { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const body = (await response.json()) as StrapiList<T>;
    return body.data ?? [];
  } catch {
    return [];
  }
}

export function getCategories() {
  return getList<Category>("/api/categories?sort=order:asc&pagination[pageSize]=100");
}

export async function getAnnouncementMessages() {
  const announcements = await getList<{ message?: string | null }>(
    "/api/announcements?sort=order:asc&pagination[pageSize]=100",
  );

  return announcements
    .map((announcement) => announcement.message?.trim() ?? "")
    .filter((message) => message.length > 0);
}

export async function getProducts() {
  const products = await getList<
    Omit<Product, "image" | "formulas" | "skinTypes" | "setIncludes" | "finishes" | "sizes"> & {
      image: { url?: string; alternativeText?: string | null } | null;
      formulas?: ProductOption[];
      skinTypes?: ProductOption[];
      setIncludes?: ProductOption[];
      finishes?: ProductOption[];
      sizes?: ProductOption[];
    }
  >(`/api/products?sort=name:asc&pagination[pageSize]=100&${PRODUCT_POPULATE}`);

  return products.map((product) => ({
    ...product,
    name: product.name.replace(/\u2028/g, " ").trim(),
    image: mediaUrl(product.image),
    badges: product.badges ?? [],
    categories: product.categories ?? [],
    formulas: (product.formulas ?? []).map(mapOption),
    skinTypes: (product.skinTypes ?? []).map(mapOption),
    setIncludes: (product.setIncludes ?? []).map(mapOption),
    finishes: (product.finishes ?? []).map(mapOption),
    sizes: (product.sizes ?? []).map(mapOption),
  }));
}

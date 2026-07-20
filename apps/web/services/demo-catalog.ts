import {
  DEMO_PRODUCTS,
  type DemoProduct,
} from '../data/demo-products';

export interface DemoCatalogueQuery {
  query?: string;
  country?: string;
  page?: number;
  size?: number;
  category?: string;
  allergenFree?: string | string[];
}

const normalise = (value?: string): string => value?.trim().toLocaleLowerCase('en') ?? '';

export function getDemonstrationCatalogue(): DemoProduct[] {
  return DEMO_PRODUCTS.map(product => ({ ...product }));
}

export function findDemonstrationProduct(id: string): DemoProduct | undefined {
  const product = DEMO_PRODUCTS.find(item => item.id === id);
  return product ? { ...product } : undefined;
}

export function searchDemonstrationCatalogue({
  query,
  country,
  page = 1,
  size = 20,
  category,
  allergenFree,
}: DemoCatalogueQuery = {}): DemoProduct[] {
  const searchTerm = normalise(query);
  const countryTerm = normalise(country);
  const categoryTerm = normalise(category);
  
  const excludedAllergens: string[] = Array.isArray(allergenFree)
    ? allergenFree.map(normalise).filter(Boolean)
    : typeof allergenFree === 'string' && allergenFree.trim()
    ? [normalise(allergenFree)]
    : [];

  const filtered = DEMO_PRODUCTS.filter(product => {
    const matchesSearch = !searchTerm || [
      product.name,
      product.description,
      product.category,
      product.originStatement,
    ].some(value => normalise(value).includes(searchTerm));
    const matchesCountry = !countryTerm || normalise(product.country) === countryTerm;
    const matchesCategory = !categoryTerm || normalise(product.category) === categoryTerm;
    const excludesAllergen = excludedAllergens.length === 0 || !product.allergens.some(
      allergen => excludedAllergens.includes(normalise(allergen)),
    );

    return matchesSearch && matchesCountry && matchesCategory && excludesAllergen;
  });

  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(100, Math.max(1, Math.floor(size)));
  const start = (safePage - 1) * safeSize;
  return filtered.slice(start, start + safeSize).map(product => ({ ...product }));
}

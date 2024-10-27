import type { components } from "./tcgx-schemas";

export type UserDto = components["schemas"]["User"]
export type AccountDto = components["schemas"]["Account"]
export type MarketplaceDto = components["schemas"]["Marketplace"]
export type BrandDto = components["schemas"]["Brand"]
export type ThemeDto = components["schemas"]["Theme"]
export type TagDto = components["schemas"]["Tag"]
export type SupportedTagValuesDto = components["schemas"]["SupportedTagValues"]
export type ProductDto = components["schemas"]["Product"]
export type ProductTagDto = components["schemas"]["ProductTag"]
export type CategoryDto = components["schemas"]["Category"]
export type BrandCategoryDto = components["schemas"]["BrandCategory"]
export type ListDto = components["schemas"]["List"]
export type CardDto = components["schemas"]["Card"]

// THIS ARE TEMPORARY AND WILL BE REMOVE BY OUR MODELS
export interface CardData {
  imageUri: string;
  title: string;
  link: string;
}

export type SingleCardData = {
  imageUri: string;
  name: string;
  number: string;
  latestPrice: number;
  rarity: string;
  alternateArt: boolean;
}

export interface CTAData {
  imageUri: string;
  title: string;
  link: string;
  linkText: string;
}
  
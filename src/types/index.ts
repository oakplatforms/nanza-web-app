import type { components } from './tcgx-schemas'

export type UserDto = components['schemas']['User']
export type AccountDto = components['schemas']['Account']
export type MarketplaceDto = components['schemas']['Marketplace']
export type BrandDto = components['schemas']['Brand']
export type ThemeDto = components['schemas']['Theme']
export type TagDto = components['schemas']['Tag']
export type SupportedTagValuesDto = components['schemas']['SupportedTagValues']
export type EntityDto = components['schemas']['Entity']
export type EntityTagDto = components['schemas']['EntityTag']
export type CategoryDto = components['schemas']['Category']
export type BrandCategoryDto = components['schemas']['BrandCategory']
export type ListDto = components['schemas']['List']

export type EntityPayload = Omit<EntityDto, 'entityTags'> & {
  entityTags?: {
    create?: EntityTagDto[];
    update?: EntityTagDto[];
    delete?: string[];
  };
};

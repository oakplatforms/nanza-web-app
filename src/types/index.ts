import type { components } from './oak-api-schemas'

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
export type ShippingCategoryDto = components['schemas']['ShippingCategory']
export type ShippingOptionDto = components['schemas']['ShippingOption']

export type EntityPayload = Omit<EntityDto, 'entityTags'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  entityTags?: {
    create?: EntityTagDto[];
    update?: EntityTagDto[];
    delete?: string[];
  };
};

export type TagPayload = Omit<TagDto, 'supportedTagValues'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  supportedTagValues?: {
    create?: SupportedTagValuesDto[];
    update?: SupportedTagValuesDto[];
    delete?: string[];
  };
};

export type BrandPayload = Omit<BrandDto, 'brandCategories'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  brandCategories?: {
    create?: BrandCategoryDto[];
    delete?: string[];
  };
};

export type ShippingCategoryPayload = Omit<ShippingCategoryDto, 'shippingOptions'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  shippingOptions?: {
    create?: ShippingOptionDto[];
    update?: ShippingOptionDto[];
    delete?: string[];
  };
};

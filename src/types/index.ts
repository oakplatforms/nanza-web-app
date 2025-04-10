import type { components } from './oak-api-schemas'

export type UserDto = components['schemas']['User']
export type AccountDto = components['schemas']['Account']
export type BrandDto = components['schemas']['Brand']
export type ThemeDto = components['schemas']['Theme']
export type TagDto = components['schemas']['Tag']
export type SupportedTagValuesDto = components['schemas']['SupportedTagValue']
export type EntityDto = components['schemas']['Entity']
export type EntityTagDto = components['schemas']['EntityTag']
export type CategoryDto = components['schemas']['Category']
export type ListDto = components['schemas']['List']
export type ShippingMethodDto = components['schemas']['ShippingMethod']
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
};

export type ShippingMethodPayload = Omit<ShippingMethodDto, 'shippingOptions'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  shippingOptions?: {
    create?: ShippingOptionDto[] | null;
    update?: ShippingOptionDto[] | null;
    delete?: string[];
  };
};

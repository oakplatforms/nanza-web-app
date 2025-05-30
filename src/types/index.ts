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
export type ParcelDto = components['schemas']['Parcel']

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

export type ShippingMethodPayload = Omit<ShippingMethodDto, 'shippingOptions'| 'parcels'> & {
  createdById?: string | null
  lastModifiedById?: string | null
  shippingOptions?: {
    create?: ShippingOptionDto[] | null;
    update?: ShippingOptionDto[] | null;
    delete?: string[];
  };
  parcels?: {
    create?: ParcelDto[];
    update?: ParcelDto[];
    delete?: string[];
  };
};

export type ShippingCarrier = 'USPS' | 'UPS' | 'FEDEX' | 'DHL'

export const PARCEL_TEMPLATES = [
  'USPS_FlatRateEnvelope',
  'USPS_SoftPack',
  'UPS_Box_10kg',
  'UPS_Box_25kg',
  'UPS_Pad_Pak',
  'FedEx_Envelope',
  'FedEx_Padded_Pak',
  'FedEx_Box_10kg',
  'FedEx_Box_25kg'
] as const

export const PARCEL_TEMPLATES_BY_CARRIER: Record<ShippingCarrier, readonly ParcelTemplate[]> = {
  USPS: ['USPS_FlatRateEnvelope', 'USPS_SoftPack'],
  UPS: ['UPS_Box_10kg', 'UPS_Box_25kg', 'UPS_Pad_Pak'],
  FEDEX: ['FedEx_Envelope', 'FedEx_Padded_Pak', 'FedEx_Box_10kg', 'FedEx_Box_25kg'],
  DHL: [],
}
export type ParcelTemplate = (typeof PARCEL_TEMPLATES)[number];

export type PaginatedResponse<T> = {
  data: T[]
  page: number | null
  total: number | null
}
export interface MauticInitProps {
  serverURL: string | null;
  appName: string;
  username: string;
  password: string;
  onInitialize?: () => void;
}

export interface MauticRequestTokenProps {
  clientId: string;
  clientSecret: string;
}

export type MauticStoredToken = {
  accessToken: string;
  expiryAt: number;
};

export interface MauticContactField {
  title?: 'Mr' | 'Mrs' | 'Miss';
  companyaddress1?: string;
  firstname?: string;
  companyaddress2?: string;
  lastname?: string;
  companyemail?: string;
  company?: string;
  phone?: string;
  companyphone?: string;
  position?: string;
  companycity?: string;
  email?: string;
  companystate?: string;
  mobile?: string;
  companyzipcode?: string;
  companycountry?: string;
  points?: number;
  companyname?: string;
  fax?: string;
  companywebsite?: string;
  companynumber_of_employees?: number;
  address1?: string;
  companyfax?: string;
  address2?: string;
  companyannual_revenue?: number;
  city?: string;
  companyindustry?: string;
  state?: string;
  companydescription?: string;
  zipcode?: string;
  country?: string;
  preferred_locale?: string;
  timezone?: string;
  last_active?: Date;
  attribution_date?: Date;
  attribution?: number;
  website?: string;
  facebook?: string;
  foursquare?: string;
  instagram?: string;
  linkedin?: string;
  skype?: string;
  twitter?: string;
  tags?: string | string[];
  avatar?: string;
  sex?: 'MAN' | 'WOMAN';
  // [key: string]: string | number | boolean;
}

export interface MauticContactCreationProps extends MauticContactField {
  ipAddress?: string;
  lastActive?: Date;
  owner?: number;
  overwriteWithBlank?: boolean;
}

export interface MauticContactProps {
  id: number;
  isPublished: boolean;
  dateAdded: string;
  createdBy: number;
  createdByUser: string;
  dateModified: string;
  modifiedBy: number;
  modifiedByUser: string;
}

export interface MauticPushDeviceProp {
  token: string;
  firebase_project: string;
  platform: string;
  platform_version: string;
  model: string;
  make: string;
  app: string;
  app_version: string;
  contact: string;
  bundle_id?: string;
}

export interface MauticContactUTMProps {
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  url: string;
  referer?: string;
  query?: Record<string, any>;
  remotehost?: string;
  lastActive?: Date;
  useragent?: string;
}

export interface MauticAppEventProps {
  date?: Date;
  lat?: number;
  lon?: number;
  bundle_id: string;
  timezone_offset?: string;
  referrer?: string;
  language?: string;
  title?: string;
  event: string;
  event_type: string;
  referer_id?: string;
  external_id?: string;
  [key: string]: any;
}

export interface MauticVideoHitProps {
  duration?: number;
  url: string;
  total_watched?: number;
  [key: string]: any;
}

export default class Mautic {
  static init(props: MauticInitProps);

  static getToken(): Promise<string>;

  static requestToken(params: MauticRequestTokenProps): Promise<MauticStoredToken>;

  static createContact(params: MauticContactCreationProps): Promise<{ contact: MauticContactProps }>;

  static setLastActive(contactId: number): Promise<{ contact: MauticContactProps }>;

  static editContact(contactId: string, params: MauticContactCreationProps): Promise<{ contact: MauticContactProps }>;

  static createPushDevice(params: MauticPushDeviceProp): Promise<Record<string, any>>;

  static updatePushDevice(deviceId: string, params: MauticPushDeviceProp): Promise<Record<string, any>>;
  static addUTM(contactId: string, params: MauticContactUTMProps): Promise<Record<string, any>>;
  static sendAppHit(params: MauticAppEventProps): Promise<Record<string, any>>;
  static sendVideoHit(params: MauticVideoHitProps): Promise<void>;
  static performCachedRequest(): Promise<void>;
}

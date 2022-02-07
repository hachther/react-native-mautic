export interface MauticInitProps {
    serverURL: string | null;
    appName: string;
    clientId: string;
    clientSecret: string;
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
  
  export interface MauticContactCreationProp extends MauticContactField {
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

export default class Mautic {
    static init(props: MauticInitProps);
    static getToken(): Promise<string>;
    static requestToken(params: MauticRequestTokenProps): Promise<MauticStoredToken>;
    static createContact(params: MauticContactCreationProp): Promise<{contact: MauticContactProps}>;
    static setLastActive(contactId: number): Promise<{contact: MauticContactProps}>;
    static editContact(contactId: string, params: MauticContactCreationProp): Promise<{contact: MauticContactProps}>;
}
import Restfull from './Restfull';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

class Mautic {
  static clientId: string;
  static clientSecret: string;
  static currentToken: MauticStoredToken;

  static init({serverURL, appName, clientId, clientSecret}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;

    Mautic.clientId = clientId;
    Mautic.clientSecret = clientSecret;
    // Restfull.tracking = tracking;
  }

  static async getToken(): Promise<string> {
    if (
      Mautic.currentToken &&
      Mautic.currentToken.expiryAt > new Date().getTime()
    ) {
      return Mautic.currentToken.accessToken;
    }

    const token = await AsyncStorage.getItem('token');
    if (token) {
      const object: MauticStoredToken = JSON.parse(token);
      if (object.expiryAt > new Date().getTime()) {
        Mautic.currentToken = object;
        return object.accessToken;
      }
    }
    const newToken = await Mautic.requestToken({
      clientId: Mautic.clientId,
      clientSecret: Mautic.clientSecret,
    });
    Mautic.currentToken = newToken;
    await AsyncStorage.setItem('token', JSON.stringify(newToken));
    return newToken.accessToken;
  }

  static async requestToken({
    clientId,
    clientSecret,
  }: MauticRequestTokenProps): Promise<MauticStoredToken> {
    const response = await Restfull.post<{
      access_token: string;
      expires_in: number;
    }>({
      endpoint: 'oauth/v2/token',
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      },
    });
    return {
      accessToken: response.access_token,
      expiryAt: new Date().getTime() + response.expires_in,
    };
  }

  static async createContact(
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    const token = await Mautic.getToken();
    return await Restfull.post<any>({
      endpoint: 'api/contacts/new',
      params: params,
      headers: {Authorization: `Bearer ${token}`},
    });
  }

  static async setLastActive(
    contactId: number,
  ): Promise<{contact: MauticContactProps}> {
    const token = await Mautic.getToken();
    return await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId}/edit`,
      params: {
        lastActive: new Date(),
      },
      headers: {Authorization: `Bearer ${token}`},
    });
  }

  static async editContact(
    contactId: number,
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    const token = await Mautic.getToken();
    return await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId}/edit`,
      params: params,
      headers: {Authorization: `Bearer ${token}`},
    });
  }
}

export default Mautic;

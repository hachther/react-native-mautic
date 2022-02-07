import Restfull from './Restfull';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MauticContactCreationProp, MauticContactProps, MauticInitProps, MauticRequestTokenProps, MauticStoredToken } from '..';


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
    contactId: string,
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

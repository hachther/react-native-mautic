import Restfull from './Restfull';
import base64 from 'react-native-base64';

import { MauticContactCreationProp, MauticContactProps, MauticInitProps, MauticRequestTokenProps, MauticStoredToken } from '..';


class Mautic {
  static basicToken: string;
  static currentToken: MauticStoredToken;

  static init({serverURL, appName, username, password}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;

    Mautic.basicToken = base64.encode(`${username}:${password}`);
    // Mautic.password = password;
    // Restfull.tracking = tracking;
  }

  static async createContact(
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    params.tags = Restfull.appName;
    return await Restfull.post<any>({
      endpoint: 'api/contacts/new',
      params: params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async setLastActive(
    contactId: number,
  ): Promise<{contact: MauticContactProps}> {
    return await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId}/edit`,
      params: {
        lastActive: new Date(),
      },
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async editContact(
    contactId: string,
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    return await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId}/edit`,
      params: params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }
}

export default Mautic;

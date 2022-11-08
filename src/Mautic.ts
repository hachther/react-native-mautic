import Restfull from './Restfull';
import base64 from 'react-native-base64';

import { MauticPushDeviceProp, MauticContactCreationProp, MauticContactProps, MauticInitProps, MauticRequestTokenProps, MauticStoredToken } from '..';


class Mautic {
  static basicToken: string;
  public static ipAddress: string;
  static currentToken: MauticStoredToken;

  static init({serverURL, appName, username, password}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;
    Restfull.profile = 'other';

    Mautic.basicToken = base64.encode(`${username}:${password}`);
    // Mautic.password = password;
    // Restfull.tracking = tracking;
  }

  static async createContact(
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    params.tags = Restfull.appName;
    params.ipAddress = Mautic.ipAddress;
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
        ipAddress: Mautic.ipAddress,
      },
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async editContact(
    contactId: string,
    params: MauticContactCreationProp,
  ): Promise<{contact: MauticContactProps}> {
    params.ipAddress = Mautic.ipAddress;
    return await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId}/edit`,
      params: params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async createPushDevice(data: MauticPushDeviceProp) {
    return await Restfull.post<any>({
      endpoint: 'api/fcm/devices/add',
      params: data,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async updatePushDevice(contact: string, data: MauticPushDeviceProp) {
    return await Restfull.patch<any>({
      endpoint: `api/fcm/devices/${contact}/edit`,
      params: data,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }
}

export default Mautic;

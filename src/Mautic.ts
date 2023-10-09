import Restfull from './Restfull';
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MauticPushDeviceProp, MauticContactCreationProps, MauticContactProps, MauticInitProps, MauticRequestTokenProps, MauticStoredToken, MauticContactUTMProps, MauticAppEventProps } from '..';

class Mautic {
  static basicToken: string;
  public static ipAddress: string;
  static currentToken: MauticStoredToken;
  public static trackingId: string;

  static init({serverURL, appName, username, password}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;
    Restfull.profile = 'other';

    Mautic.basicToken = base64.encode(`${username}:${password}`);
    AsyncStorage.getItem('trackingId').then(trackingId => {
      if (trackingId) {
        Mautic.trackingId = trackingId;
      }
    })
    // Mautic.password = password;
    // Restfull.tracking = tracking;
  }

  static async createContact(
    params: MauticContactCreationProps,
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

  static async addUTM(contactId: string, params: MauticContactUTMProps) {
    return await Restfull.post<any>({
      endpoint: `api/contacts/${contactId}/utm/add`,
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

  static async updatePushDevice(id: string, data: MauticPushDeviceProp) {
    return await Restfull.patch<any>({
      endpoint: `api/fcm/devices/${id}/edit`,
      params: data,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async getPushDevice(id: string) {
    return await Restfull.get<any>({
      endpoint: `api/fcm/devices/${id}`,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async sendAppHit(params: MauticAppEventProps) {
    if (!Mautic.trackingId) {
      return
    }
    params.mautic_device_id = Mautic.trackingId;
    if (!params.date) {
      params.date = new Date();
    }
    return await Restfull.post<any>({
      endpoint: 'fcm/events',
      params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
  }

  static async setTrackingId(trackingId: string) {
    Mautic.trackingId = trackingId;
    await AsyncStorage.setItem('trackingId', trackingId);
  }

  static async performCachedRequest() {
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      if(!key.startsWith('RestRequest')) {
        continue;
      }
      const request = JSON.parse(await AsyncStorage.getItem(key));
      try {
        await Restfull.request(request);
        await AsyncStorage.removeItem(key);
      } catch (e: any) {
        if (e.message !== 'Network request failed') {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  }
}

export default Mautic;

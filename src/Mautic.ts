import Restfull from './Restfull';
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUniqueId,
  getBrand,
  getBaseOs,
  getDevice,
  getDeviceName,
  getModel,
  getReadableVersion,
  getSystemName,
  getSystemVersion,
  getUserAgent,
  getDeviceType,
  getBundleId,
  getApplicationName,
} from 'react-native-device-info';
import {Platform, NativeModules} from 'react-native';
import TimeZone from 'react-native-timezone';

const deviceLanguage = () => {
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier;
  }

  return NativeModules.SettingsManager.settings.AppleLocale;
};

import { MauticPushDeviceProp, MauticContactCreationProps, MauticContactProps, MauticInitProps, MauticRequestTokenProps, MauticStoredToken, MauticContactUTMProps, MauticAppEventProps, MauticVideoHitProps } from '..';

class Mautic {
  static basicToken: string;
  public static ipAddress: string;
  static currentToken: MauticStoredToken;
  public static trackingId: string;
  public static contactId: string;
  public static appName: string;

  static init({serverURL, appName, username, password, onInitialize}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;
    Restfull.profile = 'other';

    Mautic.basicToken = base64.encode(`${username}:${password}`);
    AsyncStorage.multiGet(['contactId', 'trackingId']).then(async ret => {
      let contactId = ret[0][1];
      let trackingId = ret[1][1];
      if (trackingId) {
        Mautic.trackingId = trackingId;
      }
      if (contactId) {
        Mautic.contactId = contactId;
      }
      if (onInitialize){
        onInitialize();
      }
    })
  }

  static async createContact(
    params: MauticContactCreationProps,
  ): Promise<{contact: MauticContactProps}> {
    params.tags = Restfull.appName;
    params.ipAddress = Mautic.ipAddress;
    const ret = await Restfull.post<any>({
      endpoint: 'api/contacts/new',
      params: params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
    if (ret.contact) {
      Mautic.setContactId(String(ret.contact.id));
    }
    return ret.contact;
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
    params: MauticContactCreationProp,
    contactId?: string,
  ): Promise<{contact: MauticContactProps}> {
    params.ipAddress = Mautic.ipAddress;
    const ret = await Restfull.patch<any>({
      endpoint: `api/contacts/${contactId || Mautic.contactId}/edit`,
      params: params,
      headers: {Authorization: `Basic ${Mautic.basicToken}`},
    });
    if (ret.contact) {
      Mautic.setContactId(String(ret.contact.id));
    }
    return ret.contact;
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

  static async trackPushDeviceChange(data: Partial<MauticPushDeviceProp>) {
    if (!Mautic.contactId) {
      await Mautic.createContact({});
    }

    let ret: {success: number; device: Record<string, any>} | undefined;
    const params: Omit<MauticPushDeviceProp, 'firebase_project' | 'token'> = {
      platform: getSystemName(),
      platform_version: getSystemVersion(),
      model: getModel(),
      make: getBrand(),
      app: Mautic.appName,
      app_version: getReadableVersion(),
      bundle_id: getBundleId(),
      contact: Mautic.contactId,
    };
    const savedDevice = await AsyncStorage.getItem('MauticDevice');
    if (!savedDevice) {
      ret = await Mautic.createPushDevice({...data, ...params} as MauticPushDeviceProp);
    } else {
      let device = JSON.parse(savedDevice);
      const isDefferent = Object.keys(params).some(key => {
        // @ts-ignore
        return params[key] != device[key]
      })
      if (isDefferent) {
        ret = await Mautic.updatePushDevice(device.id, {...data, ...params} as MauticPushDeviceProp)
      }
    }

    if (!ret) {
      return undefined
    }

    await AsyncStorage.setItem('MauticDevice', JSON.stringify(ret.device));

    Mautic.setTrackingId(ret.device.tracking_id)

    return ret.device;
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
      params: {
        ...params,
        // device_name: await getDeviceName(),
        // device_os: getSystemName(),
        // device_brand: getBrand(),
        // device_model: getModel(),
        platform: `${getSystemName()} ${getSystemVersion()}`,
        bundle_id: getBundleId(),
        app: `${getApplicationName()}/v.${getReadableVersion()}`,
        preferred_locale: deviceLanguage(),
        timezone: await TimeZone.getTimeZone(),
        timezone_offset: new Date().getTimezoneOffset(),
      },
      headers: {
        Authorization: `Basic ${Mautic.basicToken}`,
        'X-Requested-With': 'XMLHttpRequest',
        // 'User-Agent': getUserAgent(),
      },
    });
  }

  static async sendVideoHit(params: MauticVideoHitProps) {
    if (!Mautic.trackingId) {
      return
    }
    params.mautic_device_id = Mautic.trackingId;
    params.guid = await getUniqueId();

    return await Restfull.post<any>({
      endpoint: 'video/hit',
      params,
      headers: {
        // Authorization: `Basic ${Mautic.basicToken}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
    });
  }

  static async setTrackingId(trackingId: string) {
    Mautic.trackingId = trackingId;
    await AsyncStorage.setItem('trackingId', trackingId);
  }

  static async setContactId(contactId: string) {
    Mautic.contactId = contactId;
    await AsyncStorage.setItem('contactId', contactId);
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

import Restfull from './Restfull';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MauticInitProps {
  serverURL: string | null;
  appName: string;
}

export interface MauticRequestTokenProps {
  clientId: string;
  clientSecret: string;
}

class Mautic {
  static init({serverURL, appName}: MauticInitProps) {
    Restfull.serverURL = serverURL;
    Restfull.appName = appName;
    // Restfull.tracking = tracking;
  }

  static async requestToken({clientId, clientSecret}: MauticRequestTokenProps) {
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
    const token = {
      accessToken: response.access_token,
      expiryAt: new Date().getTime() + response.expires_in,
    };
    await AsyncStorage.setItem('token', JSON.stringify(token));
  }
}

export default Mautic;

import toQuery from './toQuery';
import RestError from './error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBuildIdSync,
  getBuildNumber,
  getModel,
  getReadableVersion,
  getSystemName,
  getSystemVersion,
} from 'react-native-device-info';

export const buildApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const end =
    endpoint.endsWith('.pdf') || endpoint.endsWith('.json') ? '' : '/';
  return `${Restfull.serverURL}/${Restfull.prefix}${endpoint}${end}`;
};

const defaultHeaders = () => {
  const h: {[key: string]: string} = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // 'Accept-Language': I18n.language,
    // 'User-Agent': `${Restfull.appName}/${version} ${system}/${systemVersion} ${brand}; ${model}`,
  };
  return h;
};

type RequestMethod = 'post' | 'get' | 'del' | 'put' | 'patch';

export interface RestfullRequestProps {
  endpoint: string;
  query?: Record<string, string | number | boolean>;
  params?: Record<string, any> | FormData;
  headers?: Record<string, string>;
  upload?: boolean;
  auth?: boolean;
  encoding?: 'json' | 'form-data';
}

export interface RestfullDownloadProps {
  endpoint: string;
  headers?: Record<string, string>;
  toFile?: string;
  cacheable?: boolean;
}

class Restfull {
  static serverURL: string | null = null;
  static prefix = 'api';
  static appName = 'Mautic';
  static accessToken = null;
  static userAgent?: string;

  static async request<T>({
    method,
    endpoint,
    query,
    params,
    headers = {},
    upload = false,
    encoding = 'json',
  }: RestfullRequestProps & {method: RequestMethod}, cacheable: boolean = false): Promise<T> {
    try {
      let url = `${Restfull.serverURL}/${endpoint}`;
      if (encoding === 'form-data') {
        headers['Content-Type'] =
          'multipart/form-data; boundary=---011000010111000001101001';
      }
      const req: {[key: string]: any} = {
        method,
        headers: {
          ...defaultHeaders(),
          'User-Agent': Restfull.getUserAgent(),
          ...headers,
        },
        body: undefined,
      };

      if (upload) {
        // @ts-ignore
        delete req.headers['Content-Type'];
      }
      if (!['get', 'del'].includes(method.toLowerCase()) && params) {
        if (upload) {
          req.body = params;
        } else if (encoding === 'form-data') {
          const form = new FormData();
          Object.keys(params).forEach(key => {
            form.append(key, (params as Record<string, any>)[key]);
          });
          req.body = form;
        } else {
          req.body = JSON.stringify(params);
        }
      }
      if (__DEV__) {
        console.log(`${method.toUpperCase()} ${url}`);
      } else {
        // Restfull.tracking(`${method.toUpperCase()} ${url}`, {
        //   category: 'Rest',
        // });
      }
      if (query) {
        url = `${url}?${toQuery(query)}`;
      }
      const response = await fetch(url, req);
      if (response.status >= 300) {
        throw new RestError(await response.text());
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (e) {
      if (e.message === 'Network request failed' && cacheable) {
        Restfull.cacheRequest({
          method,
          endpoint,
          query,
          params,
          headers,
          encoding,
        });
      }
      throw e;
    }
  }

  static cacheRequest({
                        method,
                        endpoint,
                        query,
                        params,
                        headers = {},
                        encoding = 'json',
                      }: RestfullRequestProps & {method: 'string'}) {
    const content: Record<string, any> = { method, endpoint, encoding };
    if (query) {
      content.query = query;
    }
    if (params) {
      content.params = params;
    }
    if (headers) {
      content.headers = headers;
    }
    AsyncStorage.setItem(
      `RestRequest${new Date().getTime()}`,
      JSON.stringify(content)
    );
  }

  static getUserAgent = () => {
    if (!Restfull.userAgent) {
      const system = getSystemName();
      const systemVersion = getSystemVersion();
      const version = getReadableVersion();
      const buildNumber = getBuildNumber();
      const buildId = getBuildIdSync();
      const model = getModel();

      Restfull.userAgent = `${
        Restfull.appName
      }/${version}.${buildNumber} (${system}; ${system} ${systemVersion}; ${model}) Version/${version}.${buildNumber} Mobile/${buildId} Model/${model.replace(
        / /g,
        '_'
      )}`;
    }

    return Restfull.userAgent;
  };

  static async get<T>(params: RestfullRequestProps): Promise<T> {
    return Restfull.request<T>({...params, method: 'get'});
  }

  static async post<T>(params: RestfullRequestProps): Promise<T> {
    return Restfull.request<T>({...params, method: 'post'});
  }

  static async put<T>(params: RestfullRequestProps): Promise<T> {
    return Restfull.request<T>({...params, method: 'put'});
  }

  static async patch<T>(params: RestfullRequestProps): Promise<T> {
    return Restfull.request<T>({...params, method: 'patch'});
  }

  static async delete<T>(params: RestfullRequestProps): Promise<T> {
    return Restfull.request<T>({...params, method: 'del'});
  }
}

export default Restfull;

import toQuery from './toQuery';
import RestError from './error';

export const buildApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const end =
    endpoint.endsWith('.pdf') || endpoint.endsWith('.json') ? '' : '/';
  return `${Restfull.serverURL}/${Restfull.prefix}${endpoint}${end}`;
};

const defaultHeaders = (auth: boolean = true) => {
  const h: {[key: string]: string} = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // 'Accept-Language': I18n.language,
    // 'User-Agent': `${Restfull.appName}/${version} ${system}/${systemVersion} ${brand}; ${model}`,
  };
  if (auth) {
    h.Authorization = `Bearer ${Restfull.accessToken}`;
  }
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

  static async request<T>({
    method,
    endpoint,
    query,
    params,
    headers = {},
    upload = false,
    auth = true,
    encoding = 'json',
  }: RestfullRequestProps & {method: RequestMethod}): Promise<T> {
    let url = `${Restfull.serverURL}/${endpoint}`;
    if (encoding === 'form-data') {
      headers['Content-Type'] =
        'multipart/form-data; boundary=---011000010111000001101001';
    }
    const req: {[key: string]: any} = {
      method,
      headers: {
        ...defaultHeaders(auth),
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
      throw new RestError('Error during the processing');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

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


import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponseHeaders } from 'axios';
import { convertCase } from './utils/convertCase';
import { AddDefault, EditDefault, GritRequestPayload } from './types';
import { GritDomainRequester } from './grit-domain-requester';

export interface GritRequesterOptions {
  baseUrl: string;
  authUrl?: string;
  token: string;
  secret: string;
  context: string;
  tokenHeader?: string;
  tokenExpirationHeader?: string;
  convertToSnakeCase?: boolean;
}

export class GritRequester {
  public client: AxiosInstance;

  public baseUrl: string;

  public authUrl: string;

  public token: string;

  public secret: string;

  public context: string;

  public tokenHeader: string;

  public tokenExpirationHeader: string;

  public converToSnakeCase: boolean = false;

  public accessToken: string | null = null;

  public tokenExpiration: Date | null = null;

  constructor(options: GritRequesterOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.baseUrl = options.baseUrl;
    this.authUrl = options.authUrl || `${options.baseUrl}/auth/generate`;
    this.token = options.token;
    this.secret = options.secret;
    this.context = options.context;
    this.tokenHeader = options.tokenHeader || 'x-token';
    this.tokenExpirationHeader = options.tokenExpirationHeader || 'x-expires';
    this.converToSnakeCase = Boolean(options.convertToSnakeCase);

    this.client.defaults.headers.common.context = this.context;
    this.interceptors();
  }

  public async auth() {
    const response = await axios.post(this.authUrl, {
      token: this.token,
      secret: this.secret,
    });

    this.accessToken = response.data.token;
    this.tokenExpiration = new Date(response.data.valid_until as string);
    if (this.tokenHeader && this.tokenExpirationHeader) {
      this.accessToken = response.headers[
        this.tokenHeader || 'x-refreshed-token'
      ];

      this.tokenExpiration = new Date(response.headers[
        this.tokenExpirationHeader || 'x-refreshed-token-valid-until'
      ]);
    }

    this.client.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
  }

  public isTokenValid(): boolean {
    return !!this.accessToken && !!this.tokenExpiration && new Date() < this.tokenExpiration;
  }

  public getRefreshTokemFromHeader(headers: AxiosResponseHeaders) {
    const refreshedToken = headers[this.tokenHeader];
    const refreshedValidUntil = headers[
      this.tokenExpirationHeader
    ];

    if (!refreshedToken || !refreshedValidUntil) {
      return null;
    }

    const splitedToken = (refreshedToken as string).split(' ');

    if (splitedToken.length < 2) {
      return null;
    }

    return {
      token: splitedToken[1],
      validUntil: refreshedValidUntil as string,
    };
  }

  private interceptors() {
    this.client.interceptors.request.use(async (config) => {
      if (!this.isTokenValid()) {
        await this.auth();
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }

      return config;
    });

    if (this.converToSnakeCase) {
      this.client.interceptors.request.use((config) => {
        if (config.data) {
          // eslint-disable-next-line no-param-reassign
          config.data = convertCase(JSON.parse(JSON.stringify(config.data)), 'camel_to_snake');
        }

        if (config.params) {
          // eslint-disable-next-line no-param-reassign
          config.params = convertCase(config.params, 'camel_to_snake');
        }

        return config;
      });

      this.client.interceptors.response.use((response) => {
        if (response.data) {
          response.data = convertCase(response.data, 'snake_to_camel');
        }
        return response;
      });
    }

    this.client.interceptors.response.use(
      (response) => {
        const refreshedToken = this.getRefreshTokemFromHeader(
          response.headers as AxiosResponseHeaders,
        );

        if (
          refreshedToken
          && refreshedToken.token !== this.accessToken
        ) {
          this.tokenExpiration = new Date(refreshedToken.validUntil);
          this.accessToken = refreshedToken.token;

          this.client.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
        }

        return response;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // eslint-disable-next-line no-underscore-dangle
        if (error.response?.status === 401 && !originalRequest._retry) {
          // eslint-disable-next-line no-underscore-dangle
          originalRequest._retry = true;

          try {
            await this.auth();

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }

            return this.client(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public async request<R, T = object>({ path, method, body }: GritRequestPayload<T>): Promise<R | null> {
    const result = await this.client.request<R>({
      url: path,
      method,
      data: body,
    });

    return result.data;
  }

  public domain<T, Add=AddDefault<T>, Edit=EditDefault<T>>(domain: string): GritDomainRequester<T, Add, Edit> {
    return new GritDomainRequester({ domain, requester: this });
  }
}

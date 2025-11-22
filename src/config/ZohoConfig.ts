import { env } from "./env";

export interface IZohoConfig {
  get baseURL(): string;
  get oauthURL(): string;
  getClientId(): string;
  getClientSecret(): string;
  getRedirectUri(type: "accessToken" | "refreshToken"): string;
  getDataCenter(): string;
  getAuthorizationCode(): string;
}

export class ZohoConfig {
  constructor(
    private clientId=env.zohoClientId,
    private clientSecret=env.zohoClientSecret,
    private redirectUriAccessToken="",
    private redirectUriRefreshToken="http://localhost:3000/zoho/refresh-token",
    private dataCenter=env.zohoDataCenter,
    private authorizationCode=env.zohoAuthorizationCode,
  ) {}

  get baseURL() {
    return `https://www.zohoapis.${this.dataCenter}`;
  }

  get oauthURL() {
    return `https://accounts.zoho.${this.dataCenter}/oauth/v2`;
  }

  getClientId() {
    return this.clientId;
  }
  getClientSecret() {
    return this.clientSecret;
  }
  getRedirectUri(type: "accessToken" | "refreshToken") {
    return type === "accessToken"
      ? this.redirectUriAccessToken
      : this.redirectUriRefreshToken;
  }
  getDataCenter() {
    return this.dataCenter;
  }
  getAuthorizationCode() {
    return this.authorizationCode;
  }
}

const zohoConfigInstance = new ZohoConfig();
export default zohoConfigInstance;
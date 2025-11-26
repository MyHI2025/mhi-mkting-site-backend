import { ZohoTokenResponse } from "../services/zoho.service";
import { env } from "./env";

export interface IZohoConfig {
  get baseURL(): string;
  get oauthURL(): string;
  getClientId(): string;
  getClientSecret(): string;
  getRedirectUri(type: "accessToken" | "refreshToken"): string;
  getDataCenter(): string;
  getAuthorizationCode(): string;
  addZohoTokens(data: ZohoTokenResponse): void;
  getTokens(): ZohoTokenResponse | null;
}

export class ZohoConfig {
  private tokens: ZohoTokenResponse | null = null;
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
  addZohoTokens(data: ZohoTokenResponse) {
    this.tokens = data;
  }
  getTokens() {
    return this.tokens;
  }
}

const zohoConfigInstance = new ZohoConfig();
export default zohoConfigInstance;
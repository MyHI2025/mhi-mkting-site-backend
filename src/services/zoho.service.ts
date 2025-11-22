import type { Contact } from "@myhi2025/shared";
import zohoConfigInstance, { IZohoConfig } from "../config/ZohoConfig";

interface ZohoTokenResponse {
  access_token: string;
  refresh_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

interface ZohoLeadData {
  Salutation?: string;
  Last_Name: string;
  First_Name?: string;
  Email: string;
  Phone?: string;
  Company?: string;
  City?: string;
  Country?: string;
  Lead_Source: string;
  Description?: string;
  Lead_Status: string;
}

export class ZohoCRMService {
  constructor(private readonly zohoConfig: IZohoConfig) {}

  private mapContactToZohoLead(contact: Contact): ZohoLeadData {
    return {
      Salutation: contact.title || undefined,
      Last_Name: contact.lastName,
      First_Name: contact.firstName || undefined,
      Email: contact.email,
      Phone: contact.phone || undefined,
      Company: contact.organization || undefined,
      City: contact.city || undefined,
      Country: contact.country || undefined,
      Lead_Source: "Website Contact Form",
      Description: `User Type: ${contact.userType}\n\nMessage:\n${contact.message}`,
      Lead_Status: "Not Contacted",
    };
  }

  async crmRequest(
    contacts: Contact[]
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const accessToken = await this.generateAccessToken();
      const leadData: any[] = [];
      for (const contact of contacts) {
        const tempLeadData = this.mapContactToZohoLead(contact);
        leadData.push(tempLeadData);
      }

      const response = await fetch(`${this.zohoConfig.baseURL}/crm/v2/Leads`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: leadData,
          trigger: ["approval", "workflow", "blueprint"],
        }),
      });
      const result = (await response.json()) as any;

      if (!response.ok) {
        console.error("Zoho API error:", result);
        return {
          success: false,
          error: result.message || "Failed to create lead in Zoho CRM",
        };
      }

      if (result.data && result.data[0]) {
        const leadInfo = result.data[0];
        if (leadInfo.code === "SUCCESS") {
          return {
            success: true,
            id: leadInfo.details.id,
          };
        } else {
          return {
            success: false,
            error: leadInfo.message || "Failed to create lead",
          };
        }
      }

      return {
        success: false,
        error: "Unexpected response from Zoho CRM",
      };
    } catch (error) {
      console.error("Error creating Zoho lead:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createLeads(
    contacts: Contact[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const result = await this.crmRequest(contacts);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${contacts[0].email}: ${result.error}`);
    }

    return results;
  }

  isConfigured(): boolean {
    return (
      this.zohoConfig.getClientId() !== "" &&
      this.zohoConfig.getClientSecret() !== "" &&
      this.zohoConfig.getAuthorizationCode() !== ""
    );
  }

  async generateAccessToken(): Promise<ZohoTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.zohoConfig.getClientId(),
      client_secret: this.zohoConfig.getClientSecret(),
      code: this.zohoConfig.getAuthorizationCode(),
    });

    const res = await fetch(`${this.zohoConfig.oauthURL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const text = await res.text();

    console.log("Zoho token raw response:", text);

    if (!res.ok) {
      throw new Error(`Failed to get access token: ${res.status} ${text}`);
    }

    return JSON.parse(text);
  }

  async generateAccessTokenFromRefresh(refreshToken: string) {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.zohoConfig.getClientId(),
      client_secret: this.zohoConfig.getClientSecret(),
    });

    const res = await fetch(`${this.zohoConfig.oauthURL}/token`, {
      method: "POST",
      body: params,
    });

    if (!res.ok) {
      throw new Error(
        `Failed to refresh token: ${res.status} ${await res.text()}`
      );
    }

    return res.json();
  }
}

export const zohoCRM = new ZohoCRMService(zohoConfigInstance);

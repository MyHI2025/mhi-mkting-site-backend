import type { Contact } from "@myhi2025/shared";

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  dataCenter: string; // e.g., "com", "eu", "in", "com.au", "jp"
}

interface ZohoTokenResponse {
  access_token: string;
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
  private config: ZohoConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    const dataCenter = process.env.ZOHO_DATA_CENTER || "com";

    if (clientId && clientSecret && refreshToken) {
      this.config = {
        clientId,
        clientSecret,
        refreshToken,
        dataCenter,
      };
    }
  }

  private getAuthUrl(): string {
    if (!this.config) throw new Error("Zoho CRM not configured");
    return `https://accounts.zoho.${this.config.dataCenter}/oauth/v2/token`;
  }

  private getApiUrl(): string {
    if (!this.config) throw new Error("Zoho CRM not configured");
    return `https://www.zohoapis.${this.config.dataCenter}/crm/v2`;
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error(
        "Zoho CRM credentials not configured. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_DATA_CENTER in Secrets."
      );
    }

    try {
      const params = new URLSearchParams({
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
      });

      const response = await fetch(this.getAuthUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to refresh Zoho token: ${error}`);
      }

      const data = await response.json() as ZohoTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Error refreshing Zoho access token:", error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }
    return this.refreshAccessToken();
  }

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

  async createLead(
    contact: Contact
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.config) {
      return {
        success: false,
        error: "Zoho CRM not configured. Please add credentials in Secrets.",
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const leadData = this.mapContactToZohoLead(contact);

      const response = await fetch(`${this.getApiUrl()}/Leads`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [leadData],
          trigger: ["approval", "workflow", "blueprint"],
        }),
      });

      const result = await response.json() as any;

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

    for (const contact of contacts) {
      const result = await this.createLead(contact);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${contact.email}: ${result.error}`);
      }
    }

    return results;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }
}

export const zohoCRM = new ZohoCRMService();

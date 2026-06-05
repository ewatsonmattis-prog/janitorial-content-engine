import { config } from '../../config/env';
export class GoHighLevelClient {
  private readonly baseUrl = 'https://services.leadconnectorhq.com';

  private get headers() {
    return {
      Authorization: `Bearer ${config.ghl.apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    };
  }

  async createEmailTemplate(payload: unknown): Promise<any> {
  const response = await fetch(
    `${this.baseUrl}/emails/public/v2/locations/${config.ghl.locationId}/campaigns/email-campaign`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `GoHighLevel API Error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/locations/${config.ghl.locationId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const ghlClient = new GoHighLevelClient();

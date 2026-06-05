import { config } from '../../config/env';
export class GoHighLevelClient {
  private readonly baseUrl = 'https://services.leadconnectorhq.com';

  private get headers() {
    return {
      Authorization: `Bearer ${config.gohighlevel.apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    };
  }

  async createEmailTemplate(payload: unknown): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/emails/templates`,
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
        `${this.baseUrl}/locations/${config.gohighlevel.locationId}`,
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

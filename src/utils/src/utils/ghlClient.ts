import { config } from '../config/env';

const BASE_URL = 'https://services.leadconnectorhq.com';

export async function createContact(
  email: string,
  firstName: string,
  lastName: string
) {
  const response = await fetch(
    `${BASE_URL}/contacts/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.ghl.apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: config.ghl.locationId,
        email,
        firstName,
        lastName,
      }),
    }
  );

  return response.json();
}

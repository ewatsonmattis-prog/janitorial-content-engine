// src/utils/ghlClient.ts

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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GoHighLevel API Error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

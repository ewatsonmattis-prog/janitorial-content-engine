export type GhlEmailTemplatePayload = {
  name: string;
  subject: string;
  previewText?: string;
  html: string;
  plainText?: string;
  folderId?: string;
};

export type GhlEmailTemplateResponse = {
  id?: string;
  templateId?: string;
  name?: string;
  status?: string;
  [key: string]: unknown;
};

export type PublishNewsletterResult = {
  success: boolean;
  templateId?: string;
  message: string;
  raw?: unknown;
};

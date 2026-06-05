import { ghlClient } from './goHighLevelClient';
import {
  GhlEmailTemplatePayload,
  PublishNewsletterResult,
} from './types';

export async function publishNewsletter(
  subject: string,
  previewText: string,
  htmlContent: string,
  plainText: string
): Promise<PublishNewsletterResult> {
  try {
    const payload = {
  name: `CleanReach Newsletter ${new Date().toISOString()}`,
  title: subject,
  subject,
  previewText,
  body: htmlContent,
  html: htmlContent,
  plainText,
  editorType: 'html',
  timeZone: 'Europe/London',
  userId: config.ghl.userId,
};

    const response = await ghlClient.createEmailTemplate(payload);

    return {
      success: true,
      templateId:
        response.id ??
        response.templateId ??
        '',
      message: 'Newsletter template created successfully',
      raw: response,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown GoHighLevel error',
    };
  }
}

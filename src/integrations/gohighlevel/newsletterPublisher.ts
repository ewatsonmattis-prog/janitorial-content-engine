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
    const payload: GhlEmailTemplatePayload = {
      name: `CleanReach Newsletter ${new Date().toISOString()}`,
      subject,
      previewText,
      html: htmlContent,
      plainText,
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

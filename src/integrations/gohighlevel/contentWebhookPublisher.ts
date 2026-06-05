import { config } from '../../config/env';
import { ContentPack } from '../../config/types';

export async function publishContentPackToGhlWebhook(
  pack: ContentPack
): Promise<void> {
  if (!config.ghl.contentWebhookUrl) {
    console.log('ℹ️ No GHL content webhook URL configured. Skipping webhook publish.');
    return;
  }

  const payload = {
    packId: pack.id,
    createdAt: pack.createdAt,
    topic: pack.input.topic,
    pillar: pack.input.pillar,

    emailSubject: pack.emailNewsletter.subjectLine,
    emailPreviewText: pack.emailNewsletter.previewText,
    emailBody: pack.emailNewsletter.body,
    emailHtml: pack.emailNewsletter.fullHtml,
    emailCta: pack.emailNewsletter.cta,

    blogTitle: pack.blogArticle.title,
    blogMarkdown: pack.blogArticle.fullMarkdown,
    blogWordCount: pack.blogArticle.wordCount,

    linkedInPost: pack.linkedInPosts[0]?.fullPost ?? '',
    gbpPost: pack.gbpPosts[0]?.body ?? '',
  };

  const response = await fetch(config.ghl.contentWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`GHL webhook failed: ${response.status} ${await response.text()}`);
  }

  console.log('✅ Content pack sent to GoHighLevel webhook.');
}

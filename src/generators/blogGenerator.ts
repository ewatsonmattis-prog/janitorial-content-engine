// ─────────────────────────────────────────────────────────────
// CleanReach Content Engine – Blog Article Generator
// ─────────────────────────────────────────────────────────────

import { ContentInput, BlogArticle, SeoData, BlogSection } from '../config/types';
import { aiComplete, parseJsonFromAI } from '../utils/aiClient';
import { loadPrompt, buildVariables, CLEANREACH_SYSTEM_PROMPT } from '../utils/promptLoader';

const SYSTEM_PROMPT = `${CLEANREACH_SYSTEM_PROMPT}

For blog articles, return a JSON object with this exact schema:
{
  "title": "string",
  "seo": {
    "primaryKeyword": "string",
    "secondaryKeywords": ["string"],
    "metaTitle": "string (under 60 chars)",
    "metaDescription": "string (under 160 chars)",
    "urlSlug": "string (lowercase-hyphenated)",
    "internalLinkSuggestions": ["string"],
    "localSeoVariations": ["string"]
  },
  "introduction": "string",
  "sections": [
    { "heading": "string", "content": "string" }
  ],
  "conclusion": "string",
  "fullMarkdown": "string under 700 words",
  "wordCount": number
}

Return ONLY valid JSON. No markdown wrapper, no commentary.`;

export async function generateBlogArticle(
  input: ContentInput
): Promise<BlogArticle> {
  const promptTemplate = loadPrompt('blog-article', buildVariables(input));

const userPrompt = `${promptTemplate}

Return ONE valid JSON object only.
Keep fullMarkdown under 700 words.
No markdown outside the JSON.
No commentary.`;

const raw = await aiComplete(SYSTEM_PROMPT, userPrompt);
  
  type RawBlog = {
    title: string;
    seo: SeoData;
    introduction: string;
    sections: BlogSection[];
    conclusion: string;
    fullMarkdown: string;
    wordCount: number;
  };

  const parsed = parseJsonFromAI<RawBlog | RawBlog[]>(raw);
  const blog = Array.isArray(parsed) ? parsed[0] : parsed;

  // Calculate word count if AI didn't provide it
  if (!blog.wordCount && blog.fullMarkdown) {
    blog.wordCount = blog.fullMarkdown.split(/\s+/).length;
  }

  return blog;
}

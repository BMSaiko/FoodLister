/**
 * AI content generation for marketing.
 * Supports OpenAI and other providers via abstraction layer.
 */

interface GenerateContentOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GeneratedContent {
  content: string;
  tokensUsed: number;
  model: string;
}

/**
 * Generate content using the configured AI provider.
 * Requires OPENAI_API_KEY in environment variables.
 */
export async function generateContent(
  options: GenerateContentOptions
): Promise<GeneratedContent> {
  const {
    prompt,
    model = 'gpt-4o-mini',
    maxTokens = 500,
    temperature = 0.7,
  } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a marketing assistant for FoodLister, a restaurant discovery app. Create engaging, concise social media content. Use emojis sparingly. Keep posts under 280 characters for Twitter, longer for other platforms.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature,
  };

  // ponytail: retry transient OpenAI failures (network blip / 429 / 5xx) with
  // backoff. 4xx (auth/validation) and missing key are deterministic -> not retried.
  // Ceiling: fixed 3 attempts; if rate limits persist at scale, move to a queue.
  const MAX_ATTEMPTS = 3;
  let lastError: unknown;
  const is4xx = (e: unknown) => e instanceof Error && /^OpenAI API error: 4/.test(e.message);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        if (response.status < 500 && response.status !== 429) {
          throw new Error(`OpenAI API error: ${response.status} ${body}`);
        }
        if (attempt < MAX_ATTEMPTS) {
          await sleep(300 * attempt);
          continue;
        }
        throw new Error(`OpenAI API error: ${response.status} ${body}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;

      return {
        content: content.trim(),
        tokensUsed,
        model,
      };
    } catch (err) {
      if (is4xx(err)) throw err;
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(300 * attempt);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI generation failed');
}

/**
 * Generate social media content for a restaurant.
 */
export async function generateRestaurantPost(
  restaurantName: string,
  rating: number | null,
  location: string | null,
  platform: string,
  postType: string = 'restaurant_promo'
): Promise<GeneratedContent> {
  const platformGuidelines: Record<string, string> = {
    twitter: 'Keep it under 280 characters. Use 1-2 relevant hashtags.',
   Instagram: 'Write a longer caption (up to 150 words). Use 5-10 relevant hashtags. Include a call to action.',
    facebook: 'Write a medium-length post (50-100 words). Friendly and conversational tone.',
    linkedin: 'Professional tone. Focus on the business/value aspect. 50-80 words.',
    tiktok: 'Casual, trendy tone. Short and punchy. Include hashtag suggestions.',
    youtube: 'Write a video description (100-200 words). Include keywords for SEO.',
  };

  const guidelines = platformGuidelines[platform] || platformGuidelines.twitter;

  const prompt = `Write a ${postType === 'restaurant_promo' ? 'promotional post' : 'social media post'} for "${restaurantName}"${location ? ` in ${location}` : ''}${rating ? ` with a rating of ${rating}/5 stars` : ''}.

Platform: ${platform}
Guidelines: ${guidelines}

The post should be engaging, highlight what makes this restaurant special, and encourage people to visit or add it to their FoodLister lists.`;

  return generateContent({ prompt, model: 'gpt-4o-mini', maxTokens: platform === 'twitter' ? 100 : 300 });
}

/**
 * Generate a weekly digest post from a list of restaurants.
 */
export async function generateWeeklyDigest(
  restaurants: Array<{ name: string; rating: number | null; location: string | null }>,
  platform: string
): Promise<GeneratedContent> {
  const restaurantList = restaurants
    .slice(0, 5)
    .map((r) => `- ${r.name}${r.location ? ` (${r.location})` : ''}${r.rating ? ` ⭐${r.rating}` : ''}`)
    .join('\n');

  const prompt = `Write a weekly digest social media post highlighting these restaurants from my FoodLister:

${restaurantList}

Platform: ${platform}
Make it exciting and encourage people to discover these spots. Include a call to action to check out the full list on FoodLister.`;

  return generateContent({ prompt, model: 'gpt-4o-mini', maxTokens: 400 });
}

/**
 * Generate content from a prompt template with variable substitution.
 */
export async function generateFromTemplate(
  template: string,
  variables: Record<string, string>,
  platform: string
): Promise<GeneratedContent> {
  let prompt = template;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return generateContent({ prompt, model: 'gpt-4o-mini', maxTokens: 400 });
}

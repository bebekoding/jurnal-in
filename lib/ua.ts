const BOT_UA = /bot|crawler|spider|crawling|facebookexternalhit|slackbot|discordbot|twitterbot|linkedinbot|whatsapp|telegrambot|embedly|preview|pinterest|redditbot|applebot|bingpreview|googlebot|duckduckbot|baiduspider|yandex/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

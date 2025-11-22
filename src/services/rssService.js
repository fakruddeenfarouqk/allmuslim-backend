import RSSParser from "rss-parser";
const parser = new RSSParser();

export async function fetchRssFeed(url) {
  const feed = await parser.parseURL(url);
  return feed.items.map(item => ({
    title: item.title,
    speaker: item.creator || item.author || "Unknown",
    dateTime: item.isoDate ? new Date(item.isoDate) : new Date(),
    sourceUrl: item.link,
    sourceType: "rss"
  }));
}

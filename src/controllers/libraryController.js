import LibraryItem from "../models/LibraryItem.js";

export async function getLibrary(req, res) {
  try {
    const items = await LibraryItem.find().sort({ publishedAt: -1 }).limit(200);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

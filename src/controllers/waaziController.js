import Waazi from "../models/Waazi.js";

export async function getUpcomingWaazi(req, res) {
  try {
    const now = new Date();
    const waazi = await Waazi.find({ dateTime: { $gte: now } })
      .sort({ dateTime: 1 })
      .limit(100);
    res.json(waazi);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

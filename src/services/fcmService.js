import axios from "axios";

export async function sendFCM({ serverKey, title, body, topic = "all", data = {} }) {
  const res = await axios.post(
    "https://fcm.googleapis.com/fcm/send",
    {
      to: `/topics/${topic}`,
      notification: { title, body },
      data
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`
      }
    }
  );
  return res.data;
}

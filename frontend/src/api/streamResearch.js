

export async function streamResearch(company, { onEvent, signal }) {
  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const response = await fetch(
    `${baseURL}/research/stream?company=${encodeURIComponent(company)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }
  );

  if (!response.ok) {
    let errMsg = "Could not start the research stream";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {
      
    }
    throw new Error(errMsg);
  }
  if (!response.body) {
    throw new Error("Could not start the research stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const messages = buffer.split("\n\n");
    buffer = messages.pop();

    for (const message of messages) {
      let eventType = "message";
      let data = "";

      for (const line of message.split("\n")) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        if (line.startsWith("data:")) data = line.slice(5).trim();
      }

      if (data) {
        onEvent(eventType, JSON.parse(data));
      }
    }
  }
}

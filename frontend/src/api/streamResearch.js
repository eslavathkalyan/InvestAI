// Native EventSource can't send a custom Authorization header, and
// every other request in this app authenticates that way (see
// api/axios.js). Rather than special-case this one endpoint to pass
// the JWT as a URL query param (which would then get logged in
// server access logs and browser history), we consume the SSE
// stream manually: fetch() with a normal header, then read the
// response body as a stream and parse the "event: x\ndata: y\n\n"
// format ourselves.
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
      // Ignore JSON parse error and use default
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

    // Individual SSE messages are separated by a blank line. The
    // last entry after splitting might be a partial message that
    // hasn't fully arrived yet, so it's kept in the buffer instead
    // of being parsed this round.
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

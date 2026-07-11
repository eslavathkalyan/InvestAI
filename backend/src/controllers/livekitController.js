import { AccessToken } from "livekit-server-sdk";
import asyncHandler from "../utils/asyncHandler.js";

const getLivekitToken = asyncHandler(async (req, res) => {
  const room = req.query.room || "investai-voice-room";
  const participantName = req.query.participant || `User-${Math.floor(1000 + Math.random() * 9000)}`;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.log("⚠️  Livekit API Key or Secret not configured. Returning simulated demo token.");
    // Return a dummy token for demo mode so the UI doesn't crash and can show the simulation
    return res.status(200).json({
      token: "demo_token_livekit_simulation_mode",
      room,
      participantName,
      isDemo: true,
      message: "Running in offline demo/simulation mode. Configure LIVEKIT_API_KEY to connect to a real room."
    });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    res.status(200).json({
      token,
      room,
      participantName,
      isDemo: false
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate Livekit token", error: error.message });
  }
});

export { getLivekitToken };

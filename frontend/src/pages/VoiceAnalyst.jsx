import React, { useState, useEffect, useRef } from "react";
import axios from "../api/axios.js";

const VoiceAnalyst = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("Lead Decision Agent");
  const [transcript, setTranscript] = useState([
    { sender: "analyst", text: "Hello! I am your AI Investment Research Analyst. Which company would you like to discuss today?" }
  ]);
  const [micActive, setMicActive] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Connect to Livekit
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await axios.get(`/livekit/token?room=investai-voice-room`);
      const { token, room, participantName, isDemo } = response.data;
      
      setRoomDetails({ room, participantName });
      setIsDemoMode(isDemo);
      
      // Simulate connection lag
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setMicActive(true);
        
        // Add connected welcome message
        setTranscript(prev => [
          ...prev,
          { sender: "system", text: `Connected to room: ${room} as ${participantName} (${isDemo ? "Demo Simulation Mode" : "Livekit Active Mode"})` },
          { sender: "analyst", text: `I am ready as the ${selectedAgent}. Speak or ask me anything about the stock market.` }
        ]);
      }, 1500);

    } catch (error) {
      console.error("Failed to connect to Livekit room:", error);
      setIsConnecting(false);
      setTranscript(prev => [
        ...prev,
        { sender: "system", text: "Error: Failed to obtain voice channel token from server." }
      ]);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setMicActive(false);
    setTranscript(prev => [
      ...prev,
      { sender: "system", text: "Disconnected from voice channel." }
    ]);
  };

  // Simulate speaking and receiving agent response
  const triggerSimulation = (userText, responseText) => {
    setTranscript(prev => [...prev, { sender: "user", text: userText }]);
    
    // Simulate thinking lag
    setTimeout(() => {
      setTranscript(prev => [...prev, { sender: "analyst", text: responseText }]);
    }, 1800);
  };

  const handleSimulationChoice = (choice) => {
    if (!isConnected) return;
    if (choice === "nvidia") {
      triggerSimulation(
        "Analyze NVIDIA's competitive position and data center metrics.",
        "NVIDIA currently holds over 90% share in AI data center accelerators. The Blackwell architecture is ramping rapidly. Given their CUDA software lock-in, I recommend a strong INVEST with a confidence score of 92%."
      );
    } else if (choice === "apple") {
      triggerSimulation(
        "Is Apple a buy right now?",
        "Apple has an incredible cash flow and services growth, but trades at over 30x P/E with low single-digit hardware revenue growth. Unless Apple Intelligence triggers a massive upgrade cycle, my call is a PASS."
      );
    } else if (choice === "tesla") {
      triggerSimulation(
        "What are the main risks for Tesla?",
        "Tesla's main risks are intensifying competition in China from low-cost EV makers like BYD, margin compression from automotive price cuts, and high execution premium on FSD and humanoid robotics."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-800">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Call Controls & Visualizer */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Voice Analyst Agent</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isConnected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {isConnected ? (isDemoMode ? "Livekit Demo Mode" : "Livekit Connected") : "Offline"}
            </span>
          </div>

          {/* Voice Waveform Animation Area */}
          <div className="flex-1 min-h-[300px] flex flex-col justify-center items-center bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden mb-6">
            {isConnected ? (
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Simulated Animated Pulse / Waveform */}
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-4 h-16 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-24 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-4 h-32 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-4 h-20 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-4 h-12 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">Connected with {selectedAgent}</p>
                  <p className="text-xs text-slate-400 mt-1">Speak now, or use the quick query options</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🎙️
                </div>
                <p className="text-sm font-semibold text-slate-600">Voice Analyst is Disconnected</p>
                <p className="text-xs text-slate-400 mt-1">Connect to dial-in to the Livekit voice room</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Active Analyst Agent</label>
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                disabled={isConnected}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option>Lead Decision Agent</option>
                <option>Company Research Agent</option>
                <option>Financial Analyst Agent</option>
                <option>Market Position Agent</option>
                <option>Risk Assessment Agent</option>
              </select>
            </div>

            <div className="flex gap-4">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Connecting Room...
                    </>
                  ) : (
                    <>
                      <span>📞</span> Dial in to Channel
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>🚫</span> Disconnect Call
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Transcript & Quick Commands */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[500px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Real-time Call Transcript</h3>

          {/* Transcript Scrollbox */}
          <div className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4 mb-4">
            {transcript.map((msg, index) => {
              if (msg.sender === "system") {
                return (
                  <div key={index} className="text-center">
                    <span className="inline-block bg-slate-200 text-slate-600 text-[11px] px-2.5 py-1 rounded-md font-mono">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                  }`}>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-1">
                      {isUser ? "You" : selectedAgent}
                    </p>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>

          {/* Quick Query Options */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Simulate Speaking (Voice Commands)</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={!isConnected}
                onClick={() => handleSimulationChoice("nvidia")}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 transition-colors"
              >
                Ask about Nvidia
              </button>
              <button
                disabled={!isConnected}
                onClick={() => handleSimulationChoice("apple")}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 transition-colors"
              >
                Ask about Apple
              </button>
              <button
                disabled={!isConnected}
                onClick={() => handleSimulationChoice("tesla")}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 transition-colors"
              >
                Ask about Tesla
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceAnalyst;

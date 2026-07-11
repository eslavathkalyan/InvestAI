import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon } from "lucide-react";

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi there! I am your InvestAI Assistant. 🤖 How can I help you navigate our platform today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const faqData = [
    {
      keywords: ["deposit", "wallet", "add money", "add funds", "razorpay"],
      reply: "💳 To deposit funds: Go to **'My Wallet'** in the navbar, select **'Deposit Funds'**, select or input the amount, and click **'Add Money'** to trigger our high-fidelity simulated Razorpay payment gateway checkout overlay.",
    },
    {
      keywords: ["invest", "buy", "purchase", "shares", "portfolio", "trading"],
      reply: "💰 To invest in a company: First, complete a stock query in **'AI Research'**. Once the report completes, click the **'Invest'** button in the header, input the number of shares, and confirm the purchase. The total cost will be deducted from your wallet balance and added to your portfolio.",
    },
    {
      keywords: ["research", "analysis", "gemini", "reports"],
      reply: "📈 To analyze a company: Go to **'AI Research'**, enter the company name or ticker symbol (e.g. Apple or AAPL), and click research. Our multi-agent AI pipeline will perform fundamental, market, and risk analysis using Gemini API.",
    },
    {
      keywords: ["withdraw", "bank", "account", "holder", "ifsc"],
      reply: "🏦 To withdraw money: Go to **'My Wallet'**, click the **'Withdraw Funds'** tab. Fill in your IFSC code & Account Number, click **'Verify'** to dynamically retrieve the account holder name, enter the amount, and withdraw.",
    },
    {
      keywords: ["contact", "instagram", "phone", "email", "support", "creator"],
      reply: "📞 To contact us: Head to the **'Contact Us'** tab in the navigation menu. There you will find clickable contact cards for our creator (Eslavath Kalyan) including Phone (+91 9701150526), Instagram (@kalyan._5), and Email.",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Process reply after delay
    setTimeout(() => {
      let matchedReply = "";
      const lowerText = textToSend.toLowerCase();

      for (const item of faqData) {
        if (item.keywords.some((kw) => lowerText.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = "🤖 I'm here to assist you with using InvestAI! Try asking about: \n- *'How to deposit money?'*\n- *'How to invest in stocks?'*\n- *'How to withdraw funds?'*\n- *'How to contact support?'*";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: matchedReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleQuickQuestion = (questionText) => {
    handleSendMessage(questionText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-paper border border-ink/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition duration-300">
          {/* Header */}
          <div className="bg-navy p-4 flex items-center justify-between text-white border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white/90">InvestAI Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/60">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-cream/15">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  msg.sender === "user" 
                    ? "bg-navy/10 border-navy/30 text-navy" 
                    : "bg-navy/10 border-navy/20 text-navy"
                }`}>
                  {msg.sender === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-navy text-white rounded-tr-none"
                    : "bg-paper text-ink border border-ink/5 rounded-tl-none whitespace-pre-line"
                }`}>
                  {msg.text}
                  <span className={`block text-[9px] mt-1 text-right ${
                    msg.sender === "user" ? "text-white/40" : "text-ink/40"
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-navy/10 border border-navy/20 flex items-center justify-center text-navy">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-paper border border-ink/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-xs">
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-4 py-2 bg-cream/10 border-t border-ink/5 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => handleQuickQuestion("How to deposit money?")}
              className="px-2.5 py-1 bg-paper hover:bg-navy/5 border border-ink/10 hover:border-navy rounded-full text-[10px] text-ink/80 transition whitespace-nowrap cursor-pointer"
            >
              💳 Deposit
            </button>
            <button
              onClick={() => handleQuickQuestion("How to buy stock?")}
              className="px-2.5 py-1 bg-paper hover:bg-navy/5 border border-ink/10 hover:border-navy rounded-full text-[10px] text-ink/80 transition whitespace-nowrap cursor-pointer"
            >
              💰 Invest
            </button>
            <button
              onClick={() => handleQuickQuestion("How to withdraw money?")}
              className="px-2.5 py-1 bg-paper hover:bg-navy/5 border border-ink/10 hover:border-navy rounded-full text-[10px] text-ink/80 transition whitespace-nowrap cursor-pointer"
            >
              🏦 Withdraw
            </button>
            <button
              onClick={() => handleQuickQuestion("How to contact support?")}
              className="px-2.5 py-1 bg-paper hover:bg-navy/5 border border-ink/10 hover:border-navy rounded-full text-[10px] text-ink/80 transition whitespace-nowrap cursor-pointer"
            >
              📞 Support
            </button>
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-paper border-t border-ink/5 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-cream/20 border border-ink/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-navy text-white hover:bg-navy/90 transition disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center hover:bg-navy/90 hover:scale-105 shadow-2xl transition cursor-pointer relative group"
      >
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-caution text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce shadow">
            1
          </span>
        )}
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default SupportChatbot;

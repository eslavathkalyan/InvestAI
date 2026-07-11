import { Phone, Instagram, Mail, MessageSquare, ExternalLink } from "lucide-react";

const Contact = () => {
  const contactDetails = [
    {
      title: "Direct Call",
      value: "+91 9701150526",
      desc: "Available for calls & urgent queries",
      action: "tel:9701150526",
      icon: <Phone className="w-6 h-6 text-gold" />,
      emoji: "📞",
      actionLabel: "Call Now",
    },
    {
      title: "Instagram",
      value: "@kalyan._5",
      desc: "Follow & connect on social feed",
      action: "https://www.instagram.com/kalyan._5/?hl=en",
      icon: <Instagram className="w-6 h-6 text-pink-500" />,
      emoji: "📸",
      actionLabel: "Follow Profile",
      external: true,
    },
    {
      title: "Official Email",
      value: "eslavathkalyannn@gmail.com",
      desc: "Send details & business proposals",
      action: "mailto:eslavathkalyannn@gmail.com",
      icon: <Mail className="w-6 h-6 text-blue-400" />,
      emoji: "✉️",
      actionLabel: "Send Email",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-gold text-xs font-bold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-3">
          Contact Us 💬
        </h1>
        <p className="text-ink/60 text-sm mt-3 leading-relaxed">
          Have any questions, feedback, or custom requests regarding InvestAI? Reach out directly using any of the channels below!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {contactDetails.map((item, idx) => (
          <a
            key={idx}
            href={item.action}
            target={item.external ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="group relative bg-paper border border-ink/5 hover:border-gold/30 rounded-2xl p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[220px]"
          >
            {}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/0 to-gold/3 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cream/40 rounded-xl group-hover:bg-gold/10 transition duration-300">
                  {item.icon}
                </div>
                <span className="text-2xl" role="img" aria-label={item.title}>
                  {item.emoji}
                </span>
              </div>
              <h3 className="font-display font-semibold text-ink text-base">
                {item.title}
              </h3>
              <p className="text-ink/40 text-xs mt-1 leading-snug">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between">
              <span className="font-mono text-xs text-ink/80 truncate max-w-[170px]">
                {item.value}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gold/80 transition duration-200">
                {item.actionLabel}
                {item.external && <ExternalLink className="w-3 h-3" />}
              </span>
            </div>
          </a>
        ))}
      </div>

      {}
      <div className="mt-12 bg-navy text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="text-center sm:text-left">
          <h4 className="font-display font-bold text-lg text-white">
            Need a Quick response? ⚡
          </h4>
          <p className="text-white/60 text-xs mt-1 leading-relaxed">
            Direct phone and Instagram messages are usually answered within an hour. We look forward to hearing from you!
          </p>
        </div>
        <a
          href="tel:9701150526"
          className="px-5 py-3 rounded-xl bg-gold hover:bg-gold/90 text-navy text-xs font-semibold uppercase tracking-wider transition shrink-0 cursor-pointer text-center"
        >
          Call Creator
        </a>
      </div>
    </div>
  );
};

export default Contact;

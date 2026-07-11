

const getStorageKey = (email) => {
  return email ? `investai_notifications_${email}` : 'investai_notifications_anonymous';
};

const getInitialNotifications = () => [
  {
    id: 1,
    category: "Platform",
    title: "Wallet Withdrawal Active 🏦",
    desc: "Link bank details and withdraw wallet money instantly via mock IMPS/NEFT transfers.",
    time: "Jul 11, 2026, 11:30 AM",
    isUnread: true,
  },
  {
    id: 2,
    category: "Stock Alert",
    title: "NVIDIA (NVDA) Gains 3.5% 📈",
    desc: "NVIDIA Corp shows positive day change score in Company Screener following tech rally.",
    time: "Jul 11, 2026, 08:30 AM",
    isUnread: true,
  },
  {
    id: 3,
    category: "Macro News",
    title: "RBI Interest Rate Decision 🏛️",
    desc: "Reserve Bank of India maintains standard repo rates. Yield curve updates reflected in Market Insights.",
    time: "Jul 10, 2026, 02:15 PM",
    isUnread: false,
  },
  {
    id: 4,
    category: "Investment Tip",
    title: "Microsoft (MSFT) Invest Rating 💡",
    desc: "AI research consensus flags MSFT with high confidence percentage in technology sector portfolio.",
    time: "Jul 9, 2026, 10:45 AM",
    isUnread: false,
  },
];

export const getNotifications = (email) => {
  const key = getStorageKey(email);
  const data = localStorage.getItem(key);
  if (!data) {
    const initial = getInitialNotifications();
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return getInitialNotifications();
  }
};

export const addNotification = (email, category, title, desc) => {
  const key = getStorageKey(email);
  const list = getNotifications(email);
  
  const formattedTime = new Date().toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const newNotif = {
    id: Date.now(),
    category,
    title,
    desc,
    time: formattedTime,
    isUnread: true
  };

  const updated = [newNotif, ...list].slice(0, 30); 
  localStorage.setItem(key, JSON.stringify(updated));

  window.dispatchEvent(new Event("investai-notifications-update"));
};

export const clearNotifications = (email) => {
  const key = getStorageKey(email);
  localStorage.setItem(key, JSON.stringify([]));
  window.dispatchEvent(new Event("investai-notifications-update"));
};

export const markNotificationsRead = (email) => {
  const key = getStorageKey(email);
  const list = getNotifications(email);
  const updated = list.map(n => ({ ...n, isUnread: false }));
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new Event("investai-notifications-update"));
};

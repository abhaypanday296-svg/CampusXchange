import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../api/apiClient";

const ChatWindow = ({ messages, currentUser, otherParticipant, activeChat, updateActiveChat, onlineUsers = [] }) => {
  const scrollRef = useRef();
  const [localQty, setLocalQty] = useState(1);
  const [qtyInput, setQtyInput] = useState(1);
  const [showQtyPanel, setShowQtyPanel] = useState(false);
  const [selling, setSelling] = useState(false);

  const product = activeChat?.productId;
  const isSeller = product?.seller?.toString() === currentUser?._id?.toString();
  const isOtherOnline = onlineUsers.includes(otherParticipant?._id?.toString());
  const maxQty = product?.quantity || 1;

  // Sync localQty with chat's saved quantity
  useEffect(() => {
    const q = activeChat?.quantity || 1;
    setLocalQty(q);
    setQtyInput(q);
  }, [activeChat?._id, activeChat?.quantity]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
        <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 rotate-12">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>Your Hub</h3>
        <p className="max-w-xs text-sm font-medium opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>
          Pick a chat and start dealing. Campus marketplace at your fingertips.
        </p>
      </div>
    );
  }

  // ✅ FIX: Seller apna naya route use karta hai — req.user.id = sellerId
  const handleMarkAsSold = async () => {
    if (!product?.inStock || !product?.title) return;
    if (!window.confirm(`${otherParticipant.username} ko ${localQty} item(s) sell karna chahte ho?`)) return;

    setSelling(true);
    try {
      const response = await apiClient.post("/orders/mark-as-sold", {
        productId: product._id,
        buyerId: otherParticipant._id,   // chat mein jo dusra user hai
        quantity: localQty,
      });

      toast.success("Sale recorded! Dashboard update ho gaya.");

      if (updateActiveChat) {
        const { quantity: newQty, inStock } = response.data.updatedProduct;
        updateActiveChat({
          ...activeChat,
          productId: { ...product, quantity: newQty, inStock },
        });
      }
      setShowQtyPanel(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Sale record karne mein error");
    } finally {
      setSelling(false);
    }
  };

  // Quantity save to backend
  const handleSaveQty = async () => {
    const val = parseInt(qtyInput);
    if (isNaN(val) || val < 1 || val > maxQty) {
      toast.error(`Quantity 1 se ${maxQty} ke beech honi chahiye`);
      return;
    }
    try {
      const response = await apiClient.patch(`/chat/update-quantity/${activeChat._id}`, { quantity: val });
      setLocalQty(val);
      if (updateActiveChat) updateActiveChat(response.data);
      toast.success(`Quantity ${val} set ho gayi`);
      setShowQtyPanel(false);
    } catch {
      toast.error("Quantity update nahi hui");
    }
  };

  // Buyer quantity change (inline)
  const handleBuyerQtyChange = async (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) return;
    try {
      const response = await apiClient.patch(`/chat/update-quantity/${activeChat._id}`, { quantity: val });
      if (updateActiveChat) updateActiveChat(response.data);
      toast.info(`Quantity ${val} set ki`);
    } catch {
      toast.error("Quantity update nahi hui");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-10"
        style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-paper)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black uppercase shadow-lg shadow-blue-500/20">
            {otherParticipant?.username?.charAt(0)}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-sm" style={{ color: "var(--mui-palette-text-primary)" }}>
              {otherParticipant?.username}
            </h3>
            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isOtherOnline ? "text-green-500" : "text-gray-400"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOtherOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {isOtherOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Product Context Card */}
      {product ? (
        <div className="px-6 py-3 border-b transition-all"
          style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-paper)" }}>
          <div className="p-3 rounded-2xl border flex items-center gap-4 bg-gray-500/5"
            style={{ borderColor: "var(--mui-palette-divider)" }}>

            {/* Product Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-blue-600/10 flex items-center justify-center">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-blue-600 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-xs uppercase truncate tracking-tight" style={{ color: "var(--mui-palette-text-primary)" }}>
                {product.title}
              </h4>
              <p className="text-blue-600 font-black text-xs mt-0.5">₹{product.price?.toLocaleString()}</p>
              <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "var(--mui-palette-text-secondary)" }}>
                Stock: <span className={product.quantity > 0 ? "text-green-500" : "text-red-500"}>{product.quantity ?? "?"}</span>
              </p>
            </div>

            {/* Action Area */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {isSeller ? (
                // ─── SELLER VIEW ───
                <div className="flex items-center gap-2">
                  
                  {/* Quantity Manager Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowQtyPanel(!showQtyPanel)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all border border-blue-500/20"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Qty: {localQty}
                    </button>

                    {/* Qty Panel Dropdown */}
                    {showQtyPanel && (
                      <div className="absolute right-0 top-10 z-50 w-52 rounded-2xl border shadow-2xl p-4 space-y-3"
                        style={{ backgroundColor: "var(--mui-palette-background-paper)", borderColor: "var(--mui-palette-divider)" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Sell Quantity Set Karo</p>
                        
                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQtyInput(q => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 flex items-center justify-center font-black text-sm transition-all"
                          >−</button>
                          <input
                            type="number"
                            min="1"
                            max={maxQty}
                            value={qtyInput}
                            onChange={e => setQtyInput(parseInt(e.target.value) || 1)}
                            className="flex-1 text-center px-2 py-1.5 rounded-lg border text-sm font-black outline-none focus:border-blue-500 transition-colors"
                            style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-default)", color: "var(--mui-palette-text-primary)" }}
                          />
                          <button
                            onClick={() => setQtyInput(q => Math.min(maxQty, q + 1))}
                            className="w-8 h-8 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 flex items-center justify-center font-black text-sm transition-all"
                          >+</button>
                        </div>
                        <p className="text-[9px] opacity-40 text-center">Max available: {maxQty}</p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowQtyPanel(false)}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase bg-gray-500/10 hover:bg-gray-500/20 transition-all"
                          >Cancel</button>
                          <button
                            onClick={handleSaveQty}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all"
                          >Save</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mark as Sold Button */}
                  <button
                    onClick={handleMarkAsSold}
                    disabled={!product.inStock || !product.title || selling}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      product.inStock && product.title && !selling
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 cursor-pointer"
                        : "bg-gray-500/20 text-gray-500 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {selling ? "Processing..." : product.inStock ? "Mark as Sold" : "Sold Out"}
                  </button>
                </div>

              ) : (
                // ─── BUYER VIEW ───
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    defaultValue={activeChat?.quantity || 1}
                    onChange={handleBuyerQtyChange}
                    className="w-16 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs font-black text-blue-600 text-center outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg, index) => {
          const senderId = msg.sender?._id || msg.sender;
          const isOwn = senderId?.toString() === currentUser?._id?.toString();

          if (msg.messageType === "product" && msg.productId) {
            const p = msg.productId;
            return (
              <div key={msg._id || index} className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-700">
                <div className="bg-blue-600/5 px-6 py-2 rounded-full mb-6 border border-blue-600/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-60">Topic: Item Inquiry</span>
                </div>
                <div className="w-full max-w-sm rounded-[2rem] border p-4 flex items-center gap-5 bg-gray-500/5 hover:bg-gray-500/10 transition-all shadow-xl group/card"
                  style={{ borderColor: "var(--mui-palette-divider)" }}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-500/10 flex-shrink-0 shadow-lg group-hover/card:scale-105 transition-transform">
                    <img src={p.images?.[0]?.url || "https://via.placeholder.com/100?text=Item"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h5 className="font-black text-sm uppercase truncate mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>{p.title}</h5>
                    <p className="text-blue-600 font-black text-xs">₹{p.price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg._id || index} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%]`}>
                <div
                  className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${
                    isOwn ? "bg-blue-600 text-white rounded-tr-none" : "rounded-tl-none border"
                  }`}
                  style={!isOwn ? {
                    borderColor: "var(--mui-palette-divider)",
                    backgroundColor: "var(--mui-palette-background-paper)",
                    color: "var(--mui-palette-text-primary)"
                  } : {}}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] mt-1.5 font-black uppercase opacity-30 tracking-widest px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatWindow;

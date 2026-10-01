import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";

// ─────────────────────────────────────────────
//  PRODUCT DETAIL MODAL
// ─────────────────────────────────────────────
const ProductDetailModal = ({ product, onClose, isWishlisted, onToggleWishlist, onMessage }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImg(0);
    setQuantity(1);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [product?._id]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Escape key close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!product) return null;

  const images = product.images?.length ? product.images : [{ url: "https://via.placeholder.com/600x400?text=No+Image" }];
  const maxQty = product.quantity || 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col"
        style={{ backgroundColor: "var(--mui-palette-background-paper)", color: "var(--mui-palette-text-primary)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          style={{ backgroundColor: "var(--mui-palette-background-default)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row gap-0 min-h-0">

          {/* ── LEFT: Image Gallery ── */}
          <div className="lg:w-[52%] flex-shrink-0 p-6 flex flex-col gap-4">

            {/* Main big image */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100"
              style={{ aspectRatio: "4/3" }}>
              <img
                src={images[activeImg]?.url}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-500"
                style={{ transform: "scale(1)" }}
              />
              {/* Category badge */}
              <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                {product.category}
              </span>
              {/* Stock badge */}
              <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                product.quantity > 0
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}>
                {product.quantity > 0 ? `Stock: ${product.quantity}` : "Out of Stock"}
              </span>
              {/* Navigation arrows for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border-2 ${
                      activeImg === i
                        ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Details ── */}
          <div className="lg:w-[48%] p-6 lg:p-8 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: "var(--mui-palette-divider)" }}>

            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-2xl font-black tracking-tight leading-tight" style={{ color: "var(--mui-palette-text-primary)" }}>
                  {product.title}
                </h2>
                {product.quantity > 0 && (
                  <span className="flex-shrink-0 text-[9px] px-2 py-1 bg-blue-500 text-white rounded-lg font-black uppercase tracking-wider mt-1">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* College & Verified */}
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider opacity-60 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {product.college?.collegeName || "Campus"}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="flex items-center gap-1 text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Verified
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600 tracking-tighter">
                  ₹{product.price?.toLocaleString()}
                </span>
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">per unit</span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm leading-relaxed opacity-80" style={{ color: "var(--mui-palette-text-secondary)" }}>
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Select Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                  style={{ backgroundColor: "var(--mui-palette-background-default)" }}
                >−</button>
                <span className="w-14 h-10 rounded-xl flex items-center justify-center font-black text-lg border"
                  style={{ borderColor: "var(--mui-palette-divider)" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                  style={{ backgroundColor: "var(--mui-palette-background-default)" }}
                >+</button>
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Max: {maxQty}</span>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller?.username && (
              <div className="flex items-center gap-3 p-3 rounded-2xl border"
                style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-default)" }}>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-sm">
                  {product.seller.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Seller</p>
                  <p className="text-sm font-bold">{product.seller.username}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto pt-2">
              <button
                onClick={() => { onToggleWishlist(product._id); }}
                className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-200"
                    : "text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border-transparent"
                }`}
                style={!isWishlisted ? { backgroundColor: "var(--mui-palette-background-default)", borderColor: "var(--mui-palette-divider)" } : {}}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>

              <button
                onClick={() => onMessage(product._id, product.seller?._id || product.seller, quantity)}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message Seller
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN PRODUCTS PAGE
// ─────────────────────────────────────────────
const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ["All", "Electronics", "Books", "Clothing", "Furniture", "Stationery", "Sports", "Other"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, wishlistRes] = await Promise.all([
        apiClient.get("/products/get-all"),
        apiClient.get("/wishlist/ids").catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(productsRes.data.data || []);
      setWishlistedIds(wishlistRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMessageClick = (productId, sellerId, qty = 1) => {
    if (!sellerId) { toast.error("Seller information not available"); return; }
    setSelectedProduct(null);
    navigate(`/chats?sellerId=${sellerId}&productId=${productId}`);
  };

  const toggleWishlist = async (productId) => {
    try {
      const response = await apiClient.post("/wishlist/toggle", { productId });
      if (response.data.isWishlisted) {
        setWishlistedIds(prev => [...prev, productId]);
        toast.success("Added to wishlist");
      } else {
        setWishlistedIds(prev => prev.filter(id => id !== productId));
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      if (error.response?.status === 401) toast.warning("Please sign in to save items");
      else toast.error("Wishlist action failed");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const themedStyle = { color: "var(--mui-palette-text-primary)", backgroundColor: "var(--mui-palette-background-default)" };
  const secondaryTextStyle = { color: "var(--mui-palette-text-secondary)" };

  return (
    <div className="min-h-screen p-4 md:p-8" style={themedStyle}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">
            Campus <span className="text-blue-600">Marketplace</span>
          </h1>
          <p className="text-lg opacity-70 max-w-2xl mx-auto" style={secondaryTextStyle}>
            Discover pre-loved essentials from your fellow students. Quality gear, student prices.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-4 rounded-2xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              style={{ borderColor: "var(--mui-palette-divider)" }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold uppercase tracking-widest text-blue-500">Curating the best deals...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed rounded-3xl opacity-50"
            style={{ borderColor: "var(--mui-palette-divider)" }}>
            <h3 className="text-2xl font-bold mb-2">No items found</h3>
            <p>Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col sm:flex-row h-auto sm:h-48 rounded-2xl overflow-hidden border transition-all duration-300 hover:border-blue-500/50"
                style={{ backgroundColor: "var(--mui-palette-background-paper)", borderColor: "var(--mui-palette-divider)" }}
              >
                {/* Image */}
                <div className="relative w-full sm:w-64 h-48 sm:h-full flex-shrink-0 overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-widest border border-white/10 shadow-lg">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold tracking-tight truncate" style={{ color: "var(--mui-palette-text-primary)" }}>
                          {product.title}
                        </h3>
                        {product.quantity > 0 && (
                          <span className="flex-shrink-0 text-[8px] px-1.5 py-0.5 bg-blue-500 text-white rounded font-black uppercase tracking-tighter">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold mb-2 opacity-60">
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {product.college?.collegeName || "Campus"}
                        </span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                        <span className="flex-shrink-0">Stock: {product.quantity}</span>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2 opacity-75" style={secondaryTextStyle}>
                        {product.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-start flex-shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-blue-500">₹</span>
                        <span className="text-2xl font-black text-blue-600 tracking-tighter">{product.price.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Buy Now</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t"
                    style={{ borderColor: "var(--mui-palette-divider)" }}>

                    {/* Campus Verified badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: "rgba(34,197,94,0.10)" }}>
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.607.27 1.176.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Campus Verified</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Wishlist — proper heart, dark/light dono me sahi */}
                      <button
                        onClick={() => toggleWishlist(product._id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border"
                        style={{
                          backgroundColor: wishlistedIds.includes(product._id) ? "rgba(239,68,68,0.12)" : "var(--mui-palette-background-default)",
                          borderColor: wishlistedIds.includes(product._id) ? "rgba(239,68,68,0.3)" : "var(--mui-palette-divider)",
                          color: wishlistedIds.includes(product._id) ? "#ef4444" : "var(--mui-palette-text-secondary)"
                        }}
                        title={wishlistedIds.includes(product._id) ? "Wishlist se hatao" : "Wishlist mein add karo"}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"
                          fill={wishlistedIds.includes(product._id) ? "currentColor" : "none"}
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>

                      {/* ── NEW: Product Details Button ── */}
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border hover:border-blue-500/50 hover:text-blue-600"
                        style={{
                          backgroundColor: "var(--mui-palette-background-default)",
                          borderColor: "var(--mui-palette-divider)",
                          color: "var(--mui-palette-text-secondary)"
                        }}
                        title="View Product Details"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </button>

                      {/* Message */}
                      <button
                        onClick={() => handleMessageClick(product._id, product.seller)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isWishlisted={wishlistedIds.includes(selectedProduct._id)}
          onToggleWishlist={toggleWishlist}
          onMessage={handleMessageClick}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Products;

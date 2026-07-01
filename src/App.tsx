import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  UtensilsCrossed, 
  MessageCircle, 
  ChefHat, 
  History, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Send,
  Mic,
  Volume2
} from 'lucide-react';
import { MENU_ITEMS, MenuItem, FOOD_QUOTES } from './data/menu';
import { cn } from './utils/cn';
import QRCode from 'react-qr-code';
import { io, Socket } from 'socket.io-client';
import { getAIWaiterResponse } from './services/geminiService';
import Markdown from 'react-markdown';

// Types
interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  table_number: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'Pending' | 'Verified' | 'Preparing' | 'Ready' | 'Completed';
  payment_status: 'Pending' | 'Verified';
  created_at: string;
}

type View = 'customer' | 'kitchen' | 'history';

// Components
const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-lg animate-pulse" />
      <svg viewBox="0 0 100 100" className="w-full h-full text-brand-orange fill-current drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
        {/* Angel Wings */}
        <path d="M30,40 C10,40 5,60 30,80 C15,70 10,50 30,45 Z" />
        <path d="M70,40 C90,40 95,60 70,80 C85,70 90,50 70,45 Z" />
        {/* Spoon and Fork */}
        <path d="M45,30 L45,70 M42,30 L48,30 M42,35 L48,35" stroke="currentColor" strokeWidth="3" />
        <circle cx="55" cy="40" r="8" />
        <path d="M55,48 L55,70" stroke="currentColor" strokeWidth="3" />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-black tracking-tighter text-white leading-none">ANGEL'S</span>
      <span className="text-xs font-bold tracking-[0.2em] text-brand-gold leading-none">KITCHEN</span>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quote, setQuote] = useState('');
  const [tableNumber, setTableNumber] = useState(() => Math.floor(Math.random() * 20 + 1).toString());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isKitchenAuthenticated, setIsKitchenAuthenticated] = useState(false);
  const [kitchenPassword, setKitchenPassword] = useState('');
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tempTableNumber, setTempTableNumber] = useState(tableNumber);
  const [mobileURL, setMobileURL] = useState<string>('');
  const [showMobileQR, setShowMobileQR] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    // Initialize audio
    bellAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => clearInterval(timer);
  }, []);

  // Initialize Socket.IO connection once on mount
  useEffect(() => {
    // Fetch mobile URL
    const fetchServerInfo = async () => {
      try {
        const res = await fetch('/api/server-info');
        const data = await res.json();
        setMobileURL(data.mobileURL);
      } catch (err) {
        console.error('Failed to fetch server info:', err);
        setMobileURL('');
      }
    };
    
    fetchServerInfo();
    
    // Connect to Socket.IO with logging
    socketRef.current = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✓ Socket.IO connected:', socketRef.current?.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('✗ Socket.IO connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('✗ Socket.IO disconnected:', reason);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []); // Only run on mount

  // Update Socket.IO event listeners when view or orders change
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.off('order:new');
    socketRef.current.on('order:new', (newOrder: Order) => {
      console.log('📦 New order received:', newOrder);
      setOrders(prev => [newOrder, ...prev]);
      // Play sound if in kitchen view
      if (view === 'kitchen') {
        bellAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));
      }
    });

    socketRef.current.off('order:update');
    socketRef.current.on('order:update', (updatedOrder: Order) => {
      console.log('🔄 Order updated:', updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });
  }, [view]); // Update when view changes

  // Fetch orders and set quote
  useEffect(() => {
    setQuote(FOOD_QUOTES[Math.floor(Math.random() * FOOD_QUOTES.length)]);
    fetchOrders();
  }, [view]);

  const handleKitchenLogin = () => {
    if (kitchenPassword === 'Veeramani') {
      setIsKitchenAuthenticated(true);
      setKitchenPassword('');
    } else {
      alert('Incorrect Password');
    }
  };

  const handleTableUpdate = () => {
    if (tempTableNumber.trim()) {
      setTableNumber(tempTableNumber);
      setIsEditingTable(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesVeg = !isVegOnly || item.isVeg;
      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [searchQuery, selectedCategory, isVegOnly]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = subtotal * 0.05; // 5% GST
    return { subtotal, gst, total: subtotal + gst };
  }, [cart]);

  const placeOrder = async () => {
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      table_number: tableNumber,
      items: cart,
      ...cartTotals,
      status: 'Pending',
      payment_status: 'Pending',
      created_at: new Date().toISOString()
    };

    try {
      console.log('📤 Placing order:', newOrder);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        console.log('✓ Order placed successfully');
        setCurrentOrder(newOrder);
        setIsPaymentModalOpen(true);
        setCart([]);
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error('Failed to place order', err);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!currentOrder) return;
    try {
      await fetch(`/api/orders/${currentOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'Pending', status: 'Pending' })
      });
      setIsPaymentModalOpen(false);
      setCurrentOrder(null);
      alert("Payment submitted for verification. Your order is being sent to the kitchen!");
    } catch (err) {
      console.error('Payment update failed', err);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status'], paymentStatus?: Order['payment_status']) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus })
      });
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await getAIWaiterResponse(msg, history);
      setChatMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      console.error('AI Error', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-stone-200 font-sans selection:bg-brand-orange/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              {[
                { id: 'customer', label: 'Order Now', icon: UtensilsCrossed },
                { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
                { id: 'history', label: 'History', icon: History }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as View)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl",
                    view === item.id 
                      ? "bg-brand-orange text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                      : "text-stone-400 hover:text-brand-gold hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Table</span>
              {isEditingTable ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={tempTableNumber}
                    onChange={(e) => setTempTableNumber(e.target.value)}
                    className="w-12 bg-dark-bg border border-brand-orange/30 rounded px-1 text-white text-sm focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate()}
                  />
                  <button onClick={handleTableUpdate} className="text-brand-gold hover:text-white"><CheckCircle2 size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-brand-gold">#{tableNumber}</span>
                  <button onClick={() => setIsEditingTable(true)} className="text-stone-500 hover:text-brand-orange transition-colors">
                    <Plus size={14} className="rotate-45" />
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-white/5 hover:bg-white/10 border border-dark-border rounded-2xl transition-all group"
            >
              <ShoppingCart className="w-6 h-6 text-brand-orange group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-dark-bg text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            {mobileURL && view === 'customer' && (
              <button 
                onClick={() => setShowMobileQR(!showMobileQR)}
                className="p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-2xl transition-all group"
                title="Show QR code for mobile access"
              >
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile QR Modal */}
      <AnimatePresence>
        {showMobileQR && mobileURL && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileQR(false)}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-bg border-2 border-brand-orange rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Access on Mobile</h3>
                  <p className="text-stone-400 text-sm">Scan this QR code to order on your phone</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl inline-block shadow-lg">
                  <QRCode 
                    value={mobileURL}
                    size={200}
                    fgColor="#0c0a09"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-stone-400 text-sm">Or visit:</p>
                  <a 
                    href={mobileURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-gold font-bold hover:text-brand-orange transition-colors break-all"
                  >
                    {mobileURL}
                  </a>
                </div>

                <button 
                  onClick={() => setShowMobileQR(false)}
                  className="w-full px-6 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'customer' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <section className="relative h-[500px] rounded-[2rem] overflow-hidden group shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80" 
                alt="Angel's Kitchen Hero" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-brand-orange/20 backdrop-blur-md border border-brand-orange/30 self-start px-4 py-1 rounded-full mb-6"
                >
                  <span className="text-brand-gold text-sm font-bold tracking-widest uppercase italic">"{quote}"</span>
                </motion.div>
                <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-4">
                  ANGEL'S <br />
                  <span className="text-brand-orange">KITCHEN.</span>
                </h2>
                <p className="text-stone-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                  Experience the divine fusion of traditional flavors and modern smart dining.
                </p>
              </div>
            </section>

            {/* Search & Filters */}
            <section className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-24 z-30 bg-dark-bg/80 backdrop-blur-xl py-6 border-y border-dark-border">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-grow">
                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-brand-orange transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search for your favorite dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all shadow-inner text-white placeholder:text-stone-600"
                  />
                </div>
                <button
                  onClick={() => setIsVegOnly(!isVegOnly)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg border",
                    isVegOnly 
                      ? "bg-green-500/10 border-green-500/50 text-green-400" 
                      : "bg-white/5 border-dark-border text-stone-400 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 border-2 flex items-center justify-center rounded-md transition-colors",
                    isVegOnly ? "border-green-500 bg-green-500" : "border-stone-600"
                  )}>
                    {isVegOnly && <div className="w-2 h-2 rounded-full bg-dark-bg" />}
                  </div>
                  Veg Only
                </button>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border",
                      selectedCategory === cat 
                        ? "bg-brand-gold text-dark-bg border-brand-gold shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
                        : "bg-white/5 border-dark-border text-stone-400 hover:border-stone-600 hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* Menu Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMenu.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-dark-card border border-dark-border rounded-[2rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-brand-orange/30 transition-all flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 bg-dark-bg/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-brand-gold font-black text-sm">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-4 h-4 border-2 flex items-center justify-center rounded-sm",
                            item.isVeg ? "border-green-500" : "border-red-500"
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              item.isVeg ? "bg-green-500" : "bg-red-500"
                            )} />
                          </div>
                          {item.price > 250 && (
                            <span className="text-[10px] font-black bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-md uppercase tracking-widest border border-brand-gold/20">Bestseller</span>
                          )}
                        </div>
                        <h3 className="font-bold text-xl text-white group-hover:text-brand-orange transition-colors">{item.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-6 flex-grow leading-relaxed">{item.description}</p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-4 bg-white/5 hover:bg-brand-orange text-white font-bold rounded-2xl border border-dark-border hover:border-brand-orange transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
                    >
                      <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </section>
          </motion.div>
        )}

        {view === 'kitchen' && (
          <div className="space-y-12">
            {!isKitchenAuthenticated ? (
              <div className="max-w-md mx-auto py-20">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-card p-10 rounded-[3rem] border-2 border-dark-border shadow-2xl text-center space-y-8"
                >
                  <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-3xl flex items-center justify-center mx-auto border border-brand-orange/20">
                    <ChefHat size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Kitchen Login</h2>
                    <p className="text-stone-500 font-bold mt-2">Authorized Personnel Only</p>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Enter Password"
                      value={kitchenPassword}
                      onChange={(e) => setKitchenPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleKitchenLogin()}
                      className="w-full px-6 py-4 bg-white/5 border border-dark-border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-center tracking-[0.5em]"
                    />
                    <button 
                      onClick={handleKitchenLogin}
                      className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange/80 transition-all shadow-lg shadow-brand-orange/20"
                    >
                      Access Dashboard
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Logo className="scale-125 origin-left" />
                    <div className="h-12 w-px bg-dark-border mx-4 hidden md:block" />
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter">KITCHEN DASHBOARD</h2>
                      <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Live Order Management System</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <button 
                      onClick={() => setIsKitchenAuthenticated(false)}
                      className="px-4 py-2 text-stone-500 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      Logout
                    </button>
                    <div className="px-6 py-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 flex items-center gap-3 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="font-black text-lg">{orders.filter(o => o.status === 'Pending').length} PENDING</span>
                    </div>
                    <div className="px-6 py-3 bg-brand-orange/10 text-brand-orange rounded-2xl border border-brand-orange/20 flex items-center gap-3 shadow-lg">
                      <ChefHat size={20} />
                      <span className="font-black text-lg">{orders.filter(o => o.status === 'Preparing').length} PREPARING</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {orders.filter(o => o.status !== 'Completed').map(order => {
                    const orderDate = new Date(order.created_at);
                    const diffMinutes = Math.floor((currentTime.getTime() - orderDate.getTime()) / 60000);
                    
                    return (
                      <motion.div 
                        layout
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-card border-2 border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
                      >
                        <div className={cn(
                          "p-6 flex justify-between items-center border-b border-dark-border",
                          order.status === 'Pending' ? "bg-red-500/5" :
                          order.status === 'Verified' ? "bg-brand-orange/5" :
                          order.status === 'Preparing' ? "bg-brand-gold/5" :
                          order.status === 'Ready' ? "bg-green-500/5" : "bg-stone-500/5"
                        )}>
                          <div>
                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] block mb-1">Order ID</span>
                            <span className="text-xl font-black text-white tracking-tighter">#{order.id.slice(-6)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] block mb-1">Table</span>
                            <span className="text-2xl font-black text-brand-orange">#{order.table_number}</span>
                          </div>
                        </div>

                        <div className="p-6 flex-grow space-y-4">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                            <span>Items</span>
                            <div className="flex items-center gap-1 text-brand-gold">
                              <Clock size={12} />
                              <span>{diffMinutes}m ago</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 flex items-center justify-center bg-brand-orange text-white text-xs font-black rounded-lg">{item.quantity}x</span>
                                  <span className="font-bold text-stone-200">{item.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-dark-bg/50 border-t border-dark-border space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Payment</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              order.payment_status === 'Verified' 
                                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                            )}>
                              {order.payment_status === 'Verified' ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {order.payment_status === 'Pending' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, order.status, 'Verified')}
                                className="col-span-2 py-3 bg-brand-orange text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-orange/80 transition-all shadow-lg shadow-brand-orange/20"
                              >
                                Verify Payment
                              </button>
                            )}
                            {order.status === 'Pending' && order.payment_status === 'Verified' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'Preparing')}
                                className="col-span-2 py-3 bg-brand-gold text-dark-bg font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-gold/80 transition-all shadow-lg shadow-brand-gold/20"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'Preparing' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'Ready')}
                                className="col-span-2 py-3 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-500/80 transition-all shadow-lg shadow-green-500/20"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.status === 'Ready' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'Completed')}
                                className="col-span-2 py-3 bg-stone-700 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-stone-600 transition-all"
                              >
                                Complete Order
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {orders.filter(o => o.status !== 'Completed').length === 0 && (
                    <div className="col-span-full py-20 text-center bg-dark-card rounded-[3rem] border border-dark-border">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-700">
                        <ChefHat size={48} />
                      </div>
                      <h3 className="text-2xl font-black text-stone-500 uppercase tracking-widest">No active orders</h3>
                      <p className="text-stone-600 font-bold">Kitchen is all clear!</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <Logo className="scale-125 origin-left" />
              <div className="h-12 w-px bg-dark-border mx-4 hidden md:block" />
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Order History</h2>
                <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Past Transactions & Records</p>
              </div>
            </div>
            <div className="bg-dark-card rounded-[3rem] border-2 border-dark-border overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-dark-border">
                    <tr>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-500">Order ID</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-500">Items</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-500">Total</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-500">Status</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-stone-500">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 font-black text-white group-hover:text-brand-orange transition-colors">#{order.id.slice(-6)}</td>
                        <td className="px-8 py-6 text-sm text-stone-400 font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="px-8 py-6 font-black text-brand-gold">₹{order.total.toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            order.status === 'Completed' 
                              ? "bg-green-500/10 text-green-400 border-green-500/20" 
                              : "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-stone-500 font-bold">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && (
                <div className="py-32 text-center">
                  <History size={64} className="mx-auto text-stone-800 mb-6" />
                  <p className="text-stone-500 font-black uppercase tracking-widest">No order records found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-card z-50 shadow-2xl flex flex-col border-l border-dark-border"
            >
              <div className="p-8 border-b border-dark-border flex items-center justify-between bg-dark-bg/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange border border-brand-orange/20">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">YOUR CART</h2>
                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Divine Selection</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-stone-500 hover:text-white border border-transparent hover:border-dark-border">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-stone-800 border border-dark-border">
                      <ShoppingCart size={64} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-stone-400 uppercase tracking-widest">Cart is empty</h3>
                      <p className="text-stone-600 font-bold mt-2">Add some divine flavors to get started!</p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-8 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-orange/80 transition-all shadow-lg shadow-brand-orange/20"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-[1.5rem] overflow-hidden border border-dark-border group-hover:border-brand-orange/30 transition-colors">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow py-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-white tracking-tight text-lg leading-tight group-hover:text-brand-orange transition-colors">{item.name}</h4>
                          <span className="font-black text-brand-gold">₹{item.price * item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-orange transition-colors"><Minus size={14} /></button>
                            <span className="w-8 text-center font-black text-sm text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-orange transition-colors"><Plus size={14} /></button>
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.id, -item.quantity)}
                            className="text-[10px] font-black text-stone-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-dark-bg/80 backdrop-blur-xl border-t border-dark-border space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                      <span>Subtotal</span>
                      <span className="text-stone-300">₹{cartTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-500">
                      <span>GST (5%)</span>
                      <span className="text-stone-300">₹{cartTotals.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-white pt-4 border-t border-dark-border tracking-tighter">
                      <span>TOTAL</span>
                      <span className="text-brand-orange">₹{cartTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={placeOrder}
                    className="w-full py-5 bg-brand-orange text-white rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:bg-brand-orange/80 transition-all active:scale-95 shadow-2xl shadow-brand-orange/30"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && currentOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-dark-card w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-dark-border"
            >
              <div className="p-10 text-center space-y-8">
                <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-3xl flex items-center justify-center mx-auto border border-brand-orange/20 shadow-inner">
                  <CreditCard size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Scan to Pay</h3>
                  <p className="text-stone-500 font-bold mt-2">Divine flavors are just a scan away</p>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] inline-block shadow-[0_0_40px_rgba(249,115,22,0.1)] border-8 border-dark-bg">
                  <QRCode 
                    value={`upi://pay?pa=angelskitchen@upi&pn=Angels%20Kitchen&am=${currentOrder.total}&cu=INR`} 
                    size={220}
                    fgColor="#0c0a09"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-5xl font-black text-brand-gold tracking-tighter">₹{currentOrder.total.toFixed(2)}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Amount Payable</div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handlePaymentConfirm}
                    className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-brand-orange/80 transition-all shadow-xl shadow-brand-orange/20 active:scale-95"
                  >
                    I Have Paid
                  </button>
                  <button 
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="text-stone-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
                  >
                    Pay Later / Cancel
                  </button>
                </div>
              </div>
              <div className="bg-dark-bg/50 p-6 text-center border-t border-dark-border">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-600 italic">Secure Payment Powered by Angel's Kitchen</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Waiter Chat */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="w-[380px] h-[600px] bg-dark-card rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-dark-border flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange border border-brand-orange/20">
                      <ChefHat size={24} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-dark-card rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-black text-white tracking-tight">ANGEL</h4>
                    <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Divine AI Waiter</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-dark-bg/30 no-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-white/5 text-brand-orange rounded-full flex items-center justify-center mx-auto border border-dark-border">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-stone-400 font-bold px-8 leading-relaxed">Greetings! I'm Angel, your divine AI waiter. How may I assist your dining experience today?</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-brand-orange text-white rounded-tr-none shadow-lg shadow-brand-orange/10" 
                        : "bg-white/5 border border-dark-border text-stone-200 rounded-tl-none"
                    )}>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-dark-border p-4 rounded-3xl rounded-tl-none flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-dark-border bg-dark-bg/50 backdrop-blur-xl">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Ask Angel anything..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow px-6 py-4 bg-white/5 border border-dark-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-white placeholder:text-stone-600"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isTyping}
                    className="p-4 bg-brand-orange text-white rounded-2xl disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-brand-orange/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-20 h-20 bg-brand-orange text-white rounded-[2rem] shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 group border-4 border-dark-bg"
        >
          {isChatOpen ? <X size={32} /> : <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-dark-card text-stone-500 py-20 mt-32 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <Logo className="mb-8 scale-110 origin-left" />
            <p className="max-w-md text-stone-400 font-medium leading-relaxed text-lg">
              Experience the divine fusion of traditional flavors and modern smart dining. 
              From personalized recommendations to real-time kitchen tracking, we ensure 
              every meal is served with perfection.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Quick Links</h4>
            <ul className="space-y-6 text-sm font-bold">
              <li><button onClick={() => setView('customer')} className="hover:text-brand-orange transition-colors">Menu</button></li>
              <li><button onClick={() => setView('kitchen')} className="hover:text-brand-orange transition-colors">Kitchen Panel</button></li>
              <li><button onClick={() => setView('history')} className="hover:text-brand-orange transition-colors">Order History</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Connect</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all cursor-pointer group">
                <Volume2 size={20} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="w-12 h-12 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all cursor-pointer group">
                <Mic size={20} className="group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-12 mt-12 border-t border-dark-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-600">
            © 2024 Angel's Kitchen. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-black text-stone-600">
            <span className="hover:text-stone-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

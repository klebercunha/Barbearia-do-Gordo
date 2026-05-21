import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Scissors, 
  CheckCircle, 
  Star, 
  MessageSquare, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Bell, 
  ChevronRight, 
  X, 
  Check, 
  Compass, 
  Ticket, 
  LogOut, 
  Plus, 
  Award,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { User, Service, Barber, Booking, Coupon, SystemSettings, Notification } from '../types';
import { formatCurrency, formatPortugueseDate, translateCategory } from '../data';

interface CustomerAppProps {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  barbers: Barber[];
  setBarbers: React.Dispatch<React.SetStateAction<Barber[]>>;
  services: Service[];
  coupons: Coupon[];
  settings: SystemSettings;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  triggerPushNotification: (title: string, msg: string) => void;
}

export default function CustomerApp({
  currentUser,
  setCurrentUser,
  bookings,
  setBookings,
  barbers,
  setBarbers,
  services,
  coupons,
  settings,
  notifications,
  setNotifications,
  triggerPushNotification
}: CustomerAppProps) {
  // Navigation tabs: 'home' | 'book' | 'profile' | 'alerts'
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'profile' | 'alerts'>('home');
  
  // States for Booking Funnel
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingBarber, setBookingBarber] = useState<Barber | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(''); // YYYY-MM-DD
  const [bookingTime, setBookingTime] = useState<string>(''); // HH:MM
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<boolean>(false);
  
  // Rescheduling states
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  // Review states
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');

  // Profile Edit states
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Filter service category state
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'cabelo' | 'barba' | 'combo'>('todos');

  // Trigger WhatsApp contact
  const handleWhatsAppHelp = () => {
    const text = encodeURIComponent(`Olá! Gostaria de tirar uma dúvida sobre os serviços da Barbearia do Gordo.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  // Trigger Google Maps directions
  const handleDirections = () => {
    window.open(settings.googleMapsUrl, '_blank');
  };

  // Generate date carousel options: today + 14 days
  const getDateOptions = () => {
    const options = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isSunday = d.getDay() === 0;
      if (isSunday) continue; // Skip Sundays usually for barberies, or keep it depending on preferences, we'll skip Sunday
      
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dateKey = `${d.getFullYear()}-${monthStr}-${dayStr}`;
      
      options.push({
        key: dateKey,
        dayNum: d.getDate(),
        dayName: weekdays[d.getDay()],
        rawDate: d
      });
    }
    return options;
  };

  // Generate hourly slots
  const getTimeSlots = (dateKey: string, selectedBarberId: string, customBookingsList: Booking[]) => {
    if (!dateKey || !selectedBarberId) return [];
    
    const slots = [];
    let current = parseInt(settings.openHour.split(':')[0]);
    const close = parseInt(settings.closeHour.split(':')[0]);
    
    // Generate every hour and half hour
    for (let h = current; h < close; h++) {
      const hStr = String(h).padStart(2, '0');
      slots.push(`${hStr}:00`);
      slots.push(`${hStr}:30`);
    }

    // Filter slots based on active bookings for this date and barber to prevent duplicate booking!
    const takenTimes = customBookingsList
      .filter(b => b.date === dateKey && b.barberId === selectedBarberId && b.status !== 'cancelled')
      .map(b => b.time);

    return slots.map(time => ({
      time,
      isAvailable: !takenTimes.includes(time)
    }));
  };

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess(false);
    setAppliedCoupon(null);
    
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    const coup = coupons.find(c => c.code === cleanCode && c.isActive);
    if (!coup) {
      setCouponError('Cupom inválido ou expirado.');
      return;
    }

    if (bookingService) {
      if (coup.minBookingValue && bookingService.price < coup.minBookingValue) {
        setCouponError(`Mínimo de ${formatCurrency(coup.minBookingValue)} para este cupom.`);
        return;
      }
    }

    setAppliedCoupon(coup);
    setCouponSuccess(true);
  };

  // Final confirm booking trigger
  const handleConfirmBooking = () => {
    if (!bookingService || !bookingBarber || !bookingDate || !bookingTime) return;

    const basePrice = bookingService.price;
    const discount = appliedCoupon ? (basePrice * appliedCoupon.discountPercentage) / 100 : 0;
    const finalPrice = Math.max(0, basePrice - discount);

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      serviceId: bookingService.id,
      barberId: bookingBarber.id,
      date: bookingDate,
      time: bookingTime,
      status: 'confirmed',
      price: finalPrice,
      couponCode: appliedCoupon?.code,
      createdAt: new Date().toISOString()
    };

    // Update bookings list
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);

    // Dynamic loyalty point reward: 1 point per confirmed visit
    const updatedUser = {
      ...currentUser,
      loyaltyPoints: currentUser.loyaltyPoints + 1
    };
    setCurrentUser(updatedUser);

    // Save in storage
    const uUsers = JSON.parse(localStorage.getItem('gordo_users') || '[]');
    const index = uUsers.findIndex((u: User) => u.id === currentUser.id);
    if (index !== -1) {
      uUsers[index] = updatedUser;
      localStorage.setItem('gordo_users', JSON.stringify(uUsers));
    }

    // Add push notification
    const alertTitle = 'Agendamento Confirmado! ✂️';
    const alertMsg = `${bookingService.name} com ${bookingBarber.name} no dia ${formatPortugueseDate(bookingDate)} às ${bookingTime}.`;
    
    const newAlert: Notification = {
      id: `not-${Date.now()}`,
      userId: currentUser.id,
      title: alertTitle,
      message: alertMsg,
      type: 'confirm',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications([newAlert, ...notifications]);
    triggerPushNotification(alertTitle, alertMsg);

    // Reset wizard
    setBookingService(null);
    setBookingBarber(null);
    setBookingDate('');
    setBookingTime('');
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponSuccess(false);

    // Redirect to profile
    setActiveTab('profile');
  };

  // Action: Cancel Booking
  const handleCancelBooking = (bId: string) => {
    const updated = bookings.map(b => {
      if (b.id === bId) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });
    setBookings(updated);

    // Deduct 1 loyalty point dynamically if cancellation, keeping at least 0
    const pointsDeducted = Math.max(0, currentUser.loyaltyPoints - 1);
    const updatedUser = { ...currentUser, loyaltyPoints: pointsDeducted };
    setCurrentUser(updatedUser);

    const alertTitle = 'Agendamento Cancelado 💈';
    const alertMsg = 'O seu horário agendado foi cancelado com sucesso.';
    
    const newAlert: Notification = {
      id: `not-${Date.now()}`,
      userId: currentUser.id,
      title: alertTitle,
      message: alertMsg,
      type: 'reminder',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications([newAlert, ...notifications]);
    triggerPushNotification(alertTitle, alertMsg);
  };

  // Process Rescheduling
  const submitReschedule = () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;

    const updated = bookings.map(b => {
      if (b.id === rescheduleBooking.id) {
        return { 
          ...b, 
          date: rescheduleDate, 
          time: rescheduleTime,
          status: 'confirmed' as const // Ensure active
        };
      }
      return b;
    });
    setBookings(updated);

    const alertTitle = 'Horário Remarcado! 🔄';
    const alertMsg = `Novo horário de agendamento: ${formatPortugueseDate(rescheduleDate)} às ${rescheduleTime}.`;
    
    const newAlert: Notification = {
      id: `not-${Date.now()}`,
      userId: currentUser.id,
      title: alertTitle,
      message: alertMsg,
      type: 'confirm',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications([newAlert, ...notifications]);
    triggerPushNotification(alertTitle, alertMsg);
    setRescheduleBooking(null);
  };

  // Submit Review / Rating
  const submitReview = () => {
    if (!ratingBooking) return;

    // Save evaluation to booking
    const updatedBookings = bookings.map(b => {
      if (b.id === ratingBooking.id) {
        return {
          ...b,
          rating: ratingValue,
          review: reviewText
        };
      }
      return b;
    });
    setBookings(updatedBookings);

    // Dynamically update barber score stats
    const barberId = ratingBooking.barberId;
    setBarbers(prevBarbers => 
      prevBarbers.map(barb => {
        if (barb.id === barberId) {
          const totalRating = (barb.rating * barb.reviewsCount) + ratingValue;
          const newCount = barb.reviewsCount + 1;
          const newAvg = parseFloat((totalRating / newCount).toFixed(1));
          return {
            ...barb,
            rating: newAvg,
            reviewsCount: newCount
          };
        }
        return barb;
      })
    );

    // Alert successful submission
    triggerPushNotification('Avaliação enviada! ⭐', 'Obrigado pelo seu feedback. Isso ajuda a barbearia a evoluir!');

    setRatingBooking(null);
    setReviewText('');
    setRatingValue(5);
  };

  // Save profile edits
  const saveProfileChanges = () => {
    if (!profileName.trim()) return;

    const updated = {
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      email: profileEmail
    };
    setCurrentUser(updated);
    setIsEditingProfile(false);

    // Save back to db
    const uUsers = JSON.parse(localStorage.getItem('gordo_users') || '[]');
    const index = uUsers.findIndex((u: User) => u.id === currentUser.id);
    if (index !== -1) {
      uUsers[index] = updated;
      localStorage.setItem('gordo_users', JSON.stringify(uUsers));
    }

    triggerPushNotification('Perfil Atualizado', 'Suas informações foram guardadas com sucesso.');
  };

  // Categorized services
  const filteredServices = services.filter(s => {
    if (selectedCategory === 'todos') return true;
    return s.category === selectedCategory;
  });

  // Client's bookings logic split
  const upcomingBookingsList = bookings.filter(b => b.userId === currentUser.id && b.status !== 'cancelled' && new Date(`${b.date}T${b.time}`) >= new Date());
  const historicBookingsList = bookings.filter(b => b.userId === currentUser.id && (b.status === 'cancelled' || new Date(`${b.date}T${b.time}`) < new Date()));

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;

  return (
    <div className="relative flex flex-col h-full bg-matte-950 text-gray-200 overflow-hidden select-none">
      
      {/* PHONE INNER HEADER */}
      <header className="px-5 py-4 border-b border-matte-800 bg-matte-900/90 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="p-1 px-2 border border-gold-500/30 rounded-lg bg-matte-950 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-gold-500" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
              Gordo Barber
            </h1>
            <p className="text-[10px] text-gold-400 font-mono">CLIENT PREMIUM</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            id="action-view-notifications"
            onClick={() => setActiveTab('alerts')} 
            className="relative p-2 rounded-full hover:bg-matte-800 text-gray-300 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-matte-950 text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-matte-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            id="action-logout"
            onClick={() => setCurrentUser(null)} 
            className="p-2 rounded-full hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE BODY NAVIGATION COMPARTMENT */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        
        {/* ==================================== */}
        {/* 1. HOME TAB INTERFACES               */}
        {/* ==================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fade-in">
            {/* HERO PROMOTIONAL Bento grid CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-matte-900 border border-gold-500/80 p-5 shadow-lg bento-card-transition">
              <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
                <Scissors className="w-44 h-44 text-gold-505" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-gold-500 text-[10px] uppercase font-mono tracking-widest font-bold">Oferta Exclusiva</div>
                  <h3 className="text-2xl font-normal text-white leading-tight mt-1">
                    Combo Imperial<br/>
                    <span className="text-gold-500 serif-font">20% OFF</span>
                  </h3>
                </div>
                
                <div className="flex justify-between items-end gap-3 pt-1">
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Corte + Barba + Toalha Quente<br/>
                    Válido até Sexta-feira
                  </p>
                  
                  <button 
                    id="action-home-go-book"
                    onClick={() => {
                      setBookingService(services.find(s => s.category === 'combo') || null);
                      setActiveTab('book');
                    }}
                    className="shrink-0 bg-gold-500 hover:bg-gold-600 text-black font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-full shadow-md transition-all transform active:scale-95"
                  >
                    Resgatar
                  </button>
                </div>
              </div>
            </div>

            {/* DYNAMIC FIDELIDADE COMPARTMENT - BENTO GOLD CARD */}
            <div className="p-5 bg-gold-500 text-black rounded-3xl border-none space-y-3 shadow-md bento-card-transition">
              <div className="flex justify-between items-center font-bold">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-black" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Cartão Fidelidade</h4>
                </div>
                <span className="text-[11px] font-mono bg-black text-gold-500 px-2 py-0.5 rounded-full text-xs">
                  {currentUser.loyaltyPoints % 11}/10 Selos
                </span>
              </div>

              {/* Bento styled progress bar */}
              <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (currentUser.loyaltyPoints % 11) * 10)}%` }}
                />
              </div>

              <div className="text-xs font-semibold leading-normal">
                {currentUser.loyaltyPoints >= 10 
                  ? "🎉 Parabéns! Você já tem 10 selos acumulados e seu próximo corte clássico é 100% de graça! Fale com o barbeiro."
                  : <span>Faltam <strong>{10 - (currentUser.loyaltyPoints % 10)} cortes</strong> para você ganhar um <strong>Corte Grátis</strong>.</span>}
              </div>

              {/* Real Stamps visual representation */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {Array.from({ length: 10 }).map((_, index) => {
                  const stampNum = index + 1;
                  const earned = (currentUser.loyaltyPoints % 11) >= stampNum;
                  return (
                    <div 
                      key={stampNum}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center border transition-all ${
                        earned 
                          ? 'bg-black text-gold-500 border-black' 
                          : 'bg-black/15 border-transparent text-black/55'
                      }`}
                    >
                      {earned ? (
                        <Scissors className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-mono font-bold">{stampNum}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAST SHORTCUT ACTION WHEEL */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="action-whatsapp-link"
                onClick={handleWhatsAppHelp}
                className="flex items-center justify-center space-x-2 p-3.5 bg-matte-900 hover:bg-matte-850 border border-matte-800 rounded-xl transition-all text-center"
              >
                <div className="p-1.5 bg-emerald-950 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-semibold text-white">Suporte Zap</h5>
                  <p className="text-[9px] text-gray-400">Tire suas dúvidas</p>
                </div>
              </button>

              <button 
                id="action-maps-directions"
                onClick={handleDirections}
                className="flex items-center justify-center space-x-2 p-3.5 bg-matte-900 hover:bg-matte-850 border border-matte-800 rounded-xl transition-all text-center"
              >
                <div className="p-1.5 bg-blue-950 rounded-lg text-blue-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-semibold text-white">Ver Mapa</h5>
                  <p className="text-[9px] text-gray-400">Rua das Barbearias</p>
                </div>
              </button>
            </div>

            {/* UPCOMING EVENTS QUICK SNEAK PEEK */}
            {upcomingBookingsList.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Próximo Agendamento</h4>
                  <button 
                    id="action-home-go-profile"
                    onClick={() => setActiveTab('profile')} 
                    className="text-[10px] text-gold-400 hover:underline"
                  >
                    Ver Tudo
                  </button>
                </div>

                <div className="p-4 bg-gradient-to-br from-matte-900 to-matte-950 border border-gold-500/30 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  {upcomingBookingsList.slice(0, 1).map(booking => {
                    const ser = services.find(s => s.id === booking.serviceId);
                    const barb = barbers.find(b => b.id === booking.barberId);
                    return (
                      <div key={booking.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-gold-950/40 border border-gold-500/20 text-gold-400 font-mono py-0.5 px-2 rounded-full uppercase">
                              Confirmado
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1">{ser?.name}</h5>
                            <p className="text-xs text-gray-400">Barbeiro: {barb?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-bold text-gold-400">{formatCurrency(booking.price)}</p>
                            <p className="text-[10px] text-gray-500">{ser?.durationMinutes} min</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-matte-800 flex items-center space-x-4 text-xs font-mono text-gray-300">
                          <div className="flex items-center space-x-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-gold-400" />
                            <span>{booking.date.split('-').reverse().join('/')}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            <span>{booking.time}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REVIEWS LIST */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white px-1">O que dizem os clientes</h4>
              <div className="space-y-2.5">
                {bookings
                  .filter(b => b.rating && b.review)
                  .slice(0, 3)
                  .map(b => (
                    <div key={b.id} className="p-3.5 bg-matte-900 border border-matte-850 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{b.userName}</span>
                        <div className="flex items-center text-amber-400 space-x-0.5">
                          {Array.from({ length: b.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 italic">“{b.review}”</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* 2. SCHEDULER BOOK FUNNEL TAB         */}
        {/* ==================================== */}
        {activeTab === 'book' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-gold-400" />
              <span>Novo Agendamento</span>
            </h3>

            {/* PROCESS MAP PROGRESS STEP INDICATORS */}
            <div className="flex items-center justify-between bg-matte-900 p-3 rounded-xl border border-matte-800 text-[10px] uppercase font-mono">
              <div className={`text-center space-y-1 flex-1 ${bookingService ? 'text-gold-400' : 'text-gray-500'}`}>
                <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center border font-bold ${bookingService ? 'bg-gold-500 border-gold-500 text-matte-950' : 'border-gray-600 bg-matte-950'}`}>1</div>
                <div>Serviço</div>
              </div>
              <div className="w-4 h-[1px] bg-matte-700" />
              <div className={`text-center space-y-1 flex-1 ${bookingBarber ? 'text-gold-400' : 'text-gray-500'}`}>
                <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center border font-bold ${bookingBarber ? 'bg-gold-500 border-gold-500 text-matte-950' : 'border-gray-600 bg-matte-950'}`}>2</div>
                <div>Barbeiro</div>
              </div>
              <div className="w-4 h-[1px] bg-matte-700" />
              <div className={`text-center space-y-1 flex-1 ${bookingDate && bookingTime ? 'text-gold-400' : 'text-gray-500'}`}>
                <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center border font-bold ${bookingDate && bookingTime ? 'bg-gold-500 border-gold-500 text-matte-950' : 'border-gray-600 bg-matte-950'}`}>3</div>
                <div>Horário</div>
              </div>
            </div>

            {/* STEP 1: CHOOSE SERVICE */}
            {!bookingService && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-300">Escolha o Serviço:</span>
                  <div className="flex space-x-1.5 text-[10px]">
                    {(['todos', 'cabelo', 'barba', 'combo'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-0.5 rounded-full capitalize border transition-all ${
                          selectedCategory === cat 
                            ? 'bg-gold-500 border-gold-500 text-matte-950 font-semibold' 
                            : 'bg-matte-950 border-matte-850 text-gray-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredServices.map(ser => (
                    <button
                      key={ser.id}
                      onClick={() => setBookingService(ser)}
                      className="w-full text-left p-3.5 bg-matte-900 border border-matte-800 rounded-xl hover:border-gold-500/40 text-xs flex justify-between items-center transition-all group"
                    >
                      <div className="space-y-1 pr-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors">{ser.name}</span>
                          <span className="text-[9px] font-mono bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded uppercase">
                            {translateCategory(ser.category)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-snug">{ser.description}</p>
                        <p className="text-[10px] text-gray-500 font-mono flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Tempo médio: {ser.durationMinutes} minutos
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-bold text-gold-400 block">{formatCurrency(ser.price)}</span>
                        <span className="text-[9px] text-gold-500 tracking-wide font-mono hover:underline group-hover:translate-x-1 inline-flex items-center">
                          Selecionar →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE BARBER */}
            {bookingService && !bookingBarber && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-semibold">Profissional Desejado:</span>
                  <button 
                    id="action-back-to-service"
                    onClick={() => setBookingService(null)} 
                    className="text-gold-400 hover:underline flex items-center"
                  >
                    ← Mudar serviço
                  </button>
                </div>

                <div className="p-3 bg-gold-950/20 rounded-xl border border-gold-500/10 text-xs select-none">
                  Selecionado: <span className="text-white font-bold">{bookingService.name}</span> ({formatCurrency(bookingService.price)})
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {barbers.filter(b => b.isActive).map(barb => (
                    <button
                      key={barb.id}
                      onClick={() => setBookingBarber(barb)}
                      className="w-full text-left p-3 bg-matte-900 border border-matte-800 rounded-xl hover:border-gold-500/40 text-xs flex items-center space-x-3 transition-colors"
                    >
                      <img 
                        src={barb.avatarUrl} 
                        alt={barb.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-matte-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white">{barb.name}</h4>
                        <p className="text-[11px] text-gray-400 italic line-clamp-1">{barb.specialty}</p>
                        
                        <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
                          <span className="flex items-center text-amber-500 font-mono font-semibold">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            {barb.rating}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 font-mono">{barb.reviewsCount} avaliações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: DATE & TIME CHOOSE AND DUPLICATION SECURITY CHECKS */}
            {bookingService && bookingBarber && (!bookingDate || !bookingTime) && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-semibold">Data e Horário:</span>
                  <button 
                    id="action-back-to-barber"
                    onClick={() => { setBookingBarber(null); setBookingDate(''); setBookingTime(''); }} 
                    className="text-gold-400 hover:underline"
                  >
                    ← Mudar barbeiro
                  </button>
                </div>

                <div className="p-3 bg-matte-900 rounded-xl border border-matte-800 text-xs space-y-1">
                  <p className="text-gray-400">Serviço: <span className="text-white font-bold">{bookingService.name}</span></p>
                  <p className="text-gray-400">Profissional: <span className="text-white font-bold">{bookingBarber.name}</span></p>
                </div>

                {/* DATE SELECTOR CAROUSEL */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-mono">1. Selecione o Dia</label>
                  <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getDateOptions().map(opt => {
                      const isSelected = bookingDate === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { setBookingDate(opt.key); setBookingTime(''); }}
                          className={`flex-shrink-0 w-12 py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-gold-500 border-gold-500 text-matte-950 font-bold shadow-lg shadow-gold-500/20Scale' 
                              : 'bg-matte-900 border-matte-850 hover:border-matte-700 text-gray-300'
                          }`}
                        >
                          <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-matte-800' : 'text-gray-500'}`}>{opt.dayName}</span>
                          <span className="text-sm font-mono mt-0.5">{opt.dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                  {bookingDate && (
                    <p className="text-[10px] text-gold-400 font-mono">Dia selecionado: {formatPortugueseDate(bookingDate)}</p>
                  )}
                </div>

                {/* TIME SELECTOR GRID WITH SECURE DUPLICATION CHECKING */}
                {bookingDate && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-mono block">2. Selecione o Horário</label>
                    <div className="grid grid-cols-4 gap-2">
                      {getTimeSlots(bookingDate, bookingBarber.id, bookings).map(slot => {
                        const isSelected = bookingTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={!slot.isAvailable}
                            onClick={() => setBookingTime(slot.time)}
                            className={`py-2 rounded-lg border text-center text-xs font-mono transition-all ${
                              isSelected 
                                ? 'bg-gradient-to-r from-gold-400 to-gold-500 border-gold-500 text-matte-950 font-bold shadow' 
                                : slot.isAvailable 
                                ? 'bg-matte-900 border-matte-850 hover:border-matte-700 text-gray-300' 
                                : 'bg-matte-950 border-transparent text-gray-600 line-through cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center space-x-2 pt-1 text-[10px] text-gray-500">
                      <div className="w-2.5 h-2.5 bg-matte-900 border border-matte-800 rounded" />
                      <span>Disponível</span>
                      <div className="w-2.5 h-2.5 bg-matte-950 text-gray-600 border border-transparent rounded line-through flex items-center justify-center text-[8px]" />
                      <span>Ocupado</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: REVEAL FINAL PRICE & APPLYING COUPON & CREATION */}
            {bookingService && bookingBarber && bookingDate && bookingTime && (
              <div className="space-y-4 animate-fade-in bg-matte-900 p-4 rounded-xl border border-matte-800">
                <div className="flex justify-between items-center pb-2 border-b border-matte-800 mb-2">
                  <h4 className="text-xs font-title font-bold text-white uppercase tracking-wider">Revisão do Agendamento</h4>
                  <button 
                    id="action-reset-wizards"
                    onClick={() => { setBookingDate(''); setBookingTime(''); setAppliedCoupon(null); }} 
                    className="text-[10px] text-gold-400 hover:underline"
                  >
                    Alterar data/hora
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Serviço:</span>
                    <span className="text-white font-semibold">{bookingService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profissional:</span>
                    <span className="text-white font-semibold">{bookingBarber.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data e Hora:</span>
                    <span className="text-white font-mono">{bookingDate.split('-').reverse().join('/')} às {bookingTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tempo estimado:</span>
                    <span className="text-white">{bookingService.durationMinutes} minutos</span>
                  </div>
                </div>

                {/* COUPON ZONE */}
                <div className="pt-2 border-t border-matte-800 space-y-2">
                  <label className="text-[10px] text-gray-400 font-mono tracking-wider">Possui cupom de desconto?</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Código do cupom (Ex: GORDO20)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 bg-matte-950 border border-matte-850 px-3 py-2 rounded-lg text-xs font-mono uppercase text-white focus:outline-none focus:border-gold-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-stone-800 hover:bg-stone-700 text-gold-400 px-3 py-2 rounded-lg text-xs font-mono font-medium border border-stone-700 transition"
                    >
                      Aplicar
                    </button>
                  </div>
                  
                  {couponError && <p className="text-[10px] text-red-400 font-mono flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{couponError}</p>}
                  {couponSuccess && appliedCoupon && (
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center">
                      <Check className="w-3 h-3 mr-1" /> Cupom {appliedCoupon.code} aplicado! -{appliedCoupon.discountPercentage}% de desconto.
                    </p>
                  )}
                </div>

                {/* CALCULATED FINAL PRICING */}
                <div className="pt-3 border-t border-matte-800 flex justify-between items-end">
                  <span className="text-xs text-gray-400">Total a pagar:</span>
                  <div className="text-right">
                    {appliedCoupon && (
                      <span className="text-[10px] text-gray-500 line-through block font-mono">
                        {formatCurrency(bookingService.price)}
                      </span>
                    )}
                    <span className="text-lg font-mono font-extrabold text-gold-500">
                      {formatCurrency(
                        appliedCoupon 
                          ? Math.max(0, bookingService.price - (bookingService.price * appliedCoupon.discountPercentage / 100)) 
                          : bookingService.price
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[9px] text-gray-500 text-center italic">
                    O pagamento é feito diretamente na barbearia no dia do serviço.
                  </p>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-matte-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-gold-500/15 transform active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* 3. PROFILE / CLIENT HISTORY TAB      */}
        {/* ==================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            {/* EDIT PROFILE CONTAINER */}
            <div className="p-4 bg-matte-900 rounded-2xl border border-matte-800 space-y-3 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gold-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Dados do Perfil</h4>
                </div>
                <button
                  id="action-toggle-edit-profile"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-[10px] text-gold-400 hover:underline"
                >
                  {isEditingProfile ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {!isEditingProfile ? (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold flex items-center"><UserIcon className="w-3.5 h-3.5 mr-2 text-stone-500" />{currentUser.name}</p>
                  <p className="text-gray-400 flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-stone-500" />{currentUser.phone}</p>
                  <p className="text-gray-400 flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-stone-500" />{currentUser.email}</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-mono">Nome Completo</label>
                    <input
                      type="text"
                      className="w-full bg-matte-950 border border-matte-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold-500 text-white"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-mono">Telefone</label>
                    <input
                      type="text"
                      className="w-full bg-matte-950 border border-matte-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold-500 text-white"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-mono">Email</label>
                    <input
                      type="email"
                      className="w-full bg-matte-950 border border-matte-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold-500 text-white"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={saveProfileChanges}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-matte-950 py-2 rounded-lg font-bold text-xs"
                  >
                    Guardar Alterações
                  </button>
                </div>
              )}
            </div>

            {/* INTERACTIVE RESCHEDULE COMPONENT MODAL (INLINE POPUP) */}
            {rescheduleBooking && (
              <div className="p-4 bg-matte-900 rounded-2xl border border-sky-500/50 space-y-3 animate-pulse-slow">
                <div className="flex justify-between items-center border-b border-matte-800 pb-2">
                  <span className="text-xs font-bold text-sky-400 flex items-center">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Remarcar Agendamento
                  </span>
                  <button 
                    id="action-close-reschedule"
                    onClick={() => setRescheduleBooking(null)} 
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-gray-300">
                  Reserva atual: <span className="text-white font-bold">
                    {services.find(s => s.id === rescheduleBooking.serviceId)?.name}
                  </span> com <span className="text-white font-bold">
                    {barbers.find(b => b.id === rescheduleBooking.barberId)?.name}
                  </span>
                </p>

                {/* Calendar Option */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono">Selecione nova data</label>
                    <select
                      value={rescheduleDate}
                      onChange={e => { setRescheduleDate(e.target.value); setRescheduleTime(''); }}
                      className="w-full bg-matte-950 border border-matte-800 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Selecione...</option>
                      {getDateOptions().map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.dayName} - {opt.dayNum} ({formatPortugueseDate(opt.key)})</option>
                      ))}
                    </select>
                  </div>

                  {rescheduleDate && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-mono">Selecione novo horário</label>
                      <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1 bg-matte-950 rounded-lg border border-matte-800">
                        {getTimeSlots(rescheduleDate, rescheduleBooking.barberId, bookings).map(slot => (
                          <button
                            key={slot.time}
                            disabled={!slot.isAvailable}
                            onClick={() => setRescheduleTime(slot.time)}
                            className={`py-1 rounded text-center text-[10px] font-mono transition-all ${
                              rescheduleTime === slot.time 
                                ? 'bg-sky-500 text-white font-bold' 
                                : slot.isAvailable 
                                ? 'bg-matte-900 border border-matte-850 hover:border-matte-700 text-gray-300' 
                                : 'bg-matte-950 text-gray-600 line-through cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!rescheduleDate || !rescheduleTime}
                    onClick={submitReschedule}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Confirmar Remarcação
                  </button>
                </div>
              </div>
            )}

            {/* INTERACTIVE RATE/REVIEW COMPARTMENT */}
            {ratingBooking && (
              <div className="p-4 bg-matte-900 rounded-2xl border border-amber-500/50 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center border-b border-matte-800 pb-2">
                  <span className="text-xs font-bold text-amber-500 flex items-center">
                    <Star className="w-3.5 h-3.5 mr-1 fill-current" /> Deixar Avaliação
                  </span>
                  <button 
                    id="action-close-rating"
                    onClick={() => setRatingBooking(null)} 
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-gray-300">
                  Como foi seu <span className="text-white font-bold">
                    {services.find(s => s.id === ratingBooking.serviceId)?.name}
                  </span> com <span className="text-white font-bold">
                    {barbers.find(b => b.id === ratingBooking.barberId)?.name}
                  </span>?
                </p>

                {/* Rating select stars  */}
                <div className="flex justify-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRatingValue(st)}
                      className="p-1 text-2xl transition hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${st <= ratingValue ? 'text-amber-500 fill-current' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-gray-400 uppercase font-mono">Seu comentário (opcional)</label>
                  <textarea
                    placeholder="Escreva como foi o atendimento..."
                    rows={2}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full bg-matte-950 border border-matte-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-white resize-none"
                  />
                </div>

                <button
                  onClick={submitReview}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-matte-950 font-bold text-xs py-2 rounded-lg transition"
                >
                  Enviar Avaliação
                </button>
              </div>
            )}

            {/* UPCOMING VISITS TICKETS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white px-1">Próximos Horários</h4>
              {upcomingBookingsList.length === 0 ? (
                <div className="p-8 bg-matte-900/50 rounded-2xl border border-dashed border-matte-800 text-center text-xs text-gray-500">
                  <Scissors className="w-8 h-8 text-matte-700 mx-auto mb-2" />
                  <span>Você não possui nenhum horário agendado.</span>
                  <button 
                    id="action-profile-go-book"
                    onClick={() => setActiveTab('book')} 
                    className="text-gold-400 block mx-auto mt-2 hover:underline"
                  >
                    Agendar agora →
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingBookingsList.map(booking => {
                    const ser = services.find(s => s.id === booking.serviceId);
                    const barb = barbers.find(b => b.id === booking.barberId);
                    return (
                      <div key={booking.id} className="p-4 bg-matte-900 border border-matte-850 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-[10px] font-mono bg-gold-950/40 border border-gold-500/20 text-gold-400 px-3 py-1 rounded-bl-xl uppercase font-semibold">
                          Confirmado
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-white">{ser?.name}</h5>
                          <p className="text-xs text-stone-400">Atendido por: {barb?.name}</p>
                        </div>

                        <div className="flex space-x-4 text-xs font-mono text-gray-200">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-gold-500" />
                            <span>{booking.date.split('-').reverse().join('/')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-gold-500" />
                            <span>{booking.time}h</span>
                          </div>
                          <div className="flex-1 text-right font-bold text-gold-400">
                            {formatCurrency(booking.price)}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-matte-800 flex space-x-2">
                          <button
                            onClick={() => {
                              setRescheduleBooking(booking);
                              setRescheduleDate('');
                              setRescheduleTime('');
                            }}
                            className="flex-1 py-1.5 bg-matte-950 hover:bg-stone-800 border border-matte-800 text-sky-400 text-[11px] font-semibold rounded-lg transition"
                          >
                            Remarcar
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-[11px] font-semibold rounded-lg transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HISTORIC COMPLETED OR CANCELLED VISITS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white px-1">Histórico de Serviços</h4>
              {historicBookingsList.length === 0 ? (
                <p className="text-xs text-gray-500 italic px-1">Nenhum serviço realizado anteriormente.</p>
              ) : (
                <div className="space-y-2">
                  {historicBookingsList.map(booking => {
                    const ser = services.find(s => s.id === booking.serviceId);
                    const barb = barbers.find(b => b.id === booking.barberId);
                    const isCancelled = booking.status === 'cancelled';
                    return (
                      <div key={booking.id} className="p-3 bg-matte-900/60 border border-matte-850 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-white">{ser?.name}</h5>
                            <p className="text-[11px] text-gray-500">{barb?.name} • {booking.date.split('-').reverse().join('/')}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-mono font-medium ${
                            isCancelled 
                              ? 'bg-red-950/30 border border-red-900/10 text-red-400' 
                              : 'bg-stone-800 text-stone-400'
                          }`}>
                            {isCancelled ? 'Cancelado' : 'Realizado'}
                          </span>
                        </div>

                        {!isCancelled && (
                          <div className="flex justify-between items-center pt-1.5 border-t border-matte-850">
                            {booking.rating ? (
                              <div className="flex items-center text-amber-500 text-[10px]">
                                <span className="mr-1">Sua avaliação:</span>
                                {Array.from({ length: booking.rating }).map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setRatingBooking(booking);
                                  setRatingValue(5);
                                  setReviewText('');
                                }}
                                className="text-[10px] text-gold-400 hover:underline flex items-center space-x-1"
                              >
                                <Star className="w-3 h-3 fill-current" />
                                <span>Deixar avaliação do barbeiro →</span>
                              </button>
                            )}
                            <span className="font-mono text-[10px] text-gray-400">{formatCurrency(booking.price)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* 4. NOTIFICATIONS DRAWER TAB          */}
        {/* ==================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gold-400" />
                <span>Central de Notificações</span>
              </h3>
              {notifications.filter(n => n.userId === currentUser.id).length > 0 && (
                <button
                  id="action-clear-unread-notifications"
                  onClick={() => {
                    // Mark all as read
                    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
                  }}
                  className="text-[10px] text-gold-400 hover:underline"
                >
                  Limpar pendentes
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  Nenhuma notificação recebida ainda.
                </div>
              ) : (
                notifications
                  .filter(n => n.userId === currentUser.id)
                  .map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs relative ${
                        alert.isRead 
                          ? 'bg-matte-900/60 border-matte-850 text-gray-400' 
                          : 'bg-matte-900 border-gold-500/20 text-white shadow-sm shadow-gold-500/5'
                      }`}
                    >
                      {!alert.isRead && (
                        <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
                      )}
                      
                      <h4 className="font-bold pr-4">{alert.title}</h4>
                      <p className="text-stone-400 text-[11px] mt-1 leading-relaxed">{alert.message}</p>
                      
                      <div className="mt-2 text-[9px] font-mono text-gray-500 text-right">
                        {new Date(alert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* CORE MOBILE CLIENT FOOTER NAV GRID */}
      <footer className="absolute bottom-0 left-0 right-0 h-16 bg-matte-900 border-t border-matte-800 grid grid-cols-4 items-center px-2 z-10">
        <button
          id="tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center space-y-1 h-full transition-all ${activeTab === 'home' ? 'text-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] tracking-wide font-medium">Início</span>
        </button>

        <button
          id="tab-book"
          onClick={() => {
            setActiveTab('book');
            setBookingService(null);
            setBookingBarber(null);
            setBookingDate('');
            setBookingTime('');
          }}
          className={`flex flex-col items-center justify-center space-y-1 h-full transition-all ${activeTab === 'book' ? 'text-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Scissors className="w-5 h-5" />
          <span className="text-[9px] tracking-wide font-medium">Agendar</span>
        </button>

        <button
          id="tab-profile"
          onClick={() => {
            setActiveTab('profile');
            setRescheduleBooking(null);
            setRatingBooking(null);
          }}
          className={`flex flex-col items-center justify-center space-y-1 h-full transition-all ${activeTab === 'profile' ? 'text-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] tracking-wide font-medium">Minhas Reservas</span>
        </button>

        <button
          id="tab-alerts"
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center space-y-1 h-full transition-all ${activeTab === 'alerts' ? 'text-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-400 rounded-full" />
            )}
          </div>
          <span className="text-[9px] tracking-wide font-medium">Notificações</span>
        </button>
      </footer>
    </div>
  );
}

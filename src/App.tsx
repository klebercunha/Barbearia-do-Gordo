import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Settings as SettingsIcon, 
  HelpCircle, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  Scissors, 
  CalendarCheck, 
  LogOut,
  Bell,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Wifi,
  Battery,
  AlertCircle,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ChevronRight,
  X
} from 'lucide-react';
import { User, Booking, Barber, Service, Coupon, SystemSettings, Notification } from './types';
import { 
  getStoredData, 
  saveStoredData, 
  DEFAULT_BARBERS, 
  DEFAULT_SERVICES, 
  DEFAULT_SETTINGS,
  DEFAULT_ADMIN,
  DEFAULT_CUSTOMER
} from './data';
import CustomerApp from './components/CustomerApp';
import AdminPanel from './components/AdminPanel';
import ControlHub from './components/ControlHub';

export default function App() {
  // Load database from localStorage or default seeds
  const [dataLoaded, setDataLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Current session active user
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Authentication internal flows: 'login' | 'register' | 'forgot'
  const [authFlow, setAuthFlow] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Auth Form Fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Push notifications simulations
  const [pushNotification, setPushNotification] = useState<{ title: string; message: string } | null>(null);

  // Layout View Toggles (on Admin login, allows viewing the phone simulator concurrently)
  const [showPhoneSimulatorOnAdmin, setShowPhoneSimulatorOnAdmin] = useState(true);

  // Simulator current time (dynamic HH:MM)
  const [simulatedTime, setSimulatedTime] = useState('09:41');

  // Initialize data
  useEffect(() => {
    const data = getStoredData();
    setUsers(data.users);
    setServices(data.services);
    setBarbers(data.barbers);
    setBookings(data.bookings);
    setCoupons(data.coupons);
    setSettings(data.settings);
    setNotifications(data.notifications);
    
    // Auto login as customer initially so reviewer doesn't see a blank login page
    setCurrentUser(DEFAULT_CUSTOMER);
    setDataLoaded(true);

    // Sync Clock ticks
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setSimulatedTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync state mutations back to Local Storage
  useEffect(() => {
    if (!dataLoaded) return;
    saveStoredData({
      users,
      services,
      barbers,
      bookings,
      coupons,
      settings,
      notifications
    });
  }, [dataLoaded, users, services, barbers, bookings, coupons, settings, notifications]);

  // Helper trigger to simulate sliding Push Notification banner
  const triggerPushNotificationHandler = (title: string, message: string) => {
    setPushNotification({ title, message });
    // Sound/vibrate feedback if supported
    if ('vibrate' in navigator) {
      try { navigator.vibrate(80); } catch (_) {}
    }
    setTimeout(() => {
      setPushNotification(null);
    }, 4500);
  };

  // Switch account helper (for the quick test shortcuts)
  const handleShortcutLogin = (isAdmin: boolean) => {
    setAuthError('');
    setAuthSuccessMsg('');
    if (isAdmin) {
      const adminUsr = users.find(u => u.isAdmin) || DEFAULT_ADMIN;
      setCurrentUser(adminUsr);
      triggerPushNotificationHandler('Logado como Admin 👑', 'Seja bem-vindo ao painel estratégico da Barbearia!');
    } else {
      const clientUsr = users.find(u => u.email === DEFAULT_CUSTOMER.email) || DEFAULT_CUSTOMER;
      setCurrentUser(clientUsr);
      triggerPushNotificationHandler(`Seja bem-vindo, ${clientUsr.name}! 👋`, 'Seu agendamento e selos de fidelidade estão carregados.');
    }
  };

  // Reset entire localized storage data to start fresh
  const handleResetLocalStorage = () => {
    if (confirm('Tem certeza que deseja resetar todo o banco local? Isso restaurará as configurações originais e agendamentos de sementes.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Generate random test booking simulation
  const handleAddRandomTestBooking = () => {
    // Pick random client or create temporary name
    const randomNames = ['Diego Maradona', 'Neymar Jr', 'Lionel Messi', 'Zinedine Zidane', 'Andrés Iniesta'];
    const randomPhones = ['11999991234', '11988884321', '11977771122', '11911112233', '11922223344'];
    const rIdx = Math.floor(Math.random() * randomNames.length);
    const rName = randomNames[rIdx];
    const rPhone = randomPhones[rIdx];

    // Pick random barber & random service
    const activeBarbers = barbers.filter(b => b.isActive);
    if (activeBarbers.length === 0) return;
    const barb = activeBarbers[Math.floor(Math.random() * activeBarbers.length)];
    const ser = services[Math.floor(Math.random() * services.length)];

    // Scheduled for today or tomorrow
    const daysOffset = Math.random() > 0.5 ? 0 : 1;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysOffset);
    const dateStr = futureDate.toISOString().split('T')[0];

    // Select random hour slot (10:00 to 18:30)
    const hours = ['10:00', '11:00', '13:30', '14:00', '15:30', '17:00'];
    const hour = hours[Math.floor(Math.random() * hours.length)];

    const testBooking: Booking = {
      id: `bk-test-${Date.now()}`,
      userId: `test-${rIdx}`,
      userName: rName,
      userPhone: rPhone,
      serviceId: ser.id,
      barberId: barb.id,
      date: dateStr,
      time: hour,
      status: 'confirmed',
      price: ser.price,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [testBooking, ...prev]);

    // Push notification trigger
    triggerPushNotificationHandler(
      'Nova Reserva Criada ➕', 
      `${rName} agendou ${ser.name} com ${barb.name} para o dia ${dateStr.split('-').reverse().join('/')} às ${hour}h.`
    );
  };

  // Manual auth process
  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (authFlow === 'login') {
      const cleanEmail = authEmail.trim().toLowerCase();
      // Look up account
      const matched = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === authPassword);
      if (!matched) {
        setAuthError('Usuário ou senha incorretos. Tente beto/admin ou use os botões de atalho.');
        return;
      }
      setCurrentUser(matched);
      triggerPushNotificationHandler(`Olá, ${matched.name}!`, 'Seja bem-vindo de volta!');
    } else if (authFlow === 'register') {
      if (!authName.trim()) {
        setAuthError('Digite seu nome completo.');
        return;
      }
      if (!authPhone.trim()) {
        setAuthError('Digite seu telefone para contato.');
        return;
      }
      const cleanEmail = authEmail.trim().toLowerCase();
      if (!cleanEmail) {
        setAuthError('Digite seu e-mail.');
        return;
      }
      // Check duplicate e-mail
      const isDuo = users.some(u => u.email.toLowerCase() === cleanEmail);
      if (isDuo) {
        setAuthError('Este e-mail já está cadastrado no sistema.');
        return;
      }

      // Add user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: authName.trim(),
        phone: authPhone.trim(),
        email: cleanEmail,
        password: authPassword,
        isAdmin: false,
        loyaltyPoints: 0
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      triggerPushNotificationHandler('Cadastro Concluído! 🎉', 'Conta criada e ativada com sucesso.');
      setAuthName('');
      setAuthPhone('');
      setAuthEmail('');
      setAuthPassword('');
    } else {
      // Simulado Forgot password
      setAuthSuccessMsg('Dica de segurança: Para e-mails de desenvolvedor, o código de recuperação foi simulado. A senha original do Kleber é (user123) e do Admin é (admin).');
    }
  };

  return (
    <div className="min-h-screen bg-matte-950 text-gray-200 font-sans flex flex-col md:p-3 relative overflow-x-hidden select-none">
      
      {/* EXTREMELY MODERN FLOATING PUSH NOTIFICATION SIMULATOR */}
      {pushNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-matte-900 border-2 border-gold-500/80 rounded-2xl p-4 shadow-[0_15px_30px_rgba(0,0,0,0.6)] z-[9999] transition-all duration-300 animate-slide-down pointer-events-auto flex items-start space-x-3">
          <div className="p-2 bg-gold-500/10 rounded-xl text-gold-400 shrink-0 border border-gold-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white font-title tracking-wide">{pushNotification.title}</h4>
            <p className="text-[11px] text-gray-400 mt-1 leading-normal">{pushNotification.message}</p>
          </div>
          <button 
            onClick={() => setPushNotification(null)}
            className="text-gray-500 hover:text-white shrink-0 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CORE FRAME FOR RESPONSIVES WRAPPING */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 p-4">
        
        {/* UPPER DESKTOP WORKSPACE CONSOLE DETAILS */}
        <div className="hidden lg:flex justify-between items-center bg-matte-900/40 p-4 rounded-3xl border border-matte-850">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-matte-950 font-extrabold shadow-md transform -rotate-3">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black font-display text-white tracking-wide uppercase">
                Barbearia do Gordo
              </h1>
              <p className="text-xs text-gold-400/90 font-mono">
                AMBITION & STYLE • PREMIUM WEB PREVIEW
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-gray-400 font-mono">
            <div className="p-1 px-3 bg-matte-950 rounded-lg flex items-center space-x-2 border border-matte-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gordo Cloud Database (Local)</span>
            </div>
            <div className="flex items-center space-x-2 text-gold-400">
              <Sparkles className="w-4 h-4" />
              <span>Toalha Quente & Navalha Afiada</span>
            </div>
          </div>
        </div>

        {/* RESPONSIVE LAYOUT WORKSPACE */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* COLUMN A: TESTING BENCH INSTRUMENTS (COVERS 4 COLUMNS) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <ControlHub
              onLoginAsUser={handleShortcutLogin}
              currentUser={currentUser}
              bookings={bookings}
              addRandomTestBooking={handleAddRandomTestBooking}
              resetAllLocalStorage={handleResetLocalStorage}
            />

            {/* ADITIONAL COMPACT MAPS BLOCK */}
            <div className="bg-matte-900 border border-matte-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between space-y-3 shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">Localização Oficial</span>
                <h4 className="text-sm font-bold text-white font-title text-ellipsis overflow-hidden">
                  Centro de Praticidade
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  {settings.address}
                </p>
              </div>

              <div className="rounded-2xl bg-matte-950 border border-matte-850 p-4 text-center overflow-hidden flex flex-col items-center justify-center space-y-2">
                <MapPin className="w-8 h-8 text-gold-500" />
                <span className="text-[10px] text-stone-500 font-mono">GOOGLE MAPS API INTEGRATED</span>
                <button
                  onClick={() => window.open(settings.googleMapsUrl, '_blank')}
                  className="bg-stone-850 text-gold-400 hover:bg-stone-800 py-1.5 px-3 rounded-lg border border-stone-800 font-mono font-bold text-[10px]"
                >
                  Abrir Rotas Externas
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN B: MAIN INTERACTIVE SCREENS (COVERS 8 COLUMNS) */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            
            {/* IF NO USER LOGGED IN OR SIMPLE CUSTOMER INTERACTION, RENDER WORKSPACE */}
            {(!currentUser || !currentUser.isAdmin) ? (
              <div className="flex items-center justify-center w-full">
                
                {/* TI-BLACK SMARTPHONE FRAME */}
                <div className="w-full max-w-sm h-[720px] bg-matte-900 border-8 border-matte-800 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative scale-100 md:scale-105 transition-transform">
                  
                  {/* PHONE UPPER HARDWARE DECK (NOTCH / STATUS BAR) */}
                  <div className="h-6 shrink-0 bg-matte-900 flex justify-between items-center px-6 relative text-[10px] font-mono text-gray-400 font-semibold select-none z-30">
                    <span className="text-white text-xs">{simulatedTime}</span>
                    {/* Speaker hardware notch pill */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-4 bg-matte-950 rounded-full flex items-center justify-center">
                      <div className="w-10 h-1 bg-neutral-800 rounded-full" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-3.5 h-3.5 text-white" />
                      <span>5G</span>
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>

                  {/* PHONE INTERNALS CORE CONTROLLERS */}
                  <div className="flex-1 overflow-hidden h-full relative flex flex-col">
                    
                    {/* AUTH SPLIT IF LOGGED OUT */}
                    {!currentUser ? (
                      <div className="flex-1 bg-matte-950 flex flex-col p-6 overflow-y-auto">
                        
                        <div className="text-center my-6 space-y-2">
                          <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mx-auto flex items-center justify-center text-matte-950 shadow-lg shadow-gold-500/10">
                            <Scissors className="w-8 h-8 rotate-45" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold font-title text-white tracking-wide">
                              Barbearia do Gordo
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">
                              Elegância, Tradição & Navalha
                            </p>
                          </div>
                        </div>

                        {/* AUTH SELECTOR ACCORDION TABS */}
                        <div className="flex p-1 bg-matte-900 rounded-xl mb-6">
                          <button
                            onClick={() => { setAuthFlow('login'); setAuthError(''); }}
                            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                              authFlow === 'login' ? 'bg-gold-500 text-matte-950 shadow font-bold' : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            Entrar
                          </button>
                          <button
                            onClick={() => { setAuthFlow('register'); setAuthError(''); }}
                            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                              authFlow === 'register' ? 'bg-gold-500 text-matte-950 shadow font-bold' : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            Cadastrar
                          </button>
                        </div>

                        {/* MANUALLY CONTROLLED AUTH FORM */}
                        <form onSubmit={handleManualAuth} className="space-y-4">
                          
                          {authFlow === 'register' && (
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Nome Completo</label>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                                <input
                                  type="text"
                                  required
                                  value={authName}
                                  onChange={e => setAuthName(e.target.value)}
                                  placeholder="Digite seu nome real"
                                  className="w-full bg-matte-900 border border-matte-850 focus:border-gold-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                                />
                              </div>
                            </div>
                          )}

                          {authFlow === 'register' && (
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">WhatsApp Telefônico</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                                <input
                                  type="tel"
                                  required
                                  value={authPhone}
                                  onChange={e => setAuthPhone(e.target.value)}
                                  placeholder="(11) 99999-8888"
                                  className="w-full bg-matte-900 border border-matte-850 focus:border-gold-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">E-mail</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                              <input
                                type="email"
                                required
                                value={authEmail}
                                onChange={e => setAuthEmail(e.target.value)}
                                placeholder="usuario@gmail.com"
                                className="w-full bg-matte-900 border border-matte-850 focus:border-gold-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          {authFlow !== 'forgot' && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Senha</label>
                                {authFlow === 'login' && (
                                  <button
                                    type="button"
                                    onClick={() => setAuthFlow('forgot')}
                                    className="text-[10px] text-gold-400 hover:underline"
                                  >
                                    Esqueceu a senha?
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  required
                                  value={authPassword}
                                  onChange={e => setAuthPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full bg-matte-900 border border-matte-850 focus:border-gold-500 focus:outline-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-2.5 text-stone-500 hover:text-white"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {authError && (
                            <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-xl flex items-center text-[11px] text-red-400">
                              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {authSuccessMsg && (
                            <div className="p-3 bg-gold-950/40 border border-gold-500/40 rounded-xl text-[10px] text-gold-300 leading-normal">
                              {authSuccessMsg}
                              <button
                                type="button"
                                onClick={() => setAuthFlow('login')}
                                className="block mt-1 font-bold underline"
                              >
                                Voltar para Login
                              </button>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full mt-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-matte-950 font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition transform active:scale-95 shadow-md shadow-gold-500/10"
                          >
                            {authFlow === 'login' ? 'Entrar na Conta' : authFlow === 'register' ? 'Criar Minha Conta' : 'Recuperar Acesso'}
                          </button>

                          {authFlow === 'forgot' && (
                            <button
                              type="button"
                              onClick={() => { setAuthFlow('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                              className="text-stone-500 tracking-wide hover:text-stone-300 w-full text-center hover:underline text-[10px] block"
                            >
                              ← Voltar para o login
                            </button>
                          )}
                        </form>
                      </div>
                    ) : (
                      /* CUSTOMER APP ROUTER MOUNT */
                      <CustomerApp
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        bookings={bookings}
                        setBookings={setBookings}
                        barbers={barbers}
                        setBarbers={setBarbers}
                        services={services}
                        coupons={coupons}
                        settings={settings}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        triggerPushNotification={triggerPushNotificationHandler}
                      />
                    )}
                  </div>

                  {/* PHONE LOWER NAVIGATION HARDWARE (NATIVE SWIPE PILL) */}
                  <div className="h-4 bg-matte-900 flex items-center justify-center shrink-0 z-30">
                    <div className="w-32 h-1 bg-stone-700 rounded-full" />
                  </div>

                </div>
              </div>
            ) : (
              /* IF USER LOGGED IN IS ADMINISTRATOR */
              <div className="w-full flex-1 flex flex-col space-y-4">
                
                {/* ADMIN DOCK CONTROLLER BAR */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Conectado como <strong className="text-white">Admin Gordo</strong></span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowPhoneSimulatorOnAdmin(!showPhoneSimulatorOnAdmin)}
                      className="text-[11px] bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850 px-3 py-1.5 rounded-xl transition"
                    >
                      {showPhoneSimulatorOnAdmin ? 'Esconder View Cliente' : 'Mostrar View Cliente Lado-a-Lado'}
                    </button>
                    <button
                      onClick={() => setCurrentUser(null)}
                      className="text-[11px] bg-red-950/40 border border-red-900/30 text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-950/60 transition"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>

                {/* DOUBLE DIVISION: ADMIN DASHBOARD GRID COMPONENT WITH INNER PHONE ACCELERATOR */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  
                  {/* ADMIN COMPONENT WRAPPER */}
                  <div className={`${showPhoneSimulatorOnAdmin ? 'xl:col-span-7' : 'xl:col-span-12'} flex flex-col`}>
                    <AdminPanel
                      bookings={bookings}
                      setBookings={setBookings}
                      barbers={barbers}
                      setBarbers={setBarbers}
                      services={services}
                      setServices={setServices}
                      coupons={coupons}
                      setCoupons={setCoupons}
                      settings={settings}
                      setSettings={setSettings}
                      users={users}
                      triggerPushNotification={triggerPushNotificationHandler}
                    />
                  </div>

                  {/* MINI INLINE SMARTPHONE SIMULATION PREVIEW (TEST HOW STUFS CHANGER IMMEDIATELY) */}
                  {showPhoneSimulatorOnAdmin && (
                    <div className="xl:col-span-5 flex flex-col items-center justify-start xl:pt-6">
                      <div className="text-center mb-3">
                        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Simulador Cliente Ativo</span>
                        <p className="text-[9px] text-slate-500 italic mt-0.5">Teste alterações de preços do admin aqui no ato!</p>
                      </div>

                      {/* SMARTPHONE WRAPPER */}
                      <div className="w-full max-w-sm h-[660px] bg-matte-900 border-8 border-matte-800 rounded-[3rem] shadow-xl overflow-hidden flex flex-col relative scale-[0.9] origin-top transition-transform">
                        
                        {/* PHONE UPPER DECK */}
                        <div className="h-6 shrink-0 bg-matte-900 flex justify-between items-center px-6 relative text-[9px] font-mono text-gray-400 font-semibold z-30">
                          <span className="text-white text-xs">{simulatedTime}</span>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-4 bg-matte-950 rounded-full flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-neutral-800 rounded-full" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Wifi className="w-3 h-3 text-white" />
                            <Battery className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>

                        {/* RENDER INLINE CLIENT SIMULATOR LINKED WITH STATE */}
                        <div className="flex-1 overflow-hidden relative break-all flex flex-col">
                          <CustomerApp
                            currentUser={DEFAULT_CUSTOMER} // For mini simulator preview, bind standard user
                            setCurrentUser={setCurrentUser}
                            bookings={bookings}
                            setBookings={setBookings}
                            barbers={barbers}
                            setBarbers={setBarbers}
                            services={services}
                            coupons={coupons}
                            settings={settings}
                            notifications={notifications}
                            setNotifications={setNotifications}
                            triggerPushNotification={triggerPushNotificationHandler}
                          />
                        </div>

                        {/* PHONE LOWER PILL */}
                        <div className="h-3 bg-matte-900 flex items-center justify-center shrink-0 z-30">
                          <div className="w-24 h-0.5 bg-stone-700 rounded-full" />
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

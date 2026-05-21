import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Percent, 
  Settings as SettingsIcon, 
  MapPin, 
  Phone, 
  Scissors, 
  Star, 
  Check, 
  X, 
  AlertCircle, 
  UserPlus, 
  Award,
  Edit2
} from 'lucide-react';
import { User, Service, Barber, Booking, Coupon, SystemSettings, Notification } from '../types';
import { formatCurrency, formatPortugueseDate } from '../data';

interface AdminPanelProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  barbers: Barber[];
  setBarbers: React.Dispatch<React.SetStateAction<Barber[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  users: User[];
  triggerPushNotification: (title: string, msg: string) => void;
}

export default function AdminPanel({
  bookings,
  setBookings,
  barbers,
  setBarbers,
  services,
  setServices,
  coupons,
  setCoupons,
  settings,
  setSettings,
  users,
  triggerPushNotification
}: AdminPanelProps) {
  // Navigation tabs: 'dashboard' | 'bookings' | 'services' | 'barbers' | 'rules'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'bookings' | 'services' | 'barbers' | 'rules'>('dashboard');

  // Filters for Booking Management
  const [filterBarber, setFilterBarber] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Add Barber state
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberAvatar, setNewBarberAvatar] = useState('');

  // Add Coupon state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(0);

  // Edit bookings state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Edit Service Pricing state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // General Settings Form state
  const [formWhatsApp, setFormWhatsApp] = useState(settings.whatsappNumber);
  const [formAddress, setFormAddress] = useState(settings.address);
  const [formOpen, setFormOpen] = useState(settings.openHour);
  const [formClose, setFormClose] = useState(settings.closeHour);

  // Handle Edit Booking save
  const handleSaveEditedBooking = () => {
    if (!editingBooking || !editDate || !editTime) return;

    setBookings(prev => prev.map(b => {
      if (b.id === editingBooking.id) {
        return {
          ...b,
          date: editDate,
          time: editTime
        };
      }
      return b;
    }));

    triggerPushNotification(
      'Agendamento Alterado 🛠️',
      `O agendamento de ${editingBooking.userName} foi remarcado para ${editDate.split('-').reverse().join('/')} às ${editTime}h.`
    );

    setEditingBooking(null);
  };

  // Change Booking Status
  const handleUpdateStatus = (bId: string, status: 'confirmed' | 'cancelled') => {
    setBookings(prev => prev.map(b => {
      if (b.id === bId) {
        return { ...b, status };
      }
      return b;
    }));

    const bRef = bookings.find(b => b.id === bId);
    if (bRef) {
      const msg = status === 'confirmed' ? 'Aprovado pelo Administrador!' : 'Cancelado pelo Administrador.';
      triggerPushNotification('Status Atualizado 💈', `${bRef.userName}: ${msg}`);
    }
  };

  // Handle addition of Barber
  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim() || !newBarberSpecialty.trim()) return;

    const newBarb: Barber = {
      id: `b-${Date.now()}`,
      name: newBarberName,
      specialty: newBarberSpecialty,
      avatarUrl: newBarberAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 0,
      isActive: true
    };

    setBarbers(prev => [...prev, newBarb]);
    triggerPushNotification('Barbeiro Adicionado ✨', `${newBarberName} agora faz parte do time!`);

    // Reset Form
    setNewBarberName('');
    setNewBarberSpecialty('');
    setNewBarberAvatar('');
  };

  // Toggle Barber active status
  const handleToggleBarber = (barbId: string) => {
    setBarbers(prev => prev.map(b => {
      if (b.id === barbId) {
        return { ...b, isActive: !b.isActive };
      }
      return b;
    }));
  };

  // Handle addition of coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCouponCode.trim().toUpperCase();
    if (!cleanCode) return;

    const newCoup: Coupon = {
      code: cleanCode,
      discountPercentage: newCouponDiscount,
      isActive: true,
      minBookingValue: newCouponMin > 0 ? newCouponMin : undefined
    };

    setCoupons(prev => [newCoup, ...prev]);
    triggerPushNotification('Cupom Ativado 🏷️', `Cupom de ${newCouponDiscount}% [${cleanCode}] criado.`);

    setNewCouponCode('');
    setNewCouponDiscount(10);
    setNewCouponMin(0);
  };

  // Toggle Coupon active state
  const handleToggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.code === code) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    }));
  };

  // Handle pricing update
  const handleSavePrice = (sId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === sId) {
        return { ...s, price: editPriceVal };
      }
      return s;
    }));
    setEditingServiceId(null);
    triggerPushNotification('Preço Atualizado 💸', `Novo valor configurado para outro serviço.`);
  };

  // Handle general System Settings update
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      ...settings,
      whatsappNumber: formWhatsApp,
      address: formAddress,
      openHour: formOpen,
      closeHour: formClose
    });
    triggerPushNotification('Configurações Salvas ⚙️', 'Regras do sistema e contatos atualizados.');
  };

  // --- STATS ENGINE CALCULATORS ---
  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const finishedBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) <= new Date());
  
  // Total Revenue (Faturamento Total)
  const totalFaturamento = activeBookings.reduce((sum, b) => sum + b.price, 0);
  
  // Average Ticket
  const averageTicket = activeBookings.length > 0 ? totalFaturamento / activeBookings.length : 0;
  
  // Active Registered Clients count
  const clientUsers = users.filter(u => !u.isAdmin);

  // Generate dataset for Barber Productivity (SVG chart)
  const barberBookingsData = barbers.map(barb => {
    const qty = bookings.filter(b => b.barberId === barb.id && b.status === 'confirmed').length;
    const value = bookings.filter(b => b.barberId === barb.id && b.status === 'confirmed').reduce((sum, b) => sum + b.price, 0);
    return { name: barb.name.split(' ')[0], value, qty };
  });

  // Generate weekly billing trajectory (last 7 days breakdown)
  const getWeeklyBillingData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const keyDate = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      const revenue = bookings
        .filter(b => b.date === keyDate && b.status === 'confirmed')
        .reduce((sum, b) => sum + b.price, 0);
      
      data.push({
        day: `${weekday} ${d.getDate()}`,
        revenue
      });
    }
    return data;
  };

  const weeklyBilling = getWeeklyBillingData();
  const maxWeeklyRevenue = Math.max(...weeklyBilling.map(w => w.revenue), 1);

  // Booking filtering logic
  const filteredBookings = bookings.filter(b => {
    const matchBarber = filterBarber === 'todos' || b.barberId === filterBarber;
    const matchStatus = filterStatus === 'todos' || b.status === filterStatus;
    return matchBarber && matchStatus;
  });

  return (
    <div className="h-full flex flex-col bg-matte-900 border border-matte-800 rounded-3xl overflow-hidden shadow-2xl bento-card-transition">
      
      {/* ADMIN UPPER DECK */}
      <div className="bg-matte-950 border-b border-matte-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
            <h1 className="text-xl font-normal text-white tracking-wide">
              <span className="serif-font text-gold-500">Painel</span> <strong className="font-extrabold text-white text-lg">ADMIN</strong>
            </h1>
          </div>
          <p className="text-xs text-stone-400">Barbearia do Gordo • Gestão Estratégica Completa</p>
        </div>

        {/* NAVIGATION MENUS */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'bookings', label: 'Agendamentos', icon: Calendar },
            { id: 'services', label: 'Serviços & Preços', icon: Scissors },
            { id: 'barbers', label: 'Barbeiros', icon: Users },
            { id: 'rules', label: 'Regras & Cupons', icon: SettingsIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isSel 
                    ? 'bg-gold-500 text-matte-950 shadow-md shadow-gold-500/10 font-bold' 
                    : 'bg-matte-850 hover:bg-matte-800 text-stone-300 border border-matte-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADMIN HUB INNER VIEWS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-matte-950/20">

        {/* ======================================= */}
        {/* VIEW 1: STRATEGIC INSIGHTS DASHBOARD    */}
        {/* ======================================= */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* NUMERICAL FLASHCARDS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-2 bento-card-transition shadow-sm">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-gold-500">Faturamento Ativo</span>
                  <DollarSign className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-mono">{formatCurrency(totalFaturamento)}</h3>
                  <p className="text-[9px] text-emerald-400 font-mono mt-1">Soma de reservas</p>
                </div>
              </div>

              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-2 bento-card-transition shadow-sm">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-gold-500">Agendamentos</span>
                  <Calendar className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-mono">{activeBookings.length}</h3>
                  <p className="text-[9px] text-stone-400 font-mono mt-1">{bookings.filter(b => b.status === 'pending').length} pendentes</p>
                </div>
              </div>

              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-2 bento-card-transition shadow-sm">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-gold-500">Ticket Médio</span>
                  <TrendingUp className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-mono">{formatCurrency(averageTicket)}</h3>
                  <p className="text-[9px] text-stone-400 font-mono mt-1">Média por reserva</p>
                </div>
              </div>

              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-2 bento-card-transition shadow-sm">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-gold-500">Clientes Ativos</span>
                  <Users className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white font-mono">{clientUsers.length}</h3>
                  <p className="text-[9px] text-emerald-400 font-mono mt-1">Cadastros válidos</p>
                </div>
              </div>
            </div>

            {/* CHARTS CONTAINER (GORGEOUS SVG DRAWINGS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CHART A: WEEKLY REVENUE LINE PROGRESS */}
              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-4 bento-card-transition shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Faturamento (Últimos 7 dias)</h4>
                    <p className="text-[10px] text-stone-400">Evolução do faturamento diário</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-gold-500 px-2.5 py-0.5 rounded-full bg-matte-950 border border-matte-800">7 Dias</span>
                </div>

                {/* Draw SVG Column/Bar chart instead of line, cleaner and extremely readable */}
                <div className="h-48 flex items-end justify-between space-x-2 pt-3">
                  {weeklyBilling.map((w, index) => {
                    const percent = (w.revenue / maxWeeklyRevenue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-2 group h-full justify-end">
                        <div className="text-[9px] text-gold-500 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-matte-950 px-1 rounded border border-matte-800">
                          {formatCurrency(w.revenue)}
                        </div>
                        <div className="w-full relative rounded-t-lg bg-matte-950 overflow-hidden h-32 flex items-end">
                          <div 
                             style={{ height: `${Math.max(4, percent)}%` }}
                             className="w-full bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-md group-hover:from-gold-500 group-hover:to-gold-300 transition-all duration-500"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 truncate w-full text-center">{w.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHART B: PRODUCTIVITY PER BARBER (SVG HORIZONTAL BAR GRAPHS) */}
              <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-4 bento-card-transition shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Estatísticas por Barbeiro</h4>
                  <p className="text-[10px] text-stone-400">Total faturado e atendimentos confirmados</p>
                </div>

                <div className="space-y-4 pt-2">
                  {barberBookingsData.map((bInfo, i) => {
                    const maxVal = Math.max(...barberBookingsData.map(b => b.value), 1);
                    const widthPercent = (bInfo.value / maxVal) * 100;
                    return (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-stone-300">
                          <span className="font-semibold text-white">{bInfo.name}</span>
                          <span className="font-mono text-[11px] text-gold-500">
                            {formatCurrency(bInfo.value)} <span className="text-stone-400">({bInfo.qty} {bInfo.qty === 1 ? 'visita' : 'visitas'})</span>
                          </span>
                        </div>
                        <div className="w-full bg-matte-950 rounded-full h-3 border border-matte-850 overflow-hidden">
                          <div 
                            style={{ width: `${Math.max(5, widthPercent)}%` }}
                            className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CUSTOMERS LOYALTY LEADERBOARD CARD */}
            <div className="p-6 bg-matte-900 rounded-3xl border border-matte-800 space-y-3 bento-card-transition shadow-sm">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gold-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-gold-500">Líderes de Fidelidade (Top Clientes)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {users
                  .filter(u => !u.isAdmin)
                  .sort((a,b) => b.loyaltyPoints - a.loyaltyPoints)
                  .slice(0,3)
                  .map((usr, i) => (
                    <div key={usr.id} className="p-3.5 bg-matte-950 border border-matte-850 rounded-2xl flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gold-500/10 text-gold-500 font-mono font-bold flex items-center justify-center border border-gold-500/20">
                        #{i + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{usr.name}</h5>
                        <p className="text-[10px] text-stone-400 font-mono">{usr.loyaltyPoints} selos acumulados</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 2: bookingS LISTING & EDITOR      */}
        {/* ======================================= */}
        {activeSubTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              
              <div className="flex flex-wrap gap-3 items-center">
                <span>Filtrar Barbeiro:</span>
                <select
                  value={filterBarber}
                  onChange={e => setFilterBarber(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                >
                  <option value="todos">Todos</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <span>Status:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                >
                  <option value="todos">Todos</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="pending">Pendentes</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>

              <div className="font-mono text-slate-400">
                Mostrando <span className="text-white font-bold">{filteredBookings.length}</span> registros
              </div>
            </div>

            {/* EDIT SCHEDULER HORARIOS COMPONENT MODAL INLINE */}
            {editingBooking && (
              <div className="p-4 bg-slate-950 border border-amber-500/50 rounded-xl space-y-3 relative animate-pulse-slow">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-xs font-bold text-amber-500">Reajustar Data/Horário da Reserva</span>
                  <button 
                    id="action-admin-close-edit-booking"
                    onClick={() => setEditingBooking(null)} 
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Nova data:</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="bg-slate-900 px-3 py-1.5 border border-slate-800 rounded text-white w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Novo horário:</label>
                    <input
                      type="text"
                      placeholder="HH:MM (Ex: 11:30)"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                      className="bg-slate-900 px-3 py-1.5 border border-slate-800 rounded text-white w-full font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveEditedBooking}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs py-2 rounded-lg font-bold"
                >
                  Confirmar Reajuste
                </button>
              </div>
            )}

            {/* BOOKINGS TABLE */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-350 select-text">
                <thead className="bg-slate-900 uppercase font-mono tracking-wider border-b border-slate-800 text-[10px] text-slate-400">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Serviço/Valor</th>
                    <th className="p-4">Barbeiro</th>
                    <th className="p-4">Data e Hora</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        Nenhum agendamento encontrado para esta pesquisa.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-white">{b.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{b.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-300">
                            {services.find(s => s.id === b.serviceId)?.name || 'Serviço'}
                          </div>
                          <div className="font-mono text-amber-400 font-bold">{formatCurrency(b.price)}</div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {barbers.find(p => p.id === b.barberId)?.name || 'Qualquer'}
                        </td>
                        <td className="p-4 font-mono">
                          <div>{b.date.split('-').reverse().join('/')}</div>
                          <div className="text-[10px] text-slate-500">{b.time}h</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            b.status === 'confirmed' 
                              ? 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400' 
                              : b.status === 'pending'
                              ? 'bg-amber-950/40 border border-amber-900/30 text-amber-500 animate-pulse'
                              : 'bg-red-950/40 border border-red-900/30 text-red-400'
                          }`}>
                            {b.status === 'confirmed' ? 'Confirmado' : b.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded border border-transparent hover:border-emerald-900/30 transition-all inline-block"
                              title="Aprovar/Ajustar para Confirmado"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingBooking(b);
                              setEditDate(b.date);
                              setEditTime(b.time);
                            }}
                            className="p-1 text-sky-400 hover:bg-sky-950/40 rounded border border-transparent hover:border-sky-900/30 transition-all inline-block"
                            title="Editar Reservas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                              className="p-1 text-red-400 hover:bg-red-950/40 rounded border border-transparent hover:border-red-900/30 transition-all inline-block"
                              title="Cancelar Horário"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 3: SERVICES AND PRICES CONTROL    */}
        {/* ======================================= */}
        {activeSubTab === 'services' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Catálogo oficial de Serviços</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(ser => {
                const isEditing = editingServiceId === ser.id;
                return (
                  <div key={ser.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-sm">{ser.name}</span>
                        <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-gray-400 font-mono uppercase">{ser.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{ser.description}</p>
                      <p className="text-[10px] text-slate-500 font-mono flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Duração: {ser.durationMinutes} minutos
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={editPriceVal}
                            onChange={e => setEditPriceVal(parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-850 text-white font-mono text-xs text-right w-20 px-2 py-1 rounded"
                          />
                          <div className="flex space-x-1 justify-end">
                            <button onClick={() => handleSavePrice(ser.id)} className="p-1 text-emerald-400 bg-slate-900 rounded"><Check className="w-3 h-3" /></button>
                            <button onClick={() => setEditingServiceId(null)} className="p-1 text-red-400 bg-slate-900 rounded"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-sm font-mono font-bold text-amber-400 block">{formatCurrency(ser.price)}</span>
                          <button
                            onClick={() => {
                              setEditingServiceId(ser.id);
                              setEditPriceVal(ser.price);
                            }}
                            className="text-[10px] text-slate-500 hover:text-amber-400 transition flex items-center"
                          >
                            <Edit2 className="w-3 h-3 mr-1" /> Modificar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 4: BARBER MANAGER MANAGER         */}
        {/* ======================================= */}
        {activeSubTab === 'barbers' && (
          <div className="space-y-6 animate-fade-in">
            {/* ADD BARBER FORM */}
            <form onSubmit={handleAddBarber} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>Adicionar Novo Barbeiro no Time</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Nome Profissional</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beto Navalha"
                    value={newBarberName}
                    onChange={e => setNewBarberName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs text-ellipsis focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Especialidades</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Degradê moderno"
                    value={newBarberSpecialty}
                    onChange={e => setNewBarberSpecialty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs text-ellipsis focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Foto URL (Opcional)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash..."
                    value={newBarberAvatar}
                    onChange={e => setNewBarberAvatar(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs text-ellipsis focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Profissional</span>
              </button>
            </form>

            {/* List of active/inactive barbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map(barb => (
                <div key={barb.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
                  <img 
                    src={barb.avatarUrl} 
                    alt={barb.name} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{barb.name}</h4>
                      <span className={`p-1 px-1.5 rounded text-[9px] uppercase font-mono font-bold ${barb.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-500'}`}>
                        {barb.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-1 italic">{barb.specialty}</p>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center text-amber-500 font-semibold font-mono">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                        {barb.rating} <span className="text-[9px] text-slate-500 ml-1">({barb.reviewsCount} reviews)</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleToggleBarber(barb.id)}
                        className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded transition ${
                          barb.isActive 
                            ? 'bg-stone-800 hover:bg-red-950 text-red-400' 
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400'
                        }`}
                      >
                        {barb.isActive ? 'Desativar' : 'Reativar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 5: RULES, COUPON ENGINE & SETTINGS */}
        {/* ======================================= */}
        {activeSubTab === 'rules' && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* COUPONS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Create Coupon */}
              <form onSubmit={handleCreateCoupon} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span>Cadastrar Cupom Desconto</span>
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">Código do Cupom</label>
                    <input
                      type="text"
                      required
                      placeholder="EX: PROMO20"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-mono uppercase">Desconto (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newCouponDiscount}
                        onChange={e => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-mono uppercase">Valor mínimo (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCouponMin}
                        onChange={e => setNewCouponMin(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-lg w-full"
                >
                  Criar Cupom
                </button>
              </form>

              {/* Coupons table */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cupons Ativos no Aplicativo</h3>
                <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto pr-1">
                  {coupons.map(coup => (
                    <div key={coup.code} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-white text-xs tracking-wider bg-slate-900 p-1 px-2 border border-slate-800 rounded">
                          {coup.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Desconto de {coup.discountPercentage}% {coup.minBookingValue ? `em compras acima de R$ ${coup.minBookingValue}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleCoupon(coup.code)}
                        className={`text-[9px] font-mono py-1 px-2.5 rounded uppercase font-bold hover:opacity-85 ${
                          coup.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950/40 text-red-400'
                        }`}
                      >
                        {coup.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SYSTEM CONTACT CONTENT SETTINGS */}
            <form onSubmit={handleSaveSettings} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4 text-amber-500" />
                <span>Configurações Operacionais & Contatos Gerais</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">WhatsApp Oficial de Suporte</label>
                  <input
                    type="text"
                    value={formWhatsApp}
                    onChange={e => setFormWhatsApp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[9px] text-slate-500">Apenas números com DDD (Ex: 5511999998888)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Endereço da Barbearia</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[9px] text-slate-500 font-mono">Exibido na tela inicial do cliente</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Horário de Abertura (Iniciar agendamento)</label>
                  <input
                    type="text"
                    value={formOpen}
                    onChange={e => setFormOpen(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Horário de Fechamento (Fim do expediente)</label>
                  <input
                    type="text"
                    value={formClose}
                    onChange={e => setFormClose(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow shadow-amber-500/10"
              >
                Salvar Configurações
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}

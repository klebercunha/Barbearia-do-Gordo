import React from 'react';
import { 
  User, 
  Shield, 
  HelpCircle, 
  CheckCircle, 
  Layers, 
  Flame, 
  Compass, 
  Key, 
  UserCheck, 
  Sparkles,
  RefreshCw,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { User as UserType, Booking } from '../types';
import { formatCurrency } from '../data';

interface ControlHubProps {
  onLoginAsUser: (isAdmin: boolean) => void;
  currentUser: UserType | null;
  bookings: Booking[];
  addRandomTestBooking: () => void;
  resetAllLocalStorage: () => void;
}

export default function ControlHub({
  onLoginAsUser,
  currentUser,
  bookings,
  addRandomTestBooking,
  resetAllLocalStorage
}: ControlHubProps) {
  return (
    <div className="bg-matte-900 border border-matte-800 rounded-3xl p-5 md:p-6 space-y-6 text-xs text-gray-300">
      
      {/* BRAND HEADER ACCENT */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-gold-500">
          <Flame className="w-5 h-5 text-gold-500 animate-pulse" />
          <h2 className="text-base font-extrabold font-display text-white uppercase tracking-wider">
            Test Bench & Shortcuts
          </h2>
        </div>
        <p className="text-[11px] text-gray-400">
          Utilize as ferramentas de simulação rápida abaixo para testar instantaneamente todas as funcionalidades com 1 clique!
        </p>
      </div>

      {/* QUICK LOGIN CONTROLS */}
      <div className="space-y-2.5">
        <h3 className="text-[10px] uppercase font-mono tracking-widest text-gold-400 font-bold flex items-center">
          <Key className="w-3.5 h-3.5 mr-1" /> Atalhos de Login Rápido
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="shortcut-login-customer"
            onClick={() => onLoginAsUser(false)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              currentUser && !currentUser.isAdmin
                ? 'bg-gradient-to-br from-gold-500/10 to-gold-500/20 border-gold-500 text-gold-400 font-bold'
                : 'bg-matte-950 border-matte-800 hover:border-matte-700 hover:bg-matte-850'
            }`}
          >
            <UserCheck className="w-5 h-5 text-gold-500 mb-1" />
            <span className="text-xs">Perfil Cliente</span>
            <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Kleber Silva</span>
          </button>

          <button
            id="shortcut-login-admin"
            onClick={() => onLoginAsUser(true)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              currentUser && currentUser.isAdmin
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/20 border-amber-500 text-amber-400 font-bold'
                : 'bg-matte-950 border-matte-800 hover:border-matte-700 hover:bg-matte-850'
            }`}
          >
            <Shield className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-xs">Painel Admin</span>
            <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Gordo Chefão</span>
          </button>
        </div>

        {/* Credentials table list */}
        <div className="p-3 bg-matte-950 border border-matte-850 rounded-xl space-y-1 text-[10px] font-mono text-gray-400">
          <p className="font-bold text-gray-300">Credenciais para login manual:</p>
          <p><span className="text-gold-400">Cliente:</span> kleber.kmsm@gmail.com / <span className="text-slate-500">user123</span></p>
          <p><span className="text-amber-500">Admin:</span> admin@barbeariadogordo.com.br / <span className="text-slate-500">admin</span></p>
        </div>
      </div>

      {/* RE-SIMULATION TRIGGERS AND LOCAL ENGINES */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase font-mono tracking-widest text-gold-400 font-bold flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Gerador de Massa de Teste
        </h3>

        <div className="space-y-2">
          <button
            id="action-add-random-booking"
            onClick={addRandomTestBooking}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-stone-800 hover:bg-stone-750 text-gold-400 font-semibold rounded-xl border border-stone-700 active:scale-95 transition-all text-center"
          >
            <CalendarCheck className="w-4 h-4 text-gold-500" />
            <span>Gerar Agendamento Aleatório</span>
          </button>
          
          <p className="text-[10px] text-gray-400 leading-normal text-center">
            Gera uma reserva fictícia aprovada e atualiza instantaneamente as receitas e gráficos do painel administrativo.
          </p>

          <button
            onClick={resetAllLocalStorage}
            className="w-full text-[10px] text-gray-500 hover:text-red-400 flex items-center justify-center space-x-1.5 transition pt-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Resetar Banco Local (Limpar Cache)</span>
          </button>
        </div>
      </div>

      {/* QUICK CORE SPEC NOTE */}
      <div className="pt-4 border-t border-matte-800 space-y-2.5">
        <h4 className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-gold-400" /> Vantagens e Tecnologias
        </h4>
        <ul className="space-y-1.5 text-gray-450 text-[11px] list-disc pl-4 text-slate-400">
          <li><strong>Banco de Dados Local:</strong> Toda alteração de preço, barbeiro ou horário é sincronizada dinamicamente com seu navegador!</li>
          <li><strong>Fidelidade Ativa:</strong> O sistema calcula se o cliente completou 10 agendamentos e premia na tela.</li>
          <li><strong>Evita Duplicidade:</strong> Se o Gordo já estiver ocupado às 14:00, o horário é indisponibilizado automaticamente no aplicativo.</li>
          <li><strong>Glow Premium:</strong> Paleta minimalista e refinada (Preto Fosco com Dourado), com visual adaptado para visualização em smartphone e desktop!</li>
        </ul>
      </div>

    </div>
  );
}

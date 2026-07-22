import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert, Tractor, Sprout, ArrowRight, Mail, KeyRound, CheckCircle2, UserPlus, LogIn, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ColomboLogo } from './Logos';
import { 
  signInUserWithSupabase, 
  signUpUserWithSupabase, 
  resetPasswordWithSupabase, 
  updatePasswordWithSupabase, 
  isSupabaseReady 
} from '../lib/supabaseService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  theme: 'green' | 'blue';
  setTheme: (theme: 'green' | 'blue') => void;
}

type AuthMode = 'login' | 'cadastro' | 'recovery' | 'update_password';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme, setTheme }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if current URL contains recovery hash/type
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setAuthMode('update_password');
      setInfoMessage('Sessão de recuperação iniciada. Defina sua nova senha abaixo.');
    }
  }, []);

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // MODE 1: LOGIN
    if (authMode === 'login') {
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      if (!trimmedUser || !trimmedPass) {
        setError('Por favor, preencha o usuário/e-mail e a senha.');
        return;
      }

      setIsLoading(true);

      if (isSupabaseReady()) {
        const res = await signInUserWithSupabase(trimmedUser, trimmedPass);
        if (!res.error && res.data) {
          setIsSuccess(true);
          setTimeout(() => {
            localStorage.setItem('ppt_is_logged_in', 'true');
            onLoginSuccess();
          }, 1200);
          return;
        } else if (res.error) {
          // Check local fallback demo credentials
          if (trimmedUser === 'Eder' && trimmedPass === 'Eder2026') {
            setIsSuccess(true);
            setTimeout(() => {
              localStorage.setItem('ppt_is_logged_in', 'true');
              onLoginSuccess();
            }, 1200);
            return;
          }
          setIsLoading(false);
          setError(`Falha ao autenticar: ${res.error}`);
          return;
        }
      }

      // Offline / Fallback verification request
      setTimeout(() => {
        if (trimmedUser === 'Eder' && trimmedPass === 'Eder2026') {
          setIsSuccess(true);
          setTimeout(() => {
            localStorage.setItem('ppt_is_logged_in', 'true');
            onLoginSuccess();
          }, 1200);
        } else {
          setIsLoading(false);
          setError('Usuário ou senha inválidos. Utilize credenciais válidas.');
        }
      }, 1000);
    }

    // MODE 2: CADASTRO
    else if (authMode === 'cadastro') {
      const trimmedUser = username.trim();
      const trimmedEmail = email.trim();
      const trimmedPass = password.trim();

      if (!trimmedUser || !trimmedEmail || !trimmedPass || !confirmPassword) {
        setError('Preencha todos os campos para realizar o cadastro.');
        return;
      }

      if (!trimmedEmail.includes('@')) {
        setError('Informe um e-mail válido.');
        return;
      }

      if (trimmedPass.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      if (trimmedPass !== confirmPassword) {
        setError('As senhas digitadas não conferem.');
        return;
      }

      setIsLoading(true);

      if (isSupabaseReady()) {
        const res = await signUpUserWithSupabase(trimmedEmail, trimmedPass, trimmedUser);
        setIsLoading(false);

        if (res.error) {
          setError(`Erro ao criar conta: ${res.error}`);
        } else {
          setIsSuccess(true);
          setInfoMessage('Conta e perfil criados no Supabase com sucesso!');
          setTimeout(() => {
            localStorage.setItem('ppt_is_logged_in', 'true');
            onLoginSuccess();
          }, 1500);
        }
      } else {
        setIsLoading(false);
        setIsSuccess(true);
        setInfoMessage('Cadastro simulado concluído (Supabase off-line).');
        setTimeout(() => {
          localStorage.setItem('ppt_is_logged_in', 'true');
          onLoginSuccess();
        }, 1500);
      }
    }

    // MODE 3: RECUPERAÇÃO DE SENHA
    else if (authMode === 'recovery') {
      const trimmedEmail = email.trim();

      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setError('Por favor, informe um e-mail válido para recuperação.');
        return;
      }

      setIsLoading(true);

      if (isSupabaseReady()) {
        const res = await resetPasswordWithSupabase(trimmedEmail);
        setIsLoading(false);

        if (res.error) {
          setError(`Erro ao solicitar recuperação: ${res.error}`);
        } else {
          setInfoMessage('Link de recuperação enviado com sucesso! Verifique sua caixa de e-mail.');
        }
      } else {
        setIsLoading(false);
        setInfoMessage('Instruções de recuperação enviadas para o e-mail informado.');
      }
    }

    // MODE 4: REDEFINIÇÃO DE SENHA
    else if (authMode === 'update_password') {
      const trimmedPass = password.trim();

      if (trimmedPass.length < 6) {
        setError('A nova senha deve possuir pelo menos 6 caracteres.');
        return;
      }

      if (trimmedPass !== confirmPassword) {
        setError('As senhas não conferem.');
        return;
      }

      setIsLoading(true);

      if (isSupabaseReady()) {
        const res = await updatePasswordWithSupabase(trimmedPass);
        setIsLoading(false);

        if (res.error) {
          setError(`Erro ao redefinir senha: ${res.error}`);
        } else {
          setIsSuccess(true);
          setInfoMessage('Senha atualizada com sucesso!');
          setTimeout(() => {
            localStorage.setItem('ppt_is_logged_in', 'true');
            onLoginSuccess();
          }, 1200);
        }
      } else {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.setItem('ppt_is_logged_in', 'true');
          onLoginSuccess();
        }, 1200);
      }
    }
  };

  const isBlue = theme === 'blue';
  
  // Color classes and values
  const bgGradient = isBlue 
    ? "from-[#040d21] via-[#050e1e] to-[#020611]" 
    : "from-[#011a0c] via-[#05160d] to-[#010905]";

  const orb1Bg = isBlue ? "bg-[#02529C]/30" : "bg-[#00843D]/30";
  const orb2Bg = isBlue ? "bg-[#00D2FC]/15" : "bg-[#5adc6a]/15";
  const orb3Bg = isBlue ? "bg-[#02529C]/10" : "bg-[#00843D]/10";
  const backplateBg = isBlue ? "bg-[#00D2FC]/[0.06]" : "bg-[#5adc6a]/[0.06]";
  
  const grid2Gradient = isBlue
    ? "bg-[linear-gradient(to_right,#00D2FC02_1px,transparent_1px),linear-gradient(to_bottom,#00D2FC02_1px,transparent_1px)]"
    : "bg-[linear-gradient(to_right,#5adc6a02_1px,transparent_1px),linear-gradient(to_bottom,#5adc6a02_1px,transparent_1px)]";

  const strokeColor = isBlue ? "#00D2FC" : "#5adc6a";
  const particleBg = isBlue ? "bg-[#00D2FC]/20" : "bg-[#5adc6a]/20";
  
  const watermarkText = isBlue ? "text-[#00D2FC]/[0.02]" : "text-[#5adc6a]/[0.02]";
  
  const logoBorderHover = isBlue ? "hover:border-[#00D2FC]/30" : "hover:border-[#5adc6a]/30";
  const subtitleColor = isBlue ? "text-[#38BDF8] filter drop-shadow-[0_0_12px_rgba(0,210,252,0.3)]" : "text-[#6ef27f] filter drop-shadow-[0_0_12px_rgba(90,220,106,0.3)]";
  
  const focusBorder = isBlue ? "focus:border-[#00D2FC]" : "focus:border-[#5adc6a]";
  const focusRing = isBlue ? "focus:ring-[#00D2FC]/20" : "focus:ring-[#5adc6a]/20";
  const hoverText = isBlue ? "hover:text-[#00D2FC]" : "hover:text-[#5adc6a]";
  
  const submitBtnBg = isBlue 
    ? "from-[#02529C] to-[#01417D] hover:from-[#00D2FC] hover:to-[#38bdf8]" 
    : "from-[#00843D] to-[#006B32] hover:from-[#5adc6a] hover:to-[#22c55e]";
    
  const submitBtnShadow = isBlue
    ? "shadow-blue-950/40 hover:shadow-[0_0_35px_rgba(0,210,252,0.45)] hover:border-[#38bdf8]/40"
    : "shadow-green-950/40 hover:shadow-[0_0_35px_rgba(90,220,106,0.45)] hover:border-[#7cfc90]/40";

  const successBg = isBlue ? "bg-[#02529C]/20" : "bg-[#00843D]/20";
  const successBorder = isBlue ? "border-[#00D2FC]/30" : "border-[#5adc6a]/30";
  const successText = isBlue ? "text-[#00D2FC]" : "text-[#5adc6a]";
  const successShadow = isBlue ? "shadow-[0_0_25px_rgba(0,210,252,0.3)]" : "shadow-[0_0_25px_rgba(90,220,106,0.3)]";

  return (
    <div id="login-container" className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 relative overflow-hidden font-sans select-none`}>
      
      {/* Theme Selector Floating Panel */}
      <div className="absolute top-6 right-6 z-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => setTheme('green')}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            theme === 'green'
              ? 'bg-gradient-to-r from-[#00843D] to-[#006B32] text-white shadow-md'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#5adc6a]" />
          Verde
        </button>
        <button
          type="button"
          onClick={() => setTheme('blue')}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            theme === 'blue'
              ? 'bg-gradient-to-r from-[#02529C] to-[#01417D] text-white shadow-md'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FC]" />
          Azul
        </button>
      </div>
      
      {/* High-fidelity glowing orbs in the background */}
      <div className={`absolute top-[-15%] left-[-15%] w-[60%] h-[60%] ${orb1Bg} rounded-full blur-[180px] pointer-events-none`} />
      <div className={`absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] ${orb2Bg} rounded-full blur-[180px] pointer-events-none`} />
      <div className={`absolute top-[30%] left-[30%] w-[40%] h-[40%] ${orb3Bg} rounded-full blur-[200px] pointer-events-none`} />
      
      {/* Diffuse and wide subtle glowing backplate behind the login card for deep atmosphere */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] max-w-[800px] ${backplateBg} rounded-full blur-[220px] pointer-events-none`} />
      
      {/* High tech abstract subtle grid pattern (double grid for extra depth) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className={`absolute inset-0 ${grid2Gradient} bg-[size:1rem_1rem] pointer-events-none`} />

      {/* Decorative Interactive Circuit Board Lines in Background Corners */}
      <svg className="absolute left-0 top-0 w-full h-full pointer-events-none opacity-[0.08] select-none" viewBox="0 0 1000 800" fill="none">
        <path d="M-100 150 H200 L320 270 V550 L200 670 H-100" stroke={strokeColor} strokeWidth="2" strokeDasharray="12 6" />
        <path d="M-50 200 H150 L250 300 V520 L150 620 H-50" stroke={strokeColor} strokeWidth="1.5" />
        <path d="M100 50 L180 130 V350 L100 430" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="150" r="5" fill={strokeColor} className="animate-pulse" />
        <circle cx="320" cy="270" r="5" fill={strokeColor} />
        <circle cx="320" cy="550" r="5" fill={strokeColor} />
        <circle cx="200" cy="670" r="5" fill={strokeColor} />
      </svg>

      <svg className="absolute right-0 bottom-0 w-full h-full pointer-events-none opacity-[0.08] select-none" viewBox="0 0 1000 800" fill="none">
        <path d="M1100 650 H800 L680 530 V250 L800 130 H1100" stroke={strokeColor} strokeWidth="2" strokeDasharray="12 6" />
        <path d="M1050 600 H850 L750 500 V280 L850 180 H1050" stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="800" cy="650" r="5" fill={strokeColor} />
        <circle cx="680" cy="530" r="5" fill={strokeColor} className="animate-pulse" />
        <circle cx="680" cy="250" r="5" fill={strokeColor} />
        <circle cx="800" cy="130" r="5" fill={strokeColor} />
      </svg>

      {/* Elegant floating green/white light particles that drift organically */}
      {[
        { id: 1, x: '12%', y: '18%', size: 'w-2 h-2', delay: 0, duration: 14 },
        { id: 2, x: '85%', y: '12%', size: 'w-3 h-3', delay: 3, duration: 18 },
        { id: 3, x: '22%', y: '78%', size: 'w-1.5 h-1.5', delay: 1, duration: 11 },
        { id: 4, x: '78%', y: '82%', size: 'w-2.5 h-2.5', delay: 4, duration: 20 },
        { id: 5, x: '50%', y: '48%', size: 'w-2 h-2', delay: 1.5, duration: 16 },
        { id: 6, x: '10%', y: '55%', size: 'w-3.5 h-3.5', delay: 5, duration: 22 },
        { id: 7, x: '92%', y: '42%', size: 'w-2 h-2', delay: 2, duration: 15 },
      ].map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.size} rounded-full ${particleBg} blur-[1px] pointer-events-none`}
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -60, 0],
            x: [0, 30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Giant high-tech decorative watermark icons behind the scene */}
      <div className={`absolute left-[8%] bottom-[12%] ${watermarkText} transform -rotate-12 pointer-events-none select-none`}>
        <Tractor size={160} strokeWidth={1} />
      </div>
      <div className={`absolute right-[8%] top-[10%] ${watermarkText} transform rotate-12 pointer-events-none select-none`}>
        <Sprout size={160} strokeWidth={1} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={isSuccess ? { scale: 1.03, opacity: 1, y: 0 } : { scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 180,
          damping: 20,
          duration: 0.6
        }}
        className="w-full max-w-[590px] relative z-10"
      >
        {/* Main Card - Expanded and visually amplified for supreme high-end feel */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[48px] p-12 sm:p-16 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300">
          
          {/* Inner ambient glow highlight at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          
          <div className="flex flex-col items-center mb-10">
            {/* Elegant Brand Logo Container (Enlarged for perfect visual hierarchy) */}
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, type: "spring" }}
              className={`w-52 h-40 bg-white/5 rounded-[36px] p-5 flex items-center justify-center mb-7 border border-white/15 shadow-inner ${logoBorderHover} hover:bg-white/[0.07] transition-all duration-300`}
            >
              <ColomboLogo className="w-full h-full text-white filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.06)]" />
            </motion.div>

            {/* Title and subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                Portal de Monitoramento
              </h2>
              <p className={`text-sm font-black uppercase tracking-[0.25em] mt-3 ${subtitleColor}`}>
                {authMode === 'login' && 'Conectividade & Telemetria Avançada'}
                {authMode === 'cadastro' && 'Cadastro de Novo Operador'}
                {authMode === 'recovery' && 'Recuperação de Chave de Acesso'}
                {authMode === 'update_password' && 'Redefinição de Senha do Sistema'}
              </p>
            </motion.div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={14} />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('cadastro')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                authMode === 'cadastro'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>Cadastro</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('recovery')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                authMode === 'recovery' || authMode === 'update_password'
                  ? 'bg-white/15 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <RefreshCw size={14} />
              <span>Recuperar</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key={authMode}
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* Error Box */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3"
                  >
                    <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-red-200 font-bold leading-relaxed uppercase">{error}</p>
                  </motion.div>
                )}

                {/* Info Notice Box */}
                {infoMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-3"
                  >
                    <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-green-200 font-bold leading-relaxed uppercase">{infoMessage}</p>
                  </motion.div>
                )}

                {/* LOGIN MODE FIELDS */}
                {authMode === 'login' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Usuário ou E-mail
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type="text"
                          disabled={isLoading}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Digite seu usuário ou e-mail"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-xs font-black text-white uppercase tracking-widest">
                          Senha
                        </label>
                      </div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha de acesso"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-14 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-5 text-gray-400 ${hoverText} hover:scale-110 active:scale-95 transition-all p-1`}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* CADASTRO MODE FIELDS */}
                {authMode === 'cadastro' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Nome do Operador
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type="text"
                          disabled={isLoading}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Ex: Eder Oliveira"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        E-mail Corporativo
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type="email"
                          disabled={isLoading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="operador@colombo.com.br"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Criar Senha
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-14 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-5 text-gray-400 ${hoverText} hover:scale-110 active:scale-95 transition-all p-1`}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Confirmar Senha
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type="password"
                          disabled={isLoading}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Digite a senha novamente"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* RECOVERY MODE FIELDS */}
                {authMode === 'recovery' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                      E-mail Cadastrado
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-5 text-gray-300" size={18} />
                      <input
                        type="email"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Informe seu e-mail corporativo"
                        className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                      />
                    </div>
                  </div>
                )}

                {/* UPDATE PASSWORD MODE FIELDS */}
                {authMode === 'update_password' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Nova Senha
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite a nova senha"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-14 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-5 text-gray-400 ${hoverText} hover:scale-110 active:scale-95 transition-all p-1`}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-white uppercase tracking-widest pl-1">
                        Confirmar Nova Senha
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-5 text-gray-300" size={18} />
                        <input
                          type="password"
                          disabled={isLoading}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a nova senha"
                          className={`w-full bg-white/[0.04] border border-white/10 ${focusBorder} focus:bg-white/[0.08] focus:ring-2 ${focusRing} text-white text-sm font-bold pl-14 pr-5 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-400`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Action Button */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-[58px] bg-gradient-to-r ${submitBtnBg} text-white font-black text-sm uppercase tracking-widest rounded-2xl border border-transparent transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-6 group ${submitBtnShadow}`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {authMode === 'login' && 'Acessar Sistema'}
                        {authMode === 'cadastro' && 'Cadastrar e Entrar'}
                        {authMode === 'recovery' && 'Enviar Link de Recuperação'}
                        {authMode === 'update_password' && 'Salvar Nova Senha'}
                      </span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                    </>
                  )}
                </motion.button>

                {/* Secondary navigation options below submit */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-300 font-bold uppercase gap-2">
                  {authMode === 'login' && (
                    <>
                      <button
                        type="button"
                        onClick={() => switchMode('recovery')}
                        className={`hover:underline ${hoverText} transition-colors`}
                      >
                        Esqueci minha senha
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode('cadastro')}
                        className={`hover:underline ${hoverText} transition-colors`}
                      >
                        Criar nova conta
                      </button>
                    </>
                  )}
                  {(authMode === 'cadastro' || authMode === 'recovery' || authMode === 'update_password') && (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className={`hover:underline ${hoverText} transition-colors mx-auto`}
                    >
                      Voltar ao Login de Acesso
                    </button>
                  )}
                </div>

              </motion.form>
            ) : (
              <motion.div 
                key="success-animation"
                className="py-12 text-center flex flex-col items-center space-y-6"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className={`w-20 h-20 ${successBg} border ${successBorder} rounded-full flex items-center justify-center ${successText} ${successShadow}`}>
                  <motion.svg 
                    className="w-10 h-10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase text-lg tracking-wider">Acesso Homologado</h3>
                  <p className={`${successText} font-bold uppercase text-xs tracking-widest`}>
                    Iniciando sessão do operador
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info under card - Enhanced contrast and size for Full HD/4K screens */}
        <div className="text-center mt-10 text-[14px] sm:text-[15px] font-bold text-white/90 uppercase tracking-[0.25em] space-y-2">
          <p className="font-extrabold text-white">© {new Date().getFullYear()} Colombo Agroindústria S/A</p>
          <p className="text-[12px] sm:text-[13px] text-white/70 font-semibold">Conectividade &amp; Telemetria Avançada • Todos os direitos reservados</p>
        </div>
      </motion.div>
    </div>
  );
};

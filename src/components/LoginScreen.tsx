import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert, Tractor, Sprout, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ColomboLogo } from './Logos';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  theme: 'green' | 'blue';
  setTheme: (theme: 'green' | 'blue') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, theme, setTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    // Simulate a professional verification request
    setTimeout(() => {
      // The credentials must be exactly: usuario Eder and senha Eder2026
      if (trimmedUser === 'Eder' && trimmedPass === 'Eder2026') {
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.setItem('ppt_is_logged_in', 'true');
          onLoginSuccess();
        }, 1200);
      } else {
        setIsLoading(false);
        setError('Usuário ou senha inválidos. Utilize as credenciais corretas.');
      }
    }, 1500);
  };

  return (
    <div id="login-container" className="min-h-screen w-full bg-gradient-to-br from-[#011a0c] via-[#05160d] to-[#010905] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
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
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#00843D]/30 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#5adc6a]/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-[#00843D]/10 rounded-full blur-[200px] pointer-events-none" />
      
      {/* Diffuse and wide subtle glowing backplate behind the login card for deep atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] max-w-[800px] bg-[#5adc6a]/[0.06] rounded-full blur-[220px] pointer-events-none" />
      
      {/* High tech abstract subtle grid pattern (double grid for extra depth) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#5adc6a02_1px,transparent_1px),linear-gradient(to_bottom,#5adc6a02_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />

      {/* Decorative Interactive Circuit Board Lines in Background Corners */}
      <svg className="absolute left-0 top-0 w-full h-full pointer-events-none opacity-[0.08] select-none" viewBox="0 0 1000 800" fill="none">
        <path d="M-100 150 H200 L320 270 V550 L200 670 H-100" stroke="#5adc6a" strokeWidth="2" strokeDasharray="12 6" />
        <path d="M-50 200 H150 L250 300 V520 L150 620 H-50" stroke="#5adc6a" strokeWidth="1.5" />
        <path d="M100 50 L180 130 V350 L100 430" stroke="#5adc6a" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="150" r="5" fill="#5adc6a" className="animate-pulse" />
        <circle cx="320" cy="270" r="5" fill="#5adc6a" />
        <circle cx="320" cy="550" r="5" fill="#5adc6a" />
        <circle cx="200" cy="670" r="5" fill="#5adc6a" />
      </svg>

      <svg className="absolute right-0 bottom-0 w-full h-full pointer-events-none opacity-[0.08] select-none" viewBox="0 0 1000 800" fill="none">
        <path d="M1100 650 H800 L680 530 V250 L800 130 H1100" stroke="#5adc6a" strokeWidth="2" strokeDasharray="12 6" />
        <path d="M1050 600 H850 L750 500 V280 L850 180 H1050" stroke="#5adc6a" strokeWidth="1.5" />
        <circle cx="800" cy="650" r="5" fill="#5adc6a" />
        <circle cx="680" cy="530" r="5" fill="#5adc6a" className="animate-pulse" />
        <circle cx="680" cy="250" r="5" fill="#5adc6a" />
        <circle cx="800" cy="130" r="5" fill="#5adc6a" />
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
          className={`absolute ${p.size} rounded-full bg-[#5adc6a]/20 blur-[1px] pointer-events-none`}
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
      <div className="absolute left-[8%] bottom-[12%] text-[#5adc6a]/[0.02] transform -rotate-12 pointer-events-none select-none">
        <Tractor size={160} strokeWidth={1} />
      </div>
      <div className="absolute right-[8%] top-[10%] text-[#5adc6a]/[0.02] transform rotate-12 pointer-events-none select-none">
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
              className="w-52 h-40 bg-white/5 rounded-[36px] p-5 flex items-center justify-center mb-7 border border-white/15 shadow-inner hover:border-[#5adc6a]/30 hover:bg-white/[0.07] transition-all duration-300"
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
              <p className="text-[#6ef27f] text-sm font-black uppercase tracking-[0.25em] mt-3 filter drop-shadow-[0_0_12px_rgba(90,220,106,0.3)]">
                Conectividade &amp; Telemetria Avançada
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="login-form"
                onSubmit={handleSubmit}
                className="space-y-7"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Error Box */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
                  >
                    <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-200 font-bold leading-relaxed uppercase">{error}</p>
                  </motion.div>
                )}

                {/* Input Username */}
                <div className="space-y-3">
                  <label className="block text-sm font-black text-white uppercase tracking-widest pl-1">
                    Usuário
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-6 text-gray-300" size={20} />
                    <input
                      type="text"
                      disabled={isLoading}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Usuário"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#5adc6a] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#5adc6a]/20 text-white text-base font-bold pl-16 pr-6 py-5 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-sm font-black text-white uppercase tracking-widest">
                      Chave de Segurança
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-6 text-gray-300" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha do sistema"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#5adc6a] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#5adc6a]/20 text-white text-base font-bold pl-16 pr-16 py-5 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 text-gray-400 hover:text-[#5adc6a] hover:scale-110 active:scale-95 transition-all p-1"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button - High Taller, Glow Effects, Beautiful Interaction */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[64px] bg-gradient-to-r from-[#00843D] to-[#006B32] hover:from-[#5adc6a] hover:to-[#22c55e] text-white font-black text-base uppercase tracking-widest rounded-2xl shadow-2xl shadow-green-950/40 hover:shadow-[0_0_35px_rgba(90,220,106,0.45)] hover:border-[#7cfc90]/40 border border-transparent transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-5 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Homologando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Acessar Sistema</span>
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                    </>
                  )}
                </motion.button>

              </motion.form>
            ) : (
              <motion.div 
                key="success-animation"
                className="py-14 text-center flex flex-col items-center space-y-6"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="w-20 h-20 bg-[#00843D]/20 border border-[#5adc6a]/30 rounded-full flex items-center justify-center text-[#5adc6a] shadow-[0_0_25px_rgba(90,220,106,0.3)]">
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
                  <h3 className="text-white font-black uppercase text-lg tracking-wider">Acesso Permitido</h3>
                  <p className="text-[#5adc6a] font-bold uppercase text-xs tracking-widest">Iniciando sessão do operador Eder</p>
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

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldAlert, Tractor, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ColomboLogo } from './Logos';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
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

  const fillDefaultCredentials = () => {
    setUsername('Eder');
    setPassword('Eder2026');
    setError(null);
  };

  return (
    <div id="login-container" className="min-h-screen w-full bg-gradient-to-br from-[#022c15] via-[#091e13] to-[#01140a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Sophisticated glowing orbs in the background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00843D]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5adc6a]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* High tech abstract subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[36px] p-8 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden">
          
          {/* Inner ambient light highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex flex-col items-center mb-8">
            {/* Elegant Brand Logo Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-36 h-28 bg-white/5 rounded-3xl p-3 flex items-center justify-center mb-5 border border-white/10 shadow-inner"
            >
              <ColomboLogo className="w-full h-full text-white" />
            </motion.div>

            {/* Title and subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                Portal de Monitoramento
              </h2>
              <p className="text-[#5adc6a] text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                Conectividade &amp; Telemetria Avançada
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="login-form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Error Box */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3"
                  >
                    <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-200 font-semibold leading-relaxed uppercase">{error}</p>
                  </motion.div>
                )}

                {/* Input Username */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest pl-1">
                    Identificação de Usuário
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      disabled={isLoading}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nome do operador"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#5adc6a] focus:bg-white/[0.08] text-white text-xs font-bold pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Chave de Segurança
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4.5 text-gray-400" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha do sistema"
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-[#5adc6a] focus:bg-white/[0.08] text-white text-xs font-bold pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#00843D] to-[#006B32] hover:from-[#5adc6a] hover:to-[#00843D] text-white font-black text-xs uppercase tracking-widest py-4.5 px-6 rounded-2xl shadow-xl shadow-green-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Homologando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Acessar Sistema</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Demo credentials helper (Professional layout) */}
                <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                    Centro de Operações Agricola
                  </p>
                  <button
                    type="button"
                    onClick={fillDefaultCredentials}
                    className="px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl text-[9px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={12} className="text-[#5adc6a]" />
                    Preencher Credenciais Padrão
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success-animation"
                className="py-10 text-center flex flex-col items-center space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 bg-[#00843D]/20 border border-[#5adc6a]/30 rounded-full flex items-center justify-center text-[#5adc6a] shadow-lg shadow-[#00843D]/10">
                  <motion.svg 
                    className="w-8 h-8" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-black uppercase text-base tracking-wider">Acesso Permitido</h3>
                  <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Iniciando sessão do operador Eder</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info under card */}
        <div className="text-center mt-6 text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] space-y-1">
          <p>© {new Date().getFullYear()} Colombo Agroindústria S/A</p>
          <p>Conectividade &amp; Telemetria Avançada • Todos os direitos reservados</p>
        </div>
      </motion.div>
    </div>
  );
};

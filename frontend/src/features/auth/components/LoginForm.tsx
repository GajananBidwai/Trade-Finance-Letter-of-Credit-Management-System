import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="glass-panel rounded-xl p-container-padding shadow-2xl">
      <div className="mb-section-gap">
        <h2 className="font-headline-md text-headline-md text-white">Welcome Back</h2>
        <p className="font-body-md text-on-surface-variant">Enter your credentials to access the global operations terminal.</p>
      </div>
      
      {loginMutation.isError && (
        <div className="mb-4 p-3 rounded bg-error-container border border-error/50">
          <p className="font-body-md text-on-error-container text-sm">
            {loginMutation.error instanceof Error ? loginMutation.error.message : 'Invalid credentials. Please try again.'}
          </p>
        </div>
      )}

      <form className="space-y-gutter" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="space-y-compact-gap">
          <label className="font-label-md text-label-md text-outline" htmlFor="email">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest/50 border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md" 
              id="email" 
              name="email" 
              placeholder="officer@lumina.trade" 
              required 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div className="space-y-compact-gap">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-outline" htmlFor="password">Password</label>
            <a className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors" href="#">Forgot password?</a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
            </div>
            <input 
              className="block w-full pl-10 pr-10 py-3 bg-surface-container-lowest/50 border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md" 
              id="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
            />
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary" 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        
        {/* Remember Me */}
        <div className="flex items-center space-x-2 py-unit">
          <input className="w-4 h-4 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface" id="remember" name="remember" type="checkbox" />
          <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this device for 30 days</label>
        </div>
        
        {/* Action Button */}
        <button 
          className="w-full py-4 bg-primary text-on-primary font-title-lg text-title-lg rounded-lg shadow-lg hover:shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed" 
          type="submit"
          disabled={loginMutation.isPending}
        >
          <span>{loginMutation.isPending ? 'Authenticating...' : 'Sign In'}</span>
          {!loginMutation.isPending && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </form>
      
      {/* SSO / Alternative Auth */}
      <div className="mt-section-gap pt-gutter border-t border-outline-variant/10">
        <p className="text-center font-label-md text-label-md text-outline mb-gutter uppercase tracking-widest">Enterprise Auth</p>
        <div className="grid grid-cols-2 gap-gutter">
          <button className="flex items-center justify-center space-x-2 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface">fingerprint</span>
            <span className="font-label-md text-on-surface">Biometrics</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface">key</span>
            <span className="font-label-md text-on-surface">SSO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

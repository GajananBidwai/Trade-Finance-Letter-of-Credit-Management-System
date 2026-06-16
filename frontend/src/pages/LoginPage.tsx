import React from 'react';
import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="bg-void text-on-surface font-body-md min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative Animated Background Element */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-[120px]"></div>
      </div>
      
      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-gutter">
        {/* Branding Anchor */}
        <div className="text-center mb-section-gap">
          <div className="inline-flex items-center justify-center mb-unit p-3 rounded-xl bg-primary-container/20 border border-primary/30 animate-float">
            <span className="material-symbols-outlined text-primary text-[32px]">hub</span>
          </div>
          <h1 className="font-display-lg text-display-lg tracking-tight text-white">Lumina</h1>
          <p className="font-label-md text-label-md text-primary tracking-widest uppercase">Trade Finance AI</p>
        </div>
        
        {/* Form component */}
        <LoginForm />
        
        {/* Security Footer */}
        <footer className="mt-container-padding flex flex-col items-center space-y-unit">
          <div className="flex items-center space-x-unit text-outline">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-label-md text-label-md">Military Grade AES-256 Encryption Active</span>
          </div>
          <p className="font-body-md text-[12px] text-on-surface-variant/50">© 2024 Lumina Trade Finance. All systems monitored.</p>
        </footer>
      </main>
      
      {/* Side Graphic (Only visible on wide screens) */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-1/2 overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          {/* Background Image */}
          <img 
            className="w-full h-full object-cover" 
            alt="Global network mesh" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSzR36B0eAyphTIwOFH-ydPdhKuyEPJ7Y05zjw07F330DfgHfkQNRtLF2dvzOmHCy6fMsIvheZLLupOpJXyaedHwd_w3M7ig4JJs2yH257v-6H49473Jx6CxmIF05INnyyE3Mlwnzi3A38zH-DTi3cJX9z5uRniD3kcNQneumvwVJlj1G0r0gwcQf_PbMas2fhHKLPhd2AtgT4j3zkLlz3giRGZZ0uA_CLeBDFPQJj_4Q5NW2Q81sZNYp8tdzVEJz2poAXcRvBxm0" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent"></div>
        
        {/* Contextual Insight (Right Side) */}
        <div className="absolute bottom-section-gap right-section-gap max-w-[320px] glass-panel p-container-padding rounded-xl animate-float">
          <div className="flex items-center space-x-unit mb-unit">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="font-label-md text-tertiary">Real-time Intelligence</span>
          </div>
          <p className="font-body-lg text-body-lg text-white mb-gutter">"AI Analyst: High volatility detected in Trans-Pacific trade lanes. Review active Letter of Credit clauses for Force Majeure compliance."</p>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

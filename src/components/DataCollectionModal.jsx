import React, { useState } from 'react';
import { FiX, FiGift } from 'react-icons/fi';

export const DataCollectionModal = ({ onSubmit, onSkip }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && email.trim()) {
      onSubmit({ username, email });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white border-4 border-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full transform animate-in zoom-in-95 duration-300 relative">
        
        <button 
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-full transition-colors"
        >
          <FiX className="w-5 h-5 text-slate-900" />
        </button>

        <div className="w-16 h-16 bg-emerald-100 rounded-2xl border-4 border-slate-900 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transform -rotate-6">
          <FiGift className="w-8 h-8 text-emerald-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Claim Your Reward!</h2>
        <p className="text-slate-600 font-medium mb-6 text-sm">
          Enter your details to receive a special voucher after completing all 6 levels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-900 px-4 py-3 rounded-xl outline-none transition-colors font-medium text-slate-900"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-900 px-4 py-3 rounded-xl outline-none transition-colors font-medium text-slate-900"
              placeholder="your@email.com"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-400 border-4 border-slate-900 text-slate-900 font-black transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none flex items-center justify-center gap-2"
            >
              Submit & Play
            </button>
            <button 
              type="button"
              onClick={onSkip}
              className="w-full py-3 rounded-xl bg-slate-100 border-4 border-slate-900 text-slate-600 font-bold transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none"
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

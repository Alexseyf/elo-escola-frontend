"use client";

import React from "react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-linear-to-br from-neutral-200 to-neutral-300 z-50">
      <div className="relative flex flex-col items-center">
        <div className="animate-pulse duration-2000">
          <img src="/logo.png" alt="Elo Escola" className="h-24 w-auto drop-shadow-md" />
        </div>
        
        <div className="mt-8 flex space-x-2">
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
        </div>
        
        <p className="mt-4 text-neutral-500 font-medium tracking-widest text-xs uppercase animate-pulse">
          Carregando
        </p>
      </div>
    </div>
  );
}

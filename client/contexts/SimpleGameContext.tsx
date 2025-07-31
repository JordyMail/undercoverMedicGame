import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleGameContextState {
  error: string | null;
  isConnected: boolean;
}

const SimpleGameContext = createContext<SimpleGameContextState | null>(null);

export function SimpleGameProvider({ children }: { children: React.ReactNode }) {
  const [state] = useState({
    error: null as string | null,
    isConnected: false,
  });

  const navigate = useNavigate();

  const contextValue: SimpleGameContextState = {
    ...state,
  };

  return (
    <SimpleGameContext.Provider value={contextValue}>
      {children}
    </SimpleGameContext.Provider>
  );
}

export function useSimpleGame() {
  const context = useContext(SimpleGameContext);
  if (!context) {
    throw new Error('useSimpleGame must be used within a SimpleGameProvider');
  }
  return context;
}

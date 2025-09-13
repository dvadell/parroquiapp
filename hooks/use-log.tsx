import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'QR_SCAN' | 'POST_RESULT';
  message: string;
  data?: unknown;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (payload: Omit<LogEntry, 'timestamp'>) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (logEntry: Omit<LogEntry, 'timestamp'>) => {
    setLogs((prevLogs) => [
      {
        ...logEntry,
        timestamp: new Date().toISOString(),
      },
      ...prevLogs,
    ]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};

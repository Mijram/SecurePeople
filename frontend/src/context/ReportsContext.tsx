import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

export interface Report {
  id: string;
  user_id: string;
  description: string;
  category: string;
  danger_level: number;
  latitude: number;
  longitude: number;
  address?: string;
  status: string;
  created_at: string;
  updated_at: string;
  nickname: string;
  avatar_url?: string;
}

export interface CreateReportData {
  description: string;
  category: string;
  danger_level: number;
  latitude: number;
  longitude: number;
  address?: string;
}

interface ReportsContextType {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  createReport: (data: CreateReportData) => Promise<Report>;
  getReportById: (id: string) => Report | undefined;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/reports');
      setReports(response.data.reports);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar reportes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Subscribe to real-time updates via Socket.IO
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('new_report', (newReport: Report) => {
      setReports(prev => {
        // Avoid duplicates
        const exists = prev.find(r => r.id === newReport.id);
        if (exists) return prev;
        return [newReport, ...prev];
      });
    });

    return () => {
      socket.off('new_report');
    };
  }, []);

  const createReport = async (data: CreateReportData): Promise<Report> => {
    const response = await api.post('/reports', data);
    const newReport: Report = response.data.report;

    // Optimistically add to local state (Socket.IO will also trigger this)
    setReports(prev => {
      const exists = prev.find(r => r.id === newReport.id);
      if (exists) return prev;
      return [newReport, ...prev];
    });

    return newReport;
  };

  const getReportById = (id: string): Report | undefined => {
    return reports.find(r => r.id === id);
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        isLoading,
        error,
        fetchReports,
        createReport,
        getReportById,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextType {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}

import { useQuery } from '@tanstack/react-query';
import { api, PaginatedResponse } from '@/lib/api';

export interface Submission {
  id:         number;
  name:       string;
  email:      string;
  phone:      string;
  service:    string;
  message:    string;
  consent:    boolean;
  created_at: string;
  updated_at: string;
}

const KEYS = {
  all:  ['submissions'] as const,
  list: (p?: object) => [...KEYS.all, 'list', p] as const,
};

export function useSubmissions(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn:  () => api.get<PaginatedResponse<Submission>>('/api/submissions/list/', params),
  });
}

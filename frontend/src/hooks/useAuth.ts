import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PaginatedResponse } from '@/lib/api';

export interface AuthUser {
  id:          number;
  username:    string;
  email:       string;
  is_active:   boolean;
  is_staff:    boolean;
  is_superuser: boolean;
  last_login:  string | null;
  date_joined: string;
}

export interface LoginEvent {
  id:        number;
  username:  string;
  timestamp: string;
  ip_address: string | null;
}

export interface ChangeLogEntry {
  id:          number;
  username:    string;
  action:      string;
  object_repr: string;
  action_time: string;
}

const ME_KEY = ['auth', 'me'] as const;

export const primeCsrf = () => api.get('/api/accounts/csrf/');

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn:  () => api.get<AuthUser>('/api/accounts/me/'),
    retry:    false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { username: string; password: string }) => api.post<AuthUser>('/api/accounts/login/', data),
    onSuccess:  (user) => qc.setQueryData(ME_KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/accounts/logout/'),
    onSuccess:  () => qc.clear(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      api.post<{ detail: string }>('/api/accounts/change-password/', data),
  });
}

export interface UserPayload {
  username:    string;
  email?:      string;
  password?:   string;
  is_active:   boolean;
  is_staff:    boolean;
  is_superuser: boolean;
}

const USERS_KEY = ['auth', 'users'] as const;

export function useAdminUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn:  () => api.get<PaginatedResponse<AuthUser>>('/api/accounts/users/'),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserPayload) => api.post<AuthUser>('/api/accounts/users/', data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserPayload>) => api.patch<AuthUser>(`/api/accounts/users/${id}/`, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/accounts/users/${id}/`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useLoginHistory() {
  return useQuery({
    queryKey: ['auth', 'login-history'],
    queryFn:  () => api.get<PaginatedResponse<LoginEvent>>('/api/accounts/login-history/'),
  });
}

export function useChangeLog() {
  return useQuery({
    queryKey: ['auth', 'change-log'],
    queryFn:  () => api.get<PaginatedResponse<ChangeLogEntry>>('/api/accounts/change-log/'),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PaginatedResponse } from '@/lib/api';

export type CertificationStatus = 'Aprovado' | 'Reprovado' | 'Em Andamento';

export interface Modulo {
  id:   number;
  nome: string;
}

export interface Certification {
  id:              number;
  nome_completo:   string;
  documento:       string;
  foto:            string | null;
  curso:           string;
  duracao:         string;
  carga_horaria:   string;
  data_conclusao:  string;
  ano:             string;
  codigo:          string;
  status:          CertificationStatus;
  declaracao:      string | null;
  descricao:       string | null;
  unique_link:     string | null;
  link_completo:   string | null;
  modulos:         Modulo[];
  created_at:      string;
  updated_at:      string;
}

export interface CertificationPayload {
  nome_completo:  string;
  documento:      string;
  curso:          string;
  duracao:        string;
  carga_horaria:  string;
  data_conclusao: string;
  ano:            string;
  codigo:         string;
  status:         CertificationStatus;
  declaracao?:    string;
  descricao?:     string;
  unique_link?:   string;
  foto?:          File | null;
}

function toRequestBody(data: Partial<CertificationPayload>): FormData | Partial<CertificationPayload> {
  if (!(data.foto instanceof File)) {
    const { foto, ...rest } = data;
    return rest;
  }
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value as string | Blob);
  });
  return formData;
}

const KEYS = {
  all:    ['certifications'] as const,
  list:   (p?: object) => [...KEYS.all, 'list', p] as const,
  detail: (id: number) => [...KEYS.all, id] as const,
};

export function useCertifications(params?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn:  () => api.get<PaginatedResponse<Certification>>('/api/certifications/', params),
  });
}

export function useCertification(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<Certification>(`/api/certifications/${id}/`),
    enabled:  !!id,
  });
}

export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CertificationPayload) => api.post<Certification>('/api/certifications/', toRequestBody(data)),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCertification(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CertificationPayload>) => api.patch<Certification>(`/api/certifications/${id}/`, toRequestBody(data)),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/certifications/${id}/`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

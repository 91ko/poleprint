import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface MainTableRow {
  id: number;
  date: string;
  clientName: string;
  remarks: string;
  totalQty: number;
  unitPrice: number;
  amount: number;
  poleType: number;
  constructor: string;
  website: string;
  mgmt: string;
  mgmt1: string;
  mgmt2: string;
}

export function useMainTableList(search?: string) {
  return useQuery({
    queryKey: ['main-table', search],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      return api.get<MainTableRow[]>(`/main-table${params}`);
    },
  });
}

export function useCreateMainTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { poleType: number; clientName?: string }) =>
      api.post<MainTableRow>('/main-table', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['main-table'] }),
  });
}

export function useUpdateMainTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.put<MainTableRow>(`/main-table/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['main-table'] }),
  });
}

export function useDeleteMainTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ success: boolean }>(`/main-table/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['main-table'] }),
  });
}

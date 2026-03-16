import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDetailList(table: string, managementId: number) {
  return useQuery({
    queryKey: ['detail', table, managementId],
    queryFn: () => api.get<Record<string, any>[]>(`/detail/${table}/${managementId}`),
    enabled: !!table && !!managementId,
  });
}

export function useCreateDetail(table: string, managementId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      api.post<Record<string, any>>(`/detail/${table}`, {
        management_id: managementId,
        ...data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['detail', table, managementId] });
      qc.invalidateQueries({ queryKey: ['main-table'] });
    },
  });
}

export function useUpdateDetail(table: string, managementId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rowid, ...data }: { rowid: number } & Record<string, any>) =>
      api.put<Record<string, any>>(`/detail/${table}/${rowid}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['detail', table, managementId] });
    },
  });
}

export function useDeleteDetail(table: string, managementId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowid: number) =>
      api.delete<{ success: boolean }>(`/detail/${table}/${rowid}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['detail', table, managementId] });
      qc.invalidateQueries({ queryKey: ['main-table'] });
    },
  });
}

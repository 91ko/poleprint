import { PoleType } from '../constants/pole-type';

export interface MainTableRow {
  id: number;
  date: string;
  clientName: string;
  remarks: string;
  totalQty: number;
  unitPrice: number;
  amount: number;
  poleType: PoleType;
  constructor: string;
  website: string;
  mgmt: string;
  mgmt1: string;
  mgmt2: string;
}

export type MainTableCreate = Omit<MainTableRow, 'id' | 'totalQty'>;
export type MainTableUpdate = Partial<MainTableCreate>;

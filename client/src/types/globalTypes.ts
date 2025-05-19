import { MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import { ColumnFilter } from '@tanstack/table-core';

export interface AppGridGetDataAPIProps {
  columnFilters: ColumnFilter[];
  EnableQuery: boolean;
  sorting: MRT_SortingState;
  pagination: MRT_PaginationState;
}

import { useMediaQuery } from '@mantine/hooks';
import {
  MaterialReactTable,
  MRT_DensityState,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
} from 'material-react-table';

// Add the constraint to T to extend MRT_RowData
type TableProps<T extends MRT_RowData> = {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  density?: MRT_DensityState;
};

const ClientSideAppGrid = <T extends MRT_RowData>({
  data,
  columns,
  density = 'compact',
}: TableProps<T>) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Memoize the table configuration to avoid unnecessary re-renders
  const table = useMaterialReactTable({
    columns,
    data, // Ensure data is stable (useState, useMemo, etc.)
    enableFullScreenToggle: false,
    enableHiding: false,
    initialState: { density: density },
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 30, 50],
      SelectProps: { style: { fontSize: 14 } },
    },
    enableTopToolbar: !isMobile,
    renderEmptyRowsFallback: ({ table }) => (
      <p style={{ textAlign: 'center' }}>No records to display</p>
    ),
    enablePagination: !isMobile,
    enableBottomToolbar: !isMobile,
  });

  return <MaterialReactTable table={table} />;
};

export default ClientSideAppGrid;

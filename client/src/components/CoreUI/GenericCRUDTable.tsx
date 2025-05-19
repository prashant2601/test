import { useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconSquareRoundedPlus } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import MUIThemeProvider from '../../providers/MUIThemeProvider';
import { unflattenObject } from '../../utility/helperFuntions';
interface GenericCRUDTableProps<T extends { [key: string]: any }> {
  title?: string;
  columns: MRT_ColumnDef<T>[];
  validateFn: (values: Partial<T>) => Record<string, any>;
  useGetHook: any;
  useAddHook: any;
  useEditHook: any;
  useDeleteHook: any;
  getRowId: (row: T) => string;
  dataMappingKey?: string;
  setValidationErrors: (errors: Record<string, string | undefined>) => void;
}

function GenericCRUDTable<T extends { [key: string]: any }>({
  title,
  columns,
  validateFn,
  useGetHook,
  useAddHook,
  useEditHook,
  useDeleteHook,
  getRowId,
  dataMappingKey,
  setValidationErrors,
}: GenericCRUDTableProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 500);

  const { data, isLoading, isError, isFetching } = useGetHook({
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    query: debouncedGlobalFilter,
  });
  const { mutateAsync: addMutation, isPending: isAdding } = useAddHook();
  const { mutateAsync: editMutation, isPending: isEditing } = useEditHook();
  const { mutateAsync: deleteMutation, isPending: isDeleting } =
    useDeleteHook();

  const handleCreate: MRT_TableOptions<T>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const finalValues = unflattenObject(values);
    const errors = validateFn(finalValues as Partial<T>);
    if (Object.values(errors).some((error) => error)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    await addMutation(finalValues);
    table.setCreatingRow(null);
  };

  const handleSave: MRT_TableOptions<T>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const finalValues = unflattenObject(values);
    const errors = validateFn(finalValues);
    if (Object.values(errors).some((error) => error)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    await editMutation(finalValues);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<T>) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation([getRowId(row.original)]);
    }
  };
  const deletMultipleRows = (rows: MRT_Row<T>[]) => {
    if (window.confirm('Are you sure you want to delete these items?')) {
      const idsToDelete = rows.map((row) => getRowId(row.original));
      deleteMutation(idsToDelete);
    }
  };

  const table = useMaterialReactTable({
    columns,
    enableGlobalFilter: true,
    enableSorting: false,
    onGlobalFilterChange: setGlobalFilter,
    data: dataMappingKey ? (data?.[dataMappingKey] ?? []) : [],
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowSelection: true,
    rowCount: (dataMappingKey ? data?.[dataMappingKey] : [])?.length,
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 30, 50],
      SelectProps: { style: { fontSize: 14 } },
    },
    initialState: { density: 'compact', showGlobalFilter: true },
    enableColumnFilters: false,
    getRowId,
    muiToolbarAlertBannerProps: isError
      ? { color: 'error', children: 'Error loading data' }
      : undefined,
    muiTableContainerProps: { sx: { height: '300px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreate,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSave,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0rem' }}>
        <Tooltip label="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Group>
        <ActionIcon
          onClick={() => table.setCreatingRow(true)}
          color="green"
          mb={0}
          variant="subtle"
        >
          <Tooltip label="Add" position="top">
            <IconSquareRoundedPlus stroke={2} />
          </Tooltip>
        </ActionIcon>
        <Tooltip label="Delete selected rows" position="top">
          <IconButton
            color="error"
            onClick={() =>
              deletMultipleRows(
                table.getSelectedRowModel().flatRows.map((row) => row)
              )
            }
            disabled={
              !table.getIsAllPageRowsSelected() &&
              !table.getIsSomeRowsSelected()
            }
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Group>
    ),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      isLoading,
      isSaving: isAdding ?? isEditing ?? isDeleting,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      pagination,
    },
  });

  return (
    <MUIThemeProvider>
      <MaterialReactTable table={table} />
    </MUIThemeProvider>
  );
}

export default GenericCRUDTable;

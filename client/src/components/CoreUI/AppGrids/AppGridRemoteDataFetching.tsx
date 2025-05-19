import {
  MaterialReactTable,
  MRT_Row,
  MRT_RowData,
  MRT_ShowHideColumnsButton,
  MRT_TableHeadCellFilterContainer,
  MRT_ToggleFullScreenButton,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_ColumnPinningState,
  MRT_ExpandButtonProps,
  MRT_TableInstance,
} from 'material-react-table';
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import { GridFilterDrawer } from '../GridFilterDrawer/GridFilterDrawer';
import EditIcon from '@mui/icons-material/Edit';
import { Modal, Text } from '@mantine/core';
import './ScrollBAr.css';
import TableCellForm from '../../tableCellForm/tableCellForm';
import { ReactNode, useState } from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import ToolBarCustomAction from './TopToolBarCustomActions/ToolBarCustomAction';
import { useIsMutating } from '@tanstack/react-query';
import { UISCHEMA } from '../../../pages/admin/customers/CRUDUISchema/customersUISchema';
import { getValueofKeyFromObject } from '../../../utility/helperFuntions';
import ManualInvoiceCrud from './TopToolBarCustomActions/ManualInvoiceCrud/ManualInvoiceCrud';
import { OnChangeFn } from '@tanstack/table-core';
import { TableNames } from '../../../enums';
import { IconEye } from '@tabler/icons-react';

type DataGridProps<T extends MRT_RowData> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  columnFilters: MRT_ColumnFiltersState;
  onPaginationChange: OnChangeFn<MRT_PaginationState>;
  onSortingChange: OnChangeFn<MRT_SortingState>;
  onColumnFiltersChange: OnChangeFn<MRT_ColumnFiltersState>;
  isLoading?: boolean;
  isError?: boolean;
  totalRowCount: number;
  OnFilterButtonClicked: () => void;
  OnApplyFiltersClicked: () => void;
  filterDrawerIsOpen: boolean;
  enableRowSelection?: boolean;
  tableName: TableNames;
  columnPinning?: MRT_ColumnPinningState;
  initialColumnVisibility?: Record<string, boolean>;
  crudOperationHeader?: string;
  uniqueIDForRows: string;
  uiSchema?: UISCHEMA[];
  muiExpandButtonProps?: MRT_ExpandButtonProps<T>;
  renderDetailPanel?: (props: {
    row: MRT_Row<T>;
    table: MRT_TableInstance<T>;
  }) => ReactNode;
  enableRowActions?: boolean;
  ManualInvoiceTableCellForm?: boolean;
  renderCaption?:
    | ReactNode
    | ((props: { table: MRT_TableInstance<T> }) => ReactNode);
  crudModalWidth?: string;
  CustomViewDetailsModal?: React.ComponentType<{
    onClose: () => void;
    opened: boolean;
    row: MRT_Row<T>;
  }>;
};
const ModalTitle = ({
  buttonClicked,
  crudOperationHeader,
}: {
  buttonClicked?: string;
  crudOperationHeader: string;
}) => (
  <>
    <Text
      size="lg"
      style={{ fontWeight: 'bold', textAlign: 'center' }}
      variant="gradient"
      gradient={{ from: 'teal', to: 'green', deg: 237 }}
    >
      {buttonClicked === 'NEW' ? 'New' : 'Edit'} {crudOperationHeader}
    </Text>
    <Divider />
  </>
);
const DataGrid = <T extends object>({
  columns,
  data,
  pagination,
  sorting,
  columnFilters,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  isLoading = false,
  isError = false,
  totalRowCount,
  OnFilterButtonClicked,
  filterDrawerIsOpen = false,
  OnApplyFiltersClicked,
  enableRowSelection = false,
  tableName,
  columnPinning,
  initialColumnVisibility,
  crudOperationHeader = '',
  uniqueIDForRows = 'id',
  uiSchema,
  muiExpandButtonProps,
  renderDetailPanel,
  enableRowActions = true,
  ManualInvoiceTableCellForm = false,
  renderCaption,
  crudModalWidth = 'auto',
  CustomViewDetailsModal,
}: DataGridProps<T>) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRow, setSelectedRow] = useState<{
    buttonCLicked: 'VIEW' | 'NEW' | 'EDIT';
    row: MRT_Row<T> | null;
  }>();
  const [
    viewDetailsOpened,
    { open: openViewDetails, close: closeViewDetails },
  ] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isMutatingDelete = useIsMutating({
    mutationKey: [
      'Deleting-Orders',
      'Deleting-Customers',
      'Deleting-Merchants',
      'Deleting-Invoices',
      'Deleting-Users',
    ],
  });
  const handleEditIconClicked = (row: MRT_Row<T>) => {
    setSelectedRow({ buttonCLicked: 'EDIT', row: row });
    open();
  };
  const handleNewIconClicked = () => {
    setSelectedRow({ buttonCLicked: 'NEW', row: null });
    open();
  };
  const handleViewIonClicked = (row: MRT_Row<T>) => {
    setSelectedRow({ buttonCLicked: 'VIEW', row: row });
    openViewDetails();
  };
  const handleCloseForm = () => {
    close();
  };

  const getToolbarAlertBannerProps = () => {
    switch (true) {
      case isError:
        return {
          color: 'error' as 'error',
          children: 'Error loading data',
        };
      case isMutatingDelete > 0:
        return {
          color: 'info' as 'info',
          children: 'Please wait...........',
        };
      default:
        return { color: 'success' as 'success', children: null };
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableMultiSort: false,

    initialState: {
      showColumnFilters: false,
      density: 'compact',
      columnPinning: columnPinning ?? undefined,
      columnVisibility: initialColumnVisibility ?? undefined,
    },
    enableRowSelection,
    enableExpandAll: false,
    columnFilterDisplayMode: 'custom',
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiTableHeadCellProps: {
      align: 'center',
      style: {
        backgroundColor: 'lightgray',
      },
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 30, 50],
      SelectProps: { style: { fontSize: 14 } },
    },
    positionToolbarAlertBanner: 'bottom',
    muiTableBodyProps: {
      sx: {
        padding: 0,
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    muiTableBodyCellProps: {
      align: 'center',
    },

    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: CustomViewDetailsModal ? 'Menu' : 'Edit',
        maxSize: 50,
      },
    },
    onColumnFiltersChange: onColumnFiltersChange,
    onSortingChange: onSortingChange,
    onPaginationChange: onPaginationChange,
    enableStickyHeader: true,
    renderToolbarInternalActions: ({ table }) =>
      !isMobile ? (
        <>
          <MRT_ShowHideColumnsButton table={table} />
          <MRT_ToggleFullScreenButton table={table} />
        </>
      ) : undefined,
    enableToolbarInternalActions: !isMobile,
    rowCount: totalRowCount,
    state: {
      columnFilters,
      isLoading,
      pagination,
      showAlertBanner: isError,
      sorting,
    },
    muiTableContainerProps: { sx: { maxHeight: '65vh' } },
    getRowId: (originalRow) =>
      getValueofKeyFromObject(originalRow, uniqueIDForRows),
    muiToolbarAlertBannerProps: getToolbarAlertBannerProps(),
    enableRowActions: enableRowActions,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 'sm', justifyContent: 'center' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEditIconClicked(row)}>
            <EditIcon style={{ fontSize: '16px' }} />
          </IconButton>
        </Tooltip>
        {Boolean(CustomViewDetailsModal) && (
          <Tooltip title="View">
            <IconButton onClick={() => handleViewIonClicked(row)}>
              <IconEye style={{ fontSize: '16px' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <ToolBarCustomAction
        table={table}
        OnFilterButtonClicked={OnFilterButtonClicked}
        handleNewIconClicked={handleNewIconClicked}
        tableName={tableName}
      />
    ),
    muiExpandButtonProps,
    renderDetailPanel,
    renderCaption,
  });
  return (
    <>
      {CustomViewDetailsModal && selectedRow?.row && (
        <CustomViewDetailsModal
          onClose={closeViewDetails}
          opened={viewDetailsOpened}
          row={selectedRow?.row}
        />
      )}
      <MaterialReactTable table={table} />
      <GridFilterDrawer
        close={OnApplyFiltersClicked}
        opened={filterDrawerIsOpen}
        crudOperationHeader={crudOperationHeader}
      >
        <Stack p="8px" gap="8px">
          {table.getLeafHeaders().map((header) => {
            if (header.column.getCanFilter()) {
              return (
                <MRT_TableHeadCellFilterContainer
                  key={header.id}
                  header={header}
                  table={table}
                  in
                  style={{
                    marginTop: 10,
                  }}
                />
              );
            }
          })}
        </Stack>
      </GridFilterDrawer>
      <Modal
        opened={opened}
        onClose={handleCloseForm}
        title={
          <ModalTitle
            buttonClicked={selectedRow?.buttonCLicked}
            crudOperationHeader={crudOperationHeader}
          />
        }
        centered
        transitionProps={{ transition: 'fade', duration: 200 }}
        {...(ManualInvoiceTableCellForm
          ? { fullScreen: true }
          : { size: crudModalWidth })}
        style={{ borderRadius: '15px' }}
      >
        {ManualInvoiceTableCellForm ? (
          <ManualInvoiceCrud
            formState={selectedRow?.buttonCLicked}
            originalRow={selectedRow?.row?.original}
            onClose={handleCloseForm}
          />
        ) : (
          <TableCellForm
            formState={selectedRow?.buttonCLicked}
            originalRow={selectedRow?.row?.original}
            onClose={handleCloseForm}
            crudOperationHeader={crudOperationHeader}
            uiSchema={uiSchema ?? []}
            tableName={tableName}
          />
        )}
      </Modal>
    </>
  );
};

export default DataGrid;

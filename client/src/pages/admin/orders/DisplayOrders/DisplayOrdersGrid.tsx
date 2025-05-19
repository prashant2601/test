import { useMemo, useState } from 'react';
import AppGridRemoteDataFetching from '../../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import { Order, useGETALLOrdersWithFilters } from '../hooks/useGetAllOrders';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import MUIThemeProvider from '../../../../providers/MUIThemeProvider';
import AppChipComponent from '../../../../components/AppChipComponent';
import TextWithIcon from '../../../../components/TextWithIcon';
import { orderStatuses } from './constants';
import { ordersUISchemaArray } from '../CRUDUISchema/ordersUISchema';
import { convertIntoDateTime } from '../../../../utility/helperFuntions';
import { TableNames } from '../../../../enums';
import { ViewOrderModal } from './ViewOrderDetails';

const DisplayOrdersGrid = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const {
    data: OrdersDataApiResponse,
    isError,
    isLoading,
  } = useGETALLOrdersWithFilters({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderId',
        header: 'Order ID',
        enableSorting: false,
        size: 120,
      },

      {
        accessorKey: 'branchName',
        header: 'Branch Name',
        enableSorting: false,
      },
      {
        accessorKey: 'customerId',
        header: 'Customer ID',
        enableSorting: false,
        size: 150,
        enableEditing: false,
      },
      {
        accessorKey: 'orderDate',
        accessorFn: (originalRow) => new Date(originalRow.orderDate),
        header: 'Order Date',
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        muiFilterDateTimePickerProps: {
          label: 'Order Date',
          timeSteps: { minutes: 1 },
        },
        maxSize: 150,
      },
      {
        accessorKey: 'orderType',
        header: 'Order Type',
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'DELIVERY', value: 'DELIVERY' },
          { label: 'COLLECTION', value: 'COLLECTION' },
        ],
        enableSorting: false,
        maxSize: 30,
        Cell: ({ renderedCellValue }) => TextWithIcon({ renderedCellValue }),
      },
      {
        accessorKey: 'paymentType',
        header: 'Payment Type',
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'CASH', value: 'CASH' },
          { label: 'CARD', value: 'CARD' },
        ],
        enableSorting: false,
        maxSize: 30,
        Cell: ({ renderedCellValue }) => TextWithIcon({ renderedCellValue }),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'COMPLETED', value: 'COMPLETED' },
          { label: 'PENDING', value: 'PENDING' },
          { label: 'PROCESSED', value: 'PROCESSED' },
        ],
        enableSorting: false,
        maxSize: 30,
      },
      {
        accessorKey: 'confirmationStatus',
        header: 'Confirmation Status',
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'COMPLETED', value: 'COMPLETED' },
          { label: 'PENDING', value: 'PENDING' },
        ],
        enableSorting: false,
        maxSize: 30,
      },
      {
        accessorKey: 'total',
        header: 'Total',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        maxSize: 60,
        Cell: ({ cell }) => (
          <AppChipComponent
            value={
              orderStatuses?.find(
                (item) => item.value === cell.getValue<string>()
              )?.label ?? ''
            }
          />
        ),
        filterVariant: 'multi-select',
        enableSorting: false,
        filterSelectOptions: orderStatuses,
        editSelectOptions: [
          { label: 'COMPLETED', value: 'COMPLETED' },
          { label: 'PENDING', value: 'PENDING' },
        ],
      },

      {
        accessorKey: 'merchantId',
        header: 'Merchant ID',
        enableSorting: false,
        size: 150,
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <AppGridRemoteDataFetching
        data={OrdersDataApiResponse?.data?.orders ?? []}
        columnFilters={columnFilters}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        totalRowCount={OrdersDataApiResponse?.data?.totalCount ?? 0}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        isLoading={isLoading}
        OnFilterButtonClicked={() => open()}
        OnApplyFiltersClicked={() => close()}
        filterDrawerIsOpen={opened}
        enableRowSelection={true}
        isError={isError}
        tableName={TableNames.OrdersDisplay}
        columnPinning={{
          left: ['mrt-row-select', 'orderId'],
          right: ['mrt-row-actions'],
        }}
        initialColumnVisibility={{
          customerId: false,
          paymentStatus: false,
          confirmationStatus: false,
        }}
        crudOperationHeader="Order"
        uniqueIDForRows="orderId"
        uiSchema={ordersUISchemaArray}
        CustomViewDetailsModal={ViewOrderModal}
      />
    </MUIThemeProvider>
  );
};

export default DisplayOrdersGrid;

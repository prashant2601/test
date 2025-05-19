import { useMemo, useState } from 'react';
import AppGridRemoteDataFetching from '../../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';

import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import MUIThemeProvider from '../../../../providers/MUIThemeProvider';
import {
  convertIntoDateTime,
  isTruthy,
} from '../../../../utility/helperFuntions';
import { TableNames } from '../../../../enums';
import {
  Expense,
  SpentByEnum,
  useGetExpenseData,
} from './hooks/useGetExpenseData';
import { expensesUISchemaArray } from './ExpensesUISchema';
import { ActionIcon, Center, Group, Loader, Switch, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconCheck, IconEye, IconReceipt, IconX } from '@tabler/icons-react';
import ClientSideAppGrid from '../../../../components/CoreUI/ClientSideAppGrid';
import { BadgeGroup } from '../../../../components/BadgeGroup';
import TextWithIcon from '../../../../components/TextWithIcon';
import { useEditExpenseData } from './hooks/useEditExpenseData';
import { ViewExpenseDetailsModal } from './ViewExpenseDetailsModal';

interface ViewReceiptItemsButtonProps {
  row: { original: Expense };
}

export const ViewReceiptItemsButton = ({
  row,
}: ViewReceiptItemsButtonProps) => {
  const handleOpenReceiptItems = () => {
    modals.open({
      title: (
        <Group gap="sm">
          <IconReceipt size={20} color="teal" />
          <Text size="lg" fw={600} c="teal">
            Receipt Items — ID #{row?.original?.receiptId}
          </Text>
        </Group>
      ),
      size: '80%',
      children: (
        <ClientSideAppGrid
          data={row?.original?.receiptItems ?? []}
          density="comfortable"
          columns={[
            { header: 'Category', accessorKey: 'category' },
            { header: 'Item Name', accessorKey: 'itemName' },
            {
              header: 'Amount',
              accessorKey: 'amount',
              Cell: ({ renderedCellValue }) =>
                TextWithIcon({ renderedCellValue, PoundAsText: true }),
            },
            {
              header: 'VAT Amount',
              accessorKey: 'vatAmount',
              Cell: ({ renderedCellValue }) =>
                TextWithIcon({ renderedCellValue, PoundAsText: true }),
            },
            {
              header: 'Total',
              accessorKey: 'total',
              Cell: ({ renderedCellValue }) =>
                TextWithIcon({ renderedCellValue, PoundAsText: true }),
            },
          ]}
        />
      ),
    });
  };

  return (
    <Center>
      <ActionIcon
        variant="transparent"
        color="blue"
        size="lg"
        onClick={handleOpenReceiptItems}
      >
        <IconEye size={20} />
      </ActionIcon>
    </Center>
  );
};

const DisplayExpenseData = () => {
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
    mutateAsync: SubmitEditedValues,
    isPending,
    variables,
  } = useEditExpenseData();
  const {
    data: expenseDataApiResponse,
    isError,
    isLoading,
  } = useGetExpenseData({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: 'receiptDate',
        accessorFn: (row) => new Date(row?.receiptDate),
        header: 'Receipt Date',
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        muiFilterDateTimePickerProps: {
          label: 'Receipt Date',
          timeSteps: { minutes: 1 },
        },
        enableSorting: true,
      },
      {
        accessorKey: 'storeName',
        header: 'Store Name',
        enableSorting: false,
      },
      {
        accessorKey: 'expenseType',
        header: 'Expense Type',
        enableSorting: false,
      },
      {
        accessorKey: 'spentBy',
        header: 'Spent By',
        enableSorting: false,
        filterVariant: 'multi-select',
        filterSelectOptions: Object.values(SpentByEnum).map((spentBy) => ({
          label: spentBy.toString(),
          value: spentBy,
        })),
      },
      {
        accessorKey: 'paidStatus',
        header: 'Paid Status',
        enableSorting: false,
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'Paid', value: 'PAID' },
          { label: 'Unpaid', value: 'UNPAID' },
        ],
        Cell: ({ cell, row }) => {
          if (cell.getValue()) {
            return (
              <Center>
                {isPending &&
                variables?.updates?.[0]?.receiptId ===
                  row?.original?.receiptId ? (
                  <Loader size="sm" />
                ) : (
                  <Switch
                    size="lg"
                    checked={cell.getValue() === 'PAID'}
                    onLabel="PAID"
                    offLabel="UNPAID"
                    thumbIcon={
                      cell.getValue() === 'PAID' ? (
                        <IconCheck
                          size={12}
                          color="var(--mantine-color-teal-6)"
                          stroke={3}
                        />
                      ) : (
                        <IconX
                          size={12}
                          color="var(--mantine-color-red-6)"
                          stroke={3}
                        />
                      )
                    }
                    styles={{ trackLabel: { width: '40px', fontSize: 'xl' } }}
                    onChange={(event) => {
                      SubmitEditedValues({
                        updates: [
                          {
                            ...row?.original,
                            paidStatus: event.currentTarget.checked
                              ? 'PAID'
                              : 'UNPAID',
                          },
                        ],
                      });
                    }}
                  />
                )}
              </Center>
            );
          }
          return undefined;
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ renderedCellValue }) =>
          TextWithIcon({ renderedCellValue, PoundAsText: true }),
      },
      {
        accessorKey: 'receiptId',
        header: 'Receipt ID',
        enableSorting: false,
      },
    ],
    [isPending]
  );

  return (
    <MUIThemeProvider>
      <AppGridRemoteDataFetching
        data={expenseDataApiResponse?.data?.expense ?? []}
        columnFilters={columnFilters}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        totalRowCount={expenseDataApiResponse?.data?.totalCount ?? 0}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        isLoading={isLoading}
        OnFilterButtonClicked={() => open()}
        OnApplyFiltersClicked={() => close()}
        filterDrawerIsOpen={opened}
        enableRowSelection={true}
        isError={isError}
        tableName={TableNames.ExpensesDisplay}
        columnPinning={{
          left: ['mrt-row-select'],
          right: ['mrt-row-actions'],
        }}
        initialColumnVisibility={{
          customerId: false,
          paymentStatus: false,
          confirmationStatus: false,
          receiptId: false,
          claimableVAT: false,
          receiptLink: false,
          receiptItems: false,
          paymentType: false,
          cardType: false,
          paymentFrom: false,
        }}
        crudOperationHeader="Expense"
        uniqueIDForRows="receiptId"
        uiSchema={expensesUISchemaArray}
        CustomViewDetailsModal={ViewExpenseDetailsModal}
        renderCaption={() => {
          return isTruthy(expenseDataApiResponse?.data?.totalAmount) ||
            isTruthy(expenseDataApiResponse?.data?.totalClaimableVAT) ? (
            <BadgeGroup
              badges={[
                {
                  label: 'Total Amount',
                  value: `£ ${expenseDataApiResponse?.data?.totalAmount ?? '0'}`,
                  color: 'primary',
                },
                {
                  label: 'Total Claimable VAT',
                  value: `£ ${expenseDataApiResponse?.data?.totalClaimableVAT ?? '0'}`,
                  color: 'primary',
                },
              ]}
            />
          ) : undefined;
        }}
      />
    </MUIThemeProvider>
  );
};

export default DisplayExpenseData;

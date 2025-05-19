import { Suspense, useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Skeleton } from '@mantine/core';
import {
  BankAccountInBankGrid,
  useGetAllBankAccounts,
} from './hooks/useGetAllBankAccounts'; // Updated to use the user hook
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { bankAccountsUISchemaArray } from './CRUDUISchema/bankAccountsUISchema';
import AppChipComponent from '../../../components/AppChipComponent';
import { convertIntoDate } from '../../../utility/helperFuntions';
import { accountRoleOptions } from './constants';
import { formatSortCode } from '../../../components/CoreUI/FormikFields/FormikSortCodeField';
import { TableNames } from '../../../enums';

const DisplayBankAccounts = () => {
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
    data: bankAccountDetailsApiResponse,
    isError,
    isLoading,
  } = useGetAllBankAccounts({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<BankAccountInBankGrid>[]>(
    () => [
      //   {
      //     accessorKey: 'accId',
      //     header: 'Id',
      //   },
      {
        accessorKey: 'accountHolderName',
        header: 'Account Holder Name',
      },
      {
        accessorKey: 'accountNumber',
        header: 'Account Number',
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: 'bankName',
        header: 'Bank Name',
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: 'sortCode',
        header: 'Sort Code',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => formatSortCode(cell.getValue<number>()) ?? <></>,
      },
      {
        accessorKey: 'accountRole',
        header: 'Account Holder Role',
        Cell: ({ cell }) => (
          <AppChipComponent
            value={
              accountRoleOptions?.find(
                (item) => item.value === cell.getValue<string>()
              )?.label ?? ''
            }
          />
        ),
        enableColumnFilter: true,
        enableSorting: false,
        filterVariant: 'multi-select',
        filterSelectOptions: accountRoleOptions,
      },
      {
        accessorKey: 'accountAddedOn',
        header: 'Account Added On',
        enableSorting: true,
        accessorFn: (originalRow) => new Date(originalRow.accountAddedOn),
        enableColumnFilter: false,
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        maxSize: 150,
      },
      {
        accessorKey: 'merchantId',
        header: 'Merchant ID',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) =>
          row?.original?.merchantId
            ? `${row?.original?.merchantName ?? ''} (${row?.original?.merchantId})`
            : null,
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={bankAccountDetailsApiResponse?.data?.bankAccounts ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={bankAccountDetailsApiResponse?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          enableRowSelection={true}
          isError={isError}
          tableName={TableNames.BankAccountDisplay}
          crudOperationHeader="Bank Account"
          columnPinning={{
            left: ['mrt-row-select', 'mrt-row-actions', 'accountHolderName'],
          }}
          uniqueIDForRows="accId"
          uiSchema={bankAccountsUISchemaArray}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayBankAccounts;

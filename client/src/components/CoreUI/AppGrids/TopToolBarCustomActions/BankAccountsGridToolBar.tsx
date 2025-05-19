import { Box, Button } from '@mui/material';
import { useEffect } from 'react';
import { GridCustomToolbarProps } from './ToolBarCustomAction';
import { useDeleteBankAccountIdsByEmails } from '../../../../pages/admin/bankAccounts/hooks/useDeleteBankAccounts';
import { IconTaxEuro } from '@tabler/icons-react';
import { useUpdateBankAccount } from '../../../../pages/admin/bankAccounts/hooks/useUpdateBankAccount';
import DeleteActionInGrid from './components/DeleteActionInGrid';
const BankAccountsGridTopToolBar = (props: GridCustomToolbarProps) => {
  const { table, handleNewIconClicked } = props;
  const {
    mutateAsync: deleteBankAccountsMutateAsync,
    isSuccess: isSucceesIndeletingIds,
  } = useDeleteBankAccountIdsByEmails();
  const { isSuccess: iSSuccessInUpdating } = useUpdateBankAccount();

  useEffect(() => {
    if (isSucceesIndeletingIds || iSSuccessInUpdating) {
      table.resetRowSelection();
    }
  }, [isSucceesIndeletingIds, iSSuccessInUpdating]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Button
        variant="contained"
        onClick={() => handleNewIconClicked()}
        size="small"
        color="success"
      >
        Add Bank Account &nbsp; <IconTaxEuro stroke={2} size={16} />
      </Button>
      <DeleteActionInGrid
        table={table}
        confirmationText="Bank Account(s)"
        onDeleteConfirm={deleteBankAccountsMutateAsync}
        uniqueIDinRow="accId"
      />
    </Box>
  );
};

export default BankAccountsGridTopToolBar;

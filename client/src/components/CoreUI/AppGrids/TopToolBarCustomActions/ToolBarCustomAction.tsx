import { MRT_TableInstance } from 'material-react-table';
import { Box, IconButton, lighten, Tooltip } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { ClearIcon } from '@mui/x-date-pickers';
import OrdersGridTopToolBar from './OrdersGridTopToolBar';
import CustomerGridTopToolBar from './CustomerGridTopToolBar';
import MerchantGridTopToolBar from './MerchantGridTopToolBar';
import AllInvoicesGridTopToolBar, {
  ALLInvoicesGridCustomToolbarProps,
} from './AllInvoicesGridTopToolBar';
import AllOtherManualInvoiceGridTopToolBar from './AllOtherManualInvoiceGridTopToolBar';
import UsersGridTopToolBar from './UsersGridTopToolBar';
import BankAccountsGridTopToolBar from './BankAccountsGridToolBar';
import SwishrCourierCustomerGridTopToolBar from './SwishrCourierCustomerGridTopToolBar';
import AllOldInvoiceGridTopToolBar from './OldInvoiceGridTopToolBar/AllOldInvoiceGridTopToolBar';
import ExpensesGridTopToolBar from './ExpensesGridTopToolBar';
export interface GridCustomToolbarProps {
  table: MRT_TableInstance<any>;
  handleNewIconClicked: () => void;
}

interface ToolBarCustomActionPropTypes {
  table: MRT_TableInstance<any>;
  OnFilterButtonClicked: () => void;
  handleNewIconClicked: () => void;
  tableName: string;
}

// Define a common type for your ToolbarComponents
type CommonToolbarProps =
  | GridCustomToolbarProps
  | ALLInvoicesGridCustomToolbarProps;

type ToolbarComponent = (props: CommonToolbarProps) => JSX.Element;

// Final type based on keys
type ToolbarComponents = {
  [K in keyof typeof TOOLBAR_COMPONENTS]: ToolbarComponent;
};

const TOOLBAR_COMPONENTS = {
  OrdersDisplay: OrdersGridTopToolBar,
  CustomersDisplay: CustomerGridTopToolBar,
  MerchantsDisplay: MerchantGridTopToolBar,
  AllInvoicesDisplay: AllInvoicesGridTopToolBar,
  AllManualInvoicesDisplay: AllOtherManualInvoiceGridTopToolBar,
  AllOldInvoicesDisplay: AllOldInvoiceGridTopToolBar,
  UsersDisplay: UsersGridTopToolBar,
  BankAccountDisplay: BankAccountsGridTopToolBar,
  SwishrCourierCustomersDisplay: SwishrCourierCustomerGridTopToolBar,
  ExpensesDisplay: ExpensesGridTopToolBar,
};

const ToolBarCustomAction = (props: ToolBarCustomActionPropTypes) => {
  const { table, OnFilterButtonClicked, tableName, handleNewIconClicked } =
    props;

  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  const ToolbarComponent =
    TOOLBAR_COMPONENTS[tableName as keyof ToolbarComponents];

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: lighten(theme.palette.background.default, 0.05),
        display: 'flex',
        p: '0px 0px 0px 8px',
        justifyContent: 'space-between',
        width: '100%',
      })}
    >
      <Box sx={{ flexGrow: 1 }}>
        {ToolbarComponent && (
          <ToolbarComponent
            table={table}
            handleNewIconClicked={handleNewIconClicked}
          />
        )}
      </Box>
      <Tooltip title="Clear Filters" placement="top">
        <IconButton onClick={handleClearFilters} color="primary" size="small">
          <ClearIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Apply Filters" placement="top">
        <IconButton
          onClick={OnFilterButtonClicked}
          color="primary"
          size="small"
        >
          <FilterAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ToolBarCustomAction;

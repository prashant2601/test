import { UISCHEMA } from '../../pages/admin/customers/CRUDUISchema/customersUISchema';
import { TableNames } from '../../enums';
import ExpenseDataCRUD from '../../pages/admin/tax-and-financial-reports/expenses-receipts/ExpenseDataCRUD';
interface AdditionalRendererInTableCellFormTypes {
  originalRow: Record<string, any>;
  formState: 'VIEW' | 'NEW' | 'EDIT';
  uiSchema: UISCHEMA[];
  tableName: TableNames;
}
const AdditionalRendererInTableCellForm = (
  props: AdditionalRendererInTableCellFormTypes
) => {
  const { originalRow, formState, uiSchema, tableName } = props;
  if (TableNames.ExpensesDisplay === tableName) {
    return <ExpenseDataCRUD formState={formState} />;
  }
  return <div>AdditionalRendererInTableCellForm</div>;
};

export default AdditionalRendererInTableCellForm;

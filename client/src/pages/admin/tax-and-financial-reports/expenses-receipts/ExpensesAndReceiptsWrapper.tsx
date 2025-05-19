import { APPTabs } from '../../../../components/CoreUI/tabs/AppTabs';
import ExpenseData from './ExpenseData';
import ExpenseReport from './ExpenseReport';
export default function ExpensesAndReceiptsWrapper() {
  const tabs = [
    {
      label: 'Expense Report',
      value: 'Expense_Reporrt',
      content: <ExpenseReport />,
    },
    { label: 'Expense Data', value: 'Expense_Data', content: <ExpenseData /> },
  ];

  return <APPTabs tabs={tabs} />;
}

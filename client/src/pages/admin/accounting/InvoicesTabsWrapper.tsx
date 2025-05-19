import { APPTabs } from '../../../components/CoreUI/tabs/AppTabs';
import DisplayInvoices from './DisplayInvoices';
import GenerateInvoices from './GenerateInvoices';
import DisplayManualInvoices from './DisplayManualInvoices';
import DisplayOldInvoices from './DisplayOldInvoices';
export default function InvoiceTabsWrapper() {
  const tabs = [
    {
      label: 'Generate Invoices',
      value: 'Generate_Invoices',
      content: <GenerateInvoices />,
    },
    {
      label: 'View Invoices',
      value: 'View_Invoices',
      content: <DisplayInvoices />,
    },
    {
      label: 'Other Invoices',
      value: 'Other_Invoices',
      content: <DisplayManualInvoices />,
    },
    {
      label: 'Old Invoices',
      value: 'Old_Invoices',
      content: <DisplayOldInvoices />,
    },
  ];

  return <APPTabs tabs={tabs} />;
}

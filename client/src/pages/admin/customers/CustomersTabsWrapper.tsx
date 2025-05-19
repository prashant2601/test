import { APPTabs } from '../../../components/CoreUI/tabs/AppTabs';
import DisplayCustomersGrid from './DisplayCustomersGrid';
import UploadCustomers from './UploadCustomers';
export default function OrdersTabsWrapper() {
  const tabs = [
    {
      label: 'All Customers',
      value: 'All_Customers',
      content: <DisplayCustomersGrid />,
    },
    {
      label: 'Upload Customers',
      value: 'Upload_Customers',
      content: <UploadCustomers />,
    },
  ];

  return <APPTabs tabs={tabs} />;
}

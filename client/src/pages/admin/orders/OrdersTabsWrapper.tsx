import { APPTabs } from '../../../components/CoreUI/tabs/AppTabs';
import DisplayOrders from './DisplayOrders/DisplayOrdersGrid';
import UplaodOrders from './UploadOrders';
export default function OrdersTabsWrapper() {
  const tabs = [
    { label: 'All Orders', value: 'All_Orders', content: <DisplayOrders /> },
    { label: 'Upload Files', value: 'Upload_Files', content: <UplaodOrders /> },
  ];

  return <APPTabs tabs={tabs} />;
}

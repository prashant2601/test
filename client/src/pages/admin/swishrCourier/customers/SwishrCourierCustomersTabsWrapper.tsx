import { APPTabs } from '../../../../components/CoreUI/tabs/AppTabs';
import DisplaySwishrCourierCustomersGrid from './DisplaySwishrCourierCustomersGrid';
import UploadSwishrCourierCustomers from './UploadSwishrCourierCustomers';
export default function SwishrCourierCustomersTabsWrapper() {
  const tabs = [
    {
      label: 'Swishr Courier Customers',
      value: 'Swishr_Courier_Customers',
      content: <DisplaySwishrCourierCustomersGrid />,
    },
    {
      label: 'Upload Swishr Courier Customers',
      value: 'Upload_Swishr_Courier_Customers',
      content: <UploadSwishrCourierCustomers />,
    },
  ];

  return <APPTabs tabs={tabs} />;
}

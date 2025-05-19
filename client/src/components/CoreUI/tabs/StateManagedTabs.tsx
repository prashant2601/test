import { Tabs } from '@mantine/core';

interface SimpleTabItem {
  label: string;
  value: string;
}

interface StateManagedTabsProps {
  tabs: SimpleTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function StateManagedTabs({
  tabs,
  activeTab,
  onTabChange,
}: StateManagedTabsProps) {
  const handleTabChange = (value: string | null) => {
    if (value) {
      onTabChange(value);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      mt={5}
      mb={10}
      variant="default"
    >
      <Tabs.List grow={false}>
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}

export default StateManagedTabs;

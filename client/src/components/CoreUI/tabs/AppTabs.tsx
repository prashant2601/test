import { useState, useEffect } from 'react';
import { rem, Tabs } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TabsProps } from '@mantine/core';
import classes from './APPTabs.module.css';

export interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface APPTabsProps extends Omit<TabsProps, 'children'> {
  tabs: TabItem[];
}

export function APPTabs({ tabs, ...props }: Readonly<APPTabsProps>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab');
    if (activeTab) {
      setValue(activeTab);
    } else {
      setValue(tabs[0].value);
      queryParams.set('tab', tabs[0].value);
      navigate(`?${queryParams.toString()}`, { replace: true });
    }
  }, [location.search, tabs]);

  const handleTabChange = (newTabValue: string | null): void => {
    setValue(newTabValue);
    navigate(`?tab=${newTabValue}`, { replace: true });
  };

  return (
    <Tabs value={value} onChange={handleTabChange} {...props}>
      <Tabs.List className={classes.list} grow flex={'flex-start'}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={classes.tab}
            styles={{ tabLabel: { fontSize: rem(16) } }}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => {
        if (value === tab.value) {
          return (
            <Tabs.Panel key={tab.value} value={tab.value}>
              {tab.content}
            </Tabs.Panel>
          );
        } else {
          return null;
        }
      })}
    </Tabs>
  );
}

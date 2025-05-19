import { Flex, Image, Skeleton } from '@mantine/core';
import { Suspense } from 'react';
import Static_Swishr_Logo from '../../../assets/Static_Logo.jpeg';
import Static_Partner_Hub_Logo from '../../../assets/Partner_Hub.jpeg';

import UserMenu from './UserMenu';
import { DisplayMerchatHeaderWidget } from '../../merchant/headerWidgets/DisplayMerchatHeaderWidget';
import { useAuth } from '../../../hooks/useAuth';
import { useMediaQuery } from '@mantine/hooks';

const AppHeaderWidget = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const AdminOnMerchantPage =
    userRole === 'superAdmin' && location?.pathname?.startsWith('/merchant');

  const showMerchantWidget = userRole === 'merchant' || AdminOnMerchantPage;
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Flex justify="space-between" align="center" px="xs" w="100%" py="sm">
      {/* Left: Logo */}
      <Suspense fallback={<Skeleton height={20} width={200} />}>
        <Image
          radius="md"
          h={50}
          fit="contain"
          alt="logo"
          src={
            userRole === 'merchant'
              ? Static_Partner_Hub_Logo
              : Static_Swishr_Logo
          }
        />
      </Suspense>

      {/* Middle: Optional */}
      <Flex justify="center" align="center" style={{ flex: 1 }}>
        {showMerchantWidget && !isMobile && <DisplayMerchatHeaderWidget />}
      </Flex>

      {/* Right: User menu */}
      <UserMenu />
    </Flex>
  );
};

export default AppHeaderWidget;

import {
  ScrollArea,
  AppShell,
  Transition,
  Burger,
  Skeleton,
  useMantineTheme,
  NavLink,
  Button,
  Group,
} from '@mantine/core';
import {
  useDisclosure,
  useMediaQuery,
  useResizeObserver,
} from '@mantine/hooks';
import { Suspense, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth';
import { useGetFinalNavlinkstoRender } from './useGetFinalNavlinkstoRender';
import { useLogout } from '../../../hooks/auth/useLogOut';
import AppHeaderWidget from './AppHeaderWidget';
import { IconArrowLeft } from '@tabler/icons-react';

function GlobalAppShell() {
  const [navbarCollapsed] = useDisclosure();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure();
  const theme = useMantineTheme();
  const { user } = useAuth();
  const [ref] = useResizeObserver();
  const { mutateAsync: LogOutUSer, isPending: isLoggingout } = useLogout();
  const isRouteActive = (route: string) => {
    return location.pathname.startsWith(`/${route}`);
  };
  const isMobile = useMediaQuery('(max-width: 768px)');

  const renderNavLinks = (links: any[]) => {
    return links.map((link) => {
      if (!link.isActive) return null;
      const isActive = isRouteActive(link.path);
      const hasSubmenu = link.submenu && link.submenu.length > 0;

      return (
        <NavLink
          key={link.label}
          label={link.label}
          component={Link}
          to={`/${link.path}`}
          leftSection={
            link.icon ? (
              <link.icon
                size="1rem"
                stroke={1.5}
                style={{
                  color: isActive ? theme.primaryColor : theme.colors.gray[7],
                }}
              />
            ) : null
          }
          active={isActive}
          childrenOffset={12}
          defaultOpened={isActive}
          styles={{
            label: {
              color: isActive ? theme.colors.green[7] : theme.colors.gray[7],
              fontWeight: isActive ? '600' : 'normal',
            },
            root: { borderRadius: '10px' },
            children: { paddingLeft: '15px' },
          }}
          bg={isActive ? theme.colors.green[0] : undefined}
          onClick={() => {
            if (isMobile && !hasSubmenu) {
              close(); // Close navbar on click in mobile view
            }
          }}
        >
          {hasSubmenu && renderNavLinks(link.submenu)}
        </NavLink>
      );
    });
  };

  const userRole = user?.role;

  const AdminOnMerchantPage =
    userRole === 'superAdmin' && location?.pathname?.startsWith('/merchant');

  const navLinks = useGetFinalNavlinkstoRender();
  const handleLogout = () => {
    LogOutUSer();
  };
  const navigate = useNavigate();
  const handleGoBacktoSuperAdminNavlink = useCallback(() => {
    navigate('/partners-and-customers/merchants', {
      replace: true,
    });
    localStorage.removeItem('AdminOnMerchantProfile');
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: !isMobile ? 300 : 170,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      {/* Header */}
      <AppShell.Header styles={{ header: { gap: 0 } }}>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          w={'100%'}
          wrap="nowrap"
        >
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <AppHeaderWidget />
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <Transition
        mounted={!navbarCollapsed}
        transition="scale-x"
        duration={300}
        timingFunction="ease"
      >
        {(styles) => (
          <AppShell.Navbar p="sm" pr={0}>
            <AppShell.Section mr={'sm'}>
              {AdminOnMerchantPage && (
                <Button
                  onClick={handleGoBacktoSuperAdminNavlink}
                  variant="light"
                  color="gray"
                  fullWidth
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Return to Admin Panel
                </Button>
              )}
              <Button
                style={{ background: theme.colors.gray[7] }}
                fullWidth
                mt={5}
              >
                {' '}
                {AdminOnMerchantPage
                  ? 'Merchant'
                  : userRole === 'superAdmin'
                    ? 'Admin'
                    : ''}{' '}
                Panel
              </Button>
            </AppShell.Section>
            <AppShell.Section grow my="md" component={ScrollArea}>
              <ScrollArea styles={{ scrollbar: { scrollbarWidth: 'thin' } }}>
                {!navLinks?.length &&
                  Array(10)
                    .fill(null)
                    ?.map((_, index) => (
                      <Skeleton height={30} w={'90%'} key={index} mb={10} />
                    ))}
                {renderNavLinks(navLinks)}
              </ScrollArea>
            </AppShell.Section>
            <AppShell.Section mr={'sm'}>
              <Button
                style={{ background: theme.colors.gray[7] }}
                onClick={handleLogout}
                fullWidth
                loading={isLoggingout}
              >
                Log out
              </Button>
            </AppShell.Section>
          </AppShell.Navbar>
        )}
      </Transition>
      <AppShell.Main ref={ref}>
        <Suspense fallback={<Skeleton height={300} width="100%" />}>
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
export default GlobalAppShell;

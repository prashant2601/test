import { APPTabs } from '../../../../components/CoreUI/tabs/AppTabs';
import { AllUserRoleTypesExcludingSuperAdmin, userRoles } from './constants';
import { useAppAbility } from '../../../../abilityContext/AbilityContext';
import DisplayMerchantUsersGrid from './DisplayAllUsers';
import { Box, Button, Divider, Flex, Text } from '@mantine/core';
import RoleBasedMenuPage from './RoleBasedMenuConfig';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronLeft } from '@tabler/icons-react';
import { Can } from '@casl/react';
const DisplayUsers = () => {
  const { ability } = useAppAbility();
  const [opened, { open, close }] = useDisclosure(false);

  const TabsTodisplay = userRoles
    ?.filter(
      (role) =>
        role.value !== 'superAdmin' &&
        ability.can('access', `${role?.value}UserTab`)
    )
    ?.map((role) => ({
      label: role.label,
      value: role.value,
      hidden: !ability.can('access', `${role.value}UserTab`),
      content: (
        <DisplayMerchantUsersGrid
          role={role?.value as AllUserRoleTypesExcludingSuperAdmin}
        />
      ),
    }));
  return (
    <Box>
      <Can I="view" a="RoleBasedConfiguration" ability={ability}>
        <Flex
          justify={'space-between'}
          align={'center'}
          w={'100%'}
          styles={{
            root: {
              border: '1px solid lightgrey',
              padding: '10px 20px',
              borderRadius: '1rem',
              background: '#f3f3f3',
              marginBottom: '1.5rem',
            },
          }}
        >
          {opened && (
            <Button
              onClick={() => close()}
              size="sm"
              leftSection={<IconChevronLeft />}
              variant="gradient"
            >
              Go Back
            </Button>
          )}
          {!opened && (
            <>
              <Text style={{ fontWeight: 500 }}>Roles and Permissions : </Text>
              <Button variant="gradient" onClick={() => open()}>
                Access & Permissions
              </Button>
            </>
          )}
        </Flex>
        <Divider m={10} />
      </Can>
      {opened ? <RoleBasedMenuPage /> : <APPTabs tabs={TabsTodisplay} />}
    </Box>
  );
};

export default DisplayUsers;

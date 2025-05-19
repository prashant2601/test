import { useCallback, useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import {
  Button,
  Paper,
  Title,
  Divider,
  Select,
  Group,
  LoadingOverlay,
  Table,
  Box,
  Center,
  Text,
} from '@mantine/core';

import { userRoles, UserRoleTypes } from './constants';
import FormikSwitchField from '../../../../components/CoreUI/FormikFields/FormikSwitchField';
import {
  APIResponseMenuKeyTypes,
  useGetRoleBasedConfigMenus,
} from './hooks/useGetRoleBasedConfigMenus';
import { Can } from '@casl/react';
import { useAppAbility } from '../../../../abilityContext/AbilityContext';
import { useUpdateRoleBasedConfigMenus } from './hooks/useUpdateRoleBasedConfigMenus';

const RoleBasedMenuPage = () => {
  const [selectedRole, setSelectedRole] = useState<Omit<
    UserRoleTypes,
    'merchant'
  > | null>(null);
  const { data: menuList, isLoading } =
    useGetRoleBasedConfigMenus(selectedRole);
  const {
    mutateAsync: UpdateRoleBasedConfig,
    isPending: isUpdatingRoleConfig,
  } = useUpdateRoleBasedConfigMenus();
  const handleSubmit = useCallback((values: APIResponseMenuKeyTypes) => {
    UpdateRoleBasedConfig(values);
  }, []);
  const { ability } = useAppAbility();
  const dropdownOptionsforRoles = useMemo(
    () => userRoles?.filter((role) => role?.value !== 'superAdmin'),
    []
  );
  return (
    <Box>
      <Can I="view" a="RoleBasedConfiguration" ability={ability}>
        <Paper shadow="md" p="sm" radius="md" pos="relative">
          <Group>
            <Title order={4} mb="md">
              Role-Based Menu Settings
            </Title>
            <Select
              value={selectedRole as string | null}
              onChange={setSelectedRole}
              data={dropdownOptionsforRoles}
              placeholder="Choose Role"
              mb="md"
              styles={{ root: { width: '140px' } }}
            />
          </Group>
          <LoadingOverlay visible={isLoading || isUpdatingRoleConfig} />
          {!selectedRole && (
            <Text>
              Select the role to configure the menu settings for that role.
            </Text>
          )}
          {!isLoading && menuList && (
            <Formik<APIResponseMenuKeyTypes>
              initialValues={menuList}
              enableReinitialize={true}
              onSubmit={(values) => handleSubmit(values)}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <Table.ScrollContainer
                    minWidth={100}
                    type="native"
                    mah={400}
                    p={0}
                    styles={{ scrollContainer: { scrollbarWidth: 'thin' } }}
                  >
                    <Table
                      withTableBorder
                      withColumnBorders
                      stickyHeaderOffset={0}
                      stickyHeader
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: '25%' }}>
                            Main Menu
                          </Table.Th>
                          <Table.Th>Submenus</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {menuList?.menus?.map((menu, index) => (
                          <Table.Tr key={menu.label + 'index'}>
                            {/* Main Menu */}
                            <Table.Td>
                              <FormikSwitchField
                                name={`menus[${index}].isActive`}
                                label={menu.label}
                                handleExternally={true}
                                onChange={async (event) => {
                                  const newValue = event.target.checked;
                                  setFieldValue(
                                    `menus[${index}].isActive`,
                                    newValue
                                  );
                                  // Ensure Formik updates all submenu items at once
                                  const updatedSubmenus = menu.submenu?.map(
                                    (sub) => ({
                                      ...sub,
                                      isActive: newValue, // Assign parent's new value
                                    })
                                  );

                                  setFieldValue(
                                    `menus[${index}].submenu`,
                                    updatedSubmenus
                                  );
                                }}
                              />
                            </Table.Td>
                            {/* Submenus */}
                            <Table.Td>
                              <Group gap={'lg'}>
                                {menu?.submenu?.map((sub, submenuindex) => (
                                  <Box key={sub.label} w={'200px'}>
                                    <FormikSwitchField
                                      key={`${menu.label}_${sub.label}`}
                                      name={`menus[${index}].submenu[${submenuindex}].isActive`}
                                      label={sub.label}
                                      handleExternally={true}
                                      onChange={(event) => {
                                        const newValue = event.target.checked;
                                        const updatedSubmenus = values?.menus[
                                          index
                                        ].submenu?.map((s, i) =>
                                          i === submenuindex
                                            ? { ...s, isActive: newValue }
                                            : s
                                        );

                                        setFieldValue(
                                          `menus[${index}].submenu`,
                                          updatedSubmenus
                                        );
                                        const allActive = updatedSubmenus?.some(
                                          (s) => s.isActive
                                        );
                                        setFieldValue(
                                          `menus[${index}].isActive`,
                                          allActive
                                        );
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                  <Divider />
                  <Center>
                    <Group mt="md">
                      <Button type="submit">Submit</Button>
                      <Button variant="outline" type="reset">
                        Reset
                      </Button>
                    </Group>
                  </Center>
                </Form>
              )}
            </Formik>
          )}
        </Paper>
      </Can>
    </Box>
  );
};

export default RoleBasedMenuPage;

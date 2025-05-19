import { ForwardRefExoticComponent, RefAttributes } from 'react';
import {
  MenuItem,
  useGetNavigationMenus,
} from '../../../hooks/auth/useGetNavigationMenus';
import { UserRoleTypes } from '../adminPanelSetting/usersAndRole/constants';

import { IconProps, Icon } from '@tabler/icons-react';
import { useAuth } from '../../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import {
  AdminNavlinkMapping,
  hardcodedAllMenusforMerchant,
  merchantNavlinkMapping,
} from './AppNavLinksMapping';
type NavlinkMapping = {
  [key: string]: {
    path: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  };
};

const injectPathsAndIconsInNavlinks = (
  menu: MenuItem[],
  mapping: NavlinkMapping,
  parentLabel?: string
): {
  path: string;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: string;
  parentLabel?: string;
}[] => {
  return menu.map((item) => ({
    ...item,
    path: parentLabel
      ? mapping[parentLabel + ' ' + item.label]?.path
      : mapping[item.label]?.path || '',
    icon: parentLabel
      ? mapping[parentLabel + ' ' + item.label]?.icon
      : mapping[item.label]?.icon || '',
    submenu: item.submenu
      ? injectPathsAndIconsInNavlinks(item.submenu, mapping, item.label)
      : undefined,
  }));
};

interface RenderReadyMenuItem extends MenuItem {
  icon: any;
  path: string;
}

const fallbackIcon = 'FallbackIcon';
const fallbackPath = 'page-not-found';

const generateMenuWithPathsAndIcons = (
  menu: MenuItem[],
  labelToIconAndPath: Record<string, { icon: any; path: string }>,
  parentPath = ''
): RenderReadyMenuItem[] => {
  return menu.map((item) => {
    const fullPathKey = parentPath ? `${parentPath}/${item.label}` : item.label;
    const mapping = labelToIconAndPath[fullPathKey] || {
      icon: fallbackIcon,
      path: fallbackPath,
    };

    const slugifiedLabel = item.label.toLowerCase().replace(/\s+/g, '-'); // replace spaces with hyphens

    const currentPath = parentPath
      ? `${parentPath}/${slugifiedLabel}`
      : slugifiedLabel;

    const newItem: RenderReadyMenuItem = {
      ...item,
      icon: mapping.icon,
      path: mapping.path || currentPath,
    };

    if (item.submenu) {
      newItem.submenu = generateMenuWithPathsAndIcons(
        item.submenu,
        labelToIconAndPath,
        fullPathKey
      );
    }

    return newItem;
  });
};

function getRoleForNavlinks(
  loggedInUserRole: UserRoleTypes | undefined,
  urlPathName: string
) {
  function extractRoleFromURl(url: string) {
    return url.split('/')[1];
  }
  const roleAsPerUrl = extractRoleFromURl(urlPathName);
  const switchcasekey = loggedInUserRole + '-' + roleAsPerUrl;
  switch (switchcasekey) {
    case 'superAdmin-merchant':
      return 'merchant';
    case 'superAdmin-driver':
      return 'driver';
    case 'admin-merchant':
      return 'merchant';
    case 'admin-driver':
      return 'driver';
    default:
      return loggedInUserRole;
  }
}
function filterActiveMenus(menus: MenuItem[]): MenuItem[] {
  return menus
    .filter((menu) => menu.isActive)
    .map((menu) => {
      const newMenu: MenuItem = { ...menu };

      if (newMenu.submenu) {
        newMenu.submenu = filterActiveMenus(newMenu.submenu);

        if (newMenu.submenu.length === 0) {
          delete newMenu.submenu;
        }
      }
      return newMenu;
    });
}
export const useGetFinalNavlinkstoRender = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const roleForNavlinks = getRoleForNavlinks(user?.role, pathname);
  const { data: NavLinksFromServer } = useGetNavigationMenus(roleForNavlinks);
  if (!NavLinksFromServer) return [];

  // Define path mappings for different roles
  const pathMappings = {
    '/merchant': merchantNavlinkMapping,
    //   '/driver': driverNavlinkMapping,
  };

  // Find matching path from pathname
  const matchingPath = Object.keys(pathMappings).find((key) =>
    pathname.startsWith(key)
  );

  // Determine the correct navlink mapping
  let mapping;

  if (matchingPath) {
    // If the path is merchant/driver, use respective mapping for icon and path
    mapping = pathMappings[matchingPath as keyof typeof pathMappings];
  } else if (
    ['superAdmin', 'admin', 'staff', 'support']?.includes(user?.role as string)
  ) {
    // If the user is superAdmin/admin, use AdminNavlinkMapping for icon and path
    mapping = AdminNavlinkMapping;
  }

  // if the logged-in user is superAdmin/admin/staff/support, and the path is merchant/driver, then means superAdmin/admin/staff/support is trying to access merchant/driver page, so we need to show all the menus for merchant/driver.
  if (
    matchingPath &&
    mapping &&
    ['superAdmin', 'admin', 'staff', 'support']?.includes(user?.role as string)
  ) {
    return generateMenuWithPathsAndIcons(hardcodedAllMenusforMerchant, mapping);
  } else if (mapping) {
    // show active menus only for all roles.
    const activeNavLinks = filterActiveMenus(NavLinksFromServer);
    return generateMenuWithPathsAndIcons(activeNavLinks, mapping);
  }
  return [];
};

import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { UserRoleTypes } from '../pages/admin/adminPanelSetting/usersAndRole/constants';

export type AppAbility = MongoAbility<[string, string]>; // Define ability type

// Define abilities based on user roles
export function defineAbilitiesFor(role: UserRoleTypes) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === 'superAdmin') {
    // Super Adminhas full control
    can('manage', 'all');
  } else if (role === 'admin') {
    can('access', [
      'merchantUserTab',
      'staffUserTab',
      'supportUserTab',
      'affiliateUserTab',
      'driverUserTab',
    ]);
    can('access', ['merchantComissionReport']);
  } else if (role === 'merchant') {
    can('access', ['merchantUserTab']);
  } else if (role === 'staff') {
    can('access', ['supportUserTab']);
  } else if (role === 'support') {
    can('access', ['staffUserTab', 'affiliateUserTab', 'driverUserTab']);
  } else if (role === 'affiliate') {
    can('access', ['']);
  } else if (role === 'driver') {
    can('access', ['']);
  }

  return build();
}

// Default empty ability
export const ability = createMongoAbility<AppAbility>([]);

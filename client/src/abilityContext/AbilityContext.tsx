import { createContext, useContext, useState, useMemo } from 'react';
import { createMongoAbility, MongoAbility } from '@casl/ability';
import { defineAbilitiesFor, AppAbility } from './ability';
import { UserRoleTypes } from '../pages/admin/adminPanelSetting/usersAndRole/constants';

interface AbilityContextType {
  ability: MongoAbility<[string, string]>;
  updateAbility: (role: UserRoleTypes) => void;
}

export const AbilityContext = createContext<AbilityContextType | undefined>(
  undefined
);

export const AbilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ability, setAbility] = useState(createMongoAbility<AppAbility>([]));

  const updateAbility = (role: UserRoleTypes) => {
    setAbility(defineAbilitiesFor(role));
  };

  // Memoize the context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({ ability, updateAbility }), [ability]);

  return (
    <AbilityContext.Provider value={contextValue}>
      {children}
    </AbilityContext.Provider>
  );
};

// Custom hook for accessing ability
export const useAppAbility = () => {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error('useAppAbility must be used within an AbilityProvider');
  }
  return context;
};

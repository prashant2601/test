import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';
import { User } from '../pages/admin/adminPanelSetting/usersAndRole/hooks/useGetUsersByRole';
import { useAppAbility } from '../abilityContext/AbilityContext';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  UpdateAuthContextUser: (date: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const appToken = localStorage.getItem('appToken');

  const { updateAbility } = useAppAbility();

  const UpdateAuthContextUser = useCallback((values: User) => {
    setUser(values);
  }, []);

  useEffect(() => {
    if (appToken && !pathname?.includes('reset-password')) {
      ApiHelpers.GET(ApiConstants.CHECK_AUTH())
        .then((response) => {
          if (response.data.user) {
            setUser(response.data.user);
            updateAbility(response?.data?.user?.role);
          }
        })
        .catch((error) => {
          navigate('/login');
          console.error('Error fetching user data:', error);
        });
    }
  }, [appToken]);
  const login = (user: User) => {
    setUser(user);
    updateAbility(user.role);
    if (['superAdmin', 'admin', 'staff', 'support']?.includes(user?.role)) {
      navigate('/');
    } else if (user?.role === 'merchant') {
      if (user?.merchantIds?.length > 1) {
        alert('User associated with mutiple merchant Ids is under Development');
      }
      localStorage.setItem('loggedInMerchantId', user?.merchantIds[0]);
      navigate(`/merchant/dashboard`);
    }
  };

  const logout = () => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('loggedInMerchantId');
    localStorage.removeItem('AdminOnMerchantProfile');
    setUser(null);
    // updateAbility("guest"); // Reset abilities
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      UpdateAuthContextUser,
    }),
    [user, appToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

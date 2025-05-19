import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';
interface MuiThemeProviderProps {
  children: ReactNode;
}
const theme = createTheme({
  palette: {
    primary: {
      main: '#006A4E',
    },
    secondary: {
      main: '#9E9E9E',
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '0px 4px',
          overflow: 'scroll',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: '1px 4px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '0.5rem',
          padding: '1px 2px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          minWidth: '160px',
        },
      },
    },
  },
});

function MUIThemeProvider({ children }: Readonly<MuiThemeProviderProps>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default MUIThemeProvider;

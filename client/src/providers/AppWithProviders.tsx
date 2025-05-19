import QueryClientProviders from './QueryClientProvider';
import App from '../App';
import MantineProviders from './MantineProviders';
import { BrowserRouter } from 'react-router-dom';
import { MuiXDateProvider } from './MuiXDateProvider';
function AppWithProviders() {
  return (
    <QueryClientProviders>
      <MantineProviders>
        <BrowserRouter>
          <MuiXDateProvider>
            <App />
          </MuiXDateProvider>
        </BrowserRouter>
      </MantineProviders>
    </QueryClientProviders>
  );
}
export default AppWithProviders;

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
const queryClient = new QueryClient();
interface QueryClientProvidersProps {
  children: ReactNode;
}
function QueryClientProviders({ children }: QueryClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools
        initialIsOpen={false}
        position="top"
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  );
}
export default QueryClientProviders;

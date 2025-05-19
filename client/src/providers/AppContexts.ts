import { createContext } from 'react';
import { AppBasedContextVariables } from './AppBasedContextProviders';

export const AppBasedContext =
  createContext<AppBasedContextVariables>(undefined);

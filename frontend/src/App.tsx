import React from 'react';
import { ShellProvider } from './context/ShellContext';
import { AppShell } from './components/shell/AppShell';

export const App: React.FC = () => {
  return (
    <ShellProvider>
      <AppShell />
    </ShellProvider>
  );
};

export default App;

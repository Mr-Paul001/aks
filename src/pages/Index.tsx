
import { FC } from 'react';
import Dashboard from './Dashboard';
import { useApp } from '@/context/AppContext';

const Index: FC = () => {
  const { orgSettings } = useApp();
  
  // This component displays the dashboard with organization title
  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default Index;

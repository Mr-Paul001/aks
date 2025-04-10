
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, Users, Calendar, ClipboardList, 
  BarChart3, Settings, Menu, X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/employees', label: 'Employees', icon: <Users className="w-5 h-5" /> },
    { path: '/attendance', label: 'Attendance', icon: <Calendar className="w-5 h-5" /> },
    { path: '/records', label: 'Records', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Attend Easy</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      <div className={cn(
        "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40 w-64 bg-sidebar border-r md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Attend Easy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Management</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Attend Easy · Offline-First · v1.0
            </p>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

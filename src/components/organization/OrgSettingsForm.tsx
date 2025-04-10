
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, X, Check, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrganizationSettings } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const OrgSettingsForm = () => {
  const { orgSettings, updateOrgSettings, addDepartment, addPosition, removeDepartment, removePosition } = useApp();
  
  const [orgName, setOrgName] = useState(orgSettings.name);
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [accentColor, setAccentColor] = useState(orgSettings.accentColor || '#8b5cf6');
  
  const colorOptions = [
    '#8b5cf6', // Purple (default)
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#f87171', // Red
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
    '#0ea5e9', // Sky
    '#14b8a6', // Teal
    '#84cc16', // Lime
    '#f97316', // Orange
    '#ef4444', // Red-500
  ];
  
  const handleSaveSettings = () => {
    const updatedSettings: OrganizationSettings = {
      ...orgSettings,
      name: orgName,
      accentColor,
    };
    updateOrgSettings(updatedSettings);
  };
  
  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      addDepartment(newDepartment.trim());
      setNewDepartment('');
    }
  };
  
  const handleAddPosition = () => {
    if (newPosition.trim()) {
      addPosition(newPosition.trim());
      setNewPosition('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input 
          id="orgName"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Enter your organization name"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex items-center space-x-2">
          <div 
            className="h-6 w-6 rounded-full border shadow"
            style={{ backgroundColor: accentColor }}
          ></div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span>Select Color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-64">
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white"
                    style={{ backgroundColor: color }}
                    onClick={() => setAccentColor(color)}
                    type="button"
                  >
                    {color === accentColor && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
                <input 
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-8 p-0 border-0 rounded-full cursor-pointer"
                  title="Custom color"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Departments</Label>
        <div className="flex flex-wrap gap-2">
          {orgSettings.departments.map((department) => (
            <Badge 
              key={department} 
              variant="secondary"
              className="flex items-center gap-1 text-sm"
            >
              {department}
              <button
                type="button"
                onClick={() => removeDepartment(department)}
                className="rounded-full hover:bg-primary/20 p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Add new department"
              onKeyDown={(e) => handleKeyPress(e, handleAddDepartment)}
            />
          </div>
          <Button 
            type="button" 
            size="icon" 
            onClick={handleAddDepartment}
            disabled={!newDepartment.trim()}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Positions</Label>
        <div className="flex flex-wrap gap-2">
          {orgSettings.positions.map((position) => (
            <Badge 
              key={position} 
              variant="secondary"
              className="flex items-center gap-1 text-sm"
            >
              {position}
              <button
                type="button"
                onClick={() => removePosition(position)}
                className="rounded-full hover:bg-primary/20 p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Add new position"
              onKeyDown={(e) => handleKeyPress(e, handleAddPosition)}
            />
          </div>
          <Button 
            type="button" 
            size="icon" 
            onClick={handleAddPosition}
            disabled={!newPosition.trim()}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add</span>
          </Button>
        </div>
      </div>
      
      <Button onClick={handleSaveSettings} className="w-full">
        Save Settings
      </Button>
    </div>
  );
};

export default OrgSettingsForm;

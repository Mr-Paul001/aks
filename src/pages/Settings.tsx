import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertCircle, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/components/ui/use-toast";

const Settings = () => {
  const { exportData, importData, clearAllData } = useApp();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportData = () => {
    exportData();
  };
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        importData(content);
      } catch (error) {
        toast({
          title: "Import failed",
          description: "An error occurred while importing data.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };
  
  const handleClearAllData = () => {
    clearAllData();
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export and import your attendance data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your employees and attendance records as a JSON file for backup or transfer.
              </p>
            </div>
            <Button onClick={handleExportData} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="font-medium">Import Data</h3>
              <p className="text-sm text-muted-foreground">
                Import previously exported data back into the system.
                This will overwrite all current data.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
            <Button variant="outline" onClick={handleImportClick} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-destructive">Clear All Data</h3>
              <p className="text-sm text-muted-foreground">
                Delete all employees and attendance records from the system.
                This action cannot be undone unless you have exported your data.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Application information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Attend Easy</h3>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Data Storage</h3>
            <p className="text-sm text-muted-foreground">
              All data is stored locally on your device in the browser's localStorage.
              No data is sent to any server or external service.
            </p>
          </div>
          
          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Offline Functionality
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    This application works entirely offline and stores all data locally.
                    Make sure to export your data regularly as a backup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all employees and attendance records.
              This action cannot be undone unless you have exported your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllData}
            >
              Yes, delete all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;

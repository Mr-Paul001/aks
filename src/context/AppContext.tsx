import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, AttendanceRecord, DashboardStats, AttendanceStatus, OrganizationSettings } from '@/types';
import { 
  getEmployees, saveEmployees, getAttendanceRecords, 
  saveAttendanceRecords, getAttendanceByDate, getOrgSettings, saveOrgSettings
} from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";

interface AppContextProps {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'timestamp'>) => void;
  updateAttendanceRecord: (record: AttendanceRecord) => void;
  deleteAttendanceRecord: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  getAttendanceByEmployee: (employeeId: string) => AttendanceRecord[];
  dashboardStats: DashboardStats;
  orgSettings: OrganizationSettings;
  updateOrgSettings: (settings: OrganizationSettings) => void;
  addDepartment: (department: string) => void;
  addPosition: (position: string) => void;
  removeDepartment: (department: string) => void;
  removePosition: (position: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => void;
  exportToCSV: (type: 'employees' | 'attendance') => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: 'My Organization',
    departments: ['HR', 'IT', 'Finance', 'Marketing', 'Operations'],
    positions: ['Manager', 'Team Lead', 'Senior Staff', 'Junior Staff', 'Intern']
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    wfhToday: 0,
    attendanceRate: 0
  });
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedEmployees = getEmployees();
    const storedRecords = getAttendanceRecords();
    const storedOrgSettings = getOrgSettings();
    
    setEmployees(storedEmployees);
    setAttendanceRecords(storedRecords);
    if (storedOrgSettings) {
      setOrgSettings(storedOrgSettings);
    }
  }, []);
  
  // Calculate dashboard stats whenever employees or attendance records change
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = getAttendanceByDate(today);
    
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      wfh: 0
    };
    
    todayRecords.forEach(record => {
      statusCounts[record.status]++;
    });
    
    const totalAttendanceToday = todayRecords.length;
    const attendanceRate = totalAttendanceToday > 0 
      ? statusCounts.present / employees.length * 100 
      : 0;
    
    setDashboardStats({
      totalEmployees: employees.length,
      presentToday: statusCounts.present,
      absentToday: statusCounts.absent,
      lateToday: statusCounts.late,
      onLeaveToday: statusCounts.leave,
      wfhToday: statusCounts.wfh,
      attendanceRate: attendanceRate
    });
  }, [employees, attendanceRecords]);
  
  // Organization settings handlers
  const updateOrgSettingsHandler = (settings: OrganizationSettings) => {
    setOrgSettings(settings);
    saveOrgSettings(settings);
    toast({
      title: "Settings updated",
      description: "Organization settings have been updated."
    });
  };
  
  const addDepartmentHandler = (department: string) => {
    if (orgSettings.departments.includes(department)) {
      toast({
        title: "Department already exists",
        description: "This department already exists in the organization.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSettings = {
      ...orgSettings,
      departments: [...orgSettings.departments, department]
    };
    setOrgSettings(updatedSettings);
    saveOrgSettings(updatedSettings);
    toast({
      title: "Department added",
      description: `${department} department has been added.`
    });
  };
  
  const addPositionHandler = (position: string) => {
    if (orgSettings.positions.includes(position)) {
      toast({
        title: "Position already exists",
        description: "This position already exists in the organization.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSettings = {
      ...orgSettings,
      positions: [...orgSettings.positions, position]
    };
    setOrgSettings(updatedSettings);
    saveOrgSettings(updatedSettings);
    toast({
      title: "Position added",
      description: `${position} position has been added.`
    });
  };
  
  const removeDepartmentHandler = (department: string) => {
    // Check if any employee is using this department
    const isInUse = employees.some(emp => emp.department === department);
    
    if (isInUse) {
      toast({
        title: "Cannot remove department",
        description: "This department is assigned to one or more employees.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSettings = {
      ...orgSettings,
      departments: orgSettings.departments.filter(d => d !== department)
    };
    setOrgSettings(updatedSettings);
    saveOrgSettings(updatedSettings);
    toast({
      title: "Department removed",
      description: `${department} department has been removed.`
    });
  };
  
  const removePositionHandler = (position: string) => {
    // Check if any employee is using this position
    const isInUse = employees.some(emp => emp.position === position);
    
    if (isInUse) {
      toast({
        title: "Cannot remove position",
        description: "This position is assigned to one or more employees.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSettings = {
      ...orgSettings,
      positions: orgSettings.positions.filter(p => p !== position)
    };
    setOrgSettings(updatedSettings);
    saveOrgSettings(updatedSettings);
    toast({
      title: "Position removed",
      description: `${position} position has been removed.`
    });
  };
  
  const addEmployeeHandler = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employeeData,
      id: uuidv4()
    };
    
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
    toast({
      title: "Employee added",
      description: `${newEmployee.name} has been added successfully.`
    });
  };
  
  const updateEmployeeHandler = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
    toast({
      title: "Employee updated",
      description: `${updatedEmployee.name}'s information has been updated.`
    });
  };
  
  const deleteEmployeeHandler = (id: string) => {
    const employeeToDelete = employees.find(emp => emp.id === id);
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
    
    // Also delete related attendance records
    const updatedRecords = attendanceRecords.filter(record => record.employeeId !== id);
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
    
    toast({
      title: "Employee deleted",
      description: employeeToDelete 
        ? `${employeeToDelete.name} has been removed.` 
        : "Employee has been removed."
    });
  };
  
  const addAttendanceRecordHandler = (recordData: Omit<AttendanceRecord, 'id' | 'timestamp'>) => {
    const newRecord = {
      ...recordData,
      id: uuidv4(),
      timestamp: Date.now()
    };
    
    // Check if a record for this employee on this day already exists
    const existingIndex = attendanceRecords.findIndex(
      r => r.employeeId === newRecord.employeeId && r.date === newRecord.date
    );
    
    let updatedRecords;
    
    if (existingIndex !== -1) {
      // Update existing record
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingIndex] = newRecord;
      toast({
        title: "Attendance updated",
        description: "The attendance record has been updated."
      });
    } else {
      // Add new record
      updatedRecords = [...attendanceRecords, newRecord];
      toast({
        title: "Attendance recorded",
        description: "The attendance has been recorded successfully."
      });
    }
    
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
  };
  
  const updateAttendanceRecordHandler = (updatedRecord: AttendanceRecord) => {
    const updatedRecords = attendanceRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
    toast({
      title: "Attendance updated",
      description: "The attendance record has been updated."
    });
  };
  
  const deleteAttendanceRecordHandler = (id: string) => {
    const updatedRecords = attendanceRecords.filter(record => record.id !== id);
    setAttendanceRecords(updatedRecords);
    saveAttendanceRecords(updatedRecords);
    toast({
      title: "Attendance record deleted",
      description: "The attendance record has been removed."
    });
  };
  
  const getEmployeeByIdHandler = (id: string) => {
    return employees.find(emp => emp.id === id);
  };
  
  const getAttendanceByDateHandler = (date: string) => {
    return attendanceRecords.filter(record => record.date === date);
  };
  
  const getAttendanceByEmployeeHandler = (employeeId: string) => {
    return attendanceRecords.filter(record => record.employeeId === employeeId);
  };
  
  const exportDataHandler = () => {
    const data = {
      employees,
      attendanceRecords,
      orgSettings,
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${orgSettings.name.replace(/\s+/g, '-').toLowerCase()}-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your attendance data has been exported successfully."
    });
  };
  
  const importDataHandler = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.employees && Array.isArray(data.employees) && 
          data.attendanceRecords && Array.isArray(data.attendanceRecords)) {
        setEmployees(data.employees);
        setAttendanceRecords(data.attendanceRecords);
        
        // Import org settings if they exist
        if (data.orgSettings) {
          setOrgSettings(data.orgSettings);
          saveOrgSettings(data.orgSettings);
        }
        
        saveEmployees(data.employees);
        saveAttendanceRecords(data.attendanceRecords);
        
        toast({
          title: "Data imported",
          description: `Imported ${data.employees.length} employees and ${data.attendanceRecords.length} attendance records.`
        });
        return true;
      } else {
        toast({
          title: "Import failed",
          description: "The data format is invalid.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not parse the imported data.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const exportToCSVHandler = (type: 'employees' | 'attendance') => {
    if (type === 'employees') {
      if (employees.length === 0) {
        toast({
          title: "No employees to export",
          description: "Please add employees before exporting.",
          variant: "destructive"
        });
        return;
      }
      
      // Simplified employee data for CSV
      const csvData = employees.map(emp => ({
        Name: emp.name,
        ID: emp.employeeId,
        Department: emp.department,
        Position: emp.position,
        'Join Date': emp.joinDate,
        'Organization': orgSettings.name
      }));
      
      // Create CSV
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row] || '';
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `${orgSettings.name.replace(/\s+/g, '-').toLowerCase()}-employees-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Employees exported",
        description: "The employee list has been exported to CSV."
      });
    } else if (type === 'attendance') {
      if (attendanceRecords.length === 0) {
        toast({
          title: "No attendance records to export",
          description: "Please add attendance records before exporting.",
          variant: "destructive"
        });
        return;
      }
      
      // Enriched attendance data with employee names
      const csvData = attendanceRecords.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return {
          'Organization': orgSettings.name,
          Date: record.date,
          'Employee Name': employee ? employee.name : 'Unknown',
          'Employee ID': employee ? employee.employeeId : 'Unknown',
          Department: employee ? employee.department : 'Unknown',
          Status: record.status,
          Notes: record.notes || ''
        };
      });
      
      // Create CSV
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row] || '';
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `${orgSettings.name.replace(/\s+/g, '-').toLowerCase()}-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Attendance exported",
        description: "Attendance records have been exported to CSV."
      });
    }
  };
  
  const clearAllDataHandler = () => {
    setEmployees([]);
    setAttendanceRecords([]);
    localStorage.removeItem('attendance-app-employees');
    localStorage.removeItem('attendance-app-attendance');
    toast({
      title: "Data cleared",
      description: "All data has been cleared from the application."
    });
  };
  
  const contextValue: AppContextProps = {
    employees,
    addEmployee: addEmployeeHandler,
    updateEmployee: updateEmployeeHandler,
    deleteEmployee: deleteEmployeeHandler,
    attendanceRecords,
    addAttendanceRecord: addAttendanceRecordHandler,
    updateAttendanceRecord: updateAttendanceRecordHandler,
    deleteAttendanceRecord: deleteAttendanceRecordHandler,
    getEmployeeById: getEmployeeByIdHandler,
    getAttendanceByDate: getAttendanceByDateHandler,
    getAttendanceByEmployee: getAttendanceByEmployeeHandler,
    dashboardStats,
    orgSettings,
    updateOrgSettings: updateOrgSettingsHandler,
    addDepartment: addDepartmentHandler,
    addPosition: addPositionHandler,
    removeDepartment: removeDepartmentHandler,
    removePosition: removePositionHandler,
    exportData: exportDataHandler,
    importData: importDataHandler,
    exportToCSV: exportToCSVHandler,
    clearAllData: clearAllDataHandler
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

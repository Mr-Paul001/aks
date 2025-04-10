
import { Employee, AttendanceRecord, OrganizationSettings } from '@/types';

const EMPLOYEES_KEY = 'attendance-app-employees';
const ATTENDANCE_KEY = 'attendance-app-attendance';
const ORG_SETTINGS_KEY = 'attendance-app-org-settings';

// Organization settings storage operations
export const getOrgSettings = (): OrganizationSettings | null => {
  const data = localStorage.getItem(ORG_SETTINGS_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveOrgSettings = (settings: OrganizationSettings): void => {
  localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(settings));
};

// Employee storage operations
export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  employees.push(employee);
  saveEmployees(employees);
};

export const updateEmployee = (updatedEmployee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
  if (index !== -1) {
    employees[index] = updatedEmployee;
    saveEmployees(employees);
  }
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  saveEmployees(filtered);
  
  // Also delete related attendance records
  const records = getAttendanceRecords();
  const updatedRecords = records.filter(record => record.employeeId !== id);
  saveAttendanceRecords(updatedRecords);
};

// Attendance records storage operations
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  
  // Check if a record for this employee on this day already exists
  const existingIndex = records.findIndex(
    r => r.employeeId === record.employeeId && r.date === record.date
  );
  
  if (existingIndex !== -1) {
    // Update existing record
    records[existingIndex] = record;
  } else {
    // Add new record
    records.push(record);
  }
  
  saveAttendanceRecords(records);
};

export const updateAttendanceRecord = (updatedRecord: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  if (index !== -1) {
    records[index] = updatedRecord;
    saveAttendanceRecords(records);
  }
};

export const deleteAttendanceRecord = (id: string): void => {
  const records = getAttendanceRecords();
  const filtered = records.filter(record => record.id !== id);
  saveAttendanceRecords(filtered);
};

export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => record.date === date);
};

export const getAttendanceByEmployee = (employeeId: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  return records.filter(record => record.employeeId === employeeId);
};

export const exportData = (): string => {
  const employees = getEmployees();
  const attendanceRecords = getAttendanceRecords();
  const orgSettings = getOrgSettings();
  
  const data = {
    employees,
    attendanceRecords,
    orgSettings,
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.employees && Array.isArray(data.employees) && 
        data.attendanceRecords && Array.isArray(data.attendanceRecords)) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data.employees));
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data.attendanceRecords));
      
      if (data.orgSettings) {
        localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(data.orgSettings));
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const downloadCSV = (data: any[], filename: string): void => {
  if (!data.length) return;
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if the value contains commas or quotes
      const escaped = typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
      return escaped;
    });
    csvRows.push(values.join(','));
  }
  
  // Create CSV content
  const csvString = csvRows.join('\n');
  
  // Create download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  // Add to document, trigger download and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const clearAllData = (): void => {
  localStorage.removeItem(EMPLOYEES_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
};

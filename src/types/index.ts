
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'wfh';

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  timestamp: number;
  notes?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  wfhToday: number;
  attendanceRate: number;
}

export interface OrganizationSettings {
  name: string;
  departments: string[];
  positions: string[];
}

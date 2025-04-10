
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarRange,
  Home,
  BarChart3,
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const Dashboard = () => {
  const { employees, attendanceRecords, dashboardStats } = useApp();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  
  // Calculate attendance data for pie chart
  useEffect(() => {
    if (dashboardStats.totalEmployees > 0) {
      setAttendanceData([
        { name: 'Present', value: dashboardStats.presentToday, color: '#10b981' },
        { name: 'Absent', value: dashboardStats.absentToday, color: '#f87171' },
        { name: 'Late', value: dashboardStats.lateToday, color: '#f59e0b' },
        { name: 'Leave', value: dashboardStats.onLeaveToday, color: '#8b5cf6' },
        { name: 'WFH', value: dashboardStats.wfhToday, color: '#3b82f6' },
      ]);
    }
  }, [dashboardStats]);
  
  // Get recent attendance records
  useEffect(() => {
    if (employees.length > 0 && attendanceRecords.length > 0) {
      // Sort by timestamp (newest first) and take the 5 most recent
      const recent = [...attendanceRecords]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map(record => {
          const employee = employees.find(emp => emp.id === record.employeeId);
          return {
            ...record,
            employeeName: employee ? employee.name : 'Unknown',
            employeePosition: employee ? employee.position : '',
            formattedDate: format(new Date(record.date), 'dd MMM yyyy')
          };
        });
      
      setRecentAttendance(recent);
    }
  }, [employees, attendanceRecords]);
  
  // Generate weekly attendance data
  const weeklyData = [
    { name: 'Mon', present: 20, absent: 3, late: 2 },
    { name: 'Tue', present: 22, absent: 2, late: 1 },
    { name: 'Wed', present: 19, absent: 4, late: 2 },
    { name: 'Thu', present: 23, absent: 1, late: 1 },
    { name: 'Fri', present: 21, absent: 2, late: 2 },
  ];
  
  const today = format(new Date(), 'dd MMMM yyyy');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active members in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Present Today
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.totalEmployees > 0 ? Math.round(dashboardStats.presentToday / dashboardStats.totalEmployees * 100) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Absent Today
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.absentToday}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.absentToday > 0 ? 'Requires attention' : 'All employees accounted for'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Working Remotely
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.wfhToday}</div>
            <p className="text-xs text-muted-foreground">
              Employees working from home today
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>
              Attendance patterns for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" />
                <Bar dataKey="absent" fill="#f87171" />
                <Bar dataKey="late" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Breakdown</CardTitle>
            <CardDescription>
              Attendance status distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No attendance data for today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest attendance records in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttendance.length > 0 ? (
            <div className="space-y-4">
              {recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{record.employeeName}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{record.employeePosition}</span>
                      <span className="mx-2">•</span>
                      <span>{record.formattedDate}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`status-badge ${
                        record.status === 'present'
                          ? 'status-badge-present'
                          : record.status === 'absent'
                          ? 'status-badge-absent'
                          : record.status === 'late'
                          ? 'status-badge-late'
                          : record.status === 'leave'
                          ? 'status-badge-leave'
                          : 'status-badge-wfh'
                      }`}
                    >
                      {record.status === 'present'
                        ? 'Present'
                        : record.status === 'absent'
                        ? 'Absent'
                        : record.status === 'late'
                        ? 'Late'
                        : record.status === 'leave'
                        ? 'On Leave'
                        : 'WFH'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <p>No recent activity to display.</p>
              <p className="text-sm">Start recording attendance to see data here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

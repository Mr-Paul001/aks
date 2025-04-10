
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
  Building,
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const Dashboard = () => {
  const { employees, attendanceRecords, dashboardStats, orgSettings } = useApp();
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
  
  // Generate weekly attendance data from actual attendance records
  const getWeeklyAttendanceData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    // Create data for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const dayRecords = attendanceRecords.filter(record => record.date === dateString);
      
      weekData.push({
        name: days[date.getDay()],
        date: format(date, 'dd/MM'),
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        late: dayRecords.filter(r => r.status === 'late').length,
        leave: dayRecords.filter(r => r.status === 'leave').length,
        wfh: dayRecords.filter(r => r.status === 'wfh').length,
      });
    }
    
    return weekData;
  };
  
  const weeklyData = getWeeklyAttendanceData();
  const today = format(new Date(), 'dd MMMM yyyy');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{orgSettings.name}</p>
        </div>
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
                <Tooltip 
                  formatter={(value, name) => {
                    const formattedName = name === 'present' ? 'Present' :
                      name === 'absent' ? 'Absent' :
                      name === 'late' ? 'Late' :
                      name === 'leave' ? 'On Leave' : 'WFH';
                    return [value, formattedName];
                  }}
                  labelFormatter={(label, items) => {
                    const item = items[0]?.payload;
                    return item ? `${label} (${item.date})` : label;
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#f87171" name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
                <Bar dataKey="leave" fill="#8b5cf6" name="Leave" />
                <Bar dataKey="wfh" fill="#3b82f6" name="WFH" />
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
            {attendanceData.length > 0 && attendanceData.some(item => item.value > 0) ? (
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
                      percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employee${value !== 1 ? 's' : ''}`]} />
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
                    <StatusBadge status={record.status} />
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

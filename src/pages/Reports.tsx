
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar as CalendarIcon, Download, FileDown, FilePieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/status/StatusBadge';
import { AttendanceStatus } from '@/types';

const Reports = () => {
  const { employees, attendanceRecords, exportToCSV, getEmployeeById } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  
  const firstDayOfMonth = startOfMonth(selectedMonth);
  const lastDayOfMonth = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  // Filter records for the selected month
  const monthStart = format(firstDayOfMonth, 'yyyy-MM-dd');
  const monthEnd = format(lastDayOfMonth, 'yyyy-MM-dd');
  
  const monthRecords = attendanceRecords.filter((record) => {
    return record.date >= monthStart && record.date <= monthEnd;
  });
  
  // Generate employee monthly summary
  const employeeSummary = employees.map((employee) => {
    const employeeRecords = monthRecords.filter(
      (record) => record.employeeId === employee.id
    );
    
    const statusCounts = {
      present: employeeRecords.filter((r) => r.status === 'present').length,
      absent: employeeRecords.filter((r) => r.status === 'absent').length,
      late: employeeRecords.filter((r) => r.status === 'late').length,
      leave: employeeRecords.filter((r) => r.status === 'leave').length,
      wfh: employeeRecords.filter((r) => r.status === 'wfh').length,
    };
    
    const totalDays = daysInMonth.length;
    const markedDays = employeeRecords.length;
    const attendanceRate = Math.round((statusCounts.present / totalDays) * 100);
    
    return {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      present: statusCounts.present,
      absent: statusCounts.absent,
      late: statusCounts.late,
      leave: statusCounts.leave,
      wfh: statusCounts.wfh,
      rate: attendanceRate,
      markedDays,
      unmarkedDays: totalDays - markedDays,
    };
  });
  
  // Get attendance calendar for a specific employee
  const getEmployeeCalendar = () => {
    if (!selectedEmployee) return [];
    
    return daysInMonth.map((day) => {
      const dateString = format(day, 'yyyy-MM-dd');
      const record = attendanceRecords.find(
        (r) => r.employeeId === selectedEmployee && r.date === dateString
      );
      
      return {
        date: day,
        status: record ? record.status : null,
        notes: record?.notes || '',
      };
    });
  };
  
  const employeeCalendar = getEmployeeCalendar();
  
  const getStatusColor = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present': return 'bg-green-100 dark:bg-green-900';
      case 'absent': return 'bg-red-100 dark:bg-red-900';
      case 'late': return 'bg-amber-100 dark:bg-amber-900';
      case 'leave': return 'bg-purple-100 dark:bg-purple-900';
      case 'wfh': return 'bg-blue-100 dark:bg-blue-900';
      default: return '';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV('employees')}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Employees
          </Button>
          <Button
            onClick={() => exportToCSV('attendance')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Attendance
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
            <CardDescription>Choose a month to view reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedMonth, 'MMMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={(date) => date && setSelectedMonth(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedEmployee && (
                <div className="text-sm space-y-2 mt-2">
                  <h4 className="font-semibold">Month Summary</h4>
                  {employeeSummary
                    .filter((summary) => summary.id === selectedEmployee)
                    .map((summary) => (
                      <div key={summary.id} className="space-y-1">
                        <div className="flex justify-between">
                          <span>Present:</span>
                          <span>{summary.present} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Absent:</span>
                          <span>{summary.absent} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late:</span>
                          <span>{summary.late} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>On Leave:</span>
                          <span>{summary.leave} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Work From Home:</span>
                          <span>{summary.wfh} days</span>
                        </div>
                        <div className="flex justify-between pt-1 font-medium">
                          <span>Attendance Rate:</span>
                          <span>{summary.rate}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedEmployee 
                ? `${getEmployeeById(selectedEmployee)?.name}'s Attendance Calendar` 
                : 'Monthly Attendance Summary'
              }
            </CardTitle>
            <CardDescription>
              {format(selectedMonth, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-medium text-sm mb-1">
                    {day}
                  </div>
                ))}
                
                {/* Add empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-16" />
                ))}
                
                {/* Calendar days */}
                {employeeCalendar.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-16 border rounded-md flex flex-col justify-between p-1 text-sm",
                      getStatusColor(day.status)
                    )}
                  >
                    <div className="font-medium">
                      {format(day.date, 'd')}
                    </div>
                    <div>
                      {day.status && (
                        <div className="mt-1">
                          <StatusBadge status={day.status} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Leave</TableHead>
                    <TableHead className="text-center">WFH</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSummary.map((summary) => (
                    <TableRow key={summary.id}>
                      <TableCell className="font-medium">{summary.name}</TableCell>
                      <TableCell className="text-center">{summary.present}</TableCell>
                      <TableCell className="text-center">{summary.absent}</TableCell>
                      <TableCell className="text-center">{summary.late}</TableCell>
                      <TableCell className="text-center">{summary.leave}</TableCell>
                      <TableCell className="text-center">{summary.wfh}</TableCell>
                      <TableCell className="text-center font-medium">
                        {summary.rate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;

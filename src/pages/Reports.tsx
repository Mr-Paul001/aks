
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar as CalendarIcon, Download, FileDown, FilePieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type ViewMode = 'daily' | 'weekly' | 'monthly';

const Reports = () => {
  const { employees, attendanceRecords, exportToCSV, getEmployeeById, orgSettings } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  
  // Get date ranges based on view mode
  const getDateRange = () => {
    if (viewMode === 'daily') {
      return {
        start: selectedDate,
        end: selectedDate,
        label: format(selectedDate, 'MMMM d, yyyy')
      };
    } else if (viewMode === 'weekly') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return {
        start: weekStart,
        end: weekEnd,
        label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      };
    } else {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      return {
        start: monthStart,
        end: monthEnd,
        label: format(selectedDate, 'MMMM yyyy')
      };
    }
  };
  
  const dateRange = getDateRange();
  const daysInRange = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  // Filter records for the selected date range
  const rangeStartStr = format(dateRange.start, 'yyyy-MM-dd');
  const rangeEndStr = format(dateRange.end, 'yyyy-MM-dd');
  
  const recordsInRange = attendanceRecords.filter((record) => {
    return record.date >= rangeStartStr && record.date <= rangeEndStr;
  });
  
  // Generate employee summary for the selected date range
  const employeeSummary = employees.map((employee) => {
    const employeeRecords = recordsInRange.filter(
      (record) => record.employeeId === employee.id
    );
    
    const statusCounts = {
      present: employeeRecords.filter((r) => r.status === 'present').length,
      absent: employeeRecords.filter((r) => r.status === 'absent').length,
      late: employeeRecords.filter((r) => r.status === 'late').length,
      leave: employeeRecords.filter((r) => r.status === 'leave').length,
      wfh: employeeRecords.filter((r) => r.status === 'wfh').length,
    };
    
    const totalDays = daysInRange.length;
    const markedDays = employeeRecords.length;
    const attendanceRate = totalDays > 0 ? Math.round((statusCounts.present / totalDays) * 100) : 0;
    
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
    
    return daysInRange.map((day) => {
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
  
  const handlePrevious = () => {
    if (viewMode === 'daily') {
      setSelectedDate(prev => addDays(prev, -1));
    } else if (viewMode === 'weekly') {
      setSelectedDate(prev => subWeeks(prev, 1));
    } else {
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'daily') {
      setSelectedDate(prev => addDays(prev, 1));
    } else if (viewMode === 'weekly') {
      setSelectedDate(prev => addWeeks(prev, 1));
    } else {
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">{orgSettings.name}</p>
        </div>
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
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>Configure your attendance report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as ViewMode)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <span className="sr-only">Previous period</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.label}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <span className="sr-only">Next period</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
                </Button>
              </div>
              
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
                  <h4 className="font-semibold">{viewMode === 'daily' ? 'Day' : viewMode === 'weekly' ? 'Week' : 'Month'} Summary</h4>
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
                ? `${getEmployeeById(selectedEmployee)?.name}'s Attendance ${viewMode === 'daily' ? 'Day' : viewMode === 'weekly' ? 'Week' : 'Month'}`
                : `${viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Attendance Summary`
              }
            </CardTitle>
            <CardDescription>
              {dateRange.label}
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
                
                {/* Only add empty cells at the start for monthly view */}
                {viewMode === 'monthly' && Array.from({ length: dateRange.start.getDay() }).map((_, index) => (
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

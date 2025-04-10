
import { useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import StatusBadge from '@/components/status/StatusBadge';
import AttendanceForm from '@/components/attendance/AttendanceForm';

const Attendance = () => {
  const { 
    employees, attendanceRecords, 
    addAttendanceRecord, getAttendanceByDate, getEmployeeById
  } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const dateAttendance = getAttendanceByDate(formattedDate);
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const handleAddSubmit = (data: any) => {
    addAttendanceRecord(data);
    setIsAddDialogOpen(false);
  };
  
  // Generate a status summary for the selected date
  const statusSummary = {
    present: dateAttendance.filter(record => record.status === 'present').length,
    absent: dateAttendance.filter(record => record.status === 'absent').length,
    late: dateAttendance.filter(record => record.status === 'late').length,
    leave: dateAttendance.filter(record => record.status === 'leave').length,
    wfh: dateAttendance.filter(record => record.status === 'wfh').length,
  };
  
  // Calculate attendance percentage
  const totalMarked = dateAttendance.length;
  const attendancePercentage = employees.length > 0
    ? Math.round((totalMarked / employees.length) * 100)
    : 0;
  
  // Get unmarked employees
  const markedEmployeeIds = dateAttendance.map(record => record.employeeId);
  const unmarkedEmployees = employees.filter(
    employee => !markedEmployeeIds.includes(employee.id)
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Attendance
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              Choose a date to view or record attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Status Summary</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md">
                    Present: {statusSummary.present}
                  </div>
                  <div className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-md">
                    Absent: {statusSummary.absent}
                  </div>
                  <div className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded-md">
                    Late: {statusSummary.late}
                  </div>
                  <div className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-md">
                    Leave: {statusSummary.leave}
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-md">
                    WFH: {statusSummary.wfh}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Completion: {attendancePercentage}%</span>
                    <span>{totalMarked}/{employees.length} marked</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dateAttendance.length > 0 ? (
              <div className="space-y-4">
                {dateAttendance.map((record) => {
                  const employee = getEmployeeById(record.employeeId);
                  return employee ? (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <div className="text-sm text-muted-foreground">
                          {employee.employeeId} • {employee.department}
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg font-medium">No attendance records for this date</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Record attendance for {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Attendance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {unmarkedEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Attendance</CardTitle>
            <CardDescription>
              Employees with no attendance record for {format(selectedDate, 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {unmarkedEmployees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.employeeId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      addAttendanceRecord({
                        employeeId: employee.id,
                        date: formattedDate,
                        status: 'present',
                        notes: ''
                      });
                    }}
                  >
                    Mark Present
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add Attendance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>
              Record attendance for an employee on {format(selectedDate, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <AttendanceForm
            employees={employees}
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;

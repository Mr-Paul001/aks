
import { useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/status/StatusBadge';
import AttendanceForm from '@/components/attendance/AttendanceForm';
import { AttendanceRecord } from '@/types';

const Records = () => {
  const {
    employees,
    attendanceRecords,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    getEmployeeById,
  } = useApp();
  
  const [search, setSearch] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  
  // Filter records
  const filteredRecords = attendanceRecords.filter((record) => {
    const employee = getEmployeeById(record.employeeId);
    
    if (!employee) return false;
    
    const matchSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      record.date.includes(search.toLowerCase()) ||
      record.status.includes(search.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(search.toLowerCase()));
    
    const matchEmployee = filterEmployee ? record.employeeId === filterEmployee : true;
    const matchStatus = filterStatus ? record.status === filterStatus : true;
    
    return matchSearch && matchEmployee && matchStatus;
  });
  
  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const handleUpdateRecord = (data: Omit<AttendanceRecord, 'id' | 'timestamp'>) => {
    if (currentRecord) {
      updateAttendanceRecord({
        ...data,
        id: currentRecord.id,
        timestamp: Date.now(),
      });
      setIsEditDialogOpen(false);
      setCurrentRecord(null);
    }
  };
  
  const handleDeleteRecord = () => {
    if (currentRecord) {
      deleteAttendanceRecord(currentRecord.id);
      setIsDeleteDialogOpen(false);
      setCurrentRecord(null);
    }
  };
  
  const openEditDialog = (record: AttendanceRecord) => {
    setCurrentRecord(record);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (record: AttendanceRecord) => {
    setCurrentRecord(record);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select
          value={filterEmployee}
          onValueChange={setFilterEmployee}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="leave">On Leave</SelectItem>
            <SelectItem value="wfh">Work From Home</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => {
                const employee = getEmployeeById(record.employeeId);
                return employee ? (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {record.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(record)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(record)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null;
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Update attendance information for an employee.
            </DialogDescription>
          </DialogHeader>
          {currentRecord && (
            <AttendanceForm
              employees={employees}
              record={currentRecord}
              onSubmit={handleUpdateRecord}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this attendance record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={handleDeleteRecord}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Records;

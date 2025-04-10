
import { AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const labels = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    leave: 'On Leave',
    wfh: 'WFH'
  };
  
  return (
    <span className={cn(
      'status-badge',
      status === 'present' && 'status-badge-present',
      status === 'absent' && 'status-badge-absent',
      status === 'late' && 'status-badge-late',
      status === 'leave' && 'status-badge-leave',
      status === 'wfh' && 'status-badge-wfh'
    )}>
      {labels[status]}
    </span>
  );
};

export default StatusBadge;

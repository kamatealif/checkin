import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceChartProps {
  classId: string;
}

export function AttendanceChart({ classId }: AttendanceChartProps) {
  const { data: stats } = useQuery({
    queryKey: ["/api/classes", classId, "stats"],
    enabled: !!classId,
  });

  if (!stats) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  // Simple visual representation since Chart.js isn't available
  const attendancePercentage = stats.averageAttendance;
  const segments = 10;
  const filledSegments = Math.round((attendancePercentage / 100) * segments);

  return (
    <div className="space-y-4" data-testid="attendance-chart">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Attendance Rate</span>
        <span className="text-lg font-semibold text-card-foreground">
          {attendancePercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="flex space-x-1">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`h-8 flex-1 rounded ${
              index < filledSegments 
                ? 'bg-primary' 
                : 'bg-muted'
            }`}
            data-testid={`chart-segment-${index}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="font-medium text-card-foreground">{stats.totalLectures}</p>
          <p className="text-muted-foreground">Total Lectures</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-card-foreground">{stats.totalStudents}</p>
          <p className="text-muted-foreground">Students</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-card-foreground">
            {Math.round((stats.averageAttendance / 100) * stats.totalStudents * stats.totalLectures)}
          </p>
          <p className="text-muted-foreground">Total Present</p>
        </div>
      </div>
    </div>
  );
}

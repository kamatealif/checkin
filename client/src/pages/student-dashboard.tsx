import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinClassSchema, type JoinClassData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, BarChart3, LogOut, Plus } from "lucide-react";

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [joinClassOpen, setJoinClassOpen] = useState(false);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/classes"],
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance/student", user?.id],
    enabled: !!user,
  });

  const joinClassForm = useForm<JoinClassData>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: {
      classCode: "",
      password: "",
      fullName: user?.fullName || "",
    },
  });

  const joinClassMutation = useMutation({
    mutationFn: async (data: JoinClassData) => {
      const res = await apiRequest("POST", "/api/classes/join", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/student"] });
      setJoinClassOpen(false);
      joinClassForm.reset();
      toast({
        title: "Success",
        description: "Successfully joined the class",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join class",
        variant: "destructive",
      });
    },
  });

  const handleJoinClass = (data: JoinClassData) => {
    joinClassMutation.mutate(data);
  };

  const calculateOverallAttendance = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter((record: any) => record.status === 'present').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  const getTodayClasses = () => {
    const today = new Date().toDateString();
    return attendance.filter((record: any) => 
      new Date(record.lecture.date).toDateString() === today
    ).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary" data-testid="text-app-title">AttendEase</h1>
              <span className="text-muted-foreground">Student Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-student-name">
                {user?.fullName}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrolled Classes</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="stat-enrolled-classes">
                    {enrollments.length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="stat-overall-attendance">
                    {calculateOverallAttendance()}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes Today</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="stat-classes-today">
                    {getTodayClasses()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">My Classes</h2>
            <Dialog open={joinClassOpen} onOpenChange={setJoinClassOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-join-class">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={joinClassForm.handleSubmit(handleJoinClass)} className="space-y-4">
                  <div>
                    <Label htmlFor="class-code">Class Code</Label>
                    <Input
                      id="class-code"
                      placeholder="Enter Class Code"
                      {...joinClassForm.register("classCode")}
                      data-testid="input-class-code"
                    />
                    {joinClassForm.formState.errors.classCode && (
                      <p className="text-sm text-destructive mt-1">
                        {joinClassForm.formState.errors.classCode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="class-password">Class Password</Label>
                    <Input
                      id="class-password"
                      type="password"
                      placeholder="Enter Password"
                      {...joinClassForm.register("password")}
                      data-testid="input-class-password"
                    />
                    {joinClassForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {joinClassForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="full-name">Your Name</Label>
                    <Input
                      id="full-name"
                      placeholder="Enter your full name"
                      {...joinClassForm.register("fullName")}
                      data-testid="input-full-name"
                    />
                    {joinClassForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">
                        {joinClassForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setJoinClassOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={joinClassMutation.isPending} data-testid="button-submit-join-class">
                      Join Class
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment: any) => {
                const classAttendance = attendance.filter((record: any) => 
                  record.lecture?.class?.id === enrollment.class?.id
                );
                const presentCount = classAttendance.filter((record: any) => record.status === 'present').length;
                const attendancePercentage = classAttendance.length > 0 
                  ? Math.round((presentCount / classAttendance.length) * 100) 
                  : 0;

                return (
                  <Card key={enrollment.id} data-testid={`card-enrollment-${enrollment.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {enrollment.class?.classCode?.substring(0, 3) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-card-foreground">
                              {enrollment.class?.name || 'Unknown Class'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Code: {enrollment.class?.classCode || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-card-foreground" data-testid={`attendance-${enrollment.id}`}>
                            {attendancePercentage}%
                          </p>
                          <p className="text-sm text-muted-foreground">Attendance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No classes joined yet. Join a class to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <div className="space-y-4">
                {attendance.slice(0, 10).map((record: any) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`attendance-record-${record.id}`}
                  >
                    <div>
                      <p className="font-medium text-card-foreground">
                        {record.lecture.class.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.lecture.title} - {new Date(record.lecture.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={record.status === 'present' ? 'default' : 'destructive'}
                      data-testid={`status-${record.id}`}
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

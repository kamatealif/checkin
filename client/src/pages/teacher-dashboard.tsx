import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClassSchema, insertLectureSchema, type Class } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Clock, 
  Plus, 
  LogOut,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { z } from "zod";
import { AttendanceChart } from "@/components/attendance-chart";

const createClassSchema = insertClassSchema.extend({
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const createLectureSchema = insertLectureSchema.extend({
  date: z.string().min(1, "Date is required"),
});

type CreateClassData = z.infer<typeof createClassSchema>;
type CreateLectureData = z.infer<typeof createLectureSchema>;

export default function TeacherDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedLectureId, setSelectedLectureId] = useState<string>("");
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [createLectureOpen, setCreateLectureOpen] = useState(false);

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["/api/classes", selectedClassId, "students"],
    enabled: !!selectedClassId,
  });

  const { data: lectures = [], isLoading: lecturesLoading } = useQuery<any[]>({
    queryKey: ["/api/classes", selectedClassId, "lectures"],
    enabled: !!selectedClassId,
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<any[]>({
    queryKey: ["/api/lectures", selectedLectureId, "attendance"],
    enabled: !!selectedLectureId,
  });

  const { data: stats } = useQuery<{
    totalLectures: number;
    totalStudents: number;
    averageAttendance: number;
  }>({
    queryKey: ["/api/classes", selectedClassId, "stats"],
    enabled: !!selectedClassId,
  });

  const createClassForm = useForm<CreateClassData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      description: "",
      password: "",
    },
  });

  const createLectureForm = useForm<CreateLectureData>({
    resolver: zodResolver(createLectureSchema),
    defaultValues: {
      title: "",
      classId: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassData) => {
      const res = await apiRequest("POST", "/api/classes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setCreateClassOpen(false);
      createClassForm.reset();
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Class creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });

  const createLectureMutation = useMutation({
    mutationFn: async (data: CreateLectureData) => {
      const res = await apiRequest("POST", "/api/lectures", {
        ...data,
        date: new Date(data.date),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId, "lectures"] });
      setCreateLectureOpen(false);
      createLectureForm.reset();
      toast({
        title: "Success",
        description: "Lecture created successfully",
      });
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const res = await apiRequest("POST", "/api/attendance", {
        lectureId: selectedLectureId,
        studentId,
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lectures", selectedLectureId, "attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClassId, "stats"] });
    },
  });

  const handleCreateClass = (data: CreateClassData) => {
    createClassMutation.mutate(data);
  };

  const handleCreateLecture = (data: CreateLectureData) => {
    createLectureMutation.mutate({
      ...data,
      classId: selectedClassId,
    });
  };

  const handleMarkAttendance = (studentId: string, status: string) => {
    markAttendanceMutation.mutate({ studentId, status });
  };

  // Get total students from all classes (simple approach)
  const totalStudents = students.length; // Will be updated when a class is selected
  const avgAttendance = stats?.averageAttendance || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary" data-testid="text-app-title">AttendEase</h1>
              <span className="text-muted-foreground">Teacher Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-teacher-name">
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="classes" data-testid="tab-classes">My Classes</TabsTrigger>
            <TabsTrigger value="attendance" data-testid="tab-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="stat-total-classes">
                        {classes.length}
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
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="stat-total-students">
                        {totalStudents}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="stat-avg-attendance">
                        {avgAttendance.toFixed(0)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
                      <p className="text-2xl font-bold text-card-foreground" data-testid="stat-active-classes">
                        {classes.length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-card-foreground">My Classes</h2>
              <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-class">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <p className="text-sm text-muted-foreground">Fill in the details to create a new class for your students.</p>
                  </DialogHeader>
                  <form onSubmit={createClassForm.handleSubmit(handleCreateClass)} className="space-y-4">
                    <div>
                      <Label htmlFor="class-name">Class Name</Label>
                      <Input
                        id="class-name"
                        placeholder="e.g., Computer Science 101"
                        {...createClassForm.register("name")}
                        data-testid="input-class-name"
                      />
                      {createClassForm.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {createClassForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="class-description">Description</Label>
                      <Textarea
                        id="class-description"
                        placeholder="Brief description of the class"
                        {...createClassForm.register("description")}
                        data-testid="input-class-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="class-password">Password</Label>
                      <Input
                        id="class-password"
                        type="password"
                        placeholder="Enter class password"
                        {...createClassForm.register("password")}
                        data-testid="input-class-password"
                      />
                      {createClassForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {createClassForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateClassOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createClassMutation.isPending} 
                        data-testid="button-submit-create-class"
                      >
                        {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls: Class) => (
                <Card key={cls.id} className="hover:shadow-lg transition-shadow" data-testid={`card-class-${cls.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Class Code:</span>
                      <span className="font-mono text-card-foreground">{cls.classCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="text-card-foreground">
                        {selectedClassId === cls.id ? students.length : '...'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedClassId(cls.id)}
                        data-testid={`button-view-class-${cls.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-card-foreground">Mark Attendance</h2>
              <div className="flex items-center space-x-4">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-48" data-testid="select-class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: Class) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedClassId && (
                  <Dialog open={createLectureOpen} onOpenChange={setCreateLectureOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-lecture">
                        <Calendar className="w-4 h-4 mr-2" />
                        New Lecture
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Lecture</DialogTitle>
                        <p className="text-sm text-muted-foreground">Schedule a new lecture for the selected class.</p>
                      </DialogHeader>
                      <form onSubmit={createLectureForm.handleSubmit(handleCreateLecture)} className="space-y-4">
                        <div>
                          <Label htmlFor="lecture-title">Lecture Title</Label>
                          <Input
                            id="lecture-title"
                            placeholder="e.g., Introduction to React"
                            {...createLectureForm.register("title")}
                            data-testid="input-lecture-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lecture-date">Date</Label>
                          <Input
                            id="lecture-date"
                            type="date"
                            {...createLectureForm.register("date")}
                            data-testid="input-lecture-date"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setCreateLectureOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createLectureMutation.isPending} data-testid="button-submit-create-lecture">
                            Create Lecture
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {selectedClassId && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Select Lecture</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Select value={selectedLectureId} onValueChange={setSelectedLectureId}>
                    <SelectTrigger data-testid="select-lecture">
                      <SelectValue placeholder="Select a lecture" />
                    </SelectTrigger>
                    <SelectContent>
                      {lectures.map((lecture: any) => (
                        <SelectItem key={lecture.id} value={lecture.id}>
                          {lecture.title} - {new Date(lecture.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedLectureId && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((enrollment: any) => {
                      const studentAttendance = attendance.find((att: any) => 
                        att.studentId === enrollment.student.id
                      );
                      
                      return (
                        <div 
                          key={enrollment.student.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                          data-testid={`row-student-${enrollment.student.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {enrollment.student.fullName.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{enrollment.student.fullName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {studentAttendance && (
                              <Badge 
                                variant={studentAttendance.status === 'present' ? 'default' : 'destructive'}
                                className="mr-2"
                              >
                                {studentAttendance.status}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant={studentAttendance?.status === 'present' ? 'default' : 'outline'}
                              onClick={() => handleMarkAttendance(enrollment.student.id, 'present')}
                              disabled={markAttendanceMutation.isPending}
                              data-testid={`button-present-${enrollment.student.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={studentAttendance?.status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => handleMarkAttendance(enrollment.student.id, 'absent')}
                              disabled={markAttendanceMutation.isPending}
                              data-testid={`button-absent-${enrollment.student.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-card-foreground">Attendance Analytics</h2>
            
            {selectedClassId && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart classId={selectedClassId} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Class Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats && (
                      <>
                        <div className="flex justify-between">
                          <span>Total Lectures:</span>
                          <span className="font-medium" data-testid="stat-class-lectures">{stats.totalLectures}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Enrolled Students:</span>
                          <span className="font-medium" data-testid="stat-class-students">{stats.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Attendance:</span>
                          <span className="font-medium" data-testid="stat-class-attendance">{stats.averageAttendance.toFixed(1)}%</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!selectedClassId && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Select a class to view analytics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

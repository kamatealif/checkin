import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2, Users, BookOpen } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const teacherRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const studentRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  prn: z.string().min(1, "PRN is required for students"),
  year: z.string().min(1, "Year is required for students"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type TeacherRegisterFormData = z.infer<typeof teacherRegisterSchema>;
type StudentRegisterFormData = z.infer<typeof studentRegisterSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [registerRole, setRegisterRole] = useState<'teacher' | 'student'>('student');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const teacherRegisterForm = useForm<TeacherRegisterFormData>({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: { 
      username: "", 
      password: "", 
      confirmPassword: "", 
      role: "teacher", 
      fullName: "",
      email: "",
      branch: ""
    },
  });

  const studentRegisterForm = useForm<StudentRegisterFormData>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { 
      username: "", 
      password: "", 
      confirmPassword: "", 
      role: "student", 
      fullName: "",
      email: "",
      branch: "",
      prn: "",
      year: ""
    },
  });

  // Use useEffect to prevent setState during render
  React.useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        setLocation('/teacher');
      } else {
        setLocation('/student');
      }
    }
  }, [user, setLocation]);

  // Return loading state while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.role === 'teacher') {
          setLocation('/teacher');
        } else {
          setLocation('/student');
        }
      },
    });
  };

  const handleTeacherRegister = (data: TeacherRegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: (user) => {
        setLocation('/teacher');
      },
    });
  };

  const handleStudentRegister = (data: StudentRegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: (user) => {
        setLocation('/student');
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">AttendEase</h1>
            <p className="text-lg text-muted-foreground">Smart Attendance Management</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <p className="text-muted-foreground">Sign in or create an account</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4" data-testid="login-form">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username")}
                        data-testid="input-username-login"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        data-testid="input-password-login"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role-select">I am a</Label>
                      <Select onValueChange={(value: 'teacher' | 'student') => setRegisterRole(value)} defaultValue="student">
                        <SelectTrigger data-testid="select-register-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student" data-testid="option-student">Student</SelectItem>
                          <SelectItem value="teacher" data-testid="option-teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {registerRole === 'teacher' ? (
                      <form onSubmit={teacherRegisterForm.handleSubmit(handleTeacherRegister)} className="space-y-4" data-testid="teacher-register-form">
                        <div>
                          <Label htmlFor="teacher-fullName">Full Name</Label>
                          <Input
                            id="teacher-fullName"
                            type="text"
                            placeholder="Enter your full name"
                            {...teacherRegisterForm.register("fullName")}
                            data-testid="input-teacher-fullname"
                          />
                          {teacherRegisterForm.formState.errors.fullName && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="teacher-email">Email</Label>
                          <Input
                            id="teacher-email"
                            type="email"
                            placeholder="Enter your email"
                            {...teacherRegisterForm.register("email")}
                            data-testid="input-teacher-email"
                          />
                          {teacherRegisterForm.formState.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="teacher-branch">Branch/Department</Label>
                          <Input
                            id="teacher-branch"
                            type="text"
                            placeholder="e.g., Computer Science"
                            {...teacherRegisterForm.register("branch")}
                            data-testid="input-teacher-branch"
                          />
                          {teacherRegisterForm.formState.errors.branch && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.branch.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="teacher-username">Username</Label>
                          <Input
                            id="teacher-username"
                            type="text"
                            placeholder="Choose a username"
                            {...teacherRegisterForm.register("username")}
                            data-testid="input-teacher-username"
                          />
                          {teacherRegisterForm.formState.errors.username && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="teacher-password">Password</Label>
                          <Input
                            id="teacher-password"
                            type="password"
                            placeholder="Create a password"
                            {...teacherRegisterForm.register("password")}
                            data-testid="input-teacher-password"
                          />
                          {teacherRegisterForm.formState.errors.password && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="teacher-confirmPassword">Confirm Password</Label>
                          <Input
                            id="teacher-confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            {...teacherRegisterForm.register("confirmPassword")}
                            data-testid="input-teacher-confirm-password"
                          />
                          {teacherRegisterForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive mt-1">
                              {teacherRegisterForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                          data-testid="button-teacher-register"
                        >
                          {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Teacher Account
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={studentRegisterForm.handleSubmit(handleStudentRegister)} className="space-y-4" data-testid="student-register-form">
                        <div>
                          <Label htmlFor="student-fullName">Full Name</Label>
                          <Input
                            id="student-fullName"
                            type="text"
                            placeholder="Enter your full name"
                            {...studentRegisterForm.register("fullName")}
                            data-testid="input-student-fullname"
                          />
                          {studentRegisterForm.formState.errors.fullName && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-email">Email</Label>
                          <Input
                            id="student-email"
                            type="email"
                            placeholder="Enter your email"
                            {...studentRegisterForm.register("email")}
                            data-testid="input-student-email"
                          />
                          {studentRegisterForm.formState.errors.email && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-prn">PRN</Label>
                          <Input
                            id="student-prn"
                            type="text"
                            placeholder="Enter your PRN"
                            {...studentRegisterForm.register("prn")}
                            data-testid="input-student-prn"
                          />
                          {studentRegisterForm.formState.errors.prn && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.prn.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-branch">Branch</Label>
                          <Input
                            id="student-branch"
                            type="text"
                            placeholder="e.g., Computer Science"
                            {...studentRegisterForm.register("branch")}
                            data-testid="input-student-branch"
                          />
                          {studentRegisterForm.formState.errors.branch && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.branch.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-year">Year</Label>
                          <Select onValueChange={(value) => studentRegisterForm.setValue("year", value)}>
                            <SelectTrigger data-testid="select-student-year">
                              <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="First Year">First Year</SelectItem>
                              <SelectItem value="Second Year">Second Year</SelectItem>
                              <SelectItem value="Third Year">Third Year</SelectItem>
                              <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                            </SelectContent>
                          </Select>
                          {studentRegisterForm.formState.errors.year && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.year.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-username">Username</Label>
                          <Input
                            id="student-username"
                            type="text"
                            placeholder="Choose a username"
                            {...studentRegisterForm.register("username")}
                            data-testid="input-student-username"
                          />
                          {studentRegisterForm.formState.errors.username && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-password">Password</Label>
                          <Input
                            id="student-password"
                            type="password"
                            placeholder="Create a password"
                            {...studentRegisterForm.register("password")}
                            data-testid="input-student-password"
                          />
                          {studentRegisterForm.formState.errors.password && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="student-confirmPassword">Confirm Password</Label>
                          <Input
                            id="student-confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            {...studentRegisterForm.register("confirmPassword")}
                            data-testid="input-student-confirm-password"
                          />
                          {studentRegisterForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive mt-1">
                              {studentRegisterForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                          data-testid="button-student-register"
                        >
                          {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Student Account
                        </Button>
                      </form>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex lg:flex-1 lg:bg-primary lg:relative">
        <div className="flex flex-col items-center justify-center px-8 text-primary-foreground">
          <div className="max-w-md text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">
                Streamline Attendance Management
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Effortlessly track student attendance with our smart, user-friendly platform designed for modern classrooms.
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-secondary-foreground">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Real-time Tracking</h4>
                  <p className="text-sm text-primary-foreground/70">
                    Mark attendance instantly with comprehensive analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-secondary-foreground">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Smart Dashboard</h4>
                  <p className="text-sm text-primary-foreground/70">
                    Get detailed insights and reports on attendance patterns
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-secondary-foreground">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold">Easy Class Management</h4>
                  <p className="text-sm text-primary-foreground/70">
                    Create and manage classes with secure access codes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

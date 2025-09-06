import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertClassSchema, 
  insertLectureSchema, 
  joinClassSchema,
  type InsertAttendance 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Class routes
  app.post("/api/classes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'teacher') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const classData = insertClassSchema.parse(req.body);
      
      // Generate unique class code
      const classCode = `${classData.name.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;
      
      const newClass = await storage.createClass({
        ...classData,
        classCode,
        teacherId: req.user.id
      });

      res.status(201).json(newClass);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/classes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.user.role === 'teacher') {
        const classes = await storage.getClassesByTeacher(req.user.id);
        res.json(classes);
      } else {
        const enrollments = await storage.getStudentEnrollments(req.user.id);
        res.json(enrollments);
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/classes/join", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'student') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { classCode, password, fullName } = joinClassSchema.parse(req.body);
      
      const classItem = await storage.getClassByCode(classCode);
      if (!classItem) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (classItem.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Check if already enrolled
      const isEnrolled = await storage.isStudentEnrolled(req.user.id, classItem.id);
      if (isEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this class" });
      }

      // Update user's full name if provided
      if (fullName && fullName !== req.user.fullName) {
        // Note: In a real app, you might want to update the user's name
      }

      const enrollment = await storage.enrollStudent({
        studentId: req.user.id,
        classId: classItem.id
      });

      res.status(201).json({ enrollment, class: classItem });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/classes/:classId/students", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'teacher') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { classId } = req.params;
      const enrollments = await storage.getClassEnrollments(classId);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });

  // Lecture routes
  app.post("/api/lectures", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'teacher') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const lectureData = insertLectureSchema.parse(req.body);
      const lecture = await storage.createLecture(lectureData);
      res.status(201).json(lecture);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/classes/:classId/lectures", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { classId } = req.params;
      const lectures = await storage.getLecturesByClass(classId);
      res.json(lectures);
    } catch (error) {
      next(error);
    }
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'teacher') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const attendanceSchema = z.object({
        lectureId: z.string(),
        studentId: z.string(),
        status: z.enum(['present', 'absent', 'late'])
      });

      const attendanceData = attendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/lectures/:lectureId/attendance", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { lectureId } = req.params;
      const attendance = await storage.getAttendanceForLecture(lectureId);
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/attendance/student/:studentId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { studentId } = req.params;
      const { classId } = req.query;
      
      // Students can only view their own attendance
      if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const attendance = await storage.getStudentAttendance(
        studentId, 
        classId as string | undefined
      );
      res.json(attendance);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/classes/:classId/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { classId } = req.params;
      const stats = await storage.getAttendanceStats(classId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

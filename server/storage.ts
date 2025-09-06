import { 
  users, 
  classes, 
  enrollments, 
  lectures, 
  attendanceRecords,
  type User, 
  type InsertUser,
  type Class,
  type InsertClass,
  type Enrollment,
  type InsertEnrollment,
  type Lecture,
  type InsertLecture,
  type AttendanceRecord,
  type InsertAttendance
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Class methods
  createClass(classData: InsertClass & { teacherId: string; classCode: string }): Promise<Class>;
  getClassByCode(classCode: string): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  getClassById(classId: string): Promise<Class | undefined>;

  // Enrollment methods
  enrollStudent(enrollment: InsertEnrollment): Promise<Enrollment>;
  getStudentEnrollments(studentId: string): Promise<(Enrollment & { class: Class })[]>;
  getClassEnrollments(classId: string): Promise<(Enrollment & { student: User })[]>;
  isStudentEnrolled(studentId: string, classId: string): Promise<boolean>;

  // Lecture methods
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  getLecturesByClass(classId: string): Promise<Lecture[]>;
  getLectureById(lectureId: string): Promise<Lecture | undefined>;

  // Attendance methods
  markAttendance(attendance: InsertAttendance): Promise<AttendanceRecord>;
  getAttendanceForLecture(lectureId: string): Promise<(AttendanceRecord & { student: User })[]>;
  getStudentAttendance(studentId: string, classId?: string): Promise<(AttendanceRecord & { lecture: Lecture & { class: Class } })[]>;
  getAttendanceStats(classId: string): Promise<{
    totalLectures: number;
    totalStudents: number;
    averageAttendance: number;
  }>;
  updateAttendance(lectureId: string, studentId: string, status: string): Promise<AttendanceRecord>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createClass(classData: InsertClass & { teacherId: string; classCode: string }): Promise<Class> {
    const [newClass] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return newClass;
  }

  async getClassByCode(classCode: string): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.classCode, classCode));
    return classItem;
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId));
  }

  async getClassById(classId: string): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.id, classId));
    return classItem;
  }

  async enrollStudent(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async getStudentEnrollments(studentId: string): Promise<(Enrollment & { class: Class })[]> {
    return await db
      .select()
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(eq(enrollments.studentId, studentId))
      .then(results => results.map(result => ({
        ...result.enrollments,
        class: result.classes
      })));
  }

  async getClassEnrollments(classId: string): Promise<(Enrollment & { student: User })[]> {
    return await db
      .select()
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.classId, classId))
      .then(results => results.map(result => ({
        ...result.enrollments,
        student: result.users
      })));
  }

  async isStudentEnrolled(studentId: string, classId: string): Promise<boolean> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.classId, classId)
      ));
    return !!enrollment;
  }

  async createLecture(lecture: InsertLecture): Promise<Lecture> {
    const [newLecture] = await db
      .insert(lectures)
      .values(lecture)
      .returning();
    return newLecture;
  }

  async getLecturesByClass(classId: string): Promise<Lecture[]> {
    return await db
      .select()
      .from(lectures)
      .where(eq(lectures.classId, classId))
      .orderBy(desc(lectures.date));
  }

  async getLectureById(lectureId: string): Promise<Lecture | undefined> {
    const [lecture] = await db.select().from(lectures).where(eq(lectures.id, lectureId));
    return lecture;
  }

  async markAttendance(attendance: InsertAttendance): Promise<AttendanceRecord> {
    // First, try to update existing attendance record
    const [existingRecord] = await db
      .select()
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.lectureId, attendance.lectureId),
        eq(attendanceRecords.studentId, attendance.studentId)
      ));

    if (existingRecord) {
      const [updatedRecord] = await db
        .update(attendanceRecords)
        .set({ status: attendance.status, markedAt: new Date() })
        .where(eq(attendanceRecords.id, existingRecord.id))
        .returning();
      return updatedRecord;
    } else {
      const [newRecord] = await db
        .insert(attendanceRecords)
        .values(attendance)
        .returning();
      return newRecord;
    }
  }

  async getAttendanceForLecture(lectureId: string): Promise<(AttendanceRecord & { student: User })[]> {
    return await db
      .select()
      .from(attendanceRecords)
      .innerJoin(users, eq(attendanceRecords.studentId, users.id))
      .where(eq(attendanceRecords.lectureId, lectureId))
      .then(results => results.map(result => ({
        ...result.attendance_records,
        student: result.users
      })));
  }

  async getStudentAttendance(studentId: string, classId?: string): Promise<(AttendanceRecord & { lecture: Lecture & { class: Class } })[]> {
    let query = db
      .select()
      .from(attendanceRecords)
      .innerJoin(lectures, eq(attendanceRecords.lectureId, lectures.id))
      .innerJoin(classes, eq(lectures.classId, classes.id))
      .where(eq(attendanceRecords.studentId, studentId))
      .orderBy(desc(lectures.date));

    if (classId) {
      query = query.where(eq(classes.id, classId));
    }

    return await query.then(results => results.map(result => ({
      ...result.attendance_records,
      lecture: {
        ...result.lectures,
        class: result.classes
      }
    })));
  }

  async getAttendanceStats(classId: string): Promise<{
    totalLectures: number;
    totalStudents: number;
    averageAttendance: number;
  }> {
    const lecturesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(lectures)
      .where(eq(lectures.classId, classId));

    const studentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(eq(enrollments.classId, classId));

    const attendanceStats = await db
      .select({ 
        totalPresent: sql<number>`count(case when ${attendanceRecords.status} = 'present' then 1 end)`,
        totalRecords: sql<number>`count(*)`
      })
      .from(attendanceRecords)
      .innerJoin(lectures, eq(attendanceRecords.lectureId, lectures.id))
      .where(eq(lectures.classId, classId));

    const totalLectures = lecturesCount[0]?.count || 0;
    const totalStudents = studentsCount[0]?.count || 0;
    const { totalPresent, totalRecords } = attendanceStats[0] || { totalPresent: 0, totalRecords: 0 };
    
    const averageAttendance = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      totalLectures,
      totalStudents,
      averageAttendance
    };
  }

  async updateAttendance(lectureId: string, studentId: string, status: string): Promise<AttendanceRecord> {
    const attendance = await this.markAttendance({ lectureId, studentId, status });
    return attendance;
  }
}

export const storage = new DatabaseStorage();

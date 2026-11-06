export interface LessonDTO {
  _id: string;
  title: string;
  durationMin: number;
  videoUrl?: string;
  notes?: string;
}

export interface ModuleDTO {
  _id: string;
  title: string;
  lessons: LessonDTO[];
}

export interface CourseDTO {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  instructor: string;
  price: number;
  originalPrice: number;
  features: string[];
  modules: ModuleDTO[];
  published: boolean;
  enrolledCount: number;
  createdAt?: string;
}

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  phone?: string;
  createdAt?: string;
}

export interface EnrollmentDTO {
  _id: string;
  status: "active" | "revoked";
  source: "razorpay" | "free" | "admin";
  completedLessons: string[];
  progressPercent: number;
  lastLessonId?: string;
  completedAt?: string;
  createdAt: string;
  course: CourseDTO;
}

export function lessonCount(course: Pick<CourseDTO, "modules">): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function totalMinutes(course: Pick<CourseDTO, "modules">): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMin || 0), 0), 0);
}

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const lessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  durationMin: { type: Number, default: 10, min: 0 },
  videoUrl: { type: String, default: "", trim: true },
  notes: { type: String, default: "" },
});

const moduleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  lessons: { type: [lessonSchema], default: [] },
});

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    durationWeeks: { type: Number, required: true, min: 1 },
    instructor: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // INR (rupees)
    originalPrice: { type: Number, default: 0, min: 0 },
    features: { type: [String], default: [] },
    modules: { type: [moduleSchema], default: [] },
    published: { type: Boolean, default: true, index: true },
    enrolledCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", shortDescription: "text", category: "text" });

const Course: Model<InferSchemaType<typeof courseSchema>> =
  (mongoose.models.Course as Model<InferSchemaType<typeof courseSchema>>) || mongoose.model("Course", courseSchema);

export default Course;

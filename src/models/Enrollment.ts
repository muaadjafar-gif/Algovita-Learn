import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
    source: { type: String, enum: ["razorpay", "free", "admin"], default: "razorpay" },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    completedLessons: { type: [String], default: [] },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    lastLessonId: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment: Model<InferSchemaType<typeof enrollmentSchema>> =
  (mongoose.models.Enrollment as Model<InferSchemaType<typeof enrollmentSchema>>) ||
  mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

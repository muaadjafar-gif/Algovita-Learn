import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: "", index: true },
    razorpaySignature: { type: String, default: "" },
    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
    failureReason: { type: String, default: "" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Payment: Model<InferSchemaType<typeof paymentSchema>> =
  (mongoose.models.Payment as Model<InferSchemaType<typeof paymentSchema>>) || mongoose.model("Payment", paymentSchema);

export default Payment;

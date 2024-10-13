const mongoose = require("mongoose");
const { Schema } = mongoose;

// Enum values
const subscriptionEnum = [1, 2, 3]; // You can replace these with actual labels if needed
// 1-monthly ,2-quaterly ,3-yearly
const trainingEnum = [1, 2, 3, 4, 5, 6]; // You can replace these with actual labels if needed
// 1-cardio-m 2-cardio-f ,3-strength ,4-personal training ,5-group classes
const memberSchema = new Schema(
  {
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    mobile: {
      type: String,
      // unique: true,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    gender: {
      type: String,
      enum: [1, 2], //1-male ,2-female
      required: true,
    }, // Use string for clarity
    address: { type: String, maxlength: 200 },
    training: {
      type: Number,
      // enum: {
      //   values: trainingEnum,
      //   message: "enum validator failed for trainingType",
      // },
      required: true,
    }, // Training enum (1-4)
    picture: { type: String }, // Optional, consider a default placeholder
    SubscriptionType: {
      type: Number,
      enum: {
        values: subscriptionEnum,
        message: "enum validator failed for subscriptionType",
      },
      required: true,
    }, // Subscription enum (1-4)
    fees: {
      type: Number,
      required: true,
      min: [0, "Fees must be a positive number"],
    },
    // payHistory: [
    //   {
    //     amount: {
    //       type: Number,
    //       required: true,
    //       min: [0, "Fees must be a positive number"],
    //     },
    //     date: {
    //       type: Date,
    //       required: true,
    //     },
    //     method: {
    //       type: String,
    //       required: true,
    //       enum: ["cash", "card", "upi"], // Example methods, adjust as needed
    //     },
    //   },
    // ],
    dueDate: { type: Date, required: true },
    startMonthDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Virtual to transform _id to id for frontend
const virtual = memberSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
memberSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

module.exports.Member = mongoose.model("Member", memberSchema);

const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Enum for subscription types
const subscriptionType = {
  values: [1, 2, 3],
  message: "Invalid subscription type", // 1 - Monthly, 2 - Quarterly, 3 - Yearly
};

// Enum for subscription status
const subscriptionStatus = {
  values: [1, 2],
  message: "Invalid subscription status", // 1 - Active, 2 - Deactivated
};

// Define Gym Schema
const GymSchema = new Schema(
  {
    // Email of the gym owner (must be unique)
    email: { type: String, required: true, unique: true },

    // Password (6-12 characters long)
    password: {
      type: String,

      required: true,
    },
    teams: [
      {
        teamName: { type: String, required: true }, // Name of the team
        teamSalary: { type: Number, required: true }, // Salary of the team
        teamType: { type: String, required: true, enum: ["trainer", "other"] }, // Type of team (trainer or other)
        status: {
          type: String,
          enum: ["Active", "Inactive"],
          default: "Active",
        }, // Status of the team
      },
    ],
    // Gym owner details
    gymOwnerName: { type: String, required: true },
    gymOwnerMobile: { type: String, required: true },

    // Gym details
    gymName: { type: String, required: true },
    gymAddress: { type: String, required: true },

    // Subscription pricing and details
    subscriptionCharge: { type: Number, required: true }, // Total subscription charge
    paymentDue: { type: Number, default: 0 }, // Outstanding payment
    paymentDueDate: { type: Date }, // Payment due date

    // Subscription type (Monthly, Quarterly, Yearly)
    subscriptionType: { type: Number, enum: subscriptionType, required: true },

    // Status of the subscription (Active or Deactivated)
    status: { type: Number, enum: subscriptionStatus, required: true },

    // Subscription start and end dates
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, required: true },

    // Maximum number of members the gym can handle
    gymCapacity: { type: Number, default: 0 },

    // List of services offered by the gym
    servicesOffered: [
      {
        serviceNumber: {
          type: Number,
          required: true,
        },
        serviceName: {
          type: String,
          required: true,
        },
        serviceCharge: {
          monthly: { type: Number, required: true }, // Price for monthly subscription
          quarterly: { type: Number, required: true }, // Price for quarterly subscription
          yearly: { type: Number, required: true }, // Price for yearly subscription
        },
      },
    ],

    // History of service price changes
    servicesPriceChangeHistory: [
      {
        serviceNumber: {
          type: Number,
          required: true,
        },
        serviceName: {
          type: String,
          required: true,
        },
        subscriptionType: {
          type: String,
          required: true,
          enum: ["monthly", "quarterly", "yearly"], // Type of subscription for which the price changed
        },
        previousCharge: { type: Number, required: true }, // Previous price before change
        currentCharge: { type: Number, required: true }, // Updated price
        date: { type: Date, default: Date.now }, // Date of the price update
      },
    ],

    // Payment history of the gym owner
    paymentHistory: [
      {
        amountPaid: { type: Number, required: true },
        paymentDate: { type: Date, required: true },

        paymentMethod: {
          type: String,
          required: true,
          enum: ["cash", "card", "upi"],
        }, // Payment method (e.g., credit card, cash)
      },
    ],

    expenses: [
      {
        month: { type: String, required: true }, // e.g., "August"
        year: { type: String, required: true }, // e.g., "2024"
        expenseName: { type: String, required: true }, // e.g., "Rent"
        totalAmount: { type: Number, required: true }, // e.g., 1500
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Gym operating hours for each day
    gymOpeningHours: {
      monday: { open: { type: String }, close: { type: String } },
      tuesday: { open: { type: String }, close: { type: String } },
      wednesday: { open: { type: String }, close: { type: String } },
      thursday: { open: { type: String }, close: { type: String } },
      friday: { open: { type: String }, close: { type: String } },
      saturday: { open: { type: String }, close: { type: String } },
      sunday: { open: { type: String }, close: { type: String } },
    },

    // Discount for gym subscriptions
    subscriptionDiscount: { type: Number, default: 0 },

    // URL for the gym's logo image
    gymLogo: { type: String },

    // Refresh token for authentication
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: String },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Virtual property to get the gym's ID for front-end usage (convert _id to id)
const virtual = GymSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
GymSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id; // Remove _id from JSON output
  },
});

// Pre-save hook to hash password before saving to database
GymSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password with hashed password
GymSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate access token for authentication
GymSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      gymName: this.gymName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Method to generate refresh token for authentication
GymSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

module.exports = mongoose.model("Gym", GymSchema);

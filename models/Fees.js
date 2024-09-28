const mongoose = require("mongoose");

const { Schema } = mongoose;

const feesSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref:"Member" },
    gymId:{ type: Schema.Types.ObjectId, ref:"Gym" },
    amount: { type: Number },
    paymentMode: { type: String},//upi,card,cash

  },
  { timestamps: true }
);

// to chnage _id to id for frontend
const virtual = feesSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
feesSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Fees = mongoose.model("Fees", feesSchema);

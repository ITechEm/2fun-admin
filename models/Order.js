import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    line_items: Object,
    name: String,
    email: String,
    phone: { type: Number, required: true },
    city: String,
    postalCode: String,
    streetAddress: String,
    country: String,
    paid: Boolean,
    trackOrder: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Cancelled",
        "Pending",
        "In Progress",
        "Ready for Delivery",
        "In Delivery",
        "Delivered"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

export const Order = models?.Order || model("Order", OrderSchema);

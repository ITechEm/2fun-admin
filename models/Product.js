import mongoose, {model, Schema, models} from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  images: [String],
  category: mongoose.Schema.Types.ObjectId,
  properties: Object,
  quantity: Number,
  inStock: { type: Boolean, default: true }, // Ensure this field is part of the schema
});

export const Product = models.Product || model('Product', ProductSchema);
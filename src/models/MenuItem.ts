import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  restaurantId: mongoose.Types.ObjectId;
}

const MenuItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

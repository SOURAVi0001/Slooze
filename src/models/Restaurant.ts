import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  country: string;
  address: string;
  cuisine: string;
  menuItems: mongoose.Types.ObjectId[];
}

const RestaurantSchema: Schema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  cuisine: { type: String, required: true },
  menuItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }]
}, { timestamps: true });

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

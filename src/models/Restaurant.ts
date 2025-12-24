import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  country: string;
  address: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  isPromoted: boolean;
  openingHours: {
    open: string;
    close: string;
  };
  menuItems: mongoose.Types.ObjectId[];
}

const RestaurantSchema: Schema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' },
  isPromoted: { type: Boolean, default: false },
  openingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' }
  },
  menuItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }]
}, { timestamps: true });

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

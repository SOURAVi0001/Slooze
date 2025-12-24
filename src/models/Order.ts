import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '@/types';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: {
    menuItemId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  country: string;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDeliveryTime: number; // in minutes
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  country: { type: String, required: true },
  paymentMethod: { type: String, default: 'Credit Card' },
  deliveryAddress: { type: String, default: 'Default Address' },
  estimatedDeliveryTime: { type: Number, default: 30 },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

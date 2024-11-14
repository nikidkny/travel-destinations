import mongoose from 'mongoose';
import { type Destination as DestinationType } from '@packages/types';

const destinationSchema = new mongoose.Schema<DestinationType>({
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  date_start: {
    type: Date,
    required: true,
  },
  date_end: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  user_id: {
    type: String,
    required: true,
  },
});

export const Destination = mongoose.model<DestinationType>('Destination', destinationSchema);

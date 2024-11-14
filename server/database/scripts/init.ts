import { connection as mongo } from '../connection';
import { User, Destination } from '../schema';
import { Destination as DestinationType } from '@packages/types';
import bcrypt from 'bcrypt';

await User.deleteMany({});
await Destination.deleteMany({});

const now = new Date();
const nextMonth = new Date();
nextMonth.setMonth(now.getMonth() + 1);

const admin = await new User({
  name: 'admin',
  username: 'admin',
  password: await bcrypt.hash('admin', 10),
}).save();

const DESTINATIONS: DestinationType[] = [
  {
    location: '1111 Avenue',
    country: 'Barbados',
    date_start: now,
    date_end: nextMonth,
    image: './placeholder-img.png',
    description: 'The 1111th Avenue',
    user_id: admin._id.toString(),
  },
  {
    location: 'Copenhagen, Hovedstaden',
    country: 'Denmark',
    date_start: now,
    date_end: nextMonth,
    image: './placeholder-img.png',
    description: 'The capital city of Denmark',
    user_id: admin._id.toString(),
  },
  {
    location: 'Poppy Flower Field',
    country: 'Afghanistan',
    date_start: now,
    date_end: nextMonth,
    image: './placeholder-img.png',
    description: 'From where three-letter agencies source raw material for the opioid crisis',
    user_id: admin._id.toString(),
  },
];

await Destination.insertMany(DESTINATIONS);

await mongo.connection.close();

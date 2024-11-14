import { Country } from './country';

export type Destination = {
  location: string;
  country: Country;
  date_start: Date;
  date_end: Date;
  image: string;
  description: string;
  user_id: string;
};

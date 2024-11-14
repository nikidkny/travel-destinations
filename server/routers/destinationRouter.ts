import { Router } from 'express';
import { Destination, User } from '../database';
import { authenticator } from '../utils/auth';
import { BSON } from 'mongodb';
import mongoose from 'mongoose';

const router = Router();

// Route to get all destinations (no authentication required)
router.get('/', async (_req, res) => {
  try {
    const allDestinations = await Destination.find();
    res.status(200).json(allDestinations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/get/:id', authenticator, async (req, res) => {
  try {
    res.status(200).json(await Destination.findOne({ _id: req.params.id }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// route to post a destination
router.post('/', authenticator, async (req, res) => {
  try {
    const { location, country, description, date_start, date_end, image } = req.body;

    if (!location || !country || !description || !date_start || !date_end) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const username = res.locals.userInfo?.username;
    if (!username) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing user information' });
    }

    const user = await User.findOne({ username }).select('_id');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
    }

    const destinationData = {
      user_id: user._id,
      location,
      country,
      description,
      date_start: new Date(date_start),
      date_end: new Date(date_end),
      image,
    };

    const destination = new Destination(destinationData);
    await destination.save();

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (e) {
    console.error('Error while saving destination:', e);
    res.status(500).json({ success: false, message: 'Unable to save destination' });
  }
});

// Route to update a destination
router.patch('/:id', authenticator, async (req, res) => {
  try {
    const username = res.locals.userInfo?.username;
    if (!username) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing user information' });
    }

    const user = await User.findOne({ username }).select('_id');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      res.status(404).json({ success: false, message: 'Destination not found' });
    }

    if (destination.user_id.toString() !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: Not your destination' });
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: updatedDestination,
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: 'Unable to update destination', error: e.message });
  }
});

// Route to get destinations of the logged-in user (authentication required)
router.get('/user', authenticator, async (req, res) => {
  try {
    const username = res.locals.userInfo?.username;
    const user = await User.findOne({ username }).select('_id');
    const userId = new mongoose.Types.ObjectId(user._id);
    console.log('Fetching destinations for user:', userId); // Log the user ID

    const userDestinations = await Destination.find({ user_id: userId });
    res.status(200).json(userDestinations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// delete a destination if the user is authenticated
router.delete('/:id', authenticator, async (req, res) => {
  try {
    const destinationId = req.params.id;
    console.log('Destination ID:', destinationId);

    // Convert the userId to a MongoDB ObjectId using the 'new' keyword
    const userId = new BSON.ObjectId(res.locals.userInfo.id);
    console.log('User ID:', userId);

    // Query the destination by _id and user_id
    const destination = await Destination.findOne({ _id: destinationId, user_id: userId });

    if (!destination) {
      res.status(404).json({ message: 'Destination not found' });
      return;
    }

    await Destination.deleteOne({ _id: destinationId });
    res.status(200).json({ message: 'Destination deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
export default router;

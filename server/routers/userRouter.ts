import { Router } from 'express';
import { User } from '../database';
import { authenticator } from '../utils/auth';

const router = Router();
// This implementation makes all this router's routes protected, you can also include it with individual endpoints if you like
router.use(authenticator);

router.get('/', async (req, res) => {
  try {
    res.status(200).json(await User.find());
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;

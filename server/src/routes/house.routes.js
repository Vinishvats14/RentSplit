import express from 'express';
import { 
  createHouse, 
  getHouse, 
  updateHouse, 
  deleteHouse,
  joinHouse,
  leaveHouse
} from '../controllers/house.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all houses or create a new house

//router.post('/', protect, createHouse);      we can also use this line instead of the below line 
router.route('/')
  .get(getHouse)
  .post(createHouse);

router.route('/:id')
  .put(updateHouse)
  .delete(deleteHouse);

router.route('/:id/join')
  .post(joinHouse);

router.route('/:id/leave')
  .post(leaveHouse);

export default router;

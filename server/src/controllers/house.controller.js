import House from '../models/House.js';
// @desc    Create new house
// @route   POST /api/houses
// @access  Private
export const createHouse = async (req, res) => {
  try {
    const { name, address, description } = req.body;
    
    const house = await House.create({
      name,
      address,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });

    await house.populate('owner', 'name email');
    await house.populate('members', 'name email');
    
    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's house
// @route   GET /api/houses
// @access  Private
export const getHouse = async (req, res) => {
  try {
    const house = await House.findOne({
      members: req.user.id
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    if (!house) {
      return res.status(404).json({ message: 'No house found' });
    }
    
    res.json(house);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update house
// @route   PUT /api/houses/:id
// @access  Private
export const updateHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    
    // Check if user is owner
    if (house.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    res.json(updatedHouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete house
// @route   DELETE /api/houses/:id
// @access  Private
export const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    
    // Check if user is owner
    if (house.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await House.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'House deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Join house
// @route   POST /api/houses/:id/join
// @access  Private
export const joinHouse = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const house = await House.findOne({ inviteCode });

    if (!house) return res.status(404).json({ message: "Invalid invite code" });

    if (house.members.includes(req.user._id))
      return res.status(400).json({ message: "Already a member" });

    house.members.push(req.user._id);
    await house.save();

    const populated = await House.findById(house._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Leave house
// @route   POST /api/houses/:id/leave
// @access  Private
export const leaveHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    
    // Check if user is a member
    if (!house.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member' });
    }
    
    // Owner cannot leave
    if (house.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Owner cannot leave. Transfer ownership first.' });
    }
    
    house.members = house.members.filter(member => member.toString() !== req.user.id);
    await house.save();
    
    res.json({ message: 'Left house successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

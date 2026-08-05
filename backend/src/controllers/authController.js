const bcrypt = require('bcrypt');
const prisma = require('../utils/db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ORG_ADMIN', // Give them global ORG_ADMIN since they own the workspace
      },
    });

    // Create a default organization for the new user
    await prisma.organization.create({
      data: {
        name: `${name}'s Workspace`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'ORG_ADMIN'
          }
        }
      }
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      if (user.status === 'SUSPENDED') {
        res.status(403);
        throw new Error('Your account is suspended.');
      }

      // Update lastLogin asynchronously without blocking HTTP response
      prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      }).catch(() => {});

      res.json({

        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        skills: true,
        experience: true,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: req.body.name || user.name,
          email: req.body.email || user.email,
          avatarUrl: req.body.avatarUrl || user.avatarUrl,
        },
      });

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        token: generateToken(updatedUser.id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    1-Click Guest Login / Demo Account access
// @route   POST /api/auth/guest
// @access  Public
const guestLogin = async (req, res, next) => {
  try {
    const guestEmail = 'guest.demo@taskflowai.com';
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      const salt = await bcrypt.genSalt(8);
      const hashedPassword = await bcrypt.hash('GuestDemoPass123!', salt);

      user = await prisma.user.create({
        data: {
          name: 'Demo Guest',
          email: guestEmail,
          password: hashedPassword,
          role: 'ORG_ADMIN',
          status: 'ACTIVE',
        },
      });

      // Create guest workspace
      await prisma.organization.create({
        data: {
          name: "Demo Guest's Workspace",
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: 'ORG_ADMIN',
            },
          },
        },
      });
    }

    // Update lastLogin asynchronously without blocking response
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(() => {});


    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isGuest: true,
      token: generateToken(user.id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  guestLogin,
  getUserProfile,
  updateUserProfile,
};


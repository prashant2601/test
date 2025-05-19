const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Models/user');
const crypto = require("crypto");
const agenda = require('../agenda');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const MenuConfig = require('../Models/menuConfig')

const { uploadBase64Image, deleteBlob } = require('../azureBlobHelper');
const DashboardMenus = require('../Utils/DashboardConfig');
const userRoleArray = require('../Utils/userRoles');
const { getNextId } = require('../Utils/utils');


const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30m", // Short-lived token
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "2d", // Long-lived token
  });
};

exports.login = async (req, res) => {
  const { query, password } = req.body;

  try {
    // Find the user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${query}$`, 'i') } },
        { userName: { $regex: new RegExp(`^${query}$`, 'i') } }
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "No User Found", success: false });
    }
    if (user.status !== "active") {
      return res.status(400).json({ message: "User is not active", success: false });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.lastLogin = moment.tz(timeZone).toDate();
    user.lastActive = moment.tz(timeZone).toDate();
    await user.save();

    // Remove sensitive fields from the response
    const { password: _, resetPasswordToken, resetPasswordExpires, _id, __v, ...safeUser } = user.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/api/auth/refresh-token",
    });

    res.status(200).json({
      token: accessToken,
      message: "Logged In Successfully",
      user: safeUser,
      success: true,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken({ _id: decoded.id, role: decoded.role });
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.checkAuth = async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized", success: false });

    res.status(200).json({ message: "Authorized", success: true, user });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: "/api/auth/refresh-token",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsers = (userType) => async (req, res) => {

  const {email, userName, status, pageNo = 1, limit = 10, sort } = req.query;
  try {

    const page = parseInt(pageNo, 10) || 1;
    const limitValue = parseInt(limit, 10) || 10;

    const matchStage = {};

    matchStage.role = userType; 

    if (email) {
      const emailRegexArray = email.split(',').map(em => new RegExp(em.trim(), 'i'));
      matchStage.email = { $in: emailRegexArray };
    }
    if (userName) {
      const userNameRegexArray = userName.split(',').map(un => new RegExp(un.trim(), 'i'));
      matchStage.userName = { $in: userNameRegexArray };
    }
    if (status) { matchStage.status = status; }

    // matchStage.role = { $ne: 'superAdmin' };

    const sortStage = {};
    sortStage.activationDate = sort === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: matchStage },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: (page - 1) * limitValue },
      { $limit: limitValue },
      {
        $project: {
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
          createdAt: 0,
          updatedAt: 0,
          password: 0,
          __v: 0,
          _id: 0
        }
      }
    ];

    const result = await User.aggregate(pipeline);

    const totalCount = await User.countDocuments(matchStage);

    const totalPages = Math.ceil(totalCount / limitValue);

    res.status(200).json({ users: result, totalCount, totalPages, currentPage: page, userType });

  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
}

exports.createSuperAdmin = async (req, res) => {
  const { userName, email, password, firstName, lastName, secretKey } = req.body;

  if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exist" });
    }

    user = await User.findOne({ userName });

    if (user) {
      return res.status(400).json({ message: "UserName already exist" });
    }

    const userId = await getNextId('user');
    const superAdmin = new User({
      userId,
      userName,
      firstName,
      lastName,
      email,
      password,
      role: "superAdmin",
      status: 'active',
      activatedOn: moment.tz(timeZone).toDate(),
    });

    await superAdmin.save();
    return res.status(201).json({ message: "Super admin created successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.createUser = async (req, res) => {
  const { email, role, merchantIds, affiliateId, firstName, lastName, userName } = req.body;
  const userRole = req.user.role;

  try {
    if (!email || !role || !firstName || !lastName || !userName) {
      return res.status(400).json({ message: "Incomplete data", success: false });
    }

    // Case-insensitive email check
    let userExists = await User.findOne({ 
      email: { $regex: new RegExp(`^${email?.trim()}$`, 'i') }
    });
    if (userExists) return res.status(400).json({ message: "Email already exists", success: false });

    // Case-insensitive username check
    userExists = await User.findOne({ 
      userName: { $regex: new RegExp(`^${userName?.trim()}$`, 'i') }
    });
    if (userExists) return res.status(400).json({ message: "userName already exists", success: false });

    if (!userRoleArray.includes(role)) {
      return res.status(400).json({ message: "Invalid role assigned", success: false });
    }
    const userId = await getNextId('user');
    // Create new user with a random password
    const newUser = await User.create({
      userId,
      userName: userName?.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim(),
      role,
      status: "inactive",
      password: crypto.randomBytes(8).toString("hex") // Temporary random password
    });

    // Generate password reset token
    const resetToken = newUser.getResetPasswordToken();

    if (merchantIds && merchantIds.length) {
      newUser.merchantIds = merchantIds;
    } else if (affiliateId) {
      newUser.affiliateId = affiliateId;
    }
    await newUser.save();

    // Send activation email
    const resetLink = `${process.env.NODE_ENV === "production" ? process.env.API_DOMAIN : process.env.CLIENT_DOMAIN}/auth/reset-password?token=${resetToken}`;

    const fullName =  newUser.firstName + " " + newUser.lastName;
    agenda.now('reset password', { emailId: email, resetLink, fullName, message: "Activate Your Account", userRole, userId: newUser.userId, role: newUser.role, btnText: "Set Your Password" });

    res.status(201).json({ message: "User created. Activation link sent." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message, success: false });
  }
};

exports.validateResetToken = async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) return res.status(400).json({ message: "Token is required", success: false });

    // Hash token (to compare with stored hash)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Ensure token is not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token", success: false });

    // Remove sensitive fields from the response
    const { password: _, resetPasswordToken, resetPasswordExpires, _id, __v, ...safeUser } = user.toObject();

    res.json({ message: "Token validated", user: safeUser, success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.resetPassword = async (req, res) => {

  try {

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Invalid data supplied", success: false });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token", success: false });

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    if (user.status === 'inactive') {
      user.status = 'active';
      user.activatedOn = moment.tz(timeZone).toDate();
    }

    await user.save();

    res.json({ message: "Password reset successful. Please log in.", success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found. Pls contact Admin", success: false });

    // Generate password reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const fullName =  user.firstName + " " + user.lastName;

    // Send activation email
    const resetLink = `${process.env.NODE_ENV === "production" ? process.env.API_DOMAIN : process.env.CLIENT_DOMAIN}/auth/reset-password?token=${resetToken}`;
    agenda.now('reset password', { emailId: email, resetLink, message: "Reset Your Password", fullName, userRole: user.role, userId: user.userId, role: user.role, btnText: "Reset Password" });

    res.status(200).json({ message: "Password reset link sent.", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

exports.editUser = async (req, res) => {
  const { userId, email, role, status, password, firstName, lastName, phone, profileImg, userName, merchantIds } = req.body;
  const userRole = req.user.role;
  let resendActivationLink = null;

  try {

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: "User not found", success: false });

    // ✅ Check if email exists but exclude the current user
    if (email) {
      let userExists = await User.findOne({ email: email.trim(), userId: { $ne: user.userId } });
      if (userExists) return res.status(400).json({ message: "Some user already has this email", success: false });
      user.email = email;
    }

    // ✅ Check if username exists but exclude the current user
    if (userName) {
      let userExists = await User.findOne({ userName: userName.trim(), userId: { $ne: user.userId } });
      if (userExists) return res.status(400).json({ message: "Some user already has this username", success: false });
      user.userName = userName;
    }

    if (role) { 
      if (!userRoleArray.includes(role)) {
        return res.status(400).json({ message: "Invalid role assigned", success: false });
      }
      user.role = role; 
    }

    if (status) {
      if (user.status === 'inactive') {
        resendActivationLink = true;
      }
      user.status = status;
    }

    if (password) user.password = password;
    if (phone) user.phone = phone;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (merchantIds) user.merchantIds = merchantIds;

    // ✅ Handle Profile Image Upload
    if (profileImg) {
      const matches = profileImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Invalid image format", success: false });
      } else {
        const imageType = matches[2];
        const imgName = `${user.userId}.${imageType}`;
        const imageUrl = await uploadBase64Image(profileImg, imgName);
        user.profileImg = imageUrl;
      }
    }

    // ✅ Handle Activation Link if Status Changed
    if (user.status === "active" && resendActivationLink) {
      user.status = "inactive";
      const resetToken = user.getResetPasswordToken();
      const resetLink = `${process.env.NODE_ENV === "production" ? process.env.API_DOMAIN : process.env.CLIENT_DOMAIN}/auth/reset-password?token=${resetToken}`;

      agenda.now("reset password", { emailId: email, resetLink, message: "Activate Your Account", role: user.role, userRole });
    }

    await user.save();

    const { password: _, resetPasswordToken, resetPasswordExpires, _id, __v, ...safeUser } = user.toObject();
    res.status(200).json({ message: "User updated", success: true, user: safeUser });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  const { userIds } = req.query;

  if (!userIds) {
    return res.status(400).json({ message: "userIds is required", success: false });
  }

  const userIdArray = userIds.split(',')
    .map(id => id.trim())  // Trim spaces
    .filter(id => id);      // Remove empty values

  if (userIdArray.length === 0) {
    return res.status(400).json({ message: "No valid user IDs found", success: false });
  }

  try {
    // Fetch users based on userIdArray
    const usersToDelete = await User.find({ userId: { $in: userIdArray } });

    if (usersToDelete.length === 0) {
      return res.status(404).json({ message: "No users found to delete", success: false });
    }

    // Collect profile images for deletion
    const profileImagePaths = usersToDelete.map(user => user.profileImg).filter(path => path);

    // Delete profile images in parallel
    if (profileImagePaths.length > 0) {
      await Promise.all(profileImagePaths.map(deleteBlob));
    }

    // Delete users
    const result = await User.deleteMany({ userId: { $in: userIdArray } });

    res.status(200).json({ message: "User(s) deleted", success: true, deletedCount: result.deletedCount });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.GetAllConfigMenus = async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: "Role is not provided", success: false });
  }

  try {
    const menus = await MenuConfig.findOne({ role })

    if (!menus) {
      return res.status(200).json({ message: "Role not found", success: false });
    }

    return res.status(200).json({ message: "Menu List", success: true, menu: menus });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }

}

exports.EditConfigMenus = async (req, res) => {
  const { role, menus } = req.body; // Extracting 'menus' from req.body

  if (!role || !menus) {
    return res.status(400).json({ message: "Data is missing", success: false });
  }

  try {
    let menuConfig = await MenuConfig.findOne({ role }); // Get the existing config

    if (!menuConfig) {
      // If the config doesn't exist, create a new one
      // menuConfig = new MenuConfig({ role, menus });
      // await menuConfig.save();
      // return res.status(200).json({
      //   message: "Role not found but created one",
      // })
     return res.status(404).json({ message: "Role not found", success: false });
    }
    menuConfig.role = role
    menuConfig.menus = menus;
    await menuConfig.save(); // Save the updated document

    return res.status(200).json({
      message: "Menu List updated successfully",
      success: true,
      menu: menuConfig,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.GetDashboardMenu = async (req, res) => {
  const { role } = req.query;

  try {
    let menus = [];
    const menuConfig = await MenuConfig.findOne({ role });
    if (!menuConfig) {
      return res.status(404).json({ message: "Role not found", success: false });
    }

    if (menuConfig && menuConfig.menus) {
      // Recursive function to filter menus
      const filterActiveMenus = (menuList) => {
        return menuList
          .filter(menu => menu.isActive !== undefined ? menu.isActive : menu)
          .map(menu => ({
            ...menu, // Preserve other properties
            submenu: menu.submenu ? filterActiveMenus(menu.submenu) : undefined,
          }))
          .filter(menu => menu.label);
      };


      menus = filterActiveMenus(menuConfig.menus);
    }

    return res.status(200).json({
      message: "Menu List",
      success: true,
      menu: menus,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }

}


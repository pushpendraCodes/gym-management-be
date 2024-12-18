const Gym = require("../models/Gym");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For generating reset token
const bcrypt = require("bcryptjs");
const { sendMail, passResetTemplate } = require("../utils/sendMail");

const generateAccessAndRefereshTokens = async ({ userId, res }) => {
  try {
    console.log(userId, "res");
    const user = await Gym.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log(accessToken, refreshToken, "user");
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // throw new ApiError(500, "Something went wrong while generating referesh and access token")
    res.status(500).json({
      msg: "Something went wrong while generating referesh and access token",
    });
  }
};

const generateRefreshAccessToken = async ({ userId, res }) => {
  try {
    console.log(userId, "res");
    const user = await Gym.findById(userId);

    const accessToken = user.generateAccessToken();
    // const refreshToken = user.generateRefreshToken();
    console.log(accessToken, "user");
    // user.refreshToken = refreshToken;
    // await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    // throw new ApiError(500, "Something went wrong while generating referesh and access token")
    res.status(500).json({
      msg: "Something went wrong while generating  refreshaccess token",
    });
  }
};

const gymSignIn = async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email);
  console.log(req.body, "bpdy");

  if (!email && !password) {
    res.status(400).json({ msg: "email & password is required" });
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const gym = await Gym.findOne({
    email,
  });

  if (!gym) {
    res.status(404).json({ msg: "user does not exist" });
  }

  const isPasswordValid = await gym.isPasswordCorrect(password);

  if (!isPasswordValid) {
    res.status(401).json({ msg: "Invalid user credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens({
    userId: gym._id,
    res,
  });

  const loggedGym = await Gym.findById(gym._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      gym: loggedGym,
      accessToken,
      refreshToken,
      msg: "User logged In Successfully",
    });
};

const demogymSignIn = async (req, res) => {
  const email  = "curlFitness@mail.com"
  const password = "123456@"

  const gym = await Gym.findOne({
    email,
  });

  if (!gym) {
    res.status(404).json({ msg: "user does not exist" });
  }

  const isPasswordValid = await gym.isPasswordCorrect(password);

  if (!isPasswordValid) {
    res.status(401).json({ msg: "Invalid user credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens({
    userId: gym._id,
    res,
  });

  const loggedGym = await Gym.findById(gym._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      gym: loggedGym,
      accessToken,
      refreshToken,
      msg: "User logged In Successfully",
    });
};

const gymLogOut = async (req, res) => {
  await Gym.findByIdAndUpdate(
    req.gym._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ msg: "User logged Out" });
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    // throw new Error(401, "unauthorized request")
    res.status(401).json({ msg: "unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await Gym.findById(decodedToken?._id);

    if (!user) {
      // throw new ApiError(401, "Invalid refresh token")
      res.status(401).json({ msg: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      // throw new ApiError(401, "Refresh token is expired or used")
      res.status(401).json({ msg: "Refresh token is expired or used" });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken } = await generateRefreshAccessToken({
      userId: user._id,
      res,
    });

    return (
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        // .cookie("refreshToken", newRefreshToken, options)
        .json({
          newAccessToken: accessToken,
          msg: "Access token refreshed",
          // refreshToken: newRefreshToken,
        })
    );
  } catch (error) {
    // throw new ApiError(401, error?.message || "Invalid refresh token");
    res.status(401).json({ msg: "Invalid refresh token" });
  }
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email, "email");

  try {
    // Find the user by email
    const user = await Gym.findOne({ email: email });
    console.log(user, "user");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token and expiration date
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    // Update user with reset token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateModifiedOnly: true });

    // Send reset email
    const resetUrl = `http://localhost:5173/set-new-password?${resetToken}`;
    const message = `Click the link to reset your password: ${resetUrl}`;

    await sendMail({
      to: email,
      subject: "Password Reset Request",
      text: message,
      html: passResetTemplate(resetUrl),
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.log(error, "err");
    res.status(500).json({ message: "Error sending reset email" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(password, token, "password");

  try {
    // Find user by reset token and check if the token is still valid
    const user = await Gym.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateModifiedOnly: true });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  gymSignIn,
  gymLogOut,
  refreshAccessToken,
  requestResetPassword,
  resetPassword,
  demogymSignIn
};

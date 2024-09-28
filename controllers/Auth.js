const Gym = require("../models/Gym");
const jwt = require("jsonwebtoken");
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
    .json({msg: "User logged Out"},);
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

module.exports = { gymSignIn, gymLogOut, refreshAccessToken };

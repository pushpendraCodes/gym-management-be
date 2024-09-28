
const Gym =  require("../models/Gym")
const jwt =  require("jsonwebtoken")

 const verifyJWT = async (req,res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log(token,"token1");
    if (!token) {
      // throw new ApiError(401, "Unauthorized request")
      res.status(401).json({ msg: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const gym = await Gym.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!gym) {
      // NEXT_VIDEO: discuss about frontend
    //   throw new ApiError(401, "Invalid Access Token");
      res.status(401).json({ msg: "Invalid Access Token" });
    }

    req.gym = gym;
    next();
  } catch (error) {
    // throw new ApiError(401, error?.message || "Invalid access token");
    res.status(401).json({ msg: "Invalid access token" });
  }
};

module.exports = verifyJWT

const { gymSignIn, gymLogOut, refreshAccessToken ,requestResetPassword,resetPassword} = require("../controllers/Auth");
const verifyJWT = require("../middlewares/authMiddileware");

const router = require("express").Router();

router.post("/gym/signIn", gymSignIn);
router.get("/gym/logOut", verifyJWT, gymLogOut);
router.post("/refresh-token", refreshAccessToken);
router.post("/request-reset-password", requestResetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

const { gymSignIn, gymLogOut, refreshAccessToken } = require("../controllers/Auth");
const verifyJWT = require("../middlewares/authMiddileware");

const router = require("express").Router();

router.post("/gym/signIn", gymSignIn);
router.get("/gym/logOut", verifyJWT, gymLogOut);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;

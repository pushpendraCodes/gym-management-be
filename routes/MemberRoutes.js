const {
  addMember,
  updateMember,
  deleteMember,
  getMembers,
  updateFees,
  getMemberById,
  getFeesHistory,
  fetchAllMember,
} = require("../controllers/MemberControllers");
const verifyJWT = require("../middlewares/authMiddileware");
const upload = require("../middlewares/multer");

const {
  memberValidationRules,
  validateMember,
} = require("../validation/MemberValidation");

const router = require("express").Router();

router.post(
  "/add-member",
  verifyJWT,
  upload.single("picture"), // Change this to handle single file
  memberValidationRules(),
  validateMember,
  addMember
);

router.patch("/update/:id", updateMember);
router.delete("/delete/:id", deleteMember);
router.post("/updateFees/:id",verifyJWT, updateFees);
router.get("/getMembers",verifyJWT, getMembers);
router.get("/getMember/:id", getMemberById);
router.get("/getfeesHistory/:id", getFeesHistory);
router.get("/fetch-all-member",verifyJWT, fetchAllMember);

module.exports = router;

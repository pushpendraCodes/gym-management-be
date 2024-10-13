const {
  createGym,
  updatePayments,
  updateServicesFees,
  getGymById,
  addTeam,
  updateTeam,
  getAllTeams,
  deleteTeam,
  getExpenses,
  addExpenses,
  UpdateExpenses,
  deleteExpens,
  totalPayHistory,
  addServices,
  updateGymProfile

} = require("../controllers/GymControllers");
const verifyJWT = require("../middlewares/authMiddileware");
const upload = require("../middlewares/multer");
const router = require("express").Router();

router.post("/createGym", upload.single("logo"), createGym);
router.put("/update-profile", verifyJWT,upload.single("logo"), updateGymProfile);
router.get("/getGym/:gymId", getGymById);
router.post("/add-service",verifyJWT, addServices);
router.put("/updatePayments/:id", updatePayments);
router.put("/updateServicesFees", verifyJWT, updateServicesFees);
router.post("/add-team", verifyJWT, addTeam);
router.put("/update-team", verifyJWT, updateTeam);
router.delete("/delete-team/:id", verifyJWT, deleteTeam);
router.get("/get-teams", verifyJWT, getAllTeams);
router.post("/add-expenses", verifyJWT, addExpenses);
router.get("/get-expenses", verifyJWT, getExpenses);
router.put("/update-expenses/:expenseId", verifyJWT, UpdateExpenses);
router.delete("/delete-expenses/:expenseId", verifyJWT, deleteExpens);
router.get("/get-TotalPayHistory", verifyJWT, totalPayHistory);

module.exports = router;

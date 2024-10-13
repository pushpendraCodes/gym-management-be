const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { uploadOnCloudinary } = require("../utils/Cloudinary");
const Gym = require("../models/Gym");
const { Fees } = require("../models/Fees");

function addOneMonth(dateString, month) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + month); // Add one month
  return date;
}

const getGymById = async (req, res) => {
  let { gymId } = req.params;
  try {
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res.status(200).json({ message: "gym fetched successfully", gym: gym });
  } catch (error) {
    res.status(500).json({ message: "Error while fecthcing gym", error });
  }
};

const createGym = async (req, res) => {
  try {
    const {
      email,
      password,
      gymOwnerName,
      gymAddress,
      gymOwnerMobile,
      subscriptionCharge,
      gymName,
      //   paymentDue,
      //   paymentDueDate,
      subscriptionType,
      status,
      //   subscriptionStartDate,
      //   subscriptionEndDate,
      gymCapacity,
      // servicesOffered,
      gymOpeningHours,
      subscriptionDiscount,
      paymentHistory,
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const existedUser = await Gym.findOne({
      $or: [{ email }, { gymOwnerMobile }],
    });

    if (existedUser) {
      return res
        .status(409)
        .json({ message: "User with email or mobile already exists" });
    }

    let logoImageLocalPath, logoImage;
    if (req.file) {
      console.log(req.file, "file");
      logoImageLocalPath = req.file.path;
      logoImage = await uploadOnCloudinary(logoImageLocalPath);
      console.log(logoImage, "url");
    }

    let subscriptionEndDate, paymentDueDate;

    if (subscriptionType == 1) {
      const date = new Date();
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      paymentDueDate = addOneMonth(formattedDate, 1);
      const date1 = new Date(paymentDueDate);
      // Subtract 1 day
      date1.setDate(date.getDate() - 1);
      const newDate = date1.toISOString();
      subscriptionEndDate = newDate;
    }
    if (subscriptionType == 2) {
      const date = new Date();
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      paymentDueDate = addOneMonth(formattedDate, 3);
      const date1 = new Date(paymentDueDate);
      // Subtract 1 day
      date1.setDate(date.getDate() - 1);
      const newDate = date1.toISOString();
      subscriptionEndDate = newDate;
    }
    if (subscriptionType == 3) {
      const date = new Date();
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      paymentDueDate = addOneMonth(formattedDate, 12);
      const date1 = new Date(paymentDueDate);
      // Subtract 1 day
      date1.setDate(date.getDate() - 1);
      const newDate = date1.toISOString();
      subscriptionEndDate = newDate;
    }

    // Create a new gym
    const newGym = new Gym({
      email,
      password,
      gymOwnerName,
      gymName,
      gymAddress,
      gymOwnerMobile,
      subscriptionCharge,
      paymentDue: 0,
      paymentDueDate,
      subscriptionType,
      status,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate,
      gymCapacity,
      servicesOffered: [],
      gymOpeningHours,
      subscriptionDiscount,
      gymLogo: logoImage?.url || "",
      paymentHistory,
    });

    // Save the gym to the database
    await newGym.save();
    const createdGym = await Gym.findById(newGym._id).select(
      "-password -refreshToken"
    );

    if (!createdGym) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the gym" });
    }

    return res
      .status(201)
      .json({ message: "Gym added successfully", gym: createdGym });
  } catch (error) {
    console.log(error, "err");
    return res.status(500).json({ message: "Error adding gym", error });
  }
};

//gym subscription payments
const updatePayments = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      //   paymentDue,
      //   paymentDueDate,
      amountPaid,
      //   paymentDate,
      paymentMethod,
    } = req.body;

    // Find the gym by ID
    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    // Update payment-related fields
    const paymentDue = gym.paymentDue - amountPaid;
    gym.paymentDue = paymentDue;
    let paymentDueDate;
    if (gym.subscriptionType == 1) {
      paymentDueDate = addOneMonth(gym.paymentDueDate, 1);
      const date = new Date(paymentDueDate);
      // Subtract 1 day
      date.setDate(date.getDate() - 1);
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      gym.subscriptionEndDate = formattedDate;
      gym.paymentDueDate = paymentDueDate;
    }
    if (gym.subscriptionType == 2) {
      paymentDueDate = addOneMonth(gym.paymentDueDate, 3);
      const date = new Date(paymentDueDate);
      // Subtract 1 day
      date.setDate(date.getDate() - 1);
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      gym.subscriptionEndDate = formattedDate;
      gym.paymentDueDate = paymentDueDate;
    }
    if (gym.subscriptionType == 3) {
      paymentDueDate = addOneMonth(gym.paymentDueDate, 12);
      const date = new Date(paymentDueDate);
      // Subtract 1 day
      date.setDate(date.getDate() - 1);
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      gym.subscriptionEndDate = formattedDate;
      gym.paymentDueDate = paymentDueDate;
    }

    // Add a new entry to payment history if there's a new payment
    if (amountPaid && paymentMethod) {
      const date = new Date();
      const formattedDate = date.toISOString();
      console.log(formattedDate);
      gym.paymentHistory.push({
        amountPaid,
        paymentDate: formattedDate,
        paymentMethod,
      });
    }

    // Save the updated gym details
    await gym.save();
    res.status(200).json({ message: "Payment updated successfully", gym });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment", error });
  }
};

//trainig fees change
const updateServicesFees = async (req, res) => {
  const gymId = req.gym._id;
  const { servicesOffered, serviceChange } = req.body;

  // Validate that servicesOffered is an array
  if (!Array.isArray(servicesOffered)) {
    return res.status(400).json({ error: "servicesOffered must be an array" });
  }

  try {
    // Find the gym by ID and update services offered and serviceChange history
    const updatedGym = await Gym.findByIdAndUpdate(
      gymId,
      {
        $set: { servicesOffered },
        $push: { servicesPriceChangeHistory: serviceChange },
      },
      { new: true } // Return the updated document
    );

    if (!updatedGym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    return res.status(200).json({
      message: "Services updated successfully",
      gym: updatedGym,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addTeam = async (req, res) => {
  const gymId = req.gym._id; // Assuming the gym ID comes from authenticated gym user
  const { teamName, teamSalary, teamType, status } = req.body;
  console.log(req.body, "req.body555");

  // Input validation
  if (!teamName || !teamSalary || !teamType) {
    return res.status(400).json({
      error: "All fields (teamName, teamSalary, teamType) are required",
    });
  }

  try {
    // Find gym by ID
    const gym = await Gym.findById(gymId);

    // Add new team to the teams array
    const team = {
      teamName,
      teamSalary,
      teamType,
      status: status || "Active", // Default status is Active
    };

    // Save the updated gym

    const updatedGym = await Gym.findByIdAndUpdate(
      gymId,
      {
        $push: { teams: team },
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Team added successfully",
      gym: updatedGym,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateTeam = async (req, res) => {
  const gymId = req.gym._id; // Assuming the gym ID comes from authenticated gym user
  const { teamId, teamName, teamSalary, teamType, status } = req.body;

  // Input validation
  if (!teamId || (!teamName && !teamSalary && !teamType && !status)) {
    return res
      .status(400)
      .json({ error: "Team ID and at least one field to update are required" });
  }

  try {
    // Find the gym by ID
    const gym = await Gym.findById(gymId);

    // Find the team within the gym
    const team = gym.teams.id(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Update team fields if provided
    if (teamName) team.teamName = teamName;
    if (teamSalary) team.teamSalary = teamSalary;
    if (teamType) team.teamType = teamType;
    if (status) team.status = status;

    // Save the updated gym
    const updatedGym = await gym.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: "Team updated successfully",
      gym: updatedGym,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteTeam = async (req, res) => {
  const gymId = req.gym._id; // Assuming the gym ID comes from authenticated gym user
  const teamId = req.params.id;

  // Input validation
  if (!teamId) {
    return res.status(400).json({ error: "Team ID is required" });
  }

  try {
    // Find the gym by ID
    const gym = await Gym.findById(gymId).select("-password"); // Exclude the password field

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    // Find the team within the gym and remove it
    const teamIndex = gym.teams.findIndex(
      (team) => team._id.toString() === teamId
    );

    if (teamIndex === -1) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Remove the team from the teams array
    gym.teams.splice(teamIndex, 1);

    // Save the updated gym
    const updatedGym = await gym.save({ validateModifiedOnly: true }); // Validate only modified fields

    res.status(200).json({
      message: "Team deleted successfully",
      gym: updatedGym,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllTeams = async (req, res) => {
  const gymId = req.gym._id; // Assuming the gym ID comes from authenticated gym user

  try {
    // Find the gym by ID
    const gym = await Gym.findById(gymId);

    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    // Send back the teams array
    res.status(200).json({
      message: "Teams retrieved successfully",
      teams: gym.teams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addExpenses = async (req, res) => {
  const { month, year, expenseName, totalAmount } = req.body;

  if (!month || !year || !expenseName || !totalAmount) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    const newExpense = { month, year, expenseName, totalAmount };
    gym.expenses.push(newExpense);
    await gym.save({ validateModifiedOnly: true });
    res.status(201).json({
      message: "expenses added  successfully",
      gym: gym,
    });
  } catch (error) {
    res.status(500).json({ error: "Error adding the expense." });
  }
};

const getExpenses = async (req, res) => {
  try {
    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    // res.json(gym.expenses);
    res.status(200).json({
      message: "expenses fetched  successfully",
      gym: gym,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching expenses." });
  }
};

const UpdateExpenses = async (req, res) => {
  const { month, year, expenseName, totalAmount } = req.body;

  try {
    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    const expense = gym.expenses.id(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // Update the expense
    expense.month = month || expense.month;
    expense.year = year || expense.year;
    expense.expenseName = expenseName || expense.expenseName;
    expense.totalAmount = totalAmount || expense.totalAmount;

    await gym.save({ validateModifiedOnly: true });
    res.status(200).json({
      message: "expenses updated  successfully",
      gym: gym,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating the expense." });
  }
};

const deleteExpens = async (req, res) => {
  try {
    // Fetch the gym by ID
    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    // Find the expense to be deleted
    const expenseIndex = gym.expenses.findIndex(
      (exp) => exp._id.toString() === req.params.expenseId
    );
    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // Remove the expense using array filter
    gym.expenses.splice(expenseIndex, 1);

    // Save the gym document with updated expenses
    await gym.save({ validateModifiedOnly: true });

    return res.json({ message: "Expense deleted successfully", gym: gym });
  } catch (error) {
    console.error("Error deleting the expense:", error);
    return res.status(500).json({ error: "Error deleting the expense." });
  }
};

// all the paymnet data of  gym
const totalPayHistory = async (req, res) => {
  try {
    let feesHistory = await Fees.find({ gymId: req.gym._id });
    return res.json({
      message: "fees history fetched  successfully",
      feesHistory: feesHistory,
    });
  } catch (error) {
    console.error("Error find the fees history:", error);
    return res
      .status(500)
      .json({ error: "Error while fetching payment history." });
  }
};

const addServices = async (req, res) => {
  try {
    const { serviceName, monthly, quarterly, yearly } = req.body;
    console.log(req.body, "bdoy");

    // Validate required fields and ensure they are numbers
    if (!serviceName || !monthly || !quarterly || !yearly) {
      return res.status(400).json({
        message: "Invalid input. All fields are required.",
      });
    }

    // Find gym by ID, which should exist in req.gym (assuming it's set by middleware)
    const gym = await Gym.findById(req.gym._id);

    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    // Calculate the next service number
    const serviceNumber = gym.servicesOffered?.length
      ? gym.servicesOffered.length + 1
      : 1;

    // Prepare new service object
    const newService = {
      serviceNumber,
      serviceName,
      serviceCharge: {
        monthly: Number(monthly),
        quarterly: Number(quarterly),
        yearly: Number(yearly),
      },
    };

    // Add new service to the gym's servicesOffered array
    gym.servicesOffered.push(newService);

    // Save the updated gym with new service (using validateModifiedOnly for efficiency)
    await gym.save({ validateModifiedOnly: true });

    return res
      .status(201)
      .json({ message: "Service added successfully", gym: gym });
  } catch (error) {
    console.error("Error adding service:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateGymProfile = async (req, res) => {
  const id = req.gym._id;
  const { email, gymAddress, gymCapacity, gymOwnerMobile } = req.body;

  try {
    // Create an empty object to hold fields to update
    const updateData = {};

    // Only add the fields that are provided in the request body

    if (email) updateData.email = email;
    if (gymAddress) updateData.gymAddress = gymAddress;
    if (gymCapacity) updateData.gymCapacity = gymCapacity;
    if (gymOwnerMobile) updateData.gymOwnerMobile = gymOwnerMobile;

    let logoImageLocalPath, logoImage;
    if (req.file) {
      console.log(req.file, "file");
      logoImageLocalPath = req.file.path;
      logoImage = await uploadOnCloudinary(logoImageLocalPath);
      console.log(logoImage, "url");
      updateData.gymLogo = logoImage.secure_url;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // Find the gym by ID and update it
    const updatedGym = await Gym.findByIdAndUpdate(
      id,
      { $set: updateData }, // $set only updates the provided fields
      { new: true } // Return the updated gym profile
    );

    if (!updatedGym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res.status(200).json({
      message: "Gym profile updated successfully",
      gym: updatedGym,
    });
  } catch (error) {
    console.error("Error updating gym profile:", error);
    res.status(500).json({
      message: "Server error while updating gym profile",
      error: error.message,
    });
  }
};

module.exports = {
  updateGymProfile,
  addServices,
  deleteExpens,
  totalPayHistory,
  UpdateExpenses,
  getExpenses,
  addExpenses,
  createGym,
  getAllTeams,
  updatePayments,
  updateServicesFees,
  deleteTeam,
  getGymById,
  addTeam,
  updateTeam,
};

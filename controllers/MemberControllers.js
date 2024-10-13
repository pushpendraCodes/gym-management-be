const mongoose = require("mongoose");
const { Member } = require("../models/Member");
const { Fees } = require("../models/Fees");
const { uploadOnCloudinary } = require("../utils/Cloudinary");

const convertToDateFormat = (dateString) => {
  const date = new Date(dateString); // Parse the input date string

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0"); // Ensure day is 2 digits

  return `${year}-${month}-${day}`;
};

const isSecondDateAhead = (firstDate, secondDate) => {
  // Get the timestamps for both dates
  const firstTime = firstDate.getTime();
  const secondTime = secondDate.getTime();

  // Compare the timestamps
  return secondTime > firstTime;
};

const isFirstDateAheadBy15Days = (firstDate, secondDate) => {
  // Get the timestamps for both dates
  const firstTime = firstDate.getTime();
  const secondTime = secondDate.getTime();

  // Calculate the difference in time (milliseconds)
  const timeDifference = firstTime - secondTime;

  // Convert the time difference to days (1 day = 1000 ms * 60 sec * 60 min * 24 hours)
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  // Check if the first date is ahead by 15 days or more
  return daysDifference >= 15;
};

const addMember = async (req, res) => {
  console.log(req.body, "body");
  const {
    firstName,
    lastName,
    mobile,
    gender,
    address,
    training,
    fees,
    SubscriptionType,
    payMethode,
  } = req.body;

  // const payHistory = JSON.parse(req.body.payHistory);

  // Check if the user already exists
  const existedUser = await Member.findOne({ mobile, gymId: req.gym._id });
  if (existedUser) {
    return res.status(409).json("user with this mobile is already exists");
  }

  // console.log(req.file, "file");

  let profileImageLocalPath, profileImage;
  if (req.file) {
    // If file exists, handle upload
    console.log(req.file, "file");
    profileImageLocalPath = req.file.path;
    profileImage = await uploadOnCloudinary(profileImageLocalPath);

    console.log(profileImage, "url");
    // Assuming Cloudinary upload function
  }

  // Due date calculation
  const today = new Date();
  let futureDate;
  switch (SubscriptionType) {
    case "1": // Monthly
      futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() + 1);
      break;
    case "2": // Quarterly
      futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() + 3);
      break;
    case "3": // Yearly
      futureDate = new Date(today);
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      break;
    default:
      // Handle invalid subscription type (e.g., log an error)
      return res.status(400).json("Invalid subscription type");
  }

  // Convert futureDate to ISO 8601 format
  const formattedDate = futureDate.toISOString();

  // Create a new member record
  const member = await Member.create({
    firstName,
    gymId: req.gym._id,
    lastName,
    mobile,
    gender,
    address,
    training,
    fees,
    // payHistory,
    dueDate: formattedDate,
    SubscriptionType,
    startMonthDate: convertToDateFormat(today),
    picture: profileImage?.url || "", // If Cloudinary upload succeeds, use the URL
  });

  const feesPay = await Fees.create({
    memberId: member._id,
    amount: member.fees,
    paymentMode: payMethode,
    gymId: req.gym._id,
  });

  if (!member || !feesPay) {
    return res
      .status(500)
      .json("Something went wrong while registering the member");
  }

  return res.status(201).json({
    message: "Member registered successfully",
    member: member,
  });
};

const updateMember = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(req.body, "req.body");

    let user = await Member.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ user, msg: "member updated successfully " });
  } catch (error) {
    res.status(401).json(error);
  }
};
const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    let user = await Member.findByIdAndDelete(id);
    res.status(200).json({ msg: "member deleted successfully " });
  } catch (error) {
    res.status(401).json(error);
  }
};

const getMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    let user = await Member.findById(id);
    res.status(200).json({ user: user, msg: "member fetched successfully " });
  } catch (error) {
    res.status(401).json(error);
  }
};
// if memeber late by 15days to pay the fees then the startmonth date will be chnaged to that day otherwise will remain same

const getFeesHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const fees = await Fees.find({ memberId: id });
    res.status(200).json({ fees: fees, msg: "Fees fetched successfully" });
  } catch (error) {
    res.status(401).json(error);
  }
};

const updateFees = async (req, res) => {
  const { id } = req.params;
  const { paymentMode, fees, SubscriptionType: subscriptionTypeStr } = req.body;
  const SubscriptionType = Number(subscriptionTypeStr);

  if (!fees || !paymentMode || !SubscriptionType) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const user = await Member.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "Member not found with this ID" });
    }

    const today = new Date();
    const dueDate = new Date(user.dueDate);

    const isDueDateBehindBy15Days = isFirstDateAheadBy15Days(today, dueDate);

    // Helper function to calculate new due date based on SubscriptionType
    const calculateNewDueDate = (subscriptionType, currentDueDate) => {
      let newDate = new Date(currentDueDate);
      console.log(newDate, "newDate");

      switch (subscriptionType) {
        case 1:
          newDate.setDate(newDate.getDate() + 30); // Monthly
          break;
        case 2:
          newDate.setDate(newDate.getDate() + 90); // Quarterly
          break;
        case 3:
          newDate.setDate(newDate.getDate() + 365); // Yearly
          break;
        default:
          newDate.setDate(newDate.getDate() + 30); // Default to 30 days
      }

      return newDate.toISOString();
    };

    let newDueDate;

    // Update due date if SubscriptionType has changed
    if (SubscriptionType !== user.SubscriptionType) {
      newDueDate = calculateNewDueDate(
        SubscriptionType,
        isDueDateBehindBy15Days ? today : dueDate
      );
      let startMonthDate = calculateNewDueDate(
        SubscriptionType,
        isDueDateBehindBy15Days ? today : user.startMonthDate
      );

      await Member.findByIdAndUpdate(
        id,
        { fees, SubscriptionType, dueDate: newDueDate, startMonthDate },
        { new: true }
      );

      console.log(
        `Updated subscription type to ${SubscriptionType} with new due date: ${newDueDate}`
      );
    } else {
      console.log("working");
      // Handle updating fees and due date based on due date status
      if (isDueDateBehindBy15Days) {
        const formattedDueDate = calculateNewDueDate(
          user.SubscriptionType,
          today
        ); // Add 30 days to today's date

        await Member.findByIdAndUpdate(
          id,
          {
            startMonthDate: today.toISOString(),
            dueDate: formattedDueDate,
          },
          { new: true }
        );
      } else {
        const futureDate = calculateNewDueDate(user.SubscriptionType, dueDate); // Add 30 days to current due date
        console.log(futureDate, user.SubscriptionType, "futureDate");
        await Member.findByIdAndUpdate(
          id,
          { dueDate: futureDate },
          { new: true }
        );
      }
    }

    // Create fees record and retrieve fees history
    const [memberFees, feesHistory, member] = await Promise.all([
      Fees.create({
        memberId: id,
        amount: fees,
        paymentMode,
        gymId: req.gym._id,
      }),
      Fees.find({ memberId: id }),
      Member.findById(id),
    ]);

    res.status(201).json({
      feesHistory,
      member,
      msg: "Fees updated successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

// Helper function to check if first date is ahead by 15 days
// const isFirstDateAheadBy15Days = (firstDate, secondDate) => {
//   const diffInTime = firstDate.getTime() - secondDate.getTime();
//   return diffInTime >= 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
// };

const getMembers = async (req, res) => {
  try {
    let query = Member.find({ gymId: req.gym._id }); // Initial query without awaiting, so it remains chainable
    let totalMemberssQuery = Member.find({ gymId: req.gym._id });
    // console.log(req.query, "query");
    // Apply search filter if applicable
    if (req.query.filter) {
      // console.log(req.query.filter, "(req.query.filter");
      const filter = req.query.filter; // Assuming filters are passed as a comma-separated list

      switch (filter) {
        case "oldest":
          sortBy = "startMonthDate";
          query = query.sort(sortBy);

          break;
        case "newest":
          sortBy = "-startMonthDate";
          query = query.sort(sortBy);
          break;
        case "G-2":
          query = query.where({ gender: 2 });
          break;
        case "G-1":
          query = query.where({ gender: 1 });
          break;

        case "duesoon":
          const today = new Date();
          const dueSoonDate = new Date(
            today.getTime() + 5 * 24 * 60 * 60 * 1000
          ); // 5 days from today

          query = query.where({
            dueDate: {
              $gte: today.toISOString().split("T")[0], // today or later
              $lte: dueSoonDate.toISOString().split("T")[0], // within the next 5 days
            },
          });
          break;
        case "overdue":
          const now = new Date();
          const fifteenDaysAgo = new Date();
          fifteenDaysAgo.setDate(now.getDate() - 15);

          query = query.where({
            dueDate: {
              $gte: fifteenDaysAgo.toISOString().split("T")[0], // 15 days ago or later
              $lt: now.toISOString().split("T")[0], // before today
            },
          });
          break;
        default:
          break;
      }

      totalMemberssQuery = totalMemberssQuery.find(query.getQuery()); // Apply same filters to total count query
    }
    console.log(req.query.subsType, "req.query.subsType");
    if (req.query.subsType && req.query.subsType !== "undefined") {
      const subscriptionType = Number(req.query.subsType); // Convert to Number

      // Check if the conversion is successful and is a valid number
      if (!isNaN(subscriptionType)) {
        query = query.where({ training: subscriptionType });
        totalMemberssQuery = totalMemberssQuery.find(query.getQuery());
      } else {
        console.error("Invalid subscription type: ", req.query.subsType);
      }
    }

    if (req.query.search) {
      query = Member.find({
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { mobile: { $regex: req.query.search, $options: "i" } },
        ],
        gymId: req.gym._id,
      });
      totalMemberssQuery = Member.find({
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { mobile: { $regex: req.query.search, $options: "i" } },
        ],
        gymId: req.gym._id,
      });
    }

    const totalDocs = await totalMemberssQuery.countDocuments().exec();

    // Apply pagination if applicable
    if (req.query._page && req.query._limit) {
      const pageSize = parseInt(req.query._limit, 10);
      const page = parseInt(req.query._page, 10);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    const docs = (await query.exec()); // Execute the query
    console.log(docs, "docs");

    // Set total count in headers and send response
    res.set("X-Total-Count", totalDocs);
    res
      .status(200)
      .json({ members: docs, msg: "members fetched successfully" });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const fetchAllMember = async (req, res) => {
  try {
    let members = await Member.find({ gymId: req.gym._id });
    res
      .status(200)
      .json({ members: members, msg: "Members fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchAllMember,
  addMember,
  updateMember,
  deleteMember,
  getMemberById,
  updateFees,
  getMembers,
  getFeesHistory,
};

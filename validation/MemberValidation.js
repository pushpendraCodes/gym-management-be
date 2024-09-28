const { body, validationResult } = require("express-validator");

// Validation rules for the member schema
const memberValidationRules = () => {
  console.log(body, "body");
  return [
    body("firstName")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("firstName must be between 3 and 50 characters"),
    body("lastName")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("lastName must be between 3 and 50 characters"),

    body("mobile")
      .notEmpty()
      .withMessage("Mobile number is required")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile number must be 10 digits")
      .isNumeric()
      .withMessage("Mobile number must contain only numbers"),

    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isIn([1, 2])
      .withMessage("Gender must be either 1 (Male) or 2 (Female)"),

    body("address")
      .notEmpty()
      .withMessage("Address is required")
      .isLength({ min: 5 })
      .withMessage("Address must be at least 5 characters long"),

    body("training")
      .notEmpty()
      .withMessage("Training type is required")
      .isIn([1,2,3,4,5,6])  //"cardio(m)-1", "cardio(f)-2", "strength-3"
      .withMessage(
        "Training type must be one of:cardio(m)-1, cardio(f)-2, strength-3,personalTraining-4 groupcalsse-5 yoga-6"
      ),



    body("fees")
      .notEmpty()
      .withMessage("Fees is required")
      .isFloat({ min: 0 })
      .withMessage("Fees cannot be negative"),




  ];
};

// Middleware to handle validation errors
const validateMember = (req, res, next) => {
    console.log(req,"req")
  const errors = validationResult(req

  );
  console.log(errors,"errors")

  if (!errors.isEmpty()) {  // Check if there are validation errors
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  memberValidationRules,
  validateMember,
};

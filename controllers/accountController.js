const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    notice: req.flash("notice"),
    errors: null,
    loggedin: req.session.loggedin,
    accountData: req.session.accountData,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/registration", {
    title: "Register",
    nav,
    notice: req.flash("notice"),
    errors: null,
    loggedin: req.session.loggedin,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/registration", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      errors: null,
      loggedin: req.session.loggedin,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice"),
      errors: null,
      loggedin: req.session.loggedin,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      errors: null,
      loggedin: req.session.loggedin,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      loggedin: req.session.loggedin,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        loggedin: req.session.loggedin,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  const accountMenu = utilities.buildAccountMenu(
    accountData.account_type,
    accountData.account_id,
    accountData.account_firstname
  );

  res.render("account/management", {
    title: "Account Management",
    accountMenu,
    nav,
    notice: req.flash("notice"),
    errors: null,
    message: "You're logged in",
    loggedin: req.session.loggedin,
  });
}

/* ****************************************
 *  Deliver Update Account Form
 * *************************************** */
async function buildUpdateForm(req, res) {
  const accountId = req.params.accountId;
  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(accountId);

  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account");
  }

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    accountData,
    errors: null,
    notice: req.flash("notice"),
    // loggedin: req.session.loggedin,
  });
}

/* ****************************************
 *  Process Account Information Update
 * *************************************** */
async function updateAccountInfo(req, res) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } =
      req.body;

    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("notice", "Account information updated successfully.");
      res.redirect("/account/");
    } else {
      // En caso de error, recuperamos los datos originales para mostrar en el formulario
      const nav = await utilities.getNav();
      const accountData = {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      };
      req.flash("notice", "Update failed. Please try again.");
      res.render("account/update", {
        title: "Update Account Information",
        nav,
        accountData,
        errors: null,
        notice: req.flash("notice"),
        loggedin: req.session.loggedin,
      });
    }
  } catch (error) {
    console.error("Error updating account info:", error);
    req.flash("notice", "An unexpected error occurred.");
    res.redirect(`/account/update/${req.body.account_id}`);
  }
}

/* ****************************************
 *  Process Password Account Update
 * *************************************** */
async function updateAccountPassword(req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Password update failed. Try again.");
    res.redirect(`/account/update/${account_id}`);
  }
}

/* ****************************************
 *  Logout account return Home page
 * *************************************** */
async function logoutAccount(req, res, next) {
  const accountData = res.locals.accountData;
  const loggedin = req.session.loggedin;
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/", accountData, loggedin);
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  buildAccountManagement,
  logoutAccount,
  buildUpdateForm,
  updateAccountInfo,
  updateAccountPassword,
};

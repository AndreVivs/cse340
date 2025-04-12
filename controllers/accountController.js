const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  res.render("account/login", {
    title: "Login",
    nav,
    header,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  res.render("account/registration", {
    title: "Register",
    nav,
    header,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
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
      header,
      errors: null,
      notice: req.flash("notice"),
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
      header,
      errors: null,
      notice: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Register",
      nav,
      header,
      errors: null,
      notice: req.flash("notice"),
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      header,
      errors: null,
      account_email,
      notice: req.flash("notice"),
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
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        header,
        errors: null,
        account_email,
        notice: req.flash("notice"),
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
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
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
    header,
    errors: null,
    message: "You're logged in",
  });
}

/* ****************************************
 *  Deliver Update Account Form
 * *************************************** */
async function buildUpdateForm(req, res) {
  const accountId = req.params.accountId;
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  const accountData = await accountModel.getAccountById(accountId);

  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account");
  }

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    header,
    accountData,
    errors: null,
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
      const updatedAccount = await accountModel.getAccountById(account_id);
      const accessToken = jwt.sign(
        {
          account_id: updatedAccount.account_id,
          account_firstname: updatedAccount.account_firstname,
          account_lastname: updatedAccount.account_lastname,
          account_email: updatedAccount.account_email,
          account_type: updatedAccount.account_type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2h" }
      );

      res.cookie("jwt", accessToken, { httpOnly: true });

      req.session.accountData = updatedAccount;
      res.locals.accountData = updatedAccount;

      const { nav, header } = await utilities.getNav(true, updatedAccount);
      const accountMenu = utilities.buildAccountMenu(
        updatedAccount.account_type,
        updatedAccount.account_id,
        updatedAccount.account_firstname
      );

      req.flash("notice", "Account information updated successfully.");

      res.render("account/management", {
        title: "Account Management",
        nav,
        header,
        accountMenu,
        errors: null,
        message: "You're logged in",
        accountData: updatedAccount,
        notice: req.flash("notice"),
      });
    } else {
      const { nav, header } = await utilities.getNav(
        res.locals.loggedin,
        res.locals.accountData
      );
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
        header,
        accountData,
        errors: null,
        notice: req.flash("notice"),
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
  try {
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
      const { nav, header } = await utilities.getNav(
        res.locals.loggedin,
        res.locals.accountData
      );
      const accountData = {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        notice: req.flash("notice"),
      };
      req.flash("notice", "Password update failed. Try again.");
      res.render("/account/update-password/", {
        title: "Update Account Information",
        nav,
        header,
        accountData,
        errors: null,
        notice: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("notice", "An unexpected error occurred.");
  }
}

/* ****************************************
 *  Logout account and return to Home page
 * *************************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt", { path: "/", httpOnly: true });
  // res.clearCookie("sessionId", { path: "/", httpOnly: true });
  // res.clearCookie("connect.sid", { path: "/", httpOnly: true });

  req.flash("notice", "You have been logged out.");

  return res.redirect("/");
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

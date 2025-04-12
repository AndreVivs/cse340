const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (loggedin, accountData) {
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";

  let header = Util.buildHeader(loggedin, accountData);

  return { nav: list, header };
};

Util.buildHeader = (loggedin, accountData) => {
  let myAccount = "";
  let cseMotors = `
<span class="siteName">
    <a href="/" title="Return to home page">CSE Motors</a>
  </span>`;

  if (loggedin && accountData) {
    myAccount = `
    <div id="tools">
      <a href="/account" title="Manage your account"
      >Welcome, ${accountData.account_firstname}</a
      >
      <a href="/account/logout" title="Click to logout">Logout</a></div>`;
  } else {
    myAccount = `<div id="tools"><a title="Click to log in" href="/account/login">MY ACCOUNT</a></div>`;
  }

  return `${cseMotors}
  ${myAccount}`;
};

Util.buildAccountMenu = (account_type, account_id, account_firstname) => {
  let greeting = "";
  let extraContent = "";

  if (account_type === "Client") {
    greeting = `<h2>Welcome ${account_firstname}</h2>`;
  } else if (account_type === "Employee" || account_type === "Admin") {
    greeting = `<h2>Welcome Happy, ${account_firstname}</h2>`;
    extraContent = `
      <h3>Inventory Management</h3>
      <p><a href="/inv">Access Inventory Management</a></p>
    `;
  }

  let menuItems = [
    `<li><a href="/account/update/${account_id}">Update account</a></li>`,
    `<li><a href="/account/logout">Logout</a></li>`,
  ];

  return `
    ${greeting}
    ${extraContent}
    <ul>
      ${menuItems.join("\n")}
    </ul>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetail = function (vehicle) {
  let detail = "";
  if (vehicle) {
    detail += '<div class="detail__vehicle-title-image">';
    detail += `<h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>`;
    detail += `<img src="${vehicle.inv_image}" alt="Full image of ${vehicle.inv_make} ${vehicle.inv_model}" />`;
    detail += "</div>";

    detail += '<div class="detail__vehicle">';
    detail += `<h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`;
    detail +=
      "<p><strong>Price: $" +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</strong></p>";
    detail +=
      '<p class="shadow"><strong>Description:</strong> ' +
      vehicle.inv_description +
      "</p>";
    detail += "<p><strong>Color:</strong> " + vehicle.inv_color + "</p>";
    detail +=
      '<p class="shadow"><strong>Miles:</strong> ' +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      " miles</p>";
    detail += "</div>";
  } else {
    detail += '<p class="notice">Sorry, vehicle details are unavailable.</p>';
  }
  return detail;
};

/* **************************************
 * Build Clasification List HTML
 * ************************************ */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classification_id" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        req.flash("notice", "Please log in.");
        res.clearCookie("jwt");
        res.locals.loggedin = 0;
        return res.redirect("/account/login");
      }
      res.locals.accountData = decoded;
      res.locals.loggedin = 1;
      next();
    });
  } else {
    res.locals.loggedin = 0;
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Middleware Authorization
 * ************************************ */
Util.requireEmployeeOrAdmin = (req, res, next) => {
  const accountType = res.locals.accountData?.account_type;
  if (accountType === "Employee" || accountType === "Admin") {
    return next();
  }
  req.flash("notice", "You do not have permission to view this page.");
  return res.redirect("/account");
};

module.exports = Util;

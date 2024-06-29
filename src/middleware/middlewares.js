const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

function requireAdmin(req, res, next) {
  const value = localStorage.getItem('adminemial');
  if (value === null) {
    res.redirect("/adminlogin");
  } else {
    next();
  }
}

function requireseller(req, res, next) {
  const value = localStorage.getItem('selleremial');
  if (value === null) {
    res.redirect("/seller_login");
  } else {
    next();
  }
}

function requirebuyer(req, res, next) {
  const value = localStorage.getItem('buyeremial');
  if (value === null) {
    res.redirect("/buyer_login");
  } else {
    next();
  }
}

module.exports = {
  requireAdmin,
  requireseller,
  requirebuyer
};

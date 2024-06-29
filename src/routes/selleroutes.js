
const express = require('express');
const path = require('path');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const router = express.Router();
// const { requireseller } = require('../middleware');
function requireseller(req, res, next) {
  const value = localStorage.getItem('selleremial');
  if (value === null) {
    res.redirect("/seller_login");
  } else {
    next();
  }
}

router.get("/seller_login", (req, res) => {
  localStorage.removeItem('selleremial');
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/seller_login.html"));
});

router.get("/seller_register", (req, res) => {
  localStorage.removeItem('selleremial');
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/seller_register.html"));
});

router.get("/add_crop", requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/add_crop.html"));
});

router.get("/seller_complain", requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/seller_complain.html"));
});

router.get("/seller_view", requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/seller_view.html"));
});

router.get("/seller_chatpage", requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/sellingpages/sellerchatapp.html"));
});

module.exports = router;

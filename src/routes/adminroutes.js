// src/routes/adminRoutes.js
const express = require('express');
const path = require('path');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const router = express.Router();
// const { requireAdmin } = require('../middleware');
function requireAdmin(req, res, next) {
  const value = localStorage.getItem('adminemial');
  if (value === null) {
    res.redirect("/adminlogin");
  } else {
    next();
  }
}
router.get("/adminlogin", (req, res) => {
  localStorage.removeItem('adminemial');
  res.sendFile(path.join(__dirname, "../../public/HTML/adminpages/adminlogin.html"));
});


router.get("/admin_dashboard", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/adminpages/admin_dashboard.html"));
});

module.exports = router;

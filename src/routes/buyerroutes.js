// src/routes/buyingRoutes.js
const express = require('express');
const path = require('path');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const router = express.Router();
// const { requirebuyer } = require('../middleware');
function requirebuyer(req, res, next) {
  const value = localStorage.getItem('buyeremial');
  if (value === null) {
    res.redirect("/buyer_login");
  } else {
    next();
  }
}
router.get("/buyer_register", (req, res) => {
  localStorage.removeItem('buyeremial');
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/buyer_register.html"));
});

router.get("/buyer_login", (req, res) => {
  localStorage.removeItem('buyeremial');
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/buyer_login.html"));
});

router.get("/crop_detail", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/crop_category.html"));
});

router.get("/fruit_detail", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/fruit.html"));
});

router.get("/vegetable_detail", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/vegetable.html"));
});

router.get("/grain_detail", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/grain.html"));
});

router.get("/crop_data_according_to_person", requirebuyer, (req, res) => {
  const { cropname, category, cropimage } = req.query;
  req.session.cropimage = cropimage;
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/crop_data_according_to_person.html"));
});

router.get("/test", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/detail_crop.html"));
});

router.get("/card_data", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/cards_data.html"));
});

router.get("/buyer_chat", requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/buyingpages/buyer_chat.html"));
});

module.exports = router;

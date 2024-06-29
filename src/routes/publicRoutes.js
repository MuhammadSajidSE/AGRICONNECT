// src/routes/publicRoutes.js
const express = require('express');
const path = require('path');
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/mainpages/home.html"));
});

router.get("/company", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/mainpages/company.html"));
});

router.get("/faq", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/mainpages/faq.html"));
});

router.get("/people", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/mainpages/people.html"));
});

router.get("/camplain_buyer", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/HTML/mainpages/complain.html"));
});

module.exports = router;

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));

//Mainpages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','mainpages', 'home.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML', 'mainpages','about.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','mainpages', 'contact.html'));
});

//Sellingpages
app.get('/seller_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'seller_login.html'));
});
app.get('/seller_register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'seller_register.html'));
});
app.get('/add_crop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'add_crop.html'));
});
app.get('/seller_view', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'seller_view.html'));
});

//adminpages
app.get('/adminlogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','adminpages', 'adminlogin.html'));
});
app.get('/admin_dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','adminpages', 'admin_dashboard.html'));
});


//Buyingpages
app.get('/mainbuying', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'mainbuying.html'));
});
app.get('/buyer_register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_register.html'));
});
app.get('/buyer_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_login.html'));
});
app.get('/crop_detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'crop_detail.html'));
});
app.get('/buyer_dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_dashboard.html'));
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

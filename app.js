const path = require("path");
const express = require("express");
const session = require("express-session");
const oracledb = require("oracledb");
const notifier = require("node-notifier");
const axios = require("axios");
const bodyParser = require("body-parser");
const { Console } = require("console");
const { LocalStorage } = require('node-localstorage');
const { connect } = require("http2");
const localStorage = new LocalStorage('./scratch');
const { connectToDatabase } = require("./src/db.js");
const { checkEmailExistbuyer, buyer_registers ,buyerLogin} = require("./src/controller/buyer/buyerauthcontroller.js");
const {  checkEmailExistsseller, seller_registers,sellerLogin} = require("./src/controller/seller/sellerauthcontroller.js");
const { requireAdmin, requireseller, requirebuyer } = require("./src/middleware/middlewares.js");
const { adminLogin } = require("./src/controller/admin/adminauthcontroller.js");
const {convertJsonStructure,convertToQuerycategory,ensureArrayFormat,convertOrReturnJson,transformData} = require("./src/jsonconvertor.js")
const { getCropsByCategory } = require("./src/controller/crops/category.js");
const { checkCropExistence, getCropQuantity, insertCrop, updateCropQuantity } = require("./src/controller/crops/insertcrop.js");
const {  getPersonCategory } = require("./src/controller/crops/personcategory.js");
const { fetchTableData } = require("./src/controller/admin/dashboardtable.js");
const { lessquantity } = require("./src/controller/crops/lessquantity.js");
const { lessquantity2 } = require("./src/controller/crops/increasequantity.js");
const { addcarditem } = require("./src/controller/buyer/addcard.js");
const { ordertosold } = require("./src/controller/buyer/order.js");
const {  editcrop,deletecrop } = require("./src/controller/buyer/deleteEdit_crop.js");
const {   submitBuyerComplaint,submitSellerComplaint  } = require("./src/controller/admin/complain.js");
const {  getdataofbuybuyer,getdataoforderbuyer,getdataofcardbuyer } = require("./src/controller/buyer/dashboard.js");
const { cardtoorderAPI, deletecard } = require("./src/controller/buyer/delete_updatecard.js");
const {  getCropOfSeller, getOrderDataForSeller,getSoldDataForSeller } = require("./src/controller/seller/dashbaord.js");
const {  getbuyercontact, getmessageseller,sendmessageseller} = require("./src/controller/seller/chating.js");
const {  getsellercontact, getmessagebuyer,sendmessagebuyer } = require("./src/controller/buyer/chatting.js");
const {  totalamoutofavailabe, numberofbuyer,totalamountorder ,totalamountsold} = require("./src/controller/seller/amounts.js");
const {  totalcardamount, totalorderamountbuyer,totalboughtamountbuyer ,numberofseller} = require("./src/controller/buyer/amounts.js");

const app = express(); 
const port = 3001;

app.use(bodyParser.json());
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));

//########################################################################################
//##############################Authentication API########################################

//BUYER REGISTER POST API
app.post("/buyer_register", async (req, res) => {
  const buyer_register = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone_no: req.body.phone_no,
    buyer_address: req.body.address,
    city: req.body.city,
  };
  try {
    const emailExists = await checkEmailExistbuyer(buyer_register.email);
    if (emailExists) {
      res.redirect("/buyer_register?error=Email%20already%20exists");
    } else {
      await buyer_registers(buyer_register);
      res.redirect("/buyer_login");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//SELLLER REGISTER POST API
app.post("/seller_register", async (req, res) => {
  const sell_register = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone_no: req.body.phone_no,
    seller_address: req.body.address,
    city: req.body.city, 
  };
  try {
    const emailExists = await checkEmailExistsseller(sell_register.email);
    if (emailExists) {
      res.redirect("/seller_register?error=Email%20already%20exists");
    } else {
      await seller_registers(sell_register);
      res.redirect("/seller_login");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
 
//ADMIN LOGIN POST API
app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const loginSuccessful = await adminLogin(email, password);
    if (loginSuccessful) {
      res.redirect("/admin_dashboard");
    } else {
      res.redirect("/adminlogin?error=Invalid%20Email%20or%20Password");
    }
  } catch (err) {
    res.status(500).send("An error occurred");
  }
});

//BUYER LOGIN POST API
app.post("/buyer_login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const loginSuccessful = await buyerLogin(email, password);
    if (loginSuccessful) {
      res.redirect("/card_data");
    } else {
      res.redirect("/buyer_login?error=Invalid%20Email%20or%20Password");
    }
  } catch (err) {
    res.status(500).send("An error occurred");
  }
});

//SELLER LOGIN POST API
app.post("/seller_login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const loginSuccessful = await sellerLogin(email, password);
    if (loginSuccessful) {
      res.redirect("/seller_view");
    } else {
      res.redirect("/seller_login?error=Invalid%20Email%20or%20Password");
    }
  } catch (err) {
    res.status(500).send("An error occurred");
  }
});

//############################################################################
//CLEAR LOCALSTORAGE API NOT USED BUT (RAHNA DO)
app.post("/clearAdminSession", (req, res) => {
  delete req.session.isAdminLoggedIn;
  delete req.session.adminType;
  res.sendStatus(200);
});
app.post("/clearsellersession", (req, res) => {
  delete req.session.issellerLoggedIn;
  delete req.session.sellerType;
  res.sendStatus(200);
});
app.post("/clearbuyersession", (req, res) => {
  delete req.session.isbuyerLoggedIn;
  delete req.session.buyerType;
  res.sendStatus(200);
});


//################################ ADD CROP ################################
//ADD CROP FUNCTION AND API
//IF ALREADY SAME PRICE CROPS IS EXIST THEN INCREASE IT QUANTITY
//OTHER WISE NEW CROPS IS ADDED
app.post("/add_crop", async (req, res) => {
  const sell_register = {
    category: req.body.category,
    name: req.body.cropname,
    price: req.body.price,
    quantity: req.body.quantity,
    seller_email: localStorage.getItem('selleremial'),
  };

  try {
    const cropExists = await checkCropExistence(sell_register.name, sell_register.price, sell_register.seller_email);
    if (cropExists.length === 0) {
      await insertCrop(sell_register);
      notifier.notify({
        title: "Crop Inserted",
        message: "Crop has been inserted successfully!",
      });
    } else {
      const currentQuantity = await getCropQuantity(sell_register.name, sell_register.price, sell_register.seller_email);
      const newQuantity = currentQuantity + parseInt(sell_register.quantity, 10);
      await updateCropQuantity(sell_register.name, sell_register.price, sell_register.seller_email, newQuantity);
      notifier.notify({
        title: "Crop Updated",
        message: "Crop quantity has been updated successfully!",
      });
    }
    res.redirect("/seller_view");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// GET FRUITS CATEGORY CROPS DATA
app.get("/fruit_detail/page", requirebuyer, async (req, res) => {
  try {
    const rows = await getCropsByCategory("Fruits");
    const result = convertJsonStructure(rows);
    res.send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// GET VEGETABLE CATEGORY CROPS DATA
app.get("/vegitable_detail/page", requirebuyer, async (req, res) => {
  try {
    const rows = await getCropsByCategory("Vegetables");
    const result = convertJsonStructure(rows);
    res.send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// GET GRAIN CATEGORY CROPS DATA
app.get("/grains_detail/page", requirebuyer, async (req, res) => {
  try {
    const rows = await getCropsByCategory("Grains");
    const result = convertJsonStructure(rows);
    res.send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


//GET THE GIVEN SPEFIC CATEGORY DATA WITH SELLER DATA
app.get("/person_category", async (req, res) => {
  let { cropname, category, cropimage } = req.query;
  cropname = cropname.trim();
  category = category.trim();
  category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  req.session.curentcropimage = cropimage;
  try {
    const result = await getPersonCategory(cropname, category);
    const result2 = convertToQuerycategory(result);
    res.json(result2);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


//################################ ADMIN DASHBOARD CODE ###################################
//GET ALL TBALE DATA WHICH IS REQURED IN AMDIN DASHBOARD
app.get("/fetch_table_data", async (req, res) => {
  try {
    const data = await fetchTableData();
    res.json(data);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// Route to serve the table data
app.get("/getTableData", async (req, res) => {
  try {
    const tableData = await fetchTableData();
    res.json(tableData);
  } catch (error) {
    console.error("Error fetching tableData:", error);
    res.status(500).send("Internal Server Error");
  }
});


//############################ SELLING CROPS CODE AND ADD TO CARD CODE ###################################
//GET DETAL SCREEN OF CROP DATA
let cropData = null;
app.post("/test", (req, res) => {
  cropData = req.body.cropData;
  req.session.curentcropimage = req.body.cropImage;
  res.send({ cropData, cropImage: req.session.curentcropimage });
});

app.get("/addcard", (req, res) => {
  if (cropData && req.session.cropimage) {
    const data = {
      CROP: cropData,
      img: req.session.cropimage,
    };
    res.send(data);
  } else {
    res.status(404).send({ message: "No crop data found" });
  }
});



//ADD TO CARD API
app.post("/cadsdata", (req, res) => {
  const requestData = req.body;
  console.log("Received data:", requestData);
  const buyeremail = localStorage.getItem('buyeremial');
  const carditem = {
    cropid: requestData.cropid,
    selleremail: requestData.selleremail,
    quantity: requestData.quantity,
    amount: requestData.amount,
    buyeremial: buyeremail,
  };
  console.log(carditem);
  lessquantity(carditem.cropid, carditem.quantity);
  addcarditem(carditem)
    .then(() =>
      res.json({ message: "Data received successfully", data: storedData })
    )
    .catch((error) =>
      res.status(500).json({ message: "Error adding card item", error })
    );
});

//########################## BUYER DASHBOARD ####################################
//###############################################################################

//FUNCTION OF GET DATA OF BUYER THAT CROP HAS BEEN BOUGHT

//GET API OF ALL DATA OF BUYER DASHBOARD
app.get('/buyer_card_table',async (req,resp)=>{
  const buyeremail = localStorage.getItem('buyeremial');
  const  resultcard = await  getdataofcardbuyer(buyeremail);
  const resultsorder = await getdataoforderbuyer(buyeremail);
  const resultbuy = await getdataofbuybuyer(buyeremail);
  let buyerdashboardata = {'cards':resultcard,'orders':resultsorder,'bought':resultbuy};
  resp.json(buyerdashboardata);
});

//API OF DLEETE THE CARD
app.post('/buyer_card_table', async (req, resp) => {
  const { cardId, cropId, quantity } = req.body;
  try {
    await lessquantity2(cropId, quantity);
    await deletecard(cardId);
    resp.json({ message: "Card item deleted and quantity updated successfully" });
  } catch (error) {
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

//API OF CONFIRMED THE CARD TO ORDER
app.get('/confirmend_card', async (req, res) => {
  try {
    await cardtoorderAPI(req);
    res.status(200).send('Order confirmed');
  } catch (error) {
    res.status(500).send('Error confirming order');
  }
});

//GET API OF SELLER DASHBAORD WHICH 
app.get('/seller_dasbaord_data',requireseller,async (req,resp)=>{
  const cropdata = await getCropOfSeller();
  const orderdata = await getOrderDataForSeller();
  const solddata = await getSoldDataForSeller();
  const seller_dash = {'cropdata':cropdata,'orderdata':orderdata,'solddata':solddata};
  resp.json(seller_dash);
})

//CONFIRMED ORDER API
app.post('/confirmend_order', async (req, res) => {
  const { cradId } = req.body;
  if (!cradId) {
      return res.status(400).send('CRAD_ID is required');
  }
  try {
      await ordertosold(cradId);
      res.status(200).send('Order confirmed');
  } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).send('Error confirming order');
  }
});

//CANCEL ORDER API
app.post('/cancel_order', async (req, res) => {
  const data = req.body;
  try {
      await lessquantity2(data.cropId, data.quantity);
      await deletecard(data.cradId);
      console.log('Received cancel order request:', data);
      res.status(200).json({ message: 'Order canceled successfully' });
  } catch (error) {
      console.error('Error processing cancel order request:', error);
      res.status(500).json({ message: 'Failed to cancel order' });
  }
});

//API OF DLEETE THE CROP
app.post('/delete_crop', async (req,resp)=>{
  const { cropId } = req.body;
  console.log('Received crop ID to delete:', cropId);
  await deletecrop(cropId);
  resp.status(200).json({ message: 'Crop deleted successfully' });
});

  //EDIT CROP API
  app.post('/edit_crop', async (req,resp)=>{
    console.log(req.body);
    const eidtdata = {'cropid':req.body.cropId,
                      'price':parseInt(req.body.price),
                    'quantity':parseInt(req.body.quantity)};
    await editcrop(eidtdata.cropid,eidtdata.price,eidtdata.quantity);
    console.log('Received crop for eidt:');
    console.log(eidtdata);
    resp.status(200).json({ message: 'Crop Edit successfully' });
  });
  
//########################## CHAT FEATURE BACKEND CODE ##########################
//###############################################################################

//API OF BUYER CONTACT LIST
app.get('/buyer_contact', async (req, resp) => {
  const data = await getbuyercontact();
  resp.send(data);
});

//SELECT THE BUYER API OF CHATING
app.post('/buyer_contact',async(req,resp)=>{
  const buyer_email = req.body.buyerEmail;
  console.log(buyer_email);
  if (localStorage.getItem('curent_buyer_contact')) {
    localStorage.removeItem('curent_buyer_contact');
  }
  localStorage.setItem('curent_buyer_contact', buyer_email);
})

//SEND MESSAGE API TO THE BUBYER
app.post('/seller_chatpage_message', async (req, resp) => {
  const message = req.body.message;
  await sendmessageseller(message);
});

//GTE API OF MESSAGE OF SPDEFIC BUYER 
app.get('/seller_chatpage_message',async(req,resp)=>{
  const result1 = await getmessageseller();
  const sellerEmail = localStorage.getItem('selleremial');
  const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
  const sendpropermessage = {messagelist:result1,selleremail:sellerEmail,buyeremail:currentbuyerEmail};
  resp.send(sendpropermessage);
})

//############################# BUYER CAHT PAGE CODE ########################### 

//GET SELLER CONTACT LIST
app.get('/seller_contact', async (req, resp) => {
  const data = await getsellercontact();
  resp.send(data);
});

//SELECT THE SPECIFC SELLER FOR CHATING
app.post('/seller_contact',async(req,resp)=>{
  const buyer_email = req.body.buyerEmail;
  console.log(buyer_email);
  if (localStorage.getItem('curent_seller_contact')) {
    localStorage.removeItem('curent_seller_contact');
  }
  localStorage.setItem('curent_seller_contact', buyer_email);
})

//API OF SEND MESSAGE TO THE SELLER
app.post('/buyer_chatpage_message', async (req, resp) => {
  const message = req.body.message;
  await sendmessagebuyer(message);
});

//GET API OF CHAT OF SPECIFIC BUYER
app.get('/buyer_chatpage_message',async(req,resp)=>{
  const result1 = await getmessagebuyer();
  const buyerEmail = localStorage.getItem('buyeremial');
  const currentsellerEmail = localStorage.getItem('curent_seller_contact');
  const sendpropermessage = {messagelist:result1,selleremail:currentsellerEmail,buyeremail:buyerEmail};
  resp.send(sendpropermessage);
})

//FIRST PAGE OF SELLER AND BUYER

app.get('/seller_dashboard_first_page',async (req,resp)=>{
  const totavailable = await totalamoutofavailabe();
  const noofbuyer = await numberofbuyer();
  const totalorder = await totalamountorder();
  const totalsold = await totalamountsold();
  var finalreuslt = {totalorder,noofbuyer,totalsold,totavailable};
  resp.send(finalreuslt);
});


app.get('/buyer_dashboard_first_page',async (req,resp)=>{
  const totalcard = await totalcardamount();
  const totalorderbuyer = await totalorderamountbuyer();
  const totalbought = await totalboughtamountbuyer();
  const noseller = await numberofseller();
  var finalreuslt = {totalcard,totalorderbuyer,totalbought,noseller};
  resp.send(finalreuslt);
});

app.post('/camplain_buyers', async (req, res) => {
  const { message } = req.body;
  try {
    const buyerEmail = localStorage.getItem('buyeremial');
    await submitBuyerComplaint(message, buyerEmail);
    res.status(200).json({ message: 'Complain submitted successfully' });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.post('/seller_complain', async (req, res) => {
  const { message } = req.body;
  try {
    const sellerEmail = localStorage.getItem('selleremial');
    await submitSellerComplaint(message, sellerEmail);
    res.status(200).json({ message: 'Complain submitted successfully' });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.use(express.static(path.join(__dirname, "public")));
const publicRoutes = require("./src/routes/publicRoutes.js");
const sellingRoutes = require("./src/routes/selleroutes.js");
const buyingRoutes = require("./src/routes/buyerroutes.js");
const adminRoutes = require("./src/routes/adminroutes.js");

app.use("/", publicRoutes);
app.use("/", sellingRoutes);
app.use("/", buyingRoutes);
app.use("/", adminRoutes);

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log("sajid");
});


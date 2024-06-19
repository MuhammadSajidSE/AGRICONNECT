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
const app = express(); // Initialize express before using it

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
async function connectToDatabase() {
  const connection = await oracledb.getConnection({
    user: "sajid",
    password: "root",
    connectString: "localhost:1521/XE",
  });
  return connection;
}

// async function checkEmailExists(email) {
app.post("/buyer_register", async (req, res) => {
  const buyer_register = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone_no: req.body.phone_no,
    buyer_address: req.body.address,
    city: req.body.city, // Add the city field
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
    console.error("Error during buyer registration:", error); // Log the error
    res.status(500).send("Internal Server Error");
  }
});

// Function to check if email exists in the database
async function checkEmailExistbuyer(email) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT * FROM buyerdata WHERE LOWER(BUYER_EMAIL) = :email",
      { email: email.toLowerCase() }
    );
    await connection.close();
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
}

// Function to register buyer
async function buyer_registers(buyers_data) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "INSERT INTO buyerdata (NAME, BUYER_EMAIL, PASSWORD, PHONE_NO, ADDRESS, CITY) VALUES (:name, :email, :password, :phone_no, :buyer_address, :city)",
      buyers_data
    );
    await connection.commit();
    await connection.close();
    return result;
  } catch (error) {
    console.error("Error registering buyer:", error);
    throw error;
  }
}

async function seller_registers(seller_data) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "INSERT INTO seller_data (name, email, password, phone_no, seller_address, city) VALUES (:name, :email, :password, :phone_no, :seller_address, :city)",
      seller_data
    );
    await connection.commit();
    await connection.close();
    return result; // Return the result if needed
  } catch (error) {
    console.error("Error registering seller:", error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function checkEmailExistsseller(email) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT * FROM seller_data WHERE LOWER(email) = :email",
      { email: email.toLowerCase() }
    );
    await connection.close();

    // If any row is returned from the query, return true; otherwise, return false
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error;
  }
}
app.post("/seller_register", async (req, res) => {
  const sell_register = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone_no: req.body.phone_no,
    seller_address: req.body.address,
    city: req.body.city, // Add the city field
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

app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", { email, password });

  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT email FROM admin_data WHERE email = :email AND password = :password",
      { email, password }
    );
    console.log("Query result:", result);
    if (result.rows.length > 0) {
      localStorage.setItem('adminemial',email );
      const value = localStorage.getItem('adminemial'); 
      res.redirect("/admin_dashboard");
    } else {
      res.redirect("/adminlogin?error=Invalid%20Email%20or%20Password");
    }

    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post("/buyer_login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await connectToDatabase();
    const allDataResult = await connection.execute("SELECT * FROM buyerdata");
    const result = await connection.execute(
      "SELECT BUYER_EMAIL FROM buyerdata WHERE BUYER_EMAIL = :email AND password = :password",
      { email, password }
    );
    console.log("Query result:", result);
    if (result.rows.length > 0) {
      localStorage.setItem('buyeremial',email );
      res.redirect("/card_data");
    } else {
      res.redirect("/buyer_login?error=Invalid%20Eamil%20or%20Password");
    }

    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post("/seller_login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT EMAIL FROM seller_data WHERE EMAIL = :email AND password = :password",
      { email, password }
    );
    if (result.rows.length > 0) {
      req.session.seller_email = email;
      localStorage.setItem('selleremial',email );
      res.redirect("/seller_view");
    } else {
      res.redirect("/seller_login?error=Invalid%20Eamil%20or%20Password");
    }
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post("/add_crop", async (req, res) => {
  const sell_register = {
    category: req.body.category,
    name: req.body.cropname,
    price: req.body.price,
    quantity: req.body.quantity,
    seller_email: localStorage.getItem('selleremial'),
  };

  const connection = await connectToDatabase();

  const chekcrop = await connection.execute(
    `SELECT name FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
    {
      name: sell_register.name,
      price: sell_register.price,
      seller_email: sell_register.seller_email,
    }
  );

  if (chekcrop.rows.length === 0) {
    await connection.execute(
      `INSERT INTO cropdata (category, name, price, quantity, seller_email) 
       VALUES (:category, :name, :price, :quantity, :seller_email)`,
      {
        category: sell_register.category,
        name: sell_register.name,
        price: sell_register.price,
        quantity: sell_register.quantity,
        seller_email: sell_register.seller_email,
      }
    );

    await connection.commit();

    notifier.notify({
      title: "Crop Inserted",
      message: "Crop has been inserted successfully!",
    });
  } else {
    const selctequanity = await connection.execute(
      `SELECT quantity FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
      {
        name: sell_register.name,
        price: sell_register.price,
        seller_email: sell_register.seller_email,
      }
    );
    let num1 = parseInt(selctequanity.rows[0][0], 10);
    let num2 = sell_register.quantity;
    num2 = parseInt(num2);
    const setquantity = num1 + num2;
    await connection.execute(
      `UPDATE cropdata SET  
         quantity = :quantity 
       WHERE name = :name AND price = :price AND seller_email = :seller_email`,
      {
        quantity: setquantity,
        name: sell_register.name,
        price: sell_register.price,
        seller_email: sell_register.seller_email,
      }
    );

    await connection.commit();

    notifier.notify({
      title: "Crop Updated",
      message: "Crop quantity has been updated successfully!",
    });
  }

  res.redirect("/seller_view");
  await connection.close();
});

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

function convertJsonStructure(jsonData) {
  // Check if the JSON is already in the desired format
  if (Array.isArray(jsonData) && jsonData.length > 0 && Array.isArray(jsonData[0])) {
    // JSON is already in the desired format, return it as is
    return jsonData;
  } else {
    // JSON needs conversion
    return jsonData.map(item => {
      return [item.CROPID, item.NAME, item.CATEGORY, item.PRICE, item.QUANTITY, item.SELLER_EMAIL];
    });
  }
}
app.get("/fruit_detail/page", requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Fruits' and QUANTITY!='${0}'`
  );
  const result2 = convertJsonStructure(result.rows);
  resp.send(result2);
});

app.get("/vegitable_detail/page", requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Vegetables' and QUANTITY!='${0}'`
  );
  const result2 = convertJsonStructure(result.rows);
  resp.send(result2);
});

app.get("/grains_detail/page", requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Grains' and QUANTITY!='${0}'`
  );
  console.log(result);
  const result2 = convertJsonStructure(result.rows);
  resp.send(result2);
});


function convertToQuerycategory(jsonData) {
  // Check if the JSON data is already in the desired format
  if (Array.isArray(jsonData) && Array.isArray(jsonData[0])) {
    return jsonData;
  }

  // Convert JSON data to the desired format
  const result = jsonData.map(item => {
    return [
      item.CROPID,
      item.NAME,
      item.CATEGORY,
      item.QUANTITY,
      item.PRICE,
      item.SELLER_NAME,
      item.SELLER_EMAIL
    ];
  });

  return result;
}
app.get("/person_category", async (req, res) => {
  let connection;
  let { cropname, category, cropimage } = req.query;
  cropname = cropname.trim();
  category = category.trim();
  category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  req.session.curentcropimage = cropimage;
  console.log(cropimage);
  console.log(
    `Received request for cropname: ${cropname}, category: ${category}, cropimage: ${cropimage}`
  );
  connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT c.CROPID, c.NAME, c.CATEGORY, c.QUANTITY, c.PRICE, s.NAME as SELLER_NAME, c.SELLER_EMAIL
           FROM cropdata c
           JOIN seller_data s ON c.SELLER_EMAIL = s.EMAIL
           WHERE LOWER(c.NAME) = LOWER(:1) AND LOWER(c.CATEGORY) = LOWER(:2)`,
    [cropname, category]
  );
  console.log("Query executed successfully. Rows:", result.rows);
  const result2 = convertToQuerycategory(result.rows);
  res.json(result2);
  console.log("Query executed successfully. Rows:", result2);
});

// Database ADmin

// Function to fetch table data
async function fetchTableData() {
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
    const buyer_data = await connection.execute(
      `SELECT BUYER_EMAIL, NAME, PHONE_NO, ADDRESS, CITY FROM BUYERDATA ORDER BY NAME`
    );
    const seller_data = await connection.execute(
      `SELECT EMAIL AS SELLER_EMAIL, NAME, PHONE_NO,  SELLER_ADDRESS, CITY  FROM SELLER_DATA ORDER BY NAME`
    );
    const crop_data = await connection.execute(
      `SELECT * FROM CROPDATA ORDER BY CROPID`
    );

    await connection.close();

    const result = {
      BUYER_DATA: buyer_data.rows,
      BUYER_COUNT: buyer_data.rows.length,
      SELLER_DATA: seller_data.rows,
      SELLER_COUNT: seller_data.rows.length,
      CROP_DATA: crop_data.rows,
      CROP_COUNT: crop_data.rows.length,
    };

    return result;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

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

let cropData = null;
app.post("/test", (req, res) => {
  cropData = req.body.cropData;
  req.session.curentcropimage = req.body.cropImage;
  console.log("Received crop data:", cropData);
  console.log("Received crop image:", req.session.curentcropimage);
  res.send({ cropData, cropImage: req.session.curentcropimage });
});

app.get("/addcard", (req, res) => {
  console.log("Session crop image:", req.session.cropimage);
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

function ensureArrayFormat(result) {
  const metaData = result.metaData;
  const rows = result.rows;
  if (rows.length > 0 && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    const convertedRows = rows.map(row => {
      return metaData.map(meta => row[meta.name]);
    });
    return {
      metaData: metaData,
      rows: convertedRows
    };
  }
  return result;
}

async function lessquantity(cropid, quan) {
  const connection = await connectToDatabase();
  try {
    let result = await connection.execute(
      `SELECT QUANTITY FROM cropdata WHERE CROPID = :cropid`,
      [cropid]
    );
    result = ensureArrayFormat(result);
    const updatequantity = result.rows[0][0];
    const a = parseInt(updatequantity) - parseInt(quan);
    console.log(result);
    console.log(updatequantity);
    console.log("dakh la bhi");
    console.log(a);
  
    console.log("Current Quantity:", updatequantity);
    await connection.execute(
      `UPDATE CROPDATA SET QUANTITY = :quantity WHERE CROPID = :cropid`,
      { quantity: a, cropid: cropid }
    );
    await connection.commit();
    console.log(a);
  } catch (error) {
    console.log("ham sa na ho paiga LESS QUANITY");
    console.log(error);
  } finally {
    await connection.close();
  }
}
async function lessquantity2(cropid, quan) {
  const connection = await connectToDatabase();
  try {
    let result = await connection.execute(
      `SELECT QUANTITY FROM cropdata WHERE CROPID = :cropid`,
      [cropid]
    );
    result = ensureArrayFormat(result);
    const updatequantity = result.rows[0][0];
    const a = parseInt(updatequantity) + parseInt(quan);
    console.log(result);
    console.log(updatequantity);
    console.log("dakh la bhi");
    console.log(a);
  
    console.log("Current Quantity:", updatequantity);
    await connection.execute(
      `UPDATE CROPDATA SET QUANTITY = :quantity WHERE CROPID = :cropid`,
      { quantity: a, cropid: cropid }
    );
    await connection.commit();
    // console.log(a);
  } catch (error) {
    console.log("ham sa na ho paiga  QUANITY increase");
    console.log(error);
  } finally {
    await connection.close();
  }
}


async function addcarditem(carditem) {
  const connection = await connectToDatabase();
  try {
    const result = await connection.execute(
      "INSERT INTO craditems (EMAIL, BUYER_EMAIL, CROPID, QUANTITY, AMOUNT,STATUS) VALUES (:selleremail, :buyeremial, :cropid, :quantity, :amount, 'cards')",
      carditem
    );
    await connection.commit();
    await connection.close();
  } catch (error) {
    console.log("Error accur fo registration buyer:", error);
  }
}

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

async function getdataofbuybuyer(buyeremail) {
  try {
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      const connection = await connectToDatabase();
      const result = await connection.execute(`
          SELECT ci.cropid, cd.NAME AS cropname, ci.quantity, ci.amount, ci.crad_id, ci.email, sd.NAME AS seller_name , sd.city AS seller_city, sd.PHONE_NO as seller_no
          FROM craditems ci 
          JOIN cropdata cd ON ci.cropid = cd.cropid 
          JOIN seller_data sd ON cd.seller_email = sd.email
          WHERE ci.buyer_email = '${buyeremail}' and ci. STATUS = 'SOLD'`);
      return result.rows;
  } catch (error) {
      console.error('Error executing query:', error);
      throw error;
  }
}

async function getdataoforderbuyer(buyeremail) {
  try {
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      const connection = await connectToDatabase();
      const result = await connection.execute(`
          SELECT ci.cropid, cd.NAME AS cropname, ci.quantity, ci.amount, ci.crad_id, ci.email, sd.NAME AS seller_name , sd.city AS seller_city, sd.PHONE_NO as seller_no 
          FROM craditems ci 
          JOIN cropdata cd ON ci.cropid = cd.cropid 
          JOIN seller_data sd ON cd.seller_email = sd.email
          WHERE ci.buyer_email = '${buyeremail}' and ci. STATUS = 'ORDER'`);
      return result.rows;
  } catch (error) {
      console.error('Error executing query:', error);
      throw error;
  }
}
async function getdataofcardbuyer(buyeremail) {
  try {
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      const connection = await connectToDatabase();
      const result = await connection.execute(`
      SELECT ci.cropid, cd.NAME AS cropname, ci.quantity, ci.amount, ci.crad_id, ci.email, sd.NAME AS seller_name, sd.city AS seller_city
      FROM craditems ci 
      JOIN cropdata cd ON ci.cropid = cd.cropid 
      JOIN seller_data sd ON cd.seller_email = sd.email
      WHERE ci.buyer_email = '${buyeremail}' AND ci.STATUS = 'cards'`);
      return result.rows;
  } catch (error) {
      console.error('Error executing query:', error);
      throw error;
  }
}

app.get('/buyer_card_table',async (req,resp)=>{
  const buyeremail = localStorage.getItem('buyeremial');
  const  resultcard = await  getdataofcardbuyer(buyeremail);
  const resultsorder = await getdataoforderbuyer(buyeremail);
  const resultbuy = await getdataofbuybuyer(buyeremail);
  let buyerdashboardata = {'cards':resultcard,'orders':resultsorder,'bought':resultbuy};
  resp.json(buyerdashboardata);
});

async function deletecard(cardid) {
  const connection = await connectToDatabase();
  try {
    await connection.execute(`DELETE FROM CRADITEMS WHERE CRAD_ID = :cardid`, [cardid]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting card:", error);
  } finally {
    await connection.close();
  }
}

app.post('/buyer_card_table', async (req, resp) => {
  const { cardId, cropId, quantity } = req.body;
  try {
    await lessquantity2(cropId, quantity);
    await deletecard(cardId);
    resp.json({ message: "Card item deleted and quantity updated successfully" });
  } catch (error) {
    console.error("Error handling buyer card table:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

async function cardtoorderAPI(req) {
  const buyeremail = localStorage.getItem('buyeremial');
  const connection = await connectToDatabase();
  await connection.execute(
    `UPDATE CRADITEMS SET STATUS = 'ORDER' WHERE BUYER_EMAIL = :buyeremail`,
    [buyeremail]
  );
  connection.commit();
  console.log('Order status updated');
}

app.get('/confirmend_card', async (req, res) => {
  try {
    console.log('Received /confirmend_card request');
    await cardtoorderAPI(req);
    res.status(200).send('Order confirmed');
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).send('Error confirming order');
  }
});

async function getCropOfSeller() {
  const sellerEmail = localStorage.getItem('selleremial'); // Ensure correct key
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
    const result = await connection.execute(
      `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL
       FROM cropdata
       WHERE SELLER_EMAIL = :sellerEmail AND QUANTITY != 0`,
      { sellerEmail }  // Use bind variable for security
    );

    // Transforming result to match specified JSON structure
    const cropdata = result.rows.map(row => ({
      CROPID: row.CROPID,
      NAME: row.NAME,
      CATEGORY: row.CATEGORY,
      PRICE: row.PRICE,
      QUANTITY: row.QUANTITY,
      SELLER_EMAIL: row.SELLER_EMAIL
    }));

    return { cropdata };
  } catch (error) {
    console.error('Error executing query:', error.message, error.stack);
    throw new Error('Failed to fetch crop data for the seller.');
  }
}


async function getOrderDataForSeller() {
  const sellerEmail = localStorage.getItem('selleremial'); // Assuming 'selleremail' is correct spelling
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
    const result = await connection.execute(
      `SELECT ci.crad_id AS CRAD_ID, cd.NAME AS CROPNAME, ci.quantity AS QUANTITY, cd.CROPID AS CROPID,
              ci.amount AS AMOUNT, bd.NAME AS BUYER_NAME, bd.PHONE_NO AS BUYER_PHONE_NO, 
              bd.city AS BUYER_CITY, ci.buyer_email AS BUYER_EMAIL, ci.STATUS AS CONFIRMED
       FROM craditems ci
       JOIN cropdata cd ON ci.cropid = cd.cropid
       JOIN seller_data sd ON cd.seller_email = sd.email
       JOIN buyerdata bd ON ci.buyer_email = bd.BUYER_EMAIL
       WHERE sd.email = :sellerEmail AND ci.STATUS = 'ORDER'`,
      { sellerEmail }  // Bind variable
    );

    // Transforming result to match specified JSON structure
    const orderdata = result.rows.map(row => ({
      CROPNAME: row.CROPNAME,
      QUANTITY: row.QUANTITY,
      CROPID :row.CROPID,
      AMOUNT: row.AMOUNT,
      BUYER_NAME: row.BUYER_NAME,
      BUYER_PHONE_NO: row.BUYER_PHONE_NO,
      BUYER_CITY: row.BUYER_CITY,
      BUYER_EMAIL: row.BUYER_EMAIL,
      CONFIRMED: row.CONFIRMED,
      CRAD_ID: row.CRAD_ID // Adding CRAD_ID to match the structure
    }));

    return { orderdata };
  } catch (error) {
    console.error('Error executing query:', error.message, error.stack);
    throw new Error('Failed to fetch order data for the seller.');
  } 
}

async function getSoldDataForSeller() {
  const sellerEmail = localStorage.getItem('selleremial'); // Ensure correct key
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
    const result = await connection.execute(
      `SELECT ci.crad_id AS CRAD_ID, cd.NAME AS CROPNAME, ci.quantity AS QUANTITY, 
              ci.amount AS AMOUNT, bd.NAME AS BUYER_NAME, bd.PHONE_NO AS BUYER_PHONE_NO, 
              bd.city AS BUYER_CITY, ci.buyer_email AS BUYER_EMAIL, ci.STATUS AS CONFIRMED
       FROM craditems ci
       JOIN cropdata cd ON ci.cropid = cd.cropid
       JOIN seller_data sd ON cd.seller_email = sd.email
       JOIN buyerdata bd ON ci.buyer_email = bd.BUYER_EMAIL
       WHERE sd.email = :sellerEmail AND ci.STATUS = 'SOLD'`,
      { sellerEmail }  // Use bind variable for security
    );

    // Transforming result to match specified JSON structure
    const orderdata = result.rows.map(row => ({
      CRAD_ID: row.CRAD_ID,
      CROPNAME: row.CROPNAME,
      QUANTITY: row.QUANTITY,
      AMOUNT: row.AMOUNT,
      BUYER_NAME: row.BUYER_NAME,
      BUYER_PHONE_NO: row.BUYER_PHONE_NO,
      BUYER_CITY: row.BUYER_CITY,
      BUYER_EMAIL: row.BUYER_EMAIL,
      CONFIRMED: row.CONFIRMED
    }));

    return { orderdata };
  } catch (error) {
    console.error('Error executing query:', error.message, error.stack);
    throw new Error('Failed to fetch sold order data for the seller.');
  } 
}


app.get('/seller_dasbaord_data',requireseller,async (req,resp)=>{
  const cropdata = await getCropOfSeller();
  const orderdata = await getOrderDataForSeller();
  const solddata = await getSoldDataForSeller();
  const seller_dash = {'cropdata':cropdata,'orderdata':orderdata,'solddata':solddata};
  resp.json(seller_dash);
})



async function ordertosold(cardid) {
  const connection = await connectToDatabase();
  await connection.execute(
      `UPDATE CRADITEMS SET STATUS = 'SOLD' WHERE CRAD_ID = :cardid`,
      [cardid]
  );
  await connection.commit();
  console.log('Order status updated');
}

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

async function deletecrop(cardid) {
try {
  const connection = await connectToDatabase();
  await connection.execute(
      `UPDATE cropdata SET QUANTITY = '${0}' WHERE CROPID = :cardid`,
      [cardid]
  );
  await connection.commit();
  console.log('crop delete succfully');
} catch (error) {
  console.log('error of delete crop')
  console.log(error);
}
}

app.post('/delete_crop', async (req,resp)=>{
  const { cropId } = req.body;
  console.log('Received crop ID to delete:', cropId);
  await deletecrop(cropId);
  resp.status(200).json({ message: 'Crop deleted successfully' });
});

async function editcrop(cropid,quantity,price) {
  try {
    const connection = await connectToDatabase();
    await connection.execute(
        `UPDATE cropdata SET QUANTITY =:quantity, PRICE = :price WHERE CROPID = :cropid`,
        {cropid,quantity,price}
    );
    await connection.commit();
    console.log('crop delete succfully');
  } catch (error) {
    console.log('error of edit data crop')
    console.log(error);
  }
  }
  
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
  
  

//chat Application backend code

function isAlreadyConverted(array) {
  if (!Array.isArray(array)) {
    console.error('Input is not an array:', array);
    return false;
  }
  return array.every(item => typeof item === 'object' && item.hasOwnProperty('email') && item.hasOwnProperty('name'));
}

// Function to convert the array if it's not in the desired format
function convertbuyercontact(array) {
  if (!Array.isArray(array)) {
    console.error('Input is not an array:', array);
    return [];
  }

  if (isAlreadyConverted(array)) {
    return array;
  }

  return array.map(item => ({
    email: item[0],
    name: item[1]
  }));
}

const convertOrReturnJson = (json) => {
  // Check if JSON is already in the desired format
  const isAlreadyConverted = json.every(item => typeof item === 'object' && 'email' in item && 'name' in item);
  
  if (isAlreadyConverted) {
    return json;
  } else {
    // Convert JSON into desired format
    const convertedJson = json.map(item => {
      return {
        email: item[0],
        name: item[1]
      };
    });
    return convertedJson;
  }
}

async function getbuyercontact() {
  const connection =await connectToDatabase();
  const sellerEmail = localStorage.getItem('selleremial');
  const result =  await connection.execute(
    `select DISTINCT buyerdata.buyer_email,buyerdata.name from buyerdata, craditems where buyerdata.buyer_email = craditems.buyer_email and craditems.email = '${sellerEmail}'`,);
  //   let formattedData = result.rows.map(row => ({
  //   email: row[0],
  //   name: row[1]
  // }));
  formattedData = convertOrReturnJson(result.rows);
    return formattedData;
}

app.get('/buyer_contact', async (req, resp) => {
  const data = await getbuyercontact();
  resp.send(data);
});


app.post('/buyer_contact',async(req,resp)=>{
  const buyer_email = req.body.buyerEmail;
  console.log(buyer_email);
  if (localStorage.getItem('curent_buyer_contact')) {
    localStorage.removeItem('curent_buyer_contact');
  }
  localStorage.setItem('curent_buyer_contact', buyer_email);
})

async function getmessageseller() {
  const connection = await connectToDatabase();
  const sellerEmail = localStorage.getItem('selleremial');
  const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
  const result = await connection.execute(`SELECT MESSAGENO,MESSAGE,SENDEREMAIL,RECIEVEREMAIL
FROM sendmessage 
WHERE 
    (SENDEREMAIL = '${currentbuyerEmail}' and RECIEVEREMAIL = '${sellerEmail}') or
    (SENDEREMAIL = '${sellerEmail}' and RECIEVEREMAIL = '${currentbuyerEmail}')`);
const messages = result.rows.map(row => ({
  messageno: row[0],
  message: row[1],
  senderemail: row[2],
  recieveremail: row[3]
}));

return messages;
}


async function sendmessageseller(message) {
  const connection = await connectToDatabase();
  const sellerEmail = localStorage.getItem('selleremial');
  const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
  const result = await connection.execute(`
  INSERT INTO sendmessage (senderemail, recieveremail, message) 
  VALUES ('${sellerEmail}', '${currentbuyerEmail}', '${message}')
`);
  await connection.commit();
}

app.post('/seller_chatpage_message', async (req, resp) => {
  const message = req.body.message;
  await sendmessageseller(message);
});
app.get('/seller_chatpage_message',async(req,resp)=>{
  const result1 = await getmessageseller();
  const sellerEmail = localStorage.getItem('selleremial');
  const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
  const sendpropermessage = {messagelist:result1,selleremail:sellerEmail,buyeremail:currentbuyerEmail};
  resp.send(sendpropermessage);
})



//buyer chating code
async function getsellercontact() {
  const connection =await connectToDatabase();
  const buyerEmail = localStorage.getItem('buyeremial');
  let result =  await connection.execute(
    `select DISTINCT seller_data.EMAIL,seller_data.NAME from seller_data, craditems where seller_data.EMAIL = craditems.EMAIL and craditems.BUYER_EMAIL = '${buyerEmail}'`,);
  //   let formattedData = result.rows.map(row => ({
  //   email: row[0],
  //   name: row[1]
  // }));
  formattedData = convertOrReturnJson(result.rows)
    return formattedData;
}
app.get('/seller_contact', async (req, resp) => {
  const data = await getsellercontact();
  resp.send(data);
});


app.post('/seller_contact',async(req,resp)=>{
  const buyer_email = req.body.buyerEmail;
  console.log(buyer_email);
  if (localStorage.getItem('curent_seller_contact')) {
    localStorage.removeItem('curent_seller_contact');
  }
  localStorage.setItem('curent_seller_contact', buyer_email);
})


async function getmessagebuyer() {
  const connection = await connectToDatabase();
  const buyerEmail = localStorage.getItem('buyeremial');
  const currentsellerEmail = localStorage.getItem('curent_seller_contact');
  const result = await connection.execute(`
  SELECT MESSAGENO,MESSAGE,SENDEREMAIL,RECIEVEREMAIL
  FROM sendmessage 
  WHERE 
      (SENDEREMAIL = '${currentsellerEmail}' and RECIEVEREMAIL = '${buyerEmail}') or
      (SENDEREMAIL = '${buyerEmail}' and RECIEVEREMAIL = '${currentsellerEmail}')
`);
const messages = result.rows.map(row => ({
  messageno: row[0],
  message: row[1],
  senderemail: row[2],
  recieveremail: row[3]
}));
return messages;
}

async function sendmessagebuyer(message) {
  const connection = await connectToDatabase();
  const buyerEmail = localStorage.getItem('buyeremial');
  const currentsellerEmail = localStorage.getItem('curent_seller_contact');
  const result = await connection.execute(`
  INSERT INTO sendmessage (senderemail, recieveremail, message) 
  VALUES ('${buyerEmail}', '${currentsellerEmail}', '${message}')
`);
  await connection.commit();
}



app.post('/buyer_chatpage_message', async (req, resp) => {
  const message = req.body.message;
  await sendmessagebuyer(message);
});
app.get('/buyer_chatpage_message',async(req,resp)=>{
  const result1 = await getmessagebuyer();
  const buyerEmail = localStorage.getItem('buyeremial');
  const currentsellerEmail = localStorage.getItem('curent_seller_contact');
  const sendpropermessage = {messagelist:result1,selleremail:currentsellerEmail,buyeremail:buyerEmail};
  resp.send(sendpropermessage);
})

app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "HTML", "mainpages", "home.html")
  );
});
app.get("/about", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "mainpages", "about.html")
  );
});
app.get("/contact", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "mainpages", "contact.html")
  );
});

//Sellingpages
app.get("/seller_login", (req, res) => {
  localStorage.removeItem('selleremial');
  res.sendFile(
    path.join(__dirname, "public", "HTML", "sellingpages", "seller_login.html")
  );
});
app.get("/seller_register", (req, res) => {
  localStorage.removeItem('selleremial');
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "HTML",
      "sellingpages",
      "seller_register.html"
    )
  );
});
app.get("/add_crop", requireseller, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "sellingpages", "add_crop.html")
  );
});
app.get("/seller_view", requireseller, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "sellingpages", "seller_view.html")
  );
});

app.get("/seller_chatpage", requireseller, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "sellingpages", "sellerchatapp.html")
  );
});


//adminpages
app.get("/adminlogin", (req, res) => {
  localStorage.removeItem('adminemial');
  res.sendFile(
    path.join(__dirname, "public", "HTML", "adminpages", "adminlogin.html")
  );
});
app.get("/admin_dashboard", requireAdmin, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "adminpages", "admin_dashboard.html")
  );
});

//Buyingpages
app.get("/buyer_register", (req, res) => {
  localStorage.removeItem('buyeremial');
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "buyer_register.html")
  );
});
app.get("/buyer_login", (req, res) => {
  localStorage.removeItem('buyeremial');
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "buyer_login.html")
  );
});
app.get("/crop_detail",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "crop_category.html")
  );
});
app.get("/fruit_detail",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "fruit.html")
  );
});
app.get("/vegetable_detail", requirebuyer,(req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "vegetable.html")
  );
});
app.get("/grain_detail",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "grain.html")
  );
});
app.get("/buyer_dashboard",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "HTML",
      "buyingpages",
      "buyer_dashboard.html"
    )
  );
});

app.get("/crop_data_according_to_person",requirebuyer, (req, res) => {
  const { cropname, category, cropimage } = req.query;
  req.session.cropimage = cropimage;
  console.log("ankh khol kar dakh la");
  console.log(cropimage);
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "HTML",
      "buyingpages",
      "crop_data_according_to_person.html"
    )
  );
});

app.get("/test",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "detail_crop.html")
  );
});
app.get("/card_data",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "cards_data.html")
  );
});
app.get("/buyer_chat",requirebuyer, (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "buyer_chat.html")
  );
});  
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const path = require("path");
const express = require("express");
const session = require("express-session");
const oracledb = require("oracledb");
const notifier = require("node-notifier");
const axios = require("axios");
const bodyParser = require("body-parser");
const { Console } = require("console");

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
      req.session.isbuyerLoggedIn = true;
      req.session.buyerType = "buyer";
      res.redirect("/buyer_dashboard");
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
    // Server-side validation to check if the email field is unique
    const emailExists = await checkEmailExistsseller(sell_register.email);
    if (emailExists) {
      // Redirect with error message
      res.redirect("/seller_register?error=Email%20already%20exists");
    } else {
      await seller_registers(sell_register);
      req.session.issellerLoggedIn = true;
      req.session.sellerType = "seller";
      res.redirect("/seller_view");
    }
  } catch (error) {
    // Send a response to the client without logging the error to the terminal
    res.status(500).send("Internal Server Error");
  }
});

// login codes
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
      req.session.isAdminLoggedIn = true;
      req.session.adminType = "admin";
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
      req.session.isbuyerLoggedIn = true;
      req.session.buyerType = "buyer";
      req.session.buyeremail = email;
      res.redirect("/buyer_dashboard");
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
      req.session.issellerLoggedIn = true;
      req.session.sellerType = "seller";
      req.session.seller_email = email;
      console.log(req.session.seller_email);
      res.redirect("/seller_view");
    } else {
      res.status(401).send("Invalid credentials");
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
    seller_email: req.session.seller_email,
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
  if (req.session.isAdminLoggedIn && req.session.adminType === "admin") {
    next();
  } else {
    res.redirect("/adminlogin");
  }
}

function requireseller(req, res, next) {
  if (req.session.issellerLoggedIn && req.session.sellerType === "seller") {
    next();
  } else {
    res.redirect("/seller_login");
  }
}

function requirebuyer(req, res, next) {
  if (req.session.isbuyerLoggedIn && req.session.buyerType === "buyer") {
    next();
  } else {
    res.redirect("/buyer_login");
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
    "SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Fruits'"
  );
  const result2 = convertJsonStructure(result.rows);
  resp.send(result2);
});



app.get("/vegitable_detail/page", requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    "SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Vegetables'"
  );
  const result2 = convertJsonStructure(result.rows);
  resp.send(result2);
});

app.get("/grains_detail/page", requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    "SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = 'Grains'"
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

async function lessquantity(cropid, quan) {
  const connection = await connectToDatabase();
  try {
    const result = await connection.execute(
      `SELECT QUANTITY FROM cropdata WHERE CROPID = :cropid`,
      [cropid]
    );
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
    const result = await connection.execute(
      `SELECT QUANTITY FROM cropdata WHERE CROPID = :cropid`,
      [cropid]
    );
    const updatequantity = result.rows[0].QUANTITY;
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
    // console.log(a);
  } catch (error) {
    console.log("ham sa na ho paiga LESS QUANITY");
    console.log(error);
  } finally {
    await connection.close();
  }
}


async function addcarditem(carditem) {
  const connection = await connectToDatabase();
  try {
    const result = await connection.execute(
      "INSERT INTO craditems (EMAIL, BUYER_EMAIL, CROPID, QUANTITY, AMOUNT) VALUES (:selleremail, :buyeremial, :cropid, :quantity, :amount)",
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
  const buyeremail = req.session.buyeremail;
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

async function getdataofcard(buyeremial) {
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  const connection = await connectToDatabase();
  const result = await connection.execute(` SELECT ci.cropid, cd.NAME AS cropname, ci.quantity, ci.amount, ci.crad_id, ci.email, sd.NAME AS seller_name
FROM craditems ci JOIN cropdata cd ON ci.cropid = cd.cropid JOIN seller_data sd ON cd.seller_email = sd.email
WHERE ci.buyer_email = '${buyeremial}'`);
return result.rows;
}
app.get('/buyer_card_table',async (req,resp)=>{
  const buyeremail = req.session.buyeremail;
  const  results = await  getdataofcard(buyeremail);
  resp.json(results);
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
  res.sendFile(
    path.join(__dirname, "public", "HTML", "sellingpages", "seller_login.html")
  );
});
app.get("/seller_register", (req, res) => {
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

//adminpages
app.get("/adminlogin", (req, res) => {
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
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "buyer_register.html")
  );
});
app.get("/buyer_login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "buyer_login.html")
  );
});
app.get("/crop_detail", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "crop_category.html")
  );
});
app.get("/fruit_detail", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "fruit.html")
  );
});
app.get("/vegetable_detail", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "vegetable.html")
  );
});
app.get("/grain_detail", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "grain.html")
  );
});
app.get("/buyer_dashboard", (req, res) => {
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

app.get("/crop_data_according_to_person", (req, res) => {
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

app.get("/test", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "detail_crop.html")
  );
});
app.get("/card_data", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "HTML", "buyingpages", "cards_data.html")
  );
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

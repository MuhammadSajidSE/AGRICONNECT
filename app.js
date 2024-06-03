const path = require('path');
const port = 3000;
const express = require("express");
const session = require('express-session');
const oracledb = require("oracledb");
const notifier = require('node-notifier');
const { count } = require('console');

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const app = express();
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

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
        city: req.body.city // Add the city field
    };

    try {
        const emailExists = await checkEmailExistbuyer(buyer_register.email);
        if (emailExists) {
            res.redirect('/buyer_register?error=Email%20already%20exists');
        } else {
            await buyer_registers(buyer_register);
            req.session.isbuyerLoggedIn = true;
            req.session.buyerType = 'buyer';
            res.redirect('/buyer_dashboard');
        }
    } catch (error) {
        console.error('Error during buyer registration:', error); // Log the error
        res.status(500).send('Internal Server Error');
    }
});

// Function to check if email exists in the database
async function checkEmailExistbuyer(email) {
    try {
        const connection = await connectToDatabase();
        const result = await connection.execute(
            'SELECT * FROM buyerdata WHERE LOWER(BUYER_EMAIL) = :email',
            { email: email.toLowerCase() }
        );
        await connection.close();
        
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error);
        throw error;
    }
}

// Function to register buyer
async function buyer_registers(buyers_data) {
    try {
        const connection = await connectToDatabase();
        const result = await connection.execute(
            'INSERT INTO buyerdata (NAME, BUYER_EMAIL, PASSWORD, PHONE_NO, ADDRESS, CITY) VALUES (:name, :email, :password, :phone_no, :buyer_address, :city)',
            buyers_data
        );
        await connection.commit();
        await connection.close();
        return result;
    } catch (error) {
        console.error('Error registering buyer:', error);
        throw error;
    }
}

async function seller_registers(seller_data) {
  try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
          'INSERT INTO seller_data (name, email, password, phone_no, seller_address, city) VALUES (:name, :email, :password, :phone_no, :seller_address, :city)',
          seller_data
      );
      await connection.commit();
      await connection.close();
      return result; // Return the result if needed
  } catch (error) {
      console.error('Error registering seller:', error);
      throw error; // Rethrow the error for the caller to handle
  }
}

async function checkEmailExistsseller(email) {
  try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
          'SELECT * FROM seller_data WHERE LOWER(email) = :email',
          { email: email.toLowerCase() }
      );
      await connection.close();
      
      // If any row is returned from the query, return true; otherwise, return false
      return result.rows.length > 0;
  } catch (error) {
      console.error('Error checking email existence:', error);
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
      city: req.body.city // Add the city field
  };
  try {
      // Server-side validation to check if the email field is unique
      const emailExists = await checkEmailExistsseller(sell_register.email);
      if (emailExists) {
          // Redirect with error message
          res.redirect('/seller_register?error=Email%20already%20exists');
      } else {
          await seller_registers(sell_register);
          req.session.issellerLoggedIn = true;
          req.session.sellerType = 'seller';
          res.redirect('/seller_view');
      }
  } catch (error) {
      // Send a response to the client without logging the error to the terminal
      res.status(500).send('Internal Server Error');
  }
});

// login codes 
app.post('/adminlogin', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received login request:', { email, password });

  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT email FROM admin_data WHERE email = :email AND password = :password",
      { email, password }
    );
    console.log('Query result:', result);
    if (result.rows.length > 0) {
      req.session.isAdminLoggedIn = true;
      req.session.adminType = 'admin';
      res.redirect('/admin_dashboard');
    } else {
      res.redirect('/adminlogin?error=Invalid%20Email%20or%20Password');
    }

    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post('/buyer_login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await connectToDatabase();
    const allDataResult = await connection.execute("SELECT * FROM buyerdata");
    const result = await connection.execute(
      "SELECT BUYER_EMAIL FROM buyerdata WHERE BUYER_EMAIL = :email AND password = :password",
      { email, password }
    );
    console.log('Query result:', result);
    if (result.rows.length > 0) {
      req.session.isbuyerLoggedIn = true;
      req.session.buyerType = 'buyer';
      res.redirect('/buyer_dashboard');
    } else {
      res.redirect('/buyer_login?error=Invalid%20Eamil%20or%20Password');
    }

    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post('/seller_login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT EMAIL FROM seller_data WHERE EMAIL = :email AND password = :password",
      { email, password }
    );
    if (result.rows.length > 0) {
      req.session.issellerLoggedIn = true;
      req.session.sellerType = 'seller';
      req.session.seller_email = email;
      console.log( req.session.seller_email);
      res.redirect('/seller_view');
    } else {
      res.status(401).send("Invalid credentials");
    }
    await connection.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post('/add_crop', async (req, res) => {
  const sell_register = {
    category: req.body.category,
    name: req.body.cropname,
    price: req.body.price,
    quantity: req.body.quantity,
    seller_email: req.session.seller_email
  };

  const connection = await connectToDatabase();
  
  const chekcrop = await connection.execute(
    `SELECT name FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
    {
      name: sell_register.name,
      price: sell_register.price,
      seller_email: sell_register.seller_email
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
        seller_email: sell_register.seller_email
      }
    );

    await connection.commit();

    notifier.notify({
      title: 'Crop Inserted',
      message: 'Crop has been inserted successfully!',
    });
  } else {
    const selctequanity = await connection.execute(
      `SELECT quantity FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
      {
        name: sell_register.name,
        price: sell_register.price,
        seller_email: sell_register.seller_email
      }
    );
      let num1 =  parseInt(selctequanity.rows[0][0], 10);
     let num2 = sell_register.quantity;
     num2 = parseInt(num2);
    const setquantity =num1 + num2;
    await connection.execute(
      `UPDATE cropdata SET  
         quantity = :quantity 
       WHERE name = :name AND price = :price AND seller_email = :seller_email`,
      {
        quantity: setquantity,
        name: sell_register.name,
        price: sell_register.price,
        seller_email: sell_register.seller_email
      }
    );

    await connection.commit();

    notifier.notify({
      title: 'Crop Updated',
      message: 'Crop quantity has been updated successfully!',
    });
  }

  res.redirect('/seller_view');
  await connection.close();
});

app.post('/clearAdminSession', (req, res) => {
  delete req.session.isAdminLoggedIn;
  delete req.session.adminType;
  res.sendStatus(200);
});

app.post('/clearsellersession', (req, res) => {
  delete req.session.issellerLoggedIn;
  delete req.session.sellerType;
  res.sendStatus(200);
});

app.post('/clearbuyersession', (req, res) => {
  delete req.session.isbuyerLoggedIn;
  delete req.session.buyerType;
  res.sendStatus(200);
});

function requireAdmin(req, res, next) {
  if (req.session.isAdminLoggedIn && req.session.adminType === 'admin') {
    next();
  } else {
    res.redirect('/adminlogin'); 
  }
}

function requireseller(req, res, next) {
  if (req.session.issellerLoggedIn && req.session.sellerType === 'seller') {
    next();
  } else {
    res.redirect('/seller_login'); 
  }
}

function requirebuyer(req, res, next) {
  if (req.session.isbuyerLoggedIn && req.session.buyerType === 'buyer') {
    next();
  } else {
    res.redirect('/buyer_login'); 
  }
}

app.get('/fruit_detail/page',requirebuyer, async (req, resp) => {
    const connection = await connectToDatabase();
    const result = await connection.execute('SELECT * FROM cropdata WHERE CATEGORY = \'Fruits\'');
    const secondValues = result.rows.map(row => row[1]);
    resp.send(secondValues);
});

app.get('/vegitable_detail/page', requirebuyer,async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute('SELECT * FROM cropdata WHERE CATEGORY = \'Vegetables\'');
  const secondValues = result.rows.map(row => row[1]);
  resp.send(secondValues);
});

app.get('/grains_detail/page',requirebuyer, async (req, resp) => {
  const connection = await connectToDatabase();
  const result = await connection.execute('SELECT * FROM cropdata WHERE CATEGORY = \'Grains\'');
  const secondValues = result.rows.map(row => row[1]);
  resp.send(secondValues);
});

app.get('/person_category', async (req, res) => {
  let connection;
  let { cropname, category } = req.query;

  cropname = cropname.trim();
  category = category.trim();
  console.log(`Received request for cropname: ${cropname}, category: ${category}`);
  category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT c.CROPID, c.NAME, c.CATEGORY, c.QUANTITY, c.PRICE, s.NAME as SELLER_NAME, c.SELLER_EMAIL
     FROM cropdata c
     JOIN seller_data s ON c.SELLER_EMAIL = s.EMAIL
     WHERE LOWER(c.NAME) = LOWER(:1) AND LOWER(c.CATEGORY) = LOWER(:2)`,
    [cropname, category]
  );
  
  console.log('Query executed successfully. Rows:', result.rows);
  res.json(result.rows);
});





// Database ADmin

// Function to fetch table data
async function fetchTableData() {
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
      const buyer_data = await connection.execute(`SELECT BUYER_EMAIL, NAME, PHONE_NO, ADDRESS, CITY FROM BUYERDATA ORDER BY NAME`);
      const seller_data = await connection.execute(`SELECT EMAIL AS SELLER_EMAIL, NAME, PHONE_NO,  SELLER_ADDRESS, CITY  FROM SELLER_DATA ORDER BY NAME`);
      const crop_data = await connection.execute(`SELECT * FROM CROPDATA ORDER BY CROPID`);

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
app.get('/getTableData', async (req, res) => {
  try {
      const tableData = await fetchTableData();
      res.json(tableData);
  } catch (error) {
      console.error('Error fetching tableData:', error);
      res.status(500).send('Internal Server Error');
  }
});


// Route to serve the table data
app.get('/getTableData', async (req, res) => {
  try {
      const tableData = await fetchTableData();
      res.json(tableData);
  } catch (error) {
      console.error('Error fetching tableData:', error);
      res.status(500).send('Internal Server Error');
  }
});







app.use(express.static(path.join(__dirname, 'public')));
//Mainpages
app.get('/', async (req, res) => {
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
app.get('/add_crop',requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'add_crop.html'));
});
app.get('/seller_view',requireseller, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','sellingpages', 'seller_view.html'));
});

//adminpages
app.get('/adminlogin',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','adminpages', 'adminlogin.html'));
});
app.get('/admin_dashboard',requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','adminpages', 'admin_dashboard.html'));
});


//Buyingpages
app.get('/buyer_register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_register.html'));
});
app.get('/buyer_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_login.html'));
});
app.get('/crop_detail',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'crop_category.html'));
});
app.get('/fruit_detail',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'fruit.html'));
});
app.get('/vegetable_detail',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'vegetable.html'));
});
app.get('/grain_detail',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'grain.html'));
});
app.get('/buyer_dashboard',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'buyer_dashboard.html'));
});

app.get('/person_category',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','buyingpages', 'person_category.html'));
});

app.get('/crop_data_according_to_person',requirebuyer, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','HTML','buyingpages', 'crop_data_according_to_person.html'));
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

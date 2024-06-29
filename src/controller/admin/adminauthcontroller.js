const { connectToDatabase } = require("../../db.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

async function adminLogin(email, password) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      "SELECT email FROM admin_data WHERE email = :email AND password = :password",
      { email, password }
    );
    await connection.close();

    if (result.rows.length > 0) {
      localStorage.setItem('adminemial', email);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    throw error;
  }
}

module.exports = { adminLogin };

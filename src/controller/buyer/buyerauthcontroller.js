const { connectToDatabase } = require("../../db.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

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


async function buyerLogin(email, password) {
    try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
        "SELECT BUYER_EMAIL FROM buyerdata WHERE BUYER_EMAIL = :email AND password = :password",
        { email, password }
      );
      await connection.close();
  
      if (result.rows.length > 0) {
        localStorage.setItem('buyeremial', email);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error during buyer login:", error);
      throw error;
    }
  }

module.exports = { checkEmailExistbuyer, buyer_registers,buyerLogin };

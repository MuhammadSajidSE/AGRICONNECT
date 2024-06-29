const { connectToDatabase } = require("../../db.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

async function seller_registers(seller_data) {
    try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
        "INSERT INTO seller_data (name, email, password, phone_no, seller_address, city) VALUES (:name, :email, :password, :phone_no, :seller_address, :city)",
        seller_data
      );
      await connection.commit();
      await connection.close();
      return result;
    } catch (error) {
      console.error("Error registering seller:", error);
      throw error; 
    }
  }
  
  //CHECK SELLER EMAIL IS ALREADY EXIST OR NOT
  async function checkEmailExistsseller(email) {
    try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
        "SELECT * FROM seller_data WHERE LOWER(email) = :email",
        { email: email.toLowerCase() }
      );
      await connection.close();
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  }
  async function sellerLogin(email, password) {
    try {
      const connection = await connectToDatabase();
      const result = await connection.execute(
        "SELECT EMAIL FROM seller_data WHERE EMAIL = :email AND password = :password",
        { email, password }
      );
      await connection.close();
  
      if (result.rows.length > 0) {
        localStorage.setItem('selleremial', email);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error during seller login:", error);
      throw error;
    }
  }
  module.exports = { checkEmailExistsseller, seller_registers,sellerLogin };
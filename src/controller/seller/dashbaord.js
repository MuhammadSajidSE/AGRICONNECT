const oracledb = require("oracledb");
const { connectToDatabase } = require("../../db.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

async function getCropOfSeller() {
    const sellerEmail = localStorage.getItem('selleremial');
    try {
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      const connection = await connectToDatabase();
      const result = await connection.execute(
        `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL
         FROM cropdata
         WHERE SELLER_EMAIL = :sellerEmail AND QUANTITY != 0`,
        { sellerEmail }  
      );
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
  
  //GET THE ORDER CROPS DATA OF SELLER
  async function getOrderDataForSeller() {
    const sellerEmail = localStorage.getItem('selleremial'); 
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
        { sellerEmail } 
      );
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
        CRAD_ID: row.CRAD_ID 
      }));
      return { orderdata };
    } catch (error) {
      console.error('Error executing query:', error.message, error.stack);
      throw new Error('Failed to fetch order data for the seller.');
    } 
  }
  
  //GET THE SOLD CROPS DATA OF THE BUYER
  async function getSoldDataForSeller() {
    const sellerEmail = localStorage.getItem('selleremial');
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
        { sellerEmail }
      );
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

  module.exports = { getCropOfSeller, getOrderDataForSeller,getSoldDataForSeller };
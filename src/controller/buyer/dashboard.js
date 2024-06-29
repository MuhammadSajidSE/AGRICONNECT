const { connectToDatabase } = require("../../db.js");
const oracledb = require("oracledb");
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
  
  //GET THE BUYER DATA THAT CROP HAS BEEN ORDERED
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
  
  //GET THE DATA OF THAT CROP HAS BEEN CARDED 
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
  
  module.exports = { getdataofbuybuyer,getdataoforderbuyer,getdataofcardbuyer };
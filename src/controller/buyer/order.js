const oracledb = require("oracledb");
const { connectToDatabase } = require("../../db.js");
async function ordertosold(cardid) {
    const connection = await connectToDatabase();
    await connection.execute(
        `UPDATE CRADITEMS SET STATUS = 'SOLD' WHERE CRAD_ID = :cardid`,
        [cardid]
    );
    await connection.commit();
    console.log('Order status updated');
  }
  
  module.exports = {ordertosold};
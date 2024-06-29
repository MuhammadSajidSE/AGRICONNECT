const oracledb = require("oracledb");
const { connectToDatabase } = require("../../db.js");

async function fetchTableData() {
  try {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connection = await connectToDatabase();
    const buyer_data = await connection.execute(
      `SELECT BUYER_EMAIL, NAME, PHONE_NO, ADDRESS, CITY FROM BUYERDATA ORDER BY NAME`
    );
    const seller_data = await connection.execute(
      `SELECT EMAIL AS SELLER_EMAIL, NAME, PHONE_NO, SELLER_ADDRESS, CITY FROM SELLER_DATA ORDER BY NAME`
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

module.exports = { fetchTableData };

const oracledb = require("oracledb");
const { connectToDatabase } = require("../../db.js");
const { ensureArrayFormat } = require("../../jsonconvertor.js");
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
      await connection.execute(
        `UPDATE CROPDATA SET QUANTITY = :quantity WHERE CROPID = :cropid`,
        { quantity: a, cropid: cropid }
      );
      await connection.commit();
    } catch (error) {
      console.log("ham sa na ho paiga  QUANITY increase");
      console.log(error);
    } finally {
      await connection.close();
    }
  }
  
  module.exports = { lessquantity2 };
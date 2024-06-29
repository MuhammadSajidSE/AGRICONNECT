const oracledb = require("oracledb");
const { connectToDatabase } = require("../../db.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

async function cardtoorderAPI(req) {
    const buyeremail = localStorage.getItem('buyeremial');
    const connection = await connectToDatabase();
    await connection.execute(
      `UPDATE CRADITEMS SET STATUS = 'ORDER' WHERE BUYER_EMAIL = :buyeremail`,
      [buyeremail]
    );
    connection.commit();
    console.log('Order status updated');
  }

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

  module.exports = { cardtoorderAPI, deletecard };
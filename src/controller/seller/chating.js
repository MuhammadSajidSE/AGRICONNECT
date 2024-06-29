const { connectToDatabase } = require("../../db.js");
const { convertOrReturnJson } = require("../../jsonconvertor.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const oracledb = require("oracledb");
async function getbuyercontact() {
    const connection =await connectToDatabase();
    const sellerEmail = localStorage.getItem('selleremial');
    const result =  await connection.execute(
      `select DISTINCT buyerdata.buyer_email,buyerdata.name from buyerdata, craditems where buyerdata.buyer_email = craditems.buyer_email and craditems.email = '${sellerEmail}'`,);
    formattedData = convertOrReturnJson(result.rows);
      return formattedData;
  }
  

  async function getmessageseller() {
    const connection = await connectToDatabase();
    const sellerEmail = localStorage.getItem('selleremial');
    const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
    const result = await connection.execute(`SELECT MESSAGENO,MESSAGE,SENDEREMAIL,RECIEVEREMAIL
  FROM sendmessage 
  WHERE 
      (SENDEREMAIL = '${currentbuyerEmail}' and RECIEVEREMAIL = '${sellerEmail}') or
      (SENDEREMAIL = '${sellerEmail}' and RECIEVEREMAIL = '${currentbuyerEmail}')`);
  const messages = result.rows.map(row => ({
    messageno: row[0],
    message: row[1],
    senderemail: row[2],
    recieveremail: row[3]
  }));
  return messages;
  }
  async function sendmessageseller(message) {
    const connection = await connectToDatabase();
    const sellerEmail = localStorage.getItem('selleremial');
    const currentbuyerEmail = localStorage.getItem('curent_buyer_contact');
    const result = await connection.execute(`
    INSERT INTO sendmessage (senderemail, recieveremail, message) 
    VALUES ('${sellerEmail}', '${currentbuyerEmail}', '${message}')
  `);
    await connection.commit();
  }
  
  
  module.exports = { getbuyercontact, getmessageseller,sendmessageseller };
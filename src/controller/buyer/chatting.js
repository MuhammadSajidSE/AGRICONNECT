const { connectToDatabase } = require("../../db.js");
const { convertOrReturnJson } = require("../../jsonconvertor.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const oracledb = require("oracledb");
async function getsellercontact() {
    const connection =await connectToDatabase();
    const buyerEmail = localStorage.getItem('buyeremial');
    let result =  await connection.execute(
      `select DISTINCT seller_data.EMAIL,seller_data.NAME from seller_data, craditems where seller_data.EMAIL = craditems.EMAIL and craditems.BUYER_EMAIL = '${buyerEmail}'`,);
    formattedData = convertOrReturnJson(result.rows)
      return formattedData;
  }
//GET MESSAGES OF SPEFIC BUYER FUNCTION
async function getmessagebuyer() {
    const connection = await connectToDatabase();
    const buyerEmail = localStorage.getItem('buyeremial');
    const currentsellerEmail = localStorage.getItem('curent_seller_contact');
    const result = await connection.execute(`
    SELECT MESSAGENO,MESSAGE,SENDEREMAIL,RECIEVEREMAIL
    FROM sendmessage 
    WHERE 
        (SENDEREMAIL = '${currentsellerEmail}' and RECIEVEREMAIL = '${buyerEmail}') or
        (SENDEREMAIL = '${buyerEmail}' and RECIEVEREMAIL = '${currentsellerEmail}')
  `);
  const messages = result.rows.map(row => ({
    messageno: row[0],
    message: row[1],
    senderemail: row[2],
    recieveremail: row[3]
  }));
  return messages;
  }
  
  async function sendmessagebuyer(message) {
    const connection = await connectToDatabase();
    const buyerEmail = localStorage.getItem('buyeremial');
    const currentsellerEmail = localStorage.getItem('curent_seller_contact');
    const result = await connection.execute(`
    INSERT INTO sendmessage (senderemail, recieveremail, message) 
    VALUES ('${buyerEmail}', '${currentsellerEmail}', '${message}')
  `);
    await connection.commit();
  }

  module.exports = { getsellercontact, getmessagebuyer,sendmessagebuyer };
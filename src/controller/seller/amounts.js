const { connectToDatabase } = require("../../db.js");
const { transformData } = require("../../jsonconvertor.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const oracledb = require("oracledb");
async function totalamoutofavailabe() {
    const sellerEmail = localStorage.getItem('selleremial');
    const connection = await connectToDatabase();
  let result = await  connection.execute(`SELECT SUM(PRICE * QUANTITY) AS TOTAL_AVAILABLE FROM cropdata WHERE SELLER_EMAIL = '${sellerEmail}'`);
  result = transformData(result.rows,"TOTAL_AVAILABLE");
    return result[0][0];
  }
  
  async function numberofbuyer() {
    const sellerEmail = localStorage.getItem('selleremial');
    const connection = await connectToDatabase();
  let result = await  connection.execute(`SELECT COUNT(DISTINCT BUYER_EMAIL) AS DISTINCT_BUYER_COUNT FROM craditems WHERE email = '${sellerEmail}'`);
  result = transformData(result.rows,"DISTINCT_BUYER_COUNT");
    return result[0][0];
  }
  
  async function totalamountorder(){
    const sellerEmail = localStorage.getItem('selleremial');
    const connection = await connectToDatabase();
    let result = await  connection.execute(`select sum(amount) as total_order from craditems WHERE email = '${sellerEmail}' and  STATUS = 'ORDER'`);
    result = transformData(result.rows,"TOTAL_ORDER");
    return result[0][0];
  }
  
  async function totalamountsold(){
    const sellerEmail = localStorage.getItem('selleremial');
    const connection = await connectToDatabase();
    let result = await  connection.execute(`select sum(amount) as total_sold from craditems WHERE email = '${sellerEmail}' and  STATUS = 'SOLD'`);
    result = transformData(result.rows,"TOTAL_SOLD");
    return result[0][0];
  }


  module.exports = { totalamoutofavailabe, numberofbuyer,totalamountorder ,totalamountsold};
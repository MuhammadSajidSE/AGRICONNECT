const { connectToDatabase } = require("../../db.js");
const { transformData } = require("../../jsonconvertor.js");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const oracledb = require("oracledb");
async function totalcardamount(){
    const buyerEmail = localStorage.getItem('buyeremial');
    const connection = await connectToDatabase();
    let result = await  connection.execute(`select sum(amount) as total_card from craditems WHERE BUYER_EMAIL = '${buyerEmail}' and  STATUS = 'CARD'`);
    result = transformData(result.rows,"TOTAL_CARD");
    return result[0][0];
  }
  
  async function totalorderamountbuyer(){
    const buyerEmail = localStorage.getItem('buyeremial');
    const connection = await connectToDatabase();
    let result = await  connection.execute(`select sum(amount) as TOTAL_ORDER_BUYER from craditems WHERE BUYER_EMAIL = '${buyerEmail}' and  STATUS = 'ORDER'`);
    result = transformData(result.rows,"TOTAL_ORDER_BUYER");
    return result[0][0];
  }
  
  async function totalboughtamountbuyer(){
    const buyerEmail = localStorage.getItem('buyeremial');
    const connection = await connectToDatabase();
    let result = await  connection.execute(`select sum(amount) as TOTAL_BOUGHT_BUYER from craditems WHERE BUYER_EMAIL = '${buyerEmail}' and  STATUS = 'SOLD'`);
    result = transformData(result.rows,"TOTAL_BOUGHT_BUYER");
    return result[0][0];
  }
  
  async function numberofseller() {
    const buyerEmail = localStorage.getItem('buyeremial');
    const connection = await connectToDatabase();
  let result = await  connection.execute(`SELECT COUNT(DISTINCT EMAIL) AS DISTINCT_SELLER_COUNT FROM craditems WHERE BUYER_EMAIL = '${buyerEmail}'`);
  result = transformData(result.rows,"DISTINCT_BUYER_COUNT");
    return result[0][0];
  }
  
  module.exports = { totalcardamount, totalorderamountbuyer,totalboughtamountbuyer ,numberofseller};
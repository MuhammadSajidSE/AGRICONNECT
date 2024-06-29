const { connectToDatabase } = require("../../db.js");

async function submitBuyerComplaint(message, buyerEmail) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(`
      INSERT INTO complain (COMPLAIN_MESSAGE, SENDER_EMAIL, CATEGORY)
      VALUES (:message, :buyerEmail, 'buyer')`, { message, buyerEmail });
    await connection.commit();
    await connection.close();
    return result;
  } catch (error) {
    console.error("Error submitting buyer complaint:", error);
    throw error;
  }
}
async function submitSellerComplaint(message, sellerEmail) {
    try {
      const connection = await connectToDatabase();
      const result = await connection.execute(`
        INSERT INTO complain (COMPLAIN_MESSAGE, SENDER_EMAIL, CATEGORY)
        VALUES (:message, :sellerEmail, 'seller')`, { message, sellerEmail });
      await connection.commit();
      await connection.close();
      return result;
    } catch (error) {
      console.error("Error submitting seller complaint:", error);
      throw error;
    }
  }
  
module.exports = { submitBuyerComplaint,submitSellerComplaint };

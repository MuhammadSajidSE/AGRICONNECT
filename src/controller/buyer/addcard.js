const { connectToDatabase } = require("../../db.js");
async function addcarditem(carditem) {
    const connection = await connectToDatabase();
    try {
      const result = await connection.execute(
        "INSERT INTO craditems (EMAIL, BUYER_EMAIL, CROPID, QUANTITY, AMOUNT,STATUS) VALUES (:selleremail, :buyeremial, :cropid, :quantity, :amount, 'cards')",
        carditem
      );
      await connection.commit();
      await connection.close();
    } catch (error) {
      console.log("Error accur fo registration buyer:", error);
    }
  }

  module.exports = { addcarditem };
const { connectToDatabase } = require("../../db.js");
const oracledb = require("oracledb");
async function editcrop(cropid,quantity,price) {
    try {
      const connection = await connectToDatabase();
      await connection.execute(
          `UPDATE cropdata SET QUANTITY =:quantity, PRICE = :price WHERE CROPID = :cropid`,
          {cropid,quantity,price}
      );
      await connection.commit();
      console.log('crop delete succfully');
    } catch (error) {
      console.log('error of edit data crop')
      console.log(error);
    }
    }
    async function deletecrop(cardid) {
        try {
          const connection = await connectToDatabase();
          await connection.execute(
              `UPDATE cropdata SET QUANTITY = '${0}' WHERE CROPID = :cardid`,
              [cardid]
          );
          await connection.commit();
          console.log('crop delete succfully');
        } catch (error) {
          console.log('error of delete crop')
          console.log(error);
        }
        }
module.exports = { editcrop,deletecrop };
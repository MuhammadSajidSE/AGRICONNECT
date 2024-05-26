app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML','mainpages', 'home.html'));
  const connection = await oracledb.getConnection({
    user: "sajid",
    password: "root",
    connectString: "localhost:1521/XE" 
});
const result = await connection.execute(
    "SELECT * FROM auth"
);
await connection.close();
console.table(result.rows); // Print data to console
res.json(result.rows); 
});
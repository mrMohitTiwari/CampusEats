const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`CampusEats Assignment 5 listening on http://localhost:${PORT}`);
});
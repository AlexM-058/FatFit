const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the frontend (Vite/React) build
app.use(express.static(path.resolve(__dirname, "client", "dist")));

// Catch-all route for client-side routing (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
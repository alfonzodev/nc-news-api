const db = require("../db/connection.js");

const fetchGalleryImages = () => {
  return db.query("SELECT img_id, img_url FROM gallery");
};

module.exports = {
  fetchGalleryImages,
};

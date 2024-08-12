const db = require("../db/connection.js");

const fetchGalleryImages = () => {
  return db.query("SELECT img_id, img_url FROM gallery");
};

const fetchAvatarImages = () => {
  return db.query("SELECT avatar_id, avatar_img_url FROM avatars");
};

module.exports = {
  fetchGalleryImages,
  fetchAvatarImages,
};

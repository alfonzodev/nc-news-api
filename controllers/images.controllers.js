const { fetchGalleryImages } = require("../models/images.models");

const getGalleryImages = (req, res, next) => {
  fetchGalleryImages()
    .then((data) => {
      const images = data.rows;
      res.status(200).send({ images });
    })
    .catch((err) => next(err));
};

module.exports = { getGalleryImages };

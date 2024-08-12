const { fetchGalleryImages, fetchAvatarImages } = require("../models/images.models");

const getGalleryImages = (req, res, next) => {
  fetchGalleryImages()
    .then((data) => {
      const images = data.rows;
      res.status(200).send({ images });
    })
    .catch((err) => next(err));
};

const getAvatarImages = (req, res, next) => {
  fetchAvatarImages()
    .then((data) => {
      const avatars = data.rows;
      res.status(200).send({ avatars });
    })
    .catch((err) => next(err));
};

module.exports = { getGalleryImages, getAvatarImages };

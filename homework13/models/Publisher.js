import mongoose from 'mongoose';

// Схема издателя
const publisherSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // название издателя
  location: { type: String, trim: true },             // местоположение издателя
});

// Модель Publisher
const Publisher = mongoose.model('Publisher', publisherSchema);

export default Publisher;

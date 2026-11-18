import mongoose from 'mongoose';

// Схема категории
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // название категории
});

// Модель Category
const Category = mongoose.model('Category', categorySchema);

export default Category;

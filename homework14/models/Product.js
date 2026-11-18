import mongoose from 'mongoose';

// Схема продукта
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },  // название продукта
  price: { type: Number, required: true }, // цена продукта

  // Связь "один ко многим": в одной категории много продуктов,
  // каждый продукт ссылается на свою категорию
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
});

// Модель Product
const Product = mongoose.model('Product', productSchema);

export default Product;

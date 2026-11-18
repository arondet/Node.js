import mongoose from 'mongoose';

// Схема статьи
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // заголовок статьи
  content: { type: String, required: true },          // содержимое статьи

  // Связь "многие ко многим": массив ссылок на теги
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
});

// Модель Article
const Article = mongoose.model('Article', articleSchema);

export default Article;

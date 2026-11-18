import mongoose from 'mongoose';

// Схема тега
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // название тега

  // Связь "многие ко многим": массив ссылок на статьи
  articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
});

// Модель Tag
const Tag = mongoose.model('Tag', tagSchema);

export default Tag;

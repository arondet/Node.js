import mongoose from 'mongoose';

// Схема журнала
const magazineSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // название журнала
  issueNumber: { type: Number, required: true, min: 1 }, // номер выпуска

  // Связь "один ко многим": у одного издателя много журналов,
  // каждый журнал ссылается на своего издателя
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: true,
  },
});

// Модель Magazine
const Magazine = mongoose.model('Magazine', magazineSchema);

export default Magazine;

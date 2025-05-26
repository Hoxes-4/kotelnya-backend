const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },projectInvitations: [
    {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
      },
      projectName: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      invitedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

// Хэшируем пароль перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Проверка пароля при входе
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

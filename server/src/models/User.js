import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: [true, 'Password is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true }
}, { timestamps: true });

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email, phone: this.phone },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export default mongoose.model('User', userSchema);

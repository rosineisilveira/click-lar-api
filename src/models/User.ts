import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "O nome é obrigatório."],
    },
   
    password: {
      type: String,
      required: [true, "A senha é obrigatória."],
      select: false, 
    },

    phone: {
      type: String,
      required: [true, "O telefone é obrigatório."],
      unique: true,
      match: [
        /^\d{10,11}$/,
        "Por favor, forneça um telefone válido (apenas números, 10 ou 11 dígitos)."
      ]
    },

    email: {
      type: String,
      required: [true, "O e-mail é obrigatório."],
      unique: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Por favor, use um e-mail válido."],
      // 'sparse: true' 
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
    
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

const User = models.User || mongoose.model("User", userSchema);

export default User;
import mongoose, { Schema, model, models } from "mongoose";

const ratingSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    }
}, { _id: false }); 

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },       
    description: { type: String, required: true }, 
    price: { type: Number, required: true },       
    category: { type: String, required: true},    
    providerId: {                                    
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ratings: [ratingSchema], 
    ratingsCount: { 
        type: Number,
        default: 0
    }, 

    averageRating: { 
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (val: number) => Math.round(val * 10) / 10 
    }
  },

  { timestamps: true }
  
);

const Service = models.Service || model("Service", ServiceSchema);

export default Service;

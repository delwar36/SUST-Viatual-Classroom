const mongoose = require('mongoose');
const validator = require("validator");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    registration: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean
    },
    verificationCode: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String
    },
    isClassCreator: {type:Boolean}
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
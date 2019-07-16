const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10
const Profile = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,

    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
})
Profile.pre('save', function (next) {
    console.log(this);
    const user = this;
    this.hashPassword(user.password, (err, hash) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(hash);
        user.password = hash;
        next();
    })

})
Profile.methods.hashPassword = (userPassword, cb) => {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return cb(err);
        }
        bcrypt.hash(userPassword, salt, (err, hashedPassword) => {
            if (err) {
                return cb(err);
            }
            return cb(null, hashedPassword);
        })
    });
}
Profile.methods.toWeb = function () {
    return {
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        age: this.age,
        email: this.email,
    }
}
// Profile.methods.ComparePassword = function (password) {
//     return bcrypt.compare(password, this.password)
// }
module.exports = mongoose.model("Profile", Profile);
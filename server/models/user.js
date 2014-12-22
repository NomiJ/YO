var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    username: { type: String, lowercase: true, unique:true },
    mobileNumber: { type:Number, unique:true },
    friends: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    groups: [{name:String, users:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}]}],
    password: String,
    verify: {
        isVerified: {type: Boolean, default: false},
        code: String,
        expires: Date
    },

    tmpPassword: String,
    tmpPasswordExpires: Date
});

userSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(5, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);
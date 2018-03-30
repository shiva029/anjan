var mongoose = require('mongoose');

var bcrypt = require('bcrypt-node');
SALT_WORK_FACTOR = 10;
var data = new mongoose.Schema({
    FirstName:String,
    LastName:String,
    Email:String,
    Password:String,
   Mobl:Number,
   otp:String,
    udate: Date,
     token: String,
    otpExpires: Date
});
data.pre('save', function(next) {
    var mahi = this;

    // only hash the password if it has been modified (or is new)
    if (!mahi.isModified('Password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(mahi.Password, salt, null,function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            mahi.Password = hash;
            next();
        });
    });
});
data.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.Password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};
module.exports = mongoose.model('mahi',data);
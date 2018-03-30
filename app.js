var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var bcrypt = require('bcrypt-node');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var expressSession = require('express-session');
var flash    = require('connect-flash');
var jwt = require('jwt-simple');
var morgan = require('morgan')
var math = require('mathjs');

var mahi = require('./model.js');
mongoose.connect('mongodb://localhost/poiu');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(validator());
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//global vars
app.use(function(req,res,next){
    res.locals.errors = null;
    next();
})

// express validator middleware
app.use(expressValidator({
    errorFormatter:function(param,msg,value){
        var namespace = param.split('.'),
         root = namespace.shift(),
         formParam = root;


        while(namespace.length){
            formParam += '[' + namespace.shift() +']';

        }
        return{
            param:formParam,
            msg:msg,
            value:value
        }

    }
})

);
app.get('/login',function(req,res){
if(!req.session.cva){
 return res.status(401).send({message:"Invalid Email or Password"});
}
return res.status(200).send({message:"successfully login"});
});

app.get('/logout',function(req,res){
req.session.destroy();
return res.status(200).send("successfully logout");
});


app.post('/login',function(req,res) {
    var Email = req.body.Email;
    var Password = req.body.Password;
    var Mobl = req.body.Mobl
    if(Email){
    mahi.findOne({Email:Email,Password:Password},function(err,mahi){
        if(err){
            return res.status(500).send();
        }
        if(!mahi){
            return res.status(404).send();
        }
    });
    

   } else if (Mobl){
    
        /*mahi.comparePassword(Password, function(err,isMatch){
            if(isMatch && isMatch ==true){
                //req.session.mahi = mahi;
                return res.status(200).send(mahi);
            }else{
                return res.status(401).send();
            }
        })
    })
});*/
mahi.findOne({Mobl:Mobl,Password:Password},function(err,mahi){
    if(err){
        return res.status(500).send();
    }
     if(!mahi){
            return res.status(404).send();
        }
})    
}
});

app.get('/', function(req,res){
    mahi.find({})
    .exec(function(err,mahis){
        if(err){
            res.send('error')
        } else{
            res.json(mahis);
        }
    })
});


app.post('/bsk',function(req,res){
req.checkBody('FirstName', 'first name is required').notEmpty();
req.checkBody('LastName', 'last name is required').notEmpty();
req.checkBody('Email', 'email is required').notEmpty();
req.checkBody('Password', 'Password  is required').notEmpty();
req.checkBody('Mobl', 'mobl is required').notEmpty();

var errors = req.validationErrors();

       if(errors){

       }else {
                  var newmahi = new mahi();

        newmahi.FirstName = req.body.FirstName;
         newmahi.LastName = req.body.LastName;
        newmahi.Email = req.body.Email;
         newmahi.Password = req.body.Password;
          newmahi.Mobl = req.body.Mobl;
                
       }
        newmahi.save(function(err,mahi){
            if(err){
                res.send('error');
                console.log('error');
            }else{
       
                res.send(mahi);
                console.log('success');
            
        }   
        });
});


app.post('/', function(req,res){
    mahi.create(req.body,function(err,mahi){
        if(err){
            res.send('error');

        }else{
            res.send(mahi);
        }
    })
});

app.post('/otp', function(req,res){
    var Mobl = req.body.Mobl;

    var otp = (Math.floor(math.random()*10000)+10000).toString().substring(1);
    //console.log(otp);
    //res.send(otp);

    var newmahi = new mahi();
    newmahi.Mobl = Mobl;
    newmahi.otp = otp;
    newmahi.save(function(err,sdata){
        if(err){
            return res.status(500).send();

        }else{
            return res.status(200).send(sdata);
        }
    })
 
});

app.post('/votp',function(req,res){

    var UserId = req.body.UserId;
    var otp = req.body.otp

/*var newmahi = new mahi();
newmahi.UserId = UserId;
newmahi.otp = otp;

newmahi.save(function(err,sav){
    if(err){
       res.send('error');
    }else{
        res.send('success');
    }
})*/
//});

/*mahi.findOne({_Id:UserId,otp:otp},function(err,user){
        if(err){
            console.log(error)
            return res.status(500).send();
        }
        if(!user){
            return res.status(404).send();
        }
        mahi.compareotp(otp, function(err,isMatch){
            if(isMatch && isMatch ==true){
                //req.session.mahi = mahi;
                return res.status(200).send(mahi);
            }else{
                return res.status(401).send();
            }
        })
    //});
});*/

mahi.findOne({_id: UserId, otp:otp},  function (err, user) {
if(err){
  console.log(err);
  return res.status(500).send();
}else if(user){
  return res.status(200).send(user);
}else{
return res.status(404).send();
}
//req.session.mahi = mahi;

})
});

/*app.post('/signupdate', function(req, res) {
    var id = req.body.UserId;
    var token = req.body.token;
    var udate = new Date();
    mahi.findOne({ token: token, _id: id }, function(err, foundObject) {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else if (!foundObject) {
            res.status(404).send("user doesnot exist");

        } else {

            foundObject.FirstName = req.body.FirstName;
            foundObject.LastName = req.body.LastName;
            foundObject.Email = req.body.Email;
            foundObject.Password = req.body.Password;
            foundObject.udate = udate;
            foundObject.otp = undefined;
            foundObject.otpExpires = undefined;


            foundObject.save(function(err, updateObject) {
                if (err) {
                    console.log(err);
                    res.status(500).send("email already exist");
                } else {
                    //res.send(updateObject);
                    return res.status(200).send({ data: { user: foundObject.toJson() } });
                }
            });
        }
    });
});*/




var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(Email, Password, done) {
    mahi.findOne({ Email: Email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(Password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
))



/*app.post('/authenticate', function(req, res) {

  // find the user
  mahi.findOne({
   FirstName: req.body.FirstName
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.Password != req.body.Password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});*/
app.post('/forword', function(req, res) {
    
        var Mobl = req.body.Mobl;
        var otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        var payload = {
            iss: req.hostname,
        }
        var token = jwt.encode(payload, "shhh..");
        mahi.findOne({ Mobl: Mobl }, function(err, foundObject) {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else if (!foundObject) {
                res.status(404).send("user doesnot exist");
    
            } else {
                foundObject.otp = otp;
                foundObject.otpExpires = Date.now() + 3600000; // 1 hour
                foundObject.token = token;
    
                foundObject.save(function(err, updateObject) {
                    if (err) {
                        console.log(err);
                        res.status(500).send();
                    } else {
    
                        return res.status(200).send({ data: { otp: foundObject.otp, UserId: foundObject.id } });
                    }
                });
            }
        });
    });


app.listen(5000,function(){
    console.log('server run');

});





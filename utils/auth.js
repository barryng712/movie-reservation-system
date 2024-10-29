const bcrypt = require("bcryptjs");

const hashPassword = async(password) => {
    const saltRound = 10;  
    return new Promise((resolve, reject) => {
       bcrypt.hash(password, saltRound, (err, hash) => {
           if(err) reject(err)
           resolve(hash)
        });
   });  
};

const comparePassword = async(password, hashedPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if(err) reject(err)
            resolve(isMatch)
        });    
    });  
}


module.exports = {
  hashPassword,
  comparePassword,
};

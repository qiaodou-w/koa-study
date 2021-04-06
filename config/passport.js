const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
const User = require('../model/User')
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
const secretOrKey = require('./keys').key;
opts.secretOrKey = secretOrKey;

module.exports = passport => {
  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    const findRes = await User.findById(jwt_payload.id)
    console.log(findRes)
    if (findRes) return done(null, findRes)
    else return done(null, false)
  }));
}
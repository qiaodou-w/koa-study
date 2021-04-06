const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
const User = require('../model/User')
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
const secretOrKey = require('./keys').key;
opts.secretOrKey = secretOrKey;

module.exports = passport => {
  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    let user
    try {
      user = await User.findById(jwt_payload.id)
    } catch (e) {
      return done(e, false)
    }

    if (user) return done(null, user)
    else return done(null, false)
  }));
}
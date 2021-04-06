const Koa = require('koa')
const app = new Koa()

const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const passport = require('koa-passport')


const mongoose = require('mongoose')

const index = require('./routes/index')
const users = require('./routes/users')

const db = require('./config/keys').devmongoUrl

// connect db
mongoose.connect(
  db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.log(err))


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

require('./config/passport')(passport)

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())


module.exports = app

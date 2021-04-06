const router = require('koa-router')()

const User = require('../model/User')

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");

router.prefix('/api/users')

const key = require('../config/keys').key

/**
 * @route GET /users/test
 * @desc 测试接口地址
 * @access 公开接口
 */
router.get('/test', ctx => {
  ctx.status = 200
  ctx.body = 'hello '
})


/**
 * @route POST /users/register
 * @desc 注册接口地址
 * @access 公开接口
 */
router.post('/register', async ctx => {
  const res = await User.find( {email: ctx.request.body.email} )
  if (res.length !== 0) {
    ctx.body = '邮箱被占用'
  } else {
    const avatar = gravatar.url(ctx.request.body.email, {s: '200', r: 'pg', d: 'mm'});
    const newUser = new User({
      name: ctx.request.body.name,
      email: ctx.request.body.email,
      password: ctx.request.body.password,
      avatar,
    });

    // 加密密码
    await bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        newUser.password = hash
        await newUser.save().then(res => {
          ctx.body = res
        }).catch(err => {
          console.log(err);
        })
        if (err) throw err;
      });
    });


    ctx.body = newUser
  }
})

/**
 * @route POST /users/login
 * @desc 登陆接口地址 返回token
 * @access 公开接口
 */
router.post('/login', async ctx => {
  // 查询
  const findResult = await User.find({ email: ctx.request.body.email });
  // 判断查没查到
  if (findResult.length === 0) {
    ctx.status = 404;
    ctx.body = { email: '用户不存在!' };
  } else {
    const password = ctx.request.body.password;
    const user = findResult[0];
    // 查到后 验证密码
    const result = await bcrypt.compareSync(password, user.password);
    // 校验通过
    if (result) {

      // jwt 生成token
      const payload = { id:user.id, name: user.name, email: user.email }
      const token = jwt.sign(payload, key, {expiresIn: 60 * 60})
      // 返回token
      ctx.status = 200;
      ctx.body = { success: true, token:'Bearer ' + token};
    } else {
      ctx.status = 400;
      ctx.body = { password: '密码错误!' };
    }
  }
})

/**
 * @route POST /users/current
 * @desc 验证token
 * @access 私有接口
 */

router.get('/current', passport.authenticate('jwt', { session: false }),async  ctx => {
  ctx.body = JSON.parse(JSON.stringify(ctx.state.user))
  delete ctx.body.password
})

module.exports = router

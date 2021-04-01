const router = require('koa-router')()

const User = require('../model/User')

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

router.prefix('/users')

/**
 * @route GET /users/test
 * @desc 测试接口地址
 * @access 公开接口
 */
router.get('/test', ctx => {
  ctx.status = 200
  ctx.body = 'test'
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

module.exports = router

var express = require('express');
var router = express.Router();
var User = require('../models/User');

//统一返回格式
var responseData;
router.use(function(req, res, next){
    responseData = {
        code:0,
        message:''
    }
    next();
});

/**
 * 用户注册
 * 注册逻辑：
 * 1、用户名不能为空
 * 2、密码不能为空
 * 3、两次输入密码必须一致
 * 
 * 数据库相关
 * 1、用户名是否已经被注册
 */
//处理注册的路由
router.post('/user/register', function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户是否为空
    if(username == ''){
        responseData.code=1;
        responseData.message='用户名不能为空';
        res.json(responseData);
        return;
    }
    //密码是否为空
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //两次输入的密码必须一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = "两次输入密码不一致";
        res.json(responseData);
        return;
    }

    //用户名是否已经被注册（查询数据库）
    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            //数据库中有重复的用户名
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData);
            return;
        }
        //保存用户的信息到数据库中
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(newUserInfo){
        // console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    })


    
});



/**
 * 登录
 */
//处理登录的路由
router.post('/user/login',function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    
    if(username == ''||password == ''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    };

    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }else{
            
            responseData.message = '登录成功';
            responseData.userInfo = {
                _id:userInfo._id,
                username:userInfo.username
            }
            req.cookies.set('loginInfo',JSON.stringify(responseData.userInfo));
            res.json(responseData);
            return;
        }
    })
});

/**
 * 退出
 */

router.get('/user/logout',function(req, res, next){
    req.cookies.set('loginInfo', null);
    res.json(responseData);
    return;
})


module.exports = router;
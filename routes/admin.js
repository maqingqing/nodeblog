var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/category');
var Content = require('../models/content');

router.use(function(req, res, next){
    if(!req.userLoginInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('只有管理员才可以进入');
        res.end();
        return;
    }
    next();
});

/**
 * 首页
 */
router.get('/', function(req,res, next){
    res.render('template/admin', {
        userLoginInfo:req.userLoginInfo
    });
})

/**
 * 用户管理
 */
router.get('/user', function(req, res, next){


    /**
     * 从数据库中读取所有用户数据，
     * limit(Number):限制获取的条数
     * skip():忽略数据的条数
     * 
     * 每页显示两条数据，
     * 1:1-2 skip(0) ->当前页-1*limit
     * 2:3-4 skip(2)
     */

    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages;

    //查询数据库中总的数据数
    User.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count/limit);//向上取整
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;

        User.find().limit(2).skip(skip).then(function(users){
            res.render('template/user_index', {
                userLoginInfo:req.userLoginInfo,
                users:users,
                page:page,
                count:count,
                pages:pages,
                page:page,
                limit:limit,
                which:'user'
            });
        });
    });
       
});

/**
 * 分类首页
 */
router.get('/category', function(req, res,  next){

    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages;

    //查询数据库中总的数据数
    Category.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count/limit);//向上取整
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;

        /**
         * 1:升序
         * -1:降序
         */
        Category.find().sort({_id:-1}).limit(2).skip(skip).then(function(categories){
            res.render('template/category_index', {
                userLoginInfo:req.userLoginInfo,
                categories:categories,
                page:page,
                count:count,
                pages:pages,
                page:page,
                limit:limit,
                which:'category'
            });
        });
    });
});

/**
 * 分类的添加
 */

router.get('/category/add', function(req, res,  next){
    res.render('template/category_add', {
        userLoginInfo:req.userLoginInfo
    });
});
/**
 * 分类的添加保存
 */
router.post('/category/add', function(req, res,  next){
    var category_name = req.body.name || '';
    if(category_name == ''){
        res.render('template/tipInfo', {
            userLoginInfo:req.userLoginInfo,
            message:'名称不能为空',
            tip:'错误提示'
        });
        return;
    }

    //数据库中是否已经存在同名分类名称
    Category.findOne({
        name:category_name
    }).then(function(rs){
        if(rs){
            //数据库中已经存在该分类了
            res.render('template/tipInfo', {
                userLoginInfo:req.userLoginInfo,
                message:'该名称已经存在',
                tip:'错误提示'
            });
            return;
        }else{
            //该名称符合要求
            var success = new Category({
                name:category_name
            }).save();
            if(success){
                res.render('template/tipInfo', {
                    userLoginInfo:req.userLoginInfo,
                    message:'分类保存成功',
                    tip:'成功提示',
                    url:'/admin/category'
                });
            }
            
        }
    })
});

/**
 * 分类修改
 */

router.get('/category/edit', function(req, res, next){
    //获取要修改的信息，并且用表单的信息展现出来
    var id = req.query.id || '';
    //获取要修改的分类信息
    Category.findOne({
        _id:id  
    }).then(function(category){
        if(!category){
            res.render('template/tipInfo', {
                userLoginInfo:req.userLoginInfo,
                message:'分类信息不存在',
                tip:'错误提示'
            });
            return;
        }else{
            res.render('template/category_edit', {
                userLoginInfo:req.userLoginInfo,
                category:category
            });
            return;
        }
    })
});

/**
 * 分类的修改保存
 */
 router.post('/category/edit',function(req, res){
     /**获取要修改的分类的信息，并且用表单的形式展现出来*/
     var id = req.query.id || '';
     /**获取post提交过来的数据*/
     var name = req.body.name || '';
      /**获取要修改的分类信息*/
      Category.findOne({
        _id:id  
    }).then(function(category){
        if(!category){
            res.render('template/tipInfo', {
                userLoginInfo:req.userLoginInfo,
                message:'分类信息不存在',
                tip:'错误提示'
            });
            return;
        }else{
           /**当用户没有做任何修改提交的时候*/
            if(name == category.name){
                res.render('template/tipInfo',{
                    userLoginInfo:req.userLoginInfo,
                    message:'修改成功',
                    url:'/admin/category',
                    tip:'成功提示'
                });
                return;
            }else{
                /**要修改的分类名称是否已经在数据库中存在*/
                return Category.findOne({
                    /** _id:{$ne:id},*/
                    name:name
                })
            }
           
        }
    }).then(function(sameCategory){
        // console.log(sameCategory);
        if(sameCategory){
            res.render('template/tipInfo', {
                userLoginInfo:req.userLoginInfo,
                message:'该名称已经存在',
                tip:'错误提示'
            });
            return;
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            })
        }
    }).then(function(){
         res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'修改成功',
            url:'/admin/category',
            tip:'成功提示'
        });
        return;
    });
 });

 /**
  * 分类删除
  */

router.get('/category/delete',function(req, res){
    /**获取要删除的分类id*/
    var id = req.query.id || '';

    Category.remove({
        _id:id
    }).then(function(){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'删除成功',
            tip:'成功提示',
            url:'/admin/category'
        })
    })
});


/**
 * 内容首页
 */
router.get('/content',function(req, res) {
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages;

    //查询数据库中总的数据数
    Content.count().then(function(count){

        //计算总页数
        pages = Math.ceil(count/limit);//向上取整
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page-1)*limit;

        /**
         * 1:升序
         * -1:降序
         */
        Content.find().sort({_id:-1}).limit(2).skip(skip).populate(['category', 'user']).sort({addTime:-1}).then(function(contents){
            res.render('template/content_index', {
                userLoginInfo:req.userLoginInfo,
                contents:contents,
                page:page,
                count:count,
                pages:pages,
                page:page,
                limit:limit,
                which:'content'
            });
        });
    });
});

/**
 * 内容添加
 */

router.get('/content/add',function(req, res){
    Category.find().sort({_id:-1}).then(function(categories){
        res.render('template/content_add',{
            userLoginInfo:req.userLoginInfo,
            categories:categories
        });
    })

});

/**
 * 添加内容保存
 */
router.post('/content/add',function(req, res){
    if(req.body.category == ''){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容不能为空',
            tip:'错误提示'
        });
        return Promise.reject();
    }
    if(req.body.title == ''){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容不能为空',
            tip:'错误提示'
        });
        return Promise.reject();
    }

    //保存数据到数据库
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userLoginInfo._id.toString(),
        addTime:req.body.addTime,
        views:req.body.views,
        description:req.body.description,
        content:req.body.content
    }).save().then(function(rs){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容保存成功',
            tip:'成功提示',
            url:'/admin/content'
        })
    })
});

/**
 * 修改内容
 * */
router.get('/content/edit', function(req, res, next){
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function(rs){
        categories = rs;
        Content.findOne({
            _id:id
        }).populate('category').then(function(content){
            if(!content){
                res.render('template/tipInfo',{
                    userLoginInfo:req.userLoginInfo,
                    message:'指定内容不存在',
                    tip:'错误提示'
                });
                return Promise.reject();
            }else{
                res.render('template/content_edit',{
                    userLoginInfo:req.userLoginInfo,
                    categories:categories,
                    content:content
                })
            }
        });
    });

});

/**
 * 保存修改内容
 * */
router.post('/content/edit',function(req, res){
    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容不能为空',
            tip:'错误提示'
        });
        return Promise.reject();
    }
    if(req.body.title == ''){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容不能为空',
            tip:'错误提示'
        });
        return Promise.reject();
    }
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        user:req.userLoginInfo._id.toString(),
        addTime:req.body.addTime,
        views:req.body.views,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容保存成功',
            tip:'成功提示',
            url:'/admin/content'
        })
    })
});

/**
 * 内容删除
 * */
router.get('/content/delete',function(req, res){
    /**获取要删除的分类id*/
    var id = req.query.id || '';

    Content.remove({
        _id:id
    }).then(function(){
        res.render('template/tipInfo',{
            userLoginInfo:req.userLoginInfo,
            message:'内容删除成功',
            tip:'成功提示',
            url:'/admin/content'
        })
    })
});

module.exports = router;
var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({

    //关联字段，内容分类的id
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    },

   //内容标题
   title: String,

    //添加时间
    addTime:{
        type:Date,
        default:new Date()
    },

    //阅读量
    views:{
        type:Number,
        default:0
    },

    //关联字段，user的id
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

   //简介
   description:{
       type:String,
       default:''
   },

   //内容
   content:{
       type:String,
       default:''
   },
    comments:{
        type:Array,
        default:[]
    }

});
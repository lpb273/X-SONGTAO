'use strict';
let express = require('express');
let router = express.Router();

let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();

let fs = require('fs');

let mongoose = require('mongoose');
let $checkToken = require('../utils/checkToken.utils.js');
//数据模型
let Users = mongoose.model('Users');
let Tags = mongoose.model('Tags');
let Comments = mongoose.model('Comments');
let Articles = mongoose.model('Articles');

//控制器
let UsersController = require('../controllers/users.controller.js');
let TagsController = require('../controllers/tags.controller.js');
let ArticleController = require('../controllers/article.controller.js');
let CommentController = require('../controllers/comments.controller.js');


//数据库查询同一错误处理
let DO_ERROR_RES = require('../utils/DO_ERROE_RES.js');


/**
 * API请求验证
 * get请求+post(login/register/upload)请求不需要token,其余都需要检查token
 * */
router.all('*', function (req, res, next) {
    let method = req.method.toLocaleLowerCase();
    let path = req.path.toString();
    if (method === 'get' || path.includes('register') || path.includes('login')|| path.includes('upload')) {
        return next();
    } else {
        let authorization = req.get("authorization");

        if (!!authorization) {
            let token = authorization.split(" ")[1];
            $checkToken(token).then(function () {
                console.log("*********token check success!**********")
                return next();
            }, function (errObj) {
                res.status(200);
                res.send(errObj);
            });
        } else {
            res.status(200);
            res.send({
                "code": "10",
                "msg": "need token!"
            });
        }
    }
});

/**
 * User相关
 * */
//register
router.post('/register', UsersController.register);
//login
router.post('/login', UsersController.login);
//change_password
router.post('/change_password', UsersController.changePassword);
//all user list
router.get('/users', UsersController.getAll);
//find user by id
router.get('/user/:id', UsersController.getById);
router.get('/user/original/:id', UsersController.getByIdWithOriginal);
//edit user by id
router.put('/user', UsersController.edit);
//delete user by id
router.delete('/user/:id', UsersController.delete);


/**
 * Upload img
 * */
//之后还需要uuid找图片,图片压缩,裁剪的功能
router.post('/imgupload', multipartMiddleware, function (req, res, next) {
    if (req.files) {
        const UploadFilePath = './public/uploads/';
        // console.log('req.files')
        // console.log(req.files)
        fs.readFile(req.files.uploadImg.path, function (err, data) {
            if (err) {
                DO_ERROR_RES(res);
                return next();
            }
            let arr = req.files.uploadImg.originalFilename.split('.');
            let suffix = arr[arr.length-1];

            //新建文件名
            let fileName = `${Date.parse(new Date())}.${suffix}`;
            let uploadPath = `${UploadFilePath}${fileName}`;

            console.log('上传图片的存放位置:' + uploadPath);
            fs.writeFile(uploadPath, data, function (err) {
                if (err) {
                    console.log("文件保存错误")
                    console.log(err);
                    res.status(200);
                    res.send({
                        "code": "2",
                        "msg": "image upload failure!"
                    });
                    return;
                }
                console.log("文件保存成功");
                res.status(200);
                res.send({
                    "code": "1",
                    "msg": "image upload success! use config path and image name to find image.",
                    "data": fileName
                });
            });
        });
    } else {
        res.status(200);
        res.send(false);
    }
});


/**
 * Tags 相关
 * */
//查找all
router.get('/tags', TagsController.get);
//
router.get('/tags_with_structure', TagsController.getAllWithStructure);
//查找某个tag
router.get('/tag/:id', TagsController.getById);
//增加
router.post('/tag', TagsController.add);
//修改
router.put('/tag', TagsController.edit);
//delete
router.delete('/tag/:id', TagsController.delete);


/**
 * Article 相关
 * */
//增加,增加的同时对标签使用num++
router.post('/article', ArticleController.add);
//根据id修改
router.put('/article', ArticleController.editById);
//查找全部,进行分页设置(api测试)
router.get('/articles', ArticleController.getAll);
//分页查找文章,进行分页设置/^\/commits\/(\w+)(?:\.\.(\w+))?$/
router.get(/^\/articles\/(\d+)_(\d+)/, ArticleController.getAllWithPages);
//根据id查找
router.get('/article/:id', ArticleController.getById);
router.get('/article/raw/:id', ArticleController.getRawById);
//根据id删除
router.delete('/article/:id', ArticleController.delete);
//查询历史记录
router.get('/article_history', ArticleController.getHistory);
//根据tag_id查找文章列表,不限制文章数量
router.get('/article_tag/:id', ArticleController.getByTagId);

/**
 * Comments 相关
 * */
//获取全部
router.get('/comments', CommentController.getAll);
//查询单个评论(将评论进行组装,还有子评论)
router.get('/comment/:comment_id', CommentController.getById);
//新增,当用户新增评论的时候,
//评论的文章的评论数++
//对评论进行评论的将前评论的next_id中新增自评论_id
router.post('/comment', CommentController.add);
//修改
router.put('/comment', CommentController.edit);
//根据文章id查询其评论的数组
router.get('/article/comments/:article_id',CommentController.getByArticleId);
//delete
router.delete('/comment/:id', CommentController.delete);
//checkComments
router.post('/changeCommentState', CommentController.check);

module.exports = router;
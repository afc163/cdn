# CDN

[![NPM version](https://img.shields.io/npm/v/cdn.svg?style=flat)](https://npmjs.org/package/cdn)

上传静态文件到七牛或又拍云服务器上，生成随机的地址返回。目前支持 .png .jpg .jpeg .gif .ico .swf .js .css .zip .pdf .flv .mp4 这些类型的文件。

![demo](https://i.alipayobjects.com/e/201312/1fOQnfM67D.png)

---

## 安装

```
$ npm install cdn -g
```

## 配置

```
$ vi ~/.cdn_config
```

编辑此文件，你可以修改默认上传源，以及配置自己的上传空间。

## 使用

```
$ cdn test.jpg
```

```
Start checking files.
Ready to upload one file:
  index.js @ application/x-javascript 0.71 KB
Busy in uploading ....
  ➜  http://cdn-qiniu.qiniudn.com/650bb27d284b3c70ed732d0b4629a0a1.png ~ spmjs.png
Uploaded one file to Alipay cdn in 0.863s!
```

就可以访问 http://cdn-qiniu.qiniudn.com/650bb27d284b3c70ed732d0b4629a0a1.png 了。

上传成功后 cdn 地址将会自动复制到剪贴板中。

### 多文件部署

支持多文件上传和通配符的匹配。

```
$ cdn test1.js test2.js test3.css
```

```
$ cdn *.jpg
```

### 部署网络地址

```
$ cdn https://www.npmjs.org/static/img/npm.png
```

### 相对绝对路径

```
$ cdn ../../test.jpg
```

```
$ cdn /home/admin/test.jpg
```

### 在 NodeJS 中

```js
var cdn = require('cdn');

cdn('/path/to/test.jpg', function(err, url) {
    // url -> http://cdn-qiniu.qiniudn.com/650bb27d284b3c70ed732d0b4629a0a1.png
});
```

/**
 * Created by xiangsongtao on 16/7/1.
 */
(function () {
    angular.module('xstApp')
    //myInfo的控制器
        .factory("AJAX", ['$http', function ($http) {
            //获取Token,只是进行get请求和register、login的post请求是不需要token的。
            //登录会能获得token,如果localstorage中存在token信息,则发送时将token携带。
            //这里只是使用localstorage存放数据,古故$localStorage不使用
            return function (httpParams) {
                let authorization = (httpParams.method.toLocaleLowerCase() !== 'get') && !!localStorage.authorization ? localStorage.authorization : null;
                let header = {
                    'authorization': "token " + authorization,
                    'Content-Type': 'application/json; charset=utf-8'
                };
                let params = {
                    method: httpParams.method || "GET",
                    data: httpParams.data,
                    params: httpParams.params,
                    url: httpParams.url,
                    cache: httpParams.cache || false,
                    timeout: httpParams.timeout || 15000,
                    success: httpParams.success || angular.noop(),
                    error: httpParams.error || angular.noop(),
                    notify: httpParams.notify || angular.noop(),
                    complete: httpParams.complete || angular.noop(),
                    headers: angular.extend(header, httpParams.headers)
                };
                return $http(params).then(
                    //success
                    function (response) {
                        if(parseInt(response.data.code) == 10){
                            alert("token问题,请重新登录!");
                        }
                        httpParams.success && httpParams.success(response.data)
                    },
                    //error
                    function (response) {
                        httpParams.error && httpParams.error(response);
                        // httpParams.error && httpParams.error("系统错误");
                    },
                    //notify
                    function (response) {
                        httpParams.notify && httpParams.notify(response);
                    })
                    .catch(function (e) {
                        httpParams.catch && httpParams.catch(e);
                    })
                    .finally(function (value) {
                        httpParams.complete && httpParams.complete(value);
                    });
            }
        }])
})();
var httpModule = angular.module('httpModule', []);
httpModule.service('httpServices',function($http){
    this.promise = function(url,data){
    	return $http({
			url:url,
			method:'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
			data: param(data)
		});
    };

    function param (obj){  // 实现序列化对象
        var str = '';
        for(var key in obj){
            str = str + "&" + key + "=" + encodeURIComponent(obj[key]);
        }

        obj = str.substring(1);
        return obj;
    }
});
var gridModule = angular.module('gridModule', []);

gridModule.service('gridServices', function ($http) {
	
	this.promiseDefault = function(url){
		return $http({
			url:url,
			method:'POST',
			params: {
				page: 1,
                rows: 20,
                sort: 'id',
                order: 'desc'
			}
		});
	};

	this.promiseNew = function(url,data){
        return $http({
			url:url,
			method:'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
			data: param(data)
		});
	};

	this.promiseJson = function(url){
        return $http.get(url);
	};

	this.exportAction = function(url,map){
        var serialization = getSerialization(map);
        var href = url + '?' + serialization;

        return href;
	};

	function param (obj){  // 实现序列化对象,用于查询
        var str = '';
        for(var key in obj){

        	if(obj[key] != null && obj[key] != '' && typeof(obj[key]) != "undefined"){
                str = str + "&" + key + "=" + encodeURIComponent(obj[key]);
        	}
        }

        obj = str.substring(1);

        return obj;
    }

    function getSerialization(map){
        var str = '';
        for(var key in map){
            if(key == 'startDate' || key == 'closeDate' || key == 'StartTime' || key == 'CloseTime' || key == 'endTime' || key == 'startTime' || key == 'closeTime'|| key == 'startTimes' || key == 'endTimes'){
               str = str + '&' + key + '=' + map[key]; 
            }else{
               str = str + '&' + key + '=' + encodeURI(encodeURI(map[key]));
            }
        }
        return str.substring(1);
    }
});
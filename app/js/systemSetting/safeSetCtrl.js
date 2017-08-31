var safeSetModule = angular.module('safeSetModule', []);
safeSetModule.controller('safeSetCtrl',function($scope, $http){

	$http({
		url:'/system/settingsAction!getSettings.action',
		method:'POST'
	}).then(function(resp){
		var obj = resp.data;

		$scope.safe = {
			password_spe_charnum : obj['password_spe_charnum'],
			session_outime: obj['session_outime'],
			account_lock_time : obj['account_lock_time'],
			password_min_len : obj['password_min_len'],
			password_lower_num : obj['password_lower_num'],
			password_retry_times : obj['password_retry_times'],
			account_min_len : obj['account_min_len'],
			password_digital_num : obj['password_digital_num'],
			password_upper_num : obj['password_upper_num'],
			unconfirm_device_alarm_interval : obj['unconfirm_device_alarm_interval']
		};

		$scope.sure = function(){

			var array = [];

			for(var key in $scope.safe){
                var list = key + ':' + '"' + $scope.safe[key] +'"';
                array.push(list);
			}

			$http({
			    url:'/system/settingsAction!setSettings.action',
			    method:'POST',
			    params: {
			    	map : array.join()
			    }
		    }).then(function(resp){
		    	if(resp.data.msg != 'ok'){
                    alert('提交失败！');
                }else{
                    alert('提交成功！');
                }
		    });

		};
	});

});
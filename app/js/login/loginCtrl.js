var loginModule = angular.module('loginModule', ['angular-md5']);
loginModule.controller('loginCtrl',function($scope, $window, $location, $http, md5){
  
	var codeObj = {
        '10000': '登陆成功！',
        '-10001': ' 输入的账户不存在!',
        '-10002': '账户被锁定!',
        '-10003': '输入密码错误！',
        '-10004': '此账号没有分配角色权限！'
	};

	function getLoginResult(code){
		if(code == '10000') {
            $location.path('main/deviceView');
		}else{
			alert(codeObj[code]);
		}  
	}

	$scope.login = function(){
		var params = {
		    username : $scope.name,
		    passwordMd5 : md5.createHash($scope.psw)
	    };
		$http({
			url: 'system/userAction!login.action',
			method:'GET',
			params: params
		}).then(function(resp){
			//将返回的token存到本地
            $window.localStorage.setItem('token', resp.data.successToken);
			var code = resp.data.code;
			getLoginResult(code);
			//将用户登录的用户名保存
			$window.localStorage.setItem('userName', $scope.name);
		});
	};
})


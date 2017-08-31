modalModule.controller('updatePswCtrl',function($scope, $http, close){

    $scope.updatePsw = {
        oldPsw : '',
        newPsw : '',
        newPsw2 : ''
    };
    $scope.checkPsw = function(){
        $http({
            method : 'POST',
            url : '/system/userAction!PswIsRightOrNot.action',
            params : {
                fieldId: 'oldpsw',
                fieldValue: $scope.updatePsw.oldPsw
            }
        }).then(function(resp){
            if(resp.data.oldpsw !== true){
                alert('旧密码输入错误');
            }
        });
    };
    $scope.checkNewPsw = function(){
        var newPsw = $scope.updatePsw.newPsw;
        var newPsw2 = $scope.updatePsw.newPsw2;
        if(newPsw !== newPsw2){
            alert('两次输入的新密码不一致！');
            return;
        }
        $http({
            method : 'POST',
            url : '/system/userAction!checkPwd.action',
            params : {
                password: newPsw
            }
        }).then(function(resp){
            if(resp.data.status == 'failed'){
               alert(resp.data.info); 
            }
        });
    };
	$scope.sure = function(){	
        var obj = {
            oldpsw : $scope.updatePsw.oldPsw,
            password : $scope.updatePsw.newPsw,
            password2 : $scope.updatePsw.newPsw2
        };
        $http({
            method : 'POST',
            url : '/system/userAction!updatePassWord.action',
            params : obj
        }).then(function(resp){
            if(resp.data.msg !== 'success'){
                alert('修改密码失败！');
            }else{
                close(null,500); 
            }
        });
	};
	$scope.close = function(result) {
 	    close(result,500); 
    };
});
modalModule.controller('aboutCtrl',function($scope, $http, close){
		$http({ 
			url:'/system/downloadAction!showAbout.action',
			method:'POST'
		}).then(function(result){
			$scope.version = result.data.version;
			$scope.sha1 = result.data.sha1;
		});
	
});
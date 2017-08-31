var findPwdModule = angular.module('findPwdModule', ['angular-md5']);
findPwdModule.controller('findPwdCtrl',function($scope, httpServices){
    $scope.user = {
    	name : '',
    	email : '',
    };

    $scope.submit = function(){
        httpServices.promise('/system/userAction!forgetPassword.action',{
	    	account : $scope.name,
	    	email : $scope.email
	    }).then(function(resp){
	    });
    };  
	
});


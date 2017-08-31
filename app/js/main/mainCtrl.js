var mainModule = angular.module('mainModule', []);
mainModule.controller('mainCtrl',function($scope, $interval, $http, $window, $location, ModalService){

    $scope.showUser = $window.localStorage.getItem('userName');

    $http.get('/realtime/systemStatus!showLicense.action').then(function(resp){
        $scope.license = {
        	device_count : resp.data.device_count,
        	from_time : resp.data.from_time,
        	to_time : resp.data.to_time
        };
    });


	function getBlackList (){
		$http({ 
			url:'/realtime/systemStatus!getBlackListCount.action',
			method:'POST'
		}).then(function(resp){
			$scope.blackNum = resp.data.count;
		});
	}

	function getDeviceList (){
		$http({
			url:'/realtime/systemStatus!getAlarmCountByLevel.action',
			method:'POST'
		}).then(function(resp){

			if(resp.data.length > 0){
	            $scope.alarm = {
		            levelOne : resp.data[0]['level1'] ? resp.data[0]['level1'] : 0,
		            levelTow : resp.data[0]['level2'] ? resp.data[0]['level2'] : 0,
		            levelThree : resp.data[0]['level3'] ? resp.data[0]['level3'] : 0, 
		            levelFour : resp.data[0]['level4'] ? resp.data[0]['level4'] : 0,       
				};
			}else{
				$scope.alarm = {
					levelOne : 0,
					levelTow : 0,
					levelThree : 0,
					levelFour : 0
				};
			}
		});
	}

	getBlackList();
	getDeviceList();

    $interval(function(){
    	getBlackList();
        getDeviceList();
    },60000);

	$scope.logout = function(){
		
        $http({
			url:'/system/userAction!logout.action',
			method:'POST'
		}).then(function(resp){
			if(resp.data.code == 0){
                $window.localStorage.clear(); 
                $location.path('login');
			}else{
				alert('退出失败！');
			}
		});
	};

	$scope.updatePsw = function(){
		ModalService.showModal({
            templateUrl: 'modals/updatePsw.html',
            controller: 'updatePswCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) { 
            });
        });
	};
	
	$scope.about = function(){
		ModalService.showModal({
            templateUrl: 'modals/about.html',
            controller: 'aboutCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) { 
            });
        });
	}

});
modalModule.controller('collisionFilterModalCtrl',function($scope, $http, close){

    $scope.collsionPoint = {
        groupId : '',
    	groupName : '',
    	startTime : '',
    	endTime : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.collsionPoint.startTime) {               
            var activeDate = moment($scope.collsionPoint.startTime).subtract(1, $view).add(1, 'minute');
            $dates.filter(function (date) {
                  return date.localDateValue() <= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.startDateOnSetTime = function () {
        $scope.$broadcast('start-date-changed');
    };
    
    $scope.endDateOnSetTime = function () {
        $scope.$broadcast('end-date-changed');
    };
    $scope.startDateBeforeRender = function ($dates) {
           
        if ($scope.collsionPoint.endTime) {
                
            var activeDate = moment($scope.collsionPoint.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $http({
		url:'/device/deviceAction!getDeviceGroup.action',
		method:'POST'
	}).then(function(resp){
//		console.log(resp.data);
        $scope.groupArray = [];
        for(var i=0; i<resp.data.length; i++){
            var obj = {
            	id : resp.data[i]['groupId'],
            	groupName : resp.data[i]['groupName']
            };
            $scope.groupArray.push(obj);
        }
	});

	$scope.sure = function(){

        var id = $scope.collsionPoint.groupId;
        //遍历设备对象数组，找到相应设备的名称
        for(var i=0; i<$scope.groupArray.length; i++){
            if($scope.groupArray[i]['id'] == id){
                $scope.collsionPoint.groupName = $scope.groupArray[i]['groupName'];
            }
        }

		var result = $scope.collsionPoint;
        close(result,500); 
	}

	$scope.close = function(result) {
 	    close(result,500); 
    };

});







modalModule.controller('deletePlanCtrl',function($scope, $http, rows ,close){

	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/device/deviceScheduler!delScheduler.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
		}).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert('删除失败！');
			}			
		});

	};

	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('addPlanCtrl',function($scope, $filter, httpServices, close){

    $scope.plan = {
		name : '',
		stime : '',
		etime : '',
		enable : true,
		month : '*',
		day : '*',
		hour : '0',
		minute : '0'
	};

	$scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.plan.stime) {               
            var activeDate = moment($scope.plan.stime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.plan.etime) {
                
            var activeDate = moment($scope.plan.etime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };


	$scope.monthList = [
	    { 
	    	value : '*',
	    	dis : '全年'
	    }
	];
	for(var i=1; i<=12 ;i++){
		var obj = {
            value : i,
	    	dis : i + '月'
		};
        $scope.monthList.push(obj);
	}

	$scope.dayList = [
	    { 
	    	value : '*',
	    	dis : '每天'
	    }
	];
	for(var i=1; i<=31 ;i++){
        var obj = {
            value : i,
	    	dis : i + '日'
		};
        $scope.dayList.push(obj);
	}

	$scope.hourList = [];
	for(var i=0; i<24 ;i++){
		var obj = {
            value : i,
	    	dis : i + '点'
		};
        $scope.hourList.push(obj);
	}

	$scope.minuteList = [];
	for(var i=0; i<60; i++){
		var obj = {
            value : i,
	    	dis : i + '分'
		};
        i = i+4;
        $scope.minuteList.push(obj);
	}

	$scope.sure = function(){
    	var obj = {
    		name : $scope.plan.name,
    		sTimeStr : $filter('date')($scope.plan.stime, 'yyyy-MM-dd HH:mm'),
    		eTimeStr : $filter('date')($scope.plan.etime, 'yyyy-MM-dd HH:mm'),
    		enable : $scope.plan.enable ? 1: 0,
    		expression : $scope.plan.month + ',' + $scope.plan.day + ',' + $scope.plan.hour + ',' + $scope.plan.minute		
    	};  

    	httpServices.promise('/device/deviceScheduler!addScheduler.action', obj ).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert('该用户已经存在！');
			}
			
		});
    };

	$scope.clear = function(){

		$scope.plan = {
			name : '',
			stime : '',
			etime : '',
			enable : true,
			month : '*',
			day : '*',
			hour : '0',
			minute : '0'
		};
    	
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };

});

modalModule.controller('editPlanCtrl',function($scope, $filter, httpServices, row, close){

    var strArray = row.expression.split(',');
    strArray[0] = strArray[0] == '全年' ? '*' : strArray[0].replace('月','');
    strArray[1] = strArray[1] == '每天' ? '*' : strArray[1].replace('日','');
    strArray[2] = strArray[2].replace('时','');
    strArray[3] = strArray[3].replace('分','');



    $scope.plan = {
		name : row.name,
		stime : new Date(row.stime),
		etime : new Date(row.etime),
		enable : row.enable == '是' ? true : false,
		month : strArray[0],
		day : strArray[1],
		hour : strArray[2],
		minute : strArray[3]
	};


    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.plan.stime) {               
            var activeDate = moment($scope.plan.stime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.plan.etime) {
                
            var activeDate = moment($scope.plan.etime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

	$scope.monthList = [
	    { 
	    	value : '*',
	    	dis : '全年'
	    }
	];
	for(var i=1; i<=12 ;i++){
		var obj = {
            value : i,
	    	dis : i + '月'
		};
        $scope.monthList.push(obj);
	}

	$scope.dayList = [
	    { 
	    	value : '*',
	    	dis : '每天'
	    }
	];
	for(var i=1; i<=31 ;i++){
        var obj = {
            value : i,
	    	dis : i + '月'
		};
        $scope.dayList.push(obj);
	}

	$scope.hourList = [];
	for(var i=0; i<24 ;i++){
		var obj = {
            value : i,
	    	dis : i + '点'
		};
        $scope.hourList.push(obj);
	}

	$scope.minuteList = [];
	for(var i=0; i<60; i++){
		var obj = {
            value : i,
	    	dis : i + '分'
		};
        i = i+4;
        $scope.minuteList.push(obj);
	}


	$scope.sure = function(){
    	var obj = {
    		id : row.id,
    		name : $scope.plan.name,
    		sTimeStr : $filter('date')($scope.plan.stime, 'yyyy-MM-dd HH:mm'),
    		eTimeStr : $filter('date')($scope.plan.etime, 'yyyy-MM-dd HH:mm'),
    		enable : $scope.plan.enable ? 1: 0,
    		expression : $scope.plan.month + ',' + $scope.plan.day + ',' + $scope.plan.hour + ',' + $scope.plan.minute		
    	};  

    	httpServices.promise('/device/deviceScheduler!editScheduler.action', obj ).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert('编辑失败！');
			}
			
		});
    };

	$scope.clear = function(){
    	$scope.plan = {
			name : '',
			stime : '',
			etime : '',
			enable : true,
			month : '*',
			day : '*',
			hour : '0',
			minute : '0'
		};
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };

});
modalModule.controller('downLoadCtrlPlanTask',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
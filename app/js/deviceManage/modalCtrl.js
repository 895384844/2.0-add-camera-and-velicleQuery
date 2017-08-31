modalModule.controller('messageCtrl',function($scope, $http, mes ,close){
	$scope.mes = {
		text : mes 
	};
	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('deleteDeviceCtrl',function($scope, $http, rows ,close){
	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['identity']);
        }

        $http({  
			url:'/device/deviceAction!delete.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
		}).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert(resp.data.info);
			}			
		});

	} 

	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('addDeviceCtrl',function($scope, $http, httpServices, typeList, close){

	$scope.typeList = typeList;

	$scope.device = {
		name : '',
	    number : '', 
	    longitude : '',
	    latitude : '',
	    ip : '',
	    port : '',
	    numberNetCart : '', 
	    modelId : '', 
	    scopeId : '', 
	    scopeName : '',
	    address : '',
	    memo : '',
	    groupId : ''
	};

	$http.post('/system/scopeAction!listScope.action').then(function(resp){
        $scope.domainList = resp.data;
    });

	$scope.$watch( 'addTree.currentNode', function( newObj, oldObj ) {
		if( $scope.addTree && angular.isObject($scope.addTree.currentNode) ) {

		    if($scope.addTree.currentNode.level == '3'){
		    	$scope.device.scopeId = $scope.addTree.currentNode.sid;
		    	$scope.device.scopeName = $scope.addTree.currentNode.sname;
		    }
		        
		}
	}, false);

    $scope.sure = function(){

		var obj = {
    		name : $scope.device.name,
            number : $scope.device.number,
            longitude : $scope.device.longitude ,
            latitude : $scope.device.latitude ,
            ip : $scope.device.ip ,
            udpPortNumber : $scope.device.port,
            numberNetCart : $scope.device.numberNetCart,
            modelId : $scope.device.modelId, 
            address : $scope.device.address,
            memo : $scope.device.memo,
            scopeId : $scope.device.scopeId,
            groupId : $scope.device.groupId
    	}; 

    	httpServices.promise('/device/deviceAction!save.action',obj).then(function(resp){
			if(resp.data.status == 'success'){
                close(null,500); 
			}else{
                alert(resp.data.info);
			}
			
		});
    };

	$scope.clear = function(){
    	$scope.device = {
			name : '',
	        number : '', 
	        longitude : '',
	        latitude : '',
	        ip : '',
	        numberNetCart : '', 
	        modelId : '', 
	        scopeId : '', 
	        scopeName : '',
	        address : '',
	        memo : '',
	        groupId : ''
	    };
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('editDeviceCtrl',function($scope, $http, httpServices, row, typeList, close){
	
	$scope.typeList = typeList;
	var newModelId = '';

	for(var i=0; i<typeList.length; i++){
        if(typeList[i]['name'] == row.modelId){
           newModelId = typeList[i]['id']; 
        }
	}
	$http.post('/system/scopeAction!listScope.action').then(function(resp){
        $scope.domainList = resp.data;
    });

	$scope.device = {
		identity : row.identity,
		name : row.name,
        number : row.number, 
        longitude : row.longitude,
        latitude : row.latitude,
        ip : row.ip,
        numberNetCart : row.numberNetCart, 
        modelId : newModelId.toString(),
        scopeId : row.scopeId, 
        address : row.address,
        memo : row.memo,
        udpPortNumber : row.udpPortNumber,
        groupId : row.groupId
	};

	var scopeNameArry = row.scopeName.split('/');

	$scope.device.scopeName = scopeNameArry[3]; 

	$scope.$watch( 'editTree.currentNode', function( newObj, oldObj ) {
	    if( $scope.editTree && angular.isObject($scope.editTree.currentNode) ) {

	    	if($scope.editTree.currentNode.level == '3'){
	    		$scope.device.scopeId = $scope.editTree.currentNode.sid;
	    		$scope.device.scopeName = $scope.editTree.currentNode.sname;
	    	}
	        
	    }
	}, false);

	$scope.sure = function(){

		httpServices.promise('/device/deviceAction!save.action',$scope.device).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert('编辑失败！！');
			}
		});

    };

	$scope.clear = function(){
    	$scope.device = {
			name : '',
	        number : '', 
	        longitude : '',
	        latitude : '',
	        ip : '',
	        numberNetCart : '', 
	        modelId : '', 
	        scopeId : '', 
	        scopeName : '',
	        address : '',
	        memo : '',
	        groupId : ''
	    };
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('startCaptureCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '启动捕获程序';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }



	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action', 
			method:'POST',
			params:obj
		}).then(function(resp){

			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}

		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('restartCaptureCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '重启捕获程序';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){

			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('closeCaptureCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '关闭捕获程序';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){

			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('catchPointCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '捕获近设备频点';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('restartSystemCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '重启设备系统';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){

			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('sameClockCtrl',function($scope, $http, rows, type, close){

	var nameArray = [];

	for(var i=0; i<rows.length; i++){
        nameArray.push(rows[i]['name']);
	}

	$scope.title = '同步设备时钟';

	$scope.task = {
		name : $scope.title + '_' + nameArray.join('_'),
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + nameArray.join('_'),
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('alarmSearchCtrl',function($scope, $http, rows, type, close){

	$scope.title = '实时告警查询';

	$scope.task = {
		name : $scope.title + '_' + rows.name,
		run : true,
		repeat : 0,
		plan : '',
	};

	$scope.$watch('task.run',function( newValue, oldValue ){
        
        if(newValue == false && $scope.task.plan == ''){
            alert('立即执行和选择计划，最少选择一项！');
        }
	});

	var ids = [];
    for(var i=0; i<rows.length; i++){
        ids.push(rows[i]['identity']);
    }

	$http({  
		url:'/device/deviceScheduler!nonPageListScheduler.action',
        method:'POST'
	}).then(function(resp){
        
       $scope.planList = resp.data;

	});

	$scope.sure = function(){

		var obj = {
			name : $scope.task.name,
        	dids : ids.join(),  
			imexe : $scope.task.run == true ? 1 : 0,  
			retryTime : $scope.task.repeat, 
			deviceScheduler : $scope.task.plan, 
			atype : type  
        };

        $http({  
			url:'/device/deviceBus!addBus.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.id){
				var result = resp.data.id;
				alert('任务已经下发！');
			    close(result,500); 
			}else{
				alert('添加任务失败！');
			}
		});
	};

	$scope.clear = function(){
		$scope.task = {
			name : $scope.title + '_' + rows.name,
			run : true,
			repeat : 0,
			plan : '',
		};
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
});

modalModule.controller('setQueryCtrl',function($scope, $http, $interval, $filter, usSpinnerService, row, close){

	var deviceType = row.modelId == 0 ? '' : row.modelId; 

	if( deviceType.indexOf('GSM') > 0){
        $scope.cellType = 'GSM';
	}else if( deviceType.indexOf('WCDMA') > 0){
        $scope.cellType = 'WCDMA';
	}else if(deviceType.indexOf('SCDMA') > 0){
		$scope.cellType = 'SCDMA';
	}else if(deviceType.indexOf('TDD-LTE') > 0){
		$scope.cellType = 'TDD-LTE';
	}else if(deviceType.indexOf('FDD-LTE') > 0){
		$scope.cellType = 'FDD-LTE';
	}else if(deviceType.indexOf('CDMA') > 0 && deviceType.indexOf('WCDMA') < 0 && deviceType.indexOf('SCDMA') < 0){
        $scope.cellType = 'CDMA';
	}

	$scope.device = {};
	$scope.power = {};
	$scope.useDuration = {
		start_time : '',
		end_time : ''
	};
	$scope.alarm = {};
	$scope.udp = {};
	$scope.udpConfig = {};
	$scope.ip = {
        ipV4_1 : '',
        ipV4_2 : '',
        dns1 : '',
        dns2 : '',
        netmask : ''
	};
	$scope.cellinfo = {};
	$scope.redirectTd = {};
	$scope.redirectFdd = {};
	$scope.redirectWCDMA = {};
	$scope.powerAtten = {};
	$scope.deviceStatus ={};

	$scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.useDuration.start_time) {               
            var activeDate = moment($scope.useDuration.start_time).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.useDuration.end_time) {
                
            var activeDate = moment($scope.useDuration.end_time);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

	function getQueryInfo(){   //页面初始取回的值

		$http({  
			url:'/device/deviceAction!dwrSearch.action',
			method:'POST',
			params:{
				Identity : row.identity
			}
		}).then(function(resp){

			var deviceINfo = resp.data;

			var cellObj = deviceINfo.cellinfo;

			function getCellInfo(){    //得到小区信息的$scope对象
				for( var key in cellObj){
					if ( key == 'auto_conf' || key == 'recapture_flag' || key == 'enable' || key == 'cfg_mode' || key == 'cfgmode' || key == 'reject_enable') {
	                    cellObj[key] = cellObj[key] == 1 ? true : false;
					};

	                $scope.cellinfo[key] = cellObj[key];
				}
			}

			getCellInfo();


			if(deviceINfo.tdd_redirect){
				var value = deviceINfo.tdd_redirect;
				for(key in value){
					if(key == 'redirect_enable'){
                        value[key] = value[key] == 1 ? true : false;
                    }
                    $scope.redirectTd[key] = value[key];
				}
			}

			if(deviceINfo.fdd_redirect){
				var value = deviceINfo.fdd_redirect;
				for(key in value){
                    if(key == 'redirect_enable'){
                        value[key] = value[key] == 1 ? true : false;
                    }
                    $scope.redirectFdd[key] = value[key];
				}
			}

			if(deviceINfo.wcdma_redirect){
				var value = deviceINfo.wcdma_redirect;
				for(key in value){
                    $scope.redirectWCDMA[key] = value[key];
				}
			}

			$scope.device =  {device_number : deviceINfo.device_number}; 
	        $scope.power.power_attenuation = deviceINfo.power_adjust;
	        if(deviceINfo.device_use_duration){
	        	$scope.useDuration = deviceINfo.device_use_duration;
	        }

	        $scope.alarm.duration = deviceINfo.no_report_duration;
	        //$scope.ip = deviceINfo.local_ip;  //没有读功能
	        $scope.udp = deviceINfo.udp_report;
	        $scope.udpConfig = deviceINfo.udp_config;
	        $scope.powerAtten = deviceINfo.power_atten;
	        $scope.deviceStatus = deviceINfo.device_status;
	       

		});
	}

	getQueryInfo();

	$scope.cellinfoMode=[
			{value:0,name:"被动式采集"},
			{value:2,name:"分时采集"},
			{value:4,name:"非掉话模式"},
			{value:5,name:"网络搜索"},
			{value:6,name:"主动式屏蔽"},
			{value:7,name:"主动式采集"}

	];

	$scope.redirectType=[
			{value:0,name:"关闭重定向"},
			{value:1,name:"重定向到WCDMA其他频点"},
			{value:2,name:"重定向到GSM"}
			

	];
	$scope.cellinfoBand=[
			{value:0,name:"850"},
			{value:1,name:"900"},
			{value:2,name:"1800"},
			{value:3,name:"1900"}

	];
	$scope.cellinfoSyncType=[
			{value:0,name:"No Sync"},
			{value:2,name:"GPS"},
			{value:4,name:"Air Sync"},
			{value:8,name:"Auto Air Sync"}
	];
	$scope.cellinfoBw=[
			{value:5,name:"5"},
			{value:10,name:"10"},
			{value:20,name:"20"}
	];
	

	$scope.getArgument = function(type){ 

            switch(type)
			{
			case 'deviceID':
			    return $filter('json')($scope.device_number);
			    break;
			case 'power':
			    return $filter('json')($scope.power);
			    break;
			case 'cell':
			    return $filter('json')($scope.cellinfo);
			    break;
			case 'useDuration':
			    $scope.useDuration = {
                    start_time : $filter('date')($scope.useDuration.start_time, 'yyyy-MM-dd'),
                    end_time : $filter('date')($scope.useDuration.end_time, 'yyyy-MM-dd')
                };
			    return $filter('json')($scope.useDuration);
			    break;
			case 'alarmDuration':
			    return $filter('json')($scope.alarm);
			    break;
			case 'udp':
			    return $filter('json')($scope.udp);
			    break;
			case 'ip':
			    return $filter('json')($scope.ip);
			    break;
			case 'number':
			    return $filter('json')($scope.device);
			    break;
			case 'udpConfig':
			    return $filter('json')($scope.udpConfig);
			    break;
			case 'powerAtten':
			    return $filter('json')($scope.powerAtten);
			    break;
			case 'deviceStatus':
			    return $filter('json')($scope.deviceStatus);
			    break;
			case 'redirectTd':
			    return $filter('json')($scope.redirectTd);
			    break;
			case 'redirectFdd':
			    return $filter('json')($scope.redirectFdd);
			    break;
			case 'redirectWCDMA':
			    return $filter('json')($scope.redirectWCDMA);
			    break;
			default:
			  
			}
    };

	$scope.creatTask = function(typeId,type){

		    var argument = null;

		    if(typeId==6 || typeId==10 || typeId==12 || typeId==17 || typeId==16 || typeId==14 || typeId==19 || typeId==20 || typeId==22 || typeId==24 || typeId==26 || typeId==28 || typeId==30 || typeId==33 || typeId==35 || typeId==37 || typeId==41){
                argument = $scope.getArgument(type);
		    }


            
            $http({  
				url :'/device/deviceBus!addBus.action',
				method :'POST',
				params : {
					dids : row.identity,
					imexe : 1,
					retryTime : 0, 
					atype : typeId,
					argument : argument
				}
			}).then(function(resp){

				alert('任务已经下发！');
				getQueryInfo();
			});

	};

    $scope.check_device_id = function(device_id) {
    	if (device_id.length > 16) {
    		alert("设备编号长度不能超过16个字符。")
    	}
    }
    $scope.check_noDatMin_range = function(noDatMin_range){
    	if ( noDatMin_range < 0 || noDatMin_range > 255) {
    		alert("无数据重启时间范围是0-255。");
    	}
    }
    
    $scope.check_tm_a_range = function(tm_a_range){
    	if ( tm_a_range < 120 || tm_a_range > 65535){
    		alert("采集持续时间范围是120-65535。");
    	}
    }
    $scope.check_tm_b_range = function(tm_b_range){
    	if( tm_b_range < 0 || tm_b_range > 32767 ){
    		alert("停止采集时间范围是0-32767。")
    	}
    }
    
    $scope.check_power_range = function(power_range){
    	if(power_range < 0 || power_range > 63){
    		alert("功率值的范围是0-63。");
    	}
    }
    
    $scope.check_port_range = function(port_range){
    	if(port_range < 0 || port_range > 65535){
    		alert("端口范围是0-65535。");
    	}
    }
    
    $scope.check_recapture_duration = function(recapture_duration){
    	if (recapture_duration < 0 || recapture_duration > 65536){
    		alert("重新捕获周期范围是0-65536。");
    	}
    }
    
    $scope.check_arfcn_range = function(arfcn_range){
    	if (arfcn_range < 0 || arfcn_range > 1023){
    		alert("信道号的范围是0-1023。");
    	}
    }
    
    $scope.check_scode_range = function(scode_range){
    	if(scode_range < 0 || scode_range > 127){
    		alert("扰码的范围是0-127。");
    	}
    }
    
    $scope.check_dlscode_range = function(dlscode_range){
    	if(dlscode_range < 0 || dlscode_range > 511){
    		alert("下行扰码的范围是0-511。");
    	}
    }
    
    $scope.check_lac_range = function(lac_range){
    	if(lac_range < 0 || lac_range > 65536){
    		alert("位置区码的范围是0-65536");
    	}
    }
    
    $scope.check_pci_range = function(pci_range){
    	if(pci_range < 0 || pci_range > 503){
    		alert("物理小区ID范围是0-503。");
    	}
    }
    
    $scope.check_tac_range = function(tac_range){
    	if(tac_range < 0 || tac_range > 65536){
    		alert("tac范围是0-65536。");
    	}
    }

	$scope.close = function(result) {
 	    close(result, 500); 
    };
	
}); 

modalModule.controller('downLoadCtrlDeviceManage',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});

modalModule.controller('importDeviceCtrl',function($scope, $http, close,Upload){

	$scope.errorMessage="";
	$scope.fileName="";
    $scope.close = function(result) {
 	    close(result,500); 
    };

    $scope.onFileSelect = function($file) { 
            if(!$file){
                return;
            }   
            var file = $file;
            $scope.errorMessage="";
            $scope.fileName=file.name;
            Upload.upload({
            	url:'/device/deviceAction!addExcelDevice.action',
            	headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
                data: {"excelTemplate": $scope.deviceFile},
                file: file
            }).progress(function(evt) {       
                $scope.isWaiting=true;
            }).success(function(data,status,headers,config){ 
            	if(data.status == 'success'){
            		close(result,500); 
            		return;
            	}else{
            		alert(data.info);
            	}
      			$scope.errorMessage="导入文件验证失败!";
            }).error(function(data,status,headers,config){ 
            	$scope.errorMessage="导入文件上传失败!";
            }).finally(function(){
                $scope.isWaiting=false;
            });   
    
        };
});
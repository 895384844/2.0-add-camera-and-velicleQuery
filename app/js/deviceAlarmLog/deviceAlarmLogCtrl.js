var deviceAlarmLogModule = angular.module('deviceAlarmLogModule', ['gridModule']);
deviceAlarmLogModule.controller('deviceAlarmLogCtrl',function($scope, $http, $stateParams, httpServices, $filter, gridServices, ModalService){
    
    $scope.deviceAlarm = {
        device : '',
        level : '',
        cause : '',
        startTime : '',
        endTime : '',
        statue : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.deviceAlarm.startTime) {               
            var activeDate = moment($scope.deviceAlarm.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.deviceAlarm.endTime) {
                
            var activeDate = moment($scope.deviceAlarm.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    if(typeof($stateParams.level) != 'undefined'){
        $scope.deviceAlarm.level = $stateParams.level;
        $scope.deviceAlarm.statue = '0';
    }

    $http({
        url:'/device/deviceAction!getMonitorDevice.action',
        method:'POST'
    }).then(function(resp){
        $scope.deviceArray = resp.data;
    });
    
    //实现表格呈现
	$scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };
	$scope.gridOptions = {
        paginationPageSizes: [20, 30],
        paginationPageSize: 20,
        useExternalPagination: true,
        enableSorting: false,
        enableColumnResize: true,
        multiSelect: true,
        rowHeight : 35,
        columnDefs : [
	        { field: 'deviceName',displayName: '告警设备名称',maxWidth:400,minWidth:150 },
	        { field: 'alarmLevel',displayName: '告警级别',maxWidth:400,minWidth:150 },
	        { field: 'alarmCause',displayName: '告警原因',maxWidth:400,minWidth:150 },
	        { field: 'date',displayName: '告警时间',maxWidth:400,minWidth:150 },
            { field: 'alarmStatus',displayName: '处理状态',maxWidth:400,minWidth:150 },
            { field: 'comments',displayName: '处理意见',maxWidth:400,minWidth:150 }
	    ]
    };

    $scope.promise = gridServices.promiseNew('/query/DeviceAlarmAction!listDeviceAlarm.action',{
        alarmLevel : $scope.deviceAlarm.level,
        alarmStatus : $scope.deviceAlarm.statue,
        page: 1,
        rows: 20,
        sort: 'id',
        order: 'desc'
    });

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/DeviceAlarmAction!listDeviceAlarm.action',{
                did : $scope.deviceAlarm.device,
                alarmCause : $scope.deviceAlarm.cause,
                alarmLevel : $scope.deviceAlarm.level,
                alarmStatus: $scope.deviceAlarm.statue,
                startDate : $filter('date')($scope.deviceAlarm.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.deviceAlarm.endTime, 'yyyy-MM-dd HH:mm:ss'),
                page: newPage,
                rows: pageSize,
                sort: 'id',
                order: 'desc'
            });

            $scope.getPage($scope.promise);
        });
        
        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            $scope.row = $scope.rows[0];
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            $scope.rows = gridApi.selection.getSelectedRows();
        });
	};

	$scope.getPage = function(promise){
		promise.then(function(resp){
            $scope.gridOptions.totalItems = resp.data.total;
//          if(resp.data.total == 0){alert("没有匹配的结果!");}
            var list = resp.data.rows;
            for(var i=0; i<list.length; i++){
                list[i]['deviceName'] = list[i]['device']['name'];
                list[i]['alarmStatus'] = list[i]['alarmStatus']==1?'已处理':'未处理';
                switch (list[i]['alarmLevel'])
                {
                case 1:
                  list[i]['alarmLevel']='一般告警';
                  break;
                case 2:
                  list[i]['alarmLevel']='次要告警';
                  break;
                case 3:
                  list[i]['alarmLevel']='重要告警';
                  break;
                case 4:
                  list[i]['alarmLevel']='严重告警';
                  break;
                }
            }
            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope.search = function(){

        var obj = {
            did : $scope.deviceAlarm.device,
            alarmCause : $scope.deviceAlarm.cause,
            alarmLevel : $scope.deviceAlarm.level,
            alarmStatus: $scope.deviceAlarm.statue,
            startDate : $filter('date')($scope.deviceAlarm.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.deviceAlarm.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20,  
            sort:"id",
            order:"desc"
        };

        $scope.promise = gridServices.promiseNew('/query/DeviceAlarmAction!listDeviceAlarm.action',obj);
        $scope.getPage($scope.promise);  

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.addComment = function(){
        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/deviceAlarmLog/comment.html',
                controller: 'addCommentsCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/query/DeviceAlarmAction!listDeviceAlarm.action',{
                        did : $scope.deviceAlarm.device,
                        alarmCause : $scope.deviceAlarm.cause,
                        alarmLevel : $scope.deviceAlarm.level,
                        alarmStatus: $scope.deviceAlarm.statue,
                        startDate : $filter('date')($scope.deviceAlarm.startTime, 'yyyy-MM-dd HH:mm:ss'),
                        closeDate : $filter('date')($scope.deviceAlarm.endTime, 'yyyy-MM-dd HH:mm:ss'),
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条编辑！');
        }
    };
    
    
    
     $scope.export = function(){
		var obj = {
			did : $scope.deviceAlarm.device,
            alarmCause : $scope.deviceAlarm.cause,
            alarmLevel : $scope.deviceAlarm.level,
            alarmStatus: $scope.deviceAlarm.statue,
            startDate : $filter('date')($scope.deviceAlarm.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.deviceAlarm.endTime, 'yyyy-MM-dd HH:mm:ss'),
		};

        httpServices.promise('/query/DeviceAlarmAction!countLength.action',obj).then(function(resp){
        	if(resp.data.status == 'success'){
                document.location.href = gridServices.exportAction('/query/DeviceAlarmAction!exportExcel.action',obj); 
        	}else{
        		httpServices.promise('/query/DeviceAlarmAction!exportExcel.action',obj).then(function(resp){
        			if(resp.data){
        				alert('后台正在准备数据，请稍后点击下载按钮！'); 
        			}
        		});
        	}
        });
	};
    $scope.downLoad = function(){
		        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
					if(resp.data){
		                ModalService.showModal({
			                templateUrl: 'modals/downLoad.html',
			                controller: 'downLoadCtrlNotice',
			                inputs: { 
			                    rows: resp.data 
			                }
			            }).then(function(modal) {
			                modal.element.modal();
			                modal.close.then(function(result) {
			                });
			            });
					}
				});
			};
    

});
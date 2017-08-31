var deviceTaskModule = angular.module('deviceTaskModule', ['gridModule']);

deviceTaskModule.controller('deviceTaskCtrl',function($scope, $http, $filter, gridServices, ModalService){   

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
            { field: 'name',displayName: '任务名称',maxWidth:250,minWidth:100 },
            { field: 'atype',displayName: '任务类型',maxWidth:250,minWidth:100 },
            { field: 'ctime',displayName: '创建时间',maxWidth:250,minWidth:100 },
            { field: 'number',displayName: '设备编号',maxWidth:250,minWidth:100 },
            // { field: 'atime',displayName: '执行时间' },
            { field: 'imexe',displayName: '是否立即执行',maxWidth:200,minWidth:100 },
            { field: 'retryTime',displayName: '重试次数',maxWidth:200,minWidth:100 },
            { field: 'deviceSchedulerName',displayName: '执行计划',maxWidth:200,minWidth:100 },
            { 
        	field: 'btnGroup',
        	displayName: '查询结果',
        	maxWidth:200,minWidth:100,
        	cellTemplate:'<a class="btnIcon btn-see" href ng-click="grid.appScope.search(row.entity)" uib-tooltip="查询结果" tooltip-placement="left"></a>'
        }
        ]
    };

    $scope.promise = gridServices.promiseDefault('/device/deviceBus!listBus.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/device/deviceBus!searchBus.action',{
                name : $scope.task.name,
                atype : $scope.task.type,
                did : $scope.task.device,
                imexe : $scope.task.enable,
                deviceScheduler : $scope.task.plan,
                startDate : $filter('date')($scope.task.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.task.endTime, 'yyyy-MM-dd HH:mm:ss'),
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
            var list = resp.data.rows;
            var taskTypeArray = [
                {
                    id : 0,
                    value : '启动捕获程序',
                },
                {
                    id : 1,
                    value : '关闭捕获程序',
                },
                {
                    id : 2,
                    value : '重启捕获程序',
                },
                {
                    id : 3,
                    value : '重启设备系统',
                },
                {
                    id : 4,
                    value : '捕获近设备频点',
                },
                {
                    id : 5,
                    value : '实时告警查询',
                },
                {   id : 6,
                	value : 'GSM小区信息设置',
                },
                {   id : 7,
                	value : 'GSM小区信息查询',
                },
                {
                    id : 8,
                    value : '同步设备时钟',
                },
                {
                    id : 10,
                    value : '设备编号设置',
                },
                {
                    id : 11,
                    value : '设备编号查询',
                },
                {
                    id : 12,
                    value : '功率设置',
                },
                {
                    id : 13,
                    value : '功率查询',
                },
                {
                    id : 14,
                    value : 'UDP上报服务器信息设置',
                },
                {
                    id : 15,
                    value : 'UDP上报服务器信息查询',
                },
                {
                    id : 16,
                    value : '无上报告警周期设置',
                },
                {
                    id : 17,
                    value : '设备使用周期设置',
                },
                {
                    id : 18,
                    value : '设备使用周期查询',
                },
                {
                    id : 19,
                    value : '设备网络信息设置',
                },
                {
                    id : 20,
                    value : 'WCDMA小区信息设置',
                },
                {
                    id : 21,
                    value : 'WCDMA小区信息查询',
                },
                {
                    id : 22,
                    value : 'TD-SCDMA小区信息设置',
                },
                {
                    id : 23,
                    value : 'TD-SCDMA小区信息查询',
                },
                {
                    id : 24,
                    value : 'TDD-LTE小区信息设置',
                },
                {
                    id : 25,
                    value : 'TDD-LTE小区信息查询',
                },
                {
                    id : 26,
                    value : 'FDD-LTE小区信息设置',
                },
                {
                    id : 27,
                    value : 'FDD-LTE小区信息查询',
                },
                {
                    id : 28,
                    value : 'TDD-LTE小区信息重定向设置',
                },
                {
                    id : 29,
                    value : 'TDD-LTE小区信息重定向查询',
                },
                {
                    id : 30,
                    value : 'FDD-LTE小区信息重定向设置',
                },
                {
                    id : 31,
                    value : 'FDD-LTE小区信息重定向查询',
                },
                {
                    id : 32,
                    value : '设备信息查询',
                },
                {
                    id : 33,
                    value : 'UDP配置服务器信息设置',
                },
                {
                    id : 34,
                    value : 'UDP配置服务器信息查询',
                },
                {
                    id : 35,
                    value : '功率衰减设置',
                },
                {
                    id : 36,
                    value : '功率衰减查询',
                },
                {
                    id : 37,
                    value : 'CDMA小区信息设置',
                },
                {
                    id : 38,
                    value : 'CDMA小区信息查询',
                },
                {
                    id : 41,
                    value : 'WCDMA小区信息重定向设置',
                },
                {
                    id : 42,
                    value : 'WCDMA小区信息重定向查询',
                },
                {
                    id : 100,
                    value : '小区信息查询',
                },
                {
                    id : 101,
                    value : '小区信息设置',
                },
            ];

            for(var i=0; i<list.length; i++){
		        list[i]['imexe'] = list[i]['imexe'] == '1' ? '是' : '否';
                for(var j=0; j<taskTypeArray.length; j++){
                    if(list[i]['atype'] == taskTypeArray[j]['id']){
                        list[i]['atype'] = taskTypeArray[j]['value'];
                    }
                }
		    }

		    $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

	$scope.delete = function(value){

        if( $scope.rows != null){
        
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteTaskCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/device/deviceBus!searchBus.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });

        }else{
            alert('请至少选择一条删除！');
        }
	};

	$scope.search = function(value){

        ModalService.showModal({
            templateUrl: 'modals/deviceTask/result.html',
            controller: 'resultCtrl',
            inputs: {
                row: value
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {});
        });

	};

    $http({
        url:'/device/deviceAction!getMonitorDevice.action',
        method:'POST'
    }).then(function(resp){
        $scope.deviceArray = resp.data;
    });

    $http({
        url:'/device/deviceScheduler!listScheduler.action',
        method:'POST', 
        params:{
            page : 1,
            rows : 1000
        }
    }).then(function(resp){
        $scope.planArray = resp.data.rows;
    });

    $scope.task = {
        name : '',
        type : '',
        device : '',
        plan : '',
        startTime : '',
        endTime : '',
        enable : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.task.startTime) {               
            var activeDate = moment($scope.task.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.task.endTime) {
                
            var activeDate = moment($scope.task.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.searchResult = function(){
        var obj = {
            name : $scope.task.name,
            atype : $scope.task.type,
            did : $scope.task.device,
            imexe : $scope.task.enable,
            deviceScheduler : $scope.task.plan,
            startDate : $filter('date')($scope.task.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.task.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20
        };

        $scope.promise = gridServices.promiseNew('/device/deviceBus!searchBus.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            name : $scope.task.name,
            atype : $scope.task.type,
            did : $scope.task.device,
            imexe : $scope.task.enable,
            deviceScheduler : $scope.task.plan,
            startDate : $filter('date')($scope.task.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.task.endTime, 'yyyy-MM-dd HH:mm:ss')
        };
        document.location.href = gridServices.exportAction('/device/deviceBus!exportExcel.action',obj);
    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
			if(resp.data){
                ModalService.showModal({
	                templateUrl: 'modals/downLoad.html',
	                controller: 'downLoadCtrlDeviceTask',
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
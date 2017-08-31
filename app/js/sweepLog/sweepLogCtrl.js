var sweepLogModule = angular.module('sweepLogModule', ['gridModule']);
sweepLogModule.controller('sweepLogCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
    
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
	        { field: 'deviceNumber',displayName: '设备编号', width: 100,maxWidth:200,minWidth:100 },
	        { field: 'creationTimestamp',displayName: '采集时间', width: 150,maxWidth:200,minWidth:100 },
	        { field: 'URxlv',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'M2Rxlv',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'U6Arfcn',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'M6Rxlv',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'U5Arfcn',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'U4Arfcn',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'U3Rxlv',width: 100,maxWidth:200,minWidth:100 },
	        { field: 'MArfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M6Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M3Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M2Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M4Rxlv', width: 100,maxWidth:200,minWidth:100 },
            { field: 'M3Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M5Arfcn', width: 100,maxWidth:200,minWidth:100 },
            { field: 'M4Arfcn', width: 100,maxWidth:200,minWidth:100 },
            { field: 'U3Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U2Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M5Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U5Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U2Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M1Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U4Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'UArfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U1Rxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'M1Rxlv', width: 100,maxWidth:200,minWidth:100 },
            { field: 'U1Arfcn',width: 100,maxWidth:200,minWidth:100 },
            { field: 'MRxlv',width: 100,maxWidth:200,minWidth:100 },
            { field: 'U6Rxlv', width: 100,maxWidth:200,minWidth:100 }
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/device/device/deviceAction!getListPageData.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/device/device/deviceAction!getListPageData.action',{
                DeviceNumber : $scope.log.device,
                StartTime : $filter('date')($scope.log.startTime, 'yyyy-MM-dd HH:mm:ss'),
                CloseTime : $filter('date')($scope.log.endTime, 'yyyy-MM-dd HH:mm:ss'),
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
            var dataArray = [];
            for(var i=0; i<list.length; i++){
                var obj = {
                    creationTimestamp : list[i]['creationTimestamp'],
                    deviceNumber : list[i]['deviceNumber'],
                    id : list[i]['id']
                };
                var map = list[i]['sweepInfoMap'];
                for(var key in map){
                    obj[key] = map[key];
                }
                dataArray.push(obj);
            }
            $scope.gridOptions.data = dataArray;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope.log = {
        startTime : '',
        endTime : '',
        device : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.log.startTime) {               
            var activeDate = moment($scope.log.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.log.endTime) {
                
            var activeDate = moment($scope.log.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.search = function(){
        var obj = {
            DeviceNumber : $scope.log.device,
            StartTime : $filter('date')($scope.log.startTime, 'yyyy-MM-dd HH:mm:ss'),
            CloseTime : $filter('date')($scope.log.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20
        };



        $scope.promise = gridServices.promiseNew('/device/device/deviceAction!getListPageData.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            DeviceNumber : $scope.log.device,
            StartTime : $filter('date')($scope.log.startTime, 'yyyy-MM-dd HH:mm:ss'),
            CloseTime : $filter('date')($scope.log.endTime, 'yyyy-MM-dd HH:mm:ss')
        };
        httpServices.promise('/device/device/deviceAction!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/device/deviceAction!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/device/deviceAction!exportExcel.action',obj).then(function(resp){
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
	                controller: 'downLoadCtrlSweep',
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
var residentPopulationModule = angular.module('residentPopulationModule', ['gridModule']);
historyQueryModule.controller('residentPopulationCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService, usSpinnerService){
    
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
	        { field: 'imei',displayName: '终端IMEI',maxWidth:500,minWidth:200 },
	        { field: 'imsi',displayName: '终端IMSI',maxWidth:500,minWidth:200},
	        { field: 'startTime',displayName: '采集开始时间',maxWidth:500,minWidth:200 },
            { field: 'lastTime',displayName: '采集结束时间',maxWidth:500,minWidth:200 }
	    ]
    };

    $scope.select = {
        groupId : '',
        startTime : '',
        endTime : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.select.startTime) {               
            var activeDate = moment($scope.select.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.select.endTime) {
                
            var activeDate = moment($scope.select.endTime);

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
            $scope.groupArray = resp.data;
    });

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            var promise = gridServices.promiseNew('/query/query/residentAction!analyzeResident.action',{
                groupId : $scope.select.groupId,
                startDate : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'),
                page: newPage,
                rows: pageSize
            });

	        $scope.getPage(promise);
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
            if(resp.data.total == 0){alert("没有匹配的结果!");}
            usSpinnerService.stop('spinner-1');
            var list = resp.data.rows;

            for(var i=0; i<list.length; i++){
                list[i]['imei'] = list[i]['equipment']['imei'];
                list[i]['imsi'] = list[i]['equipment']['imsi'];
            }

            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

    $scope.search = function(){
    	usSpinnerService.spin('spinner-1');

        var promise = gridServices.promiseNew('/query/query/residentAction!analyzeResident.action',{
            groupId : $scope.select.groupId,
            startDate : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page: 1,
            rows: 20,
        });

        $scope.getPage(promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            groupId : $scope.select.groupId,
            startDate : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'), 
        };
	    httpServices.promise('/query/query/residentActionForExcel!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/query/query/residentActionForExcel!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/query/query/residentActionForExcel!exportExcel.action',obj).then(function(resp){
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
	                controller: 'downLoadCtrlResident',
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

    
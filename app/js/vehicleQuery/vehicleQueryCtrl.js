var vehicleQueryModule = angular.module('vehicleQueryModule', ['gridModule']);
vehicleQueryModule.controller('vehicleQueryCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService,usSpinnerService){

    $http({
        url:'/query/cameraAction!getCameraInfoList.action',
        method:'POST'
    }).then(function(resp){
        $scope.groupArray = resp.data;
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
	        { field: 'camera.name',displayName: '设备地址',maxWidth:300,minWidth:100 },
	        { field: 'camera.ip',displayName: '设备IP',maxWidth:300,minWidth:100 },
	        { field: 'camera.laneNumber',displayName: '车道号',maxWidth:300,minWidth:100 },
	        { field: 'time',displayName: '采集时间',maxWidth:300,minWidth:100 },
	        { field: 'plateNum',displayName: '车牌号',maxWidth:300,minWidth:100 },
	        { field: 'plateCol',displayName: '车牌颜色',maxWidth:300,minWidth:100 },
	        { field: 'carCol',displayName: '车身颜色',maxWidth:300,minWidth:100 },
	        { field: 'carDir',displayName: '识别方向',maxWidth:300,minWidth:100 },
	        { field: 'carRate',displayName: '车速',maxWidth:300,minWidth:100 },
	        { field: 'carType',displayName: '车辆类型',maxWidth:300,minWidth:100 },
	        { 
	        	field: 'pic',
	        	displayName: '车牌图片',
	        	maxWidth:300,
	        	minWidth:100,
	        	cellTemplate: '<a class="btnIcon btn-search" href ng-click="grid.appScope.showPic(row.entity)"></a>' 			}
	    ]
    };

    $scope.promise = gridServices.promiseNew('/query/cameraInfoAction!listCameraInfo.action',{
        page : 1,
        rows: 20,
        sort: 'time',
        order: 'desc'
    });

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/cameraInfoAction!listCameraInfo.action',{
                cid : $scope.vehicle.cid,
                plateNum : $scope.vehicle.plateNum,
                startTime : $filter('date')($scope.vehicle.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeTime : $filter('date')($scope.vehicle.endTime, 'yyyy-MM-dd HH:mm:ss'),
                page: newPage,
                rows: pageSize,
                sort: 'time',
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

	$scope.showPic = function(value) {		
		ModalService.showModal({
            templateUrl: 'modals/vehicleQuery/showPic.html',
            controller: 'showPicCtrl',
            inputs: {            	
            	value : value
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
            	
            });
        });
	};


	$scope.getPage = function(promise){
		promise.then(function(resp){
            $scope.gridOptions.totalItems = resp.data.total;           
            var list = resp.data.rows;
            $scope.gridOptions.data = list;
            
		});
        $scope.rows = null;
	};
    $scope.getPage($scope.promise);
    $scope.vehicle = {
        startTime : '',
        closeTime : '',
        cid : '',
        plateNum : ''
    };
    
    $scope.endDateBeforeRender = function ($view, $dates) {
        if ($scope.vehicle.startTime) {               
            var activeDate = moment($scope.vehicle.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.endTime) {
                
            var activeDate = moment($scope.vehicle.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };
    
    $scope.search = function(){
    	usSpinnerService.spin('spinner-1');
        var obj = {
            cid : $scope.vehicle.cid,
            plateNum: $scope.vehicle.plateNum,
            startTime : $filter('date')($scope.vehicle.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeTime : $filter('date')($scope.vehicle.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20,
            sort: 'time',
            order: 'desc'
        };
        $scope.promise = gridServices.promiseNew('/query/cameraInfoAction!listCameraInfo.action',obj);
        $scope.getPage($scope.promise);
        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
        
    };
});
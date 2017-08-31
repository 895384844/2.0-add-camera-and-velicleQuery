var trafficModule = angular.module('trafficModule', ['gridModule']);

trafficModule.controller('trafficCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService, usSpinnerService){

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
	        { field: 'startTime',displayName: '开始时间',maxWidth:600,minWidth:300 },
	        { field: 'endTime',displayName: '结束时间',maxWidth:600,minWidth:300 },
	        { field: 'total',displayName: '终端数量',maxWidth:600,minWidth:300 }
	    ]
    };

    $scope.select = {
        groupId : '',
        time : '',
        startTime : '',
        endTime : ''
    };
    //遍历组设备
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
            
            var promise = gridServices.promiseNew('/query/query/statisticsAction!analyzeStatis.action',{
                groupId : $scope.select.groupId,
                spanTime : $scope.select.time,
                startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
                endTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'),
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
            //如果有返回值的情况下，显示图标按钮可用
            $scope.btn.status = false;
            $scope.gridOptions.totalItems = resp.data.total;
            if(resp.data.total == 0){alert("没有匹配的结果!");}
            usSpinnerService.stop('spinner-1');
            $scope.gridOptions.data = resp.data.rows;
		});
        $scope.rows = null;
	};

    $scope.btn = { status : true};
    
    $scope.showChar = function(){

        var postData={
            groupId : $scope.select.groupId,
            spanTime : $scope.select.time,
            startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            endTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss')
        };

        ModalService.showModal({
                    templateUrl: 'modals/trafficAnalysis/showChar.html',
                    controller: 'showCharCtrl',
                    inputs: { 
                        postData:postData
                        
                    }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
            });
        });  
    };   

    $scope.endDateBeforeRender = function($view, $dates){

            var startDate = moment($scope.select.startTime).subtract(1, $view).add(1, 'minute');

            $scope.$watch('select.time',function(newValue,oldValue){

                if(newValue != oldValue){
                    $scope.select.startTime = '';
                    $scope.select.endTime = '';
                }

                switch($scope.select.time){
                    case '600':
                      var endDate = moment($scope.select.startTime).subtract(1, $view).add(11, 'day');
                      break;
                    case '1800':
                      var endDate = moment($scope.select.startTime).subtract(1, $view).add(31, 'day');
                      break;
                    case '3600':
                      var endDate = moment($scope.select.startTime).subtract(1, $view).add(61, 'day');
                      break;
                    case '86400':
                      var endDate = moment($scope.select.startTime).subtract(1, $view).add(3, 'year');
                      break;
                    default:
                      var endDate = moment($scope.select.startTime).subtract(1, $view).add(10, 'year');
                };
                $dates.filter(function (date) {
                  return date.localDateValue() >= endDate.valueOf();

                }).forEach(function (date) {
                   date.selectable = false;
                });
            });

            $dates.filter(function (date) {
              return date.localDateValue() <= startDate.valueOf();

            }).forEach(function (date) {
               date.selectable = false;
            });
    };

    $scope.endDateOnSetTime = function(){
        $scope.$broadcast('end-date-changed');
    };

    $scope.startDateOnSetTime = function(){
        $scope.$broadcast('start-date-changed');
    };

    $scope.search = function(){

        var promise = gridServices.promiseNew('/query/query/statisticsAction!analyzeStatis.action',{
            groupId : $scope.select.groupId,
            spanTime : $scope.select.time,
            startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            endTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page: 1,
            rows: 20,
        });
        usSpinnerService.spin('spinner-1');

        $scope.getPage(promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            groupId : $scope.select.groupId,
            spanTime : $scope.select.time,
            startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            endTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss') 
        };
        httpServices.promise('/query/query/statisticsAction!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/query/query/statisticsAction!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/query/query/statisticsAction!exportExcel.action',obj).then(function(resp){
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
	                controller: 'downLoadCtrlTraffic',
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

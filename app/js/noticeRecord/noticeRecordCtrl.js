var noticeRecordModule = angular.module('noticeRecordModule', ['gridModule']);
noticeRecordModule.controller('noticeRecordCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
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
	        { field: 'dstPhoneNumber',displayName: '接收地址',maxWidth:500,minWidth:200 },
	        { field: 'content',displayName: '发送内容',maxWidth:500,minWidth:200 },
	        { field: 'date',displayName: '发送时间',maxWidth:500,minWidth:200 },
            { field: 'result',displayName: '发送结果',maxWidth:500,minWidth:200 }
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/smmodem/SMModemAction!getPageData.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/smmodem/SMModemAction!getPageData.action',{
                dstPhoneNumber : $scope.notice.phone,
                content : $scope.notice.content,
                StartTime : $filter('date')($scope.notice.startTime, 'yyyy-MM-dd HH:mm:ss'),
                CloseTime :  $filter('date')($scope.notice.endTime, 'yyyy-MM-dd HH:mm:ss'),
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

                var result = list[i]['result'];
                
                if(result == 0){
                    list[i]['result'] = '失败';
                }else{
                    list[i]['result'] = '成功';
                }

            }

            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope.notice = {
        phone : '',
        content : '',
        startTime : '',
        endTime : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.notice.startTime) {               
            var activeDate = moment($scope.notice.startTime).subtract(1, $view).add(1, 'minute');
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
           
        if ($scope.notice.endTime) {
                
            var activeDate = moment($scope.notice.endTime);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };


    $scope.search = function(){
        var obj = {
            dstPhoneNumber : $scope.notice.phone,
            content : $scope.notice.content,
            StartTime : $filter('date')($scope.notice.startTime, 'yyyy-MM-dd HH:mm:ss'),
            CloseTime :  $filter('date')($scope.notice.endTime, 'yyyy-MM-dd HH:mm:ss'),
            page : 1,
            rows : 20
        };

        $scope.promise = gridServices.promiseNew('/smmodem/SMModemAction!getPageData.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };
  
    $scope.export = function(){
        var obj = {
           dstPhoneNumber : $scope.notice.phone,
            content : $scope.notice.content,
            StartTime : $filter('date')($scope.notice.startTime, 'yyyy-MM-dd HH:mm:ss'),
            CloseTime :  $filter('date')($scope.notice.endTime, 'yyyy-MM-dd HH:mm:ss') 
        };
       httpServices.promise('/smmodem/SMModemAction!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/smmodem/SMModemAction!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/smmodem/SMModemAction!exportExcel.action',obj).then(function(resp){
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
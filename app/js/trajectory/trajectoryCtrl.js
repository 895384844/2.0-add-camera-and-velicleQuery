var trajectoryModule = angular.module('trajectoryModule', ['gridModule']);
trajectoryModule.controller('trajectoryCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService, usSpinnerService){

    $scope.top = (angular.element('.form').prop('offsetHeight') + 30) + 'px';
	 $http({
	        url:'/device/deviceAction!getMonitorDevice.action',
	        method:'POST'
	    }).then(function(resp){
	            $scope.deviceArray = resp.data;
	    });




	$scope.gridOptions = {
        paginationPageSizes: [20,30,50],
        paginationPageSize: 30,
        useExternalPagination: true,
        enableSorting: false,
        enableColumnResize: true,
        multiSelect: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'imei',displayName: 'IMEI',maxWidth:300,minWidth:100  },
            { field: 'imsi',displayName: 'IMSI',maxWidth:300,minWidth:100  },
            { field: 'name',displayName: '采集设备名称',maxWidth:300,minWidth:100  },
            { field: 'number',displayName: '采集设备编号',maxWidth:300,minWidth:100  },
            { field: 'address',displayName: '采集设备地址',maxWidth:300,minWidth:100  },
            { field: 'startTime',displayName: '上号开始时间',maxWidth:300,minWidth:100  },
            { field: 'endTime',displayName: '上号结束时间',maxWidth:300,minWidth:100  } 
        ]
    };

    $scope.select = {
        value : '',
        startTime : '',
        endTime : '',
        type : 'imsi'
    };


    $scope.endDateBeforeRender = endDateBeforeRender;
    $scope.endDateOnSetTime = endDateOnSetTime;
    $scope.startDateBeforeRender = startDateBeforeRender;
    $scope.startDateOnSetTime = startDateOnSetTime;

    function startDateOnSetTime () {
      $scope.$broadcast('start-date-changed');
    }

    function endDateOnSetTime () {
      $scope.$broadcast('end-date-changed');
    }

    function startDateBeforeRender ($dates) {
      if ($scope.select.endTime) {
        var activeDate = moment($scope.select.endTime);

        $dates.filter(function (date) {
          return date.localDateValue() >= activeDate.valueOf();
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }

    function endDateBeforeRender ($view, $dates) {
      if ($scope.select.startTime) {
        var activeDate = moment($scope.select.startTime).subtract(1, $view).add(1, 'minute');

        $dates.filter(function (date) {
          return date.localDateValue() <= activeDate.valueOf();
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }




    var paginationChanged=function (newPage, pageSize){
            $scope.gridOptions.paginationCurrentPage=newPage;
            var promise = gridServices.promiseNew('/query/query/traceLogAction!getTraceList.action',{
                type : $scope.select.type,
                typeValue : $scope.select.value,
                startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss'),
                page: newPage,
                rows: pageSize
            }); 

            $scope.getPage(promise);
        };


    $scope.gridOptions.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, paginationChanged);

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


            $scope.gridOptions.data = [];
            for(var i=0; i<list.length; i++){
                var obj = {
                    'imei' : list[i]['equipment']['imei'],
                    'imsi' : list[i]['equipment']['imsi'],
                    'name' : list[i]['device']['name'],
                    'number' : list[i]['device']['number'],
                    'address' : list[i]['device']['address'],
                    'startTime' : list[i]['startTime'],
                    'endTime' : list[i]['endTime']
                };
                $scope.gridOptions.data.push(obj);
            }
        });
        $scope.rows = null;
    };

    
    $scope.search = function(){
    	usSpinnerService.spin('spinner-1');
        paginationChanged(1,$scope.gridOptions.paginationPageSize);
    };

    $scope.export = function(){
        var obj = {
            type : $scope.select.type,
            typeValue : $scope.select.value,
            startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss')
        };
        httpServices.promise('/query/query/traceLogActionForExcel!countLength.action',obj).then(function(resp){
	        	if(resp.data.status == 'success'){
	                document.location.href = gridServices.exportAction('/query/query/traceLogActionForExcel!exportExcel.action',obj); 
	        	}else{
	        		httpServices.promise('/query/query/traceLogActionForExcel!exportExcel.action',obj).then(function(resp){
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
			                controller: 'downLoadCtrlTrajectory',
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

    $scope.showMap = function(){

        var promise = gridServices.promiseNew('/query/query/traceLogAction!getTraceOnMap.action',{
            type : $scope.select.type,
            typeValue : $scope.select.value,
            startTime : $filter('date')($scope.select.startTime, 'yyyy-MM-dd HH:mm:ss'),
            closeTime : $filter('date')($scope.select.endTime, 'yyyy-MM-dd HH:mm:ss')
        });  

        promise.then(function(resp){
            var resultList = resp.data;
            if(resultList.length != 0){
                ModalService.showModal({
                    templateUrl: 'modals/trajectory/showMap.html',
                    controller: 'showMapCtrl',
                    inputs: { 
                        list: resultList
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function() {
                    	
                    });
                }); 
            }else{
                alert('无轨迹显示！');
            }

        });    
    };
    

});
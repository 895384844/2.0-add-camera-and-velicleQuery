var logManageModule = angular.module('logManageModule', []);
logManageModule.controller('logManageCtrl',function($scope, $http, $filter, gridServices, ModalService, httpServices){

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
	        { field: 'username',displayName: '操作人',maxWidth:400,minWidth:100 },
	        { field: 'modulecode',displayName: '操作模块',maxWidth:400,minWidth:100 },
	        { field: 'operateCode',displayName: '动作名称',maxWidth:400,minWidth:100 },
	        { field: 'ip',displayName: 'IP地址',maxWidth:400,minWidth:100 },
	        { field: 'date',displayName: '操作时间',maxWidth:400,minWidth:100 }
	    ]
	};

	$scope.promise = $http({
			url:'/system/syslogAction!listSyslog.action',
			method:'POST',
			params: {
				page: 1,
                rows: 20,
                sort: 'id',
                order: 'desc'
			}
		}); 

	$scope.gridOptions.onRegisterApi = function(gridApi){

		$scope.gridApi = gridApi;
	    //分页变化事件
	    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
	        $scope.newPage = newPage;

	        $scope.promise = $http({
				url:'/system/syslogAction!listSyslog.action',
				method:'POST',
				params: {
					username: $scope.log.name,
		            modulecode: $scope.log.moudleSelect,
		            operateCode: $scope.log.actionSelect,
		            ip: $scope.log.ip,
		            startDate: $filter('date')($scope.data.dateDropDownInputStart, 'yyyy-MM-dd HH:mm'),
		            closeDate: $filter('date')($scope.data.dateDropDownInputEnd, 'yyyy-MM-dd HH:mm'),
					page: newPage,
		            rows: pageSize,
		            sort: 'id',
		            order: 'desc'
				}
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

	$scope.log = {
		name : '',
		moudleSelect : '',
		actionSelect : '',
		ip : '',
		startDate:'',
		closeDate:''
	};

	$scope.data = {
        dateDropDownInputStart : '',
        dateDropDownInputEnd : ''
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
      if ($scope.data.dateDropDownInputEnd) {
        var activeDate = moment($scope.data.dateDropDownInputEnd);

        $dates.filter(function (date) {
          return date.localDateValue() >= activeDate.valueOf();
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }

    function endDateBeforeRender ($view, $dates) {
      if ($scope.data.dateDropDownInputStart) {
        var activeDate = moment($scope.data.dateDropDownInputStart).subtract(1, $view).add(1, 'minute');
        $dates.filter(function (date) {
          return date.localDateValue() <= activeDate.valueOf();
        }).forEach(function (date) {
          date.selectable = false;
        })
      }
    }
    

	$scope.search = function(){
		var obj = {
			username: $scope.log.name,
		    modulecode: $scope.log.moudleSelect,
		    operateCode: $scope.log.actionSelect,
		    ip: $scope.log.ip,
		    startDate: $filter('date')($scope.data.dateDropDownInputStart, 'yyyy-MM-dd HH:mm'),
		    closeDate: $filter('date')($scope.data.dateDropDownInputEnd, 'yyyy-MM-dd HH:mm'),
		    page: 1,
		    rows: 20,
		    sort: 'id',
		    order: 'desc'
		};
		$scope.promise = $http({
			url:'/system/syslogAction!listSyslog.action',
			method:'POST',
			params: obj
		});
        $scope.getPage($scope.promise);
        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
	};
	$scope.export = function(){
		var obj = {
			username: $scope.log.name,
		    modulecode: $scope.log.moudleSelect,
		    operateCode: $scope.log.actionSelect,
		    ip: $scope.log.ip,
		    startDate: $filter('date')($scope.data.dateDropDownInputStart, 'yyyy-MM-dd HH:mm'),
		    closeDate: $filter('date')($scope.data.dateDropDownInputEnd, 'yyyy-MM-dd HH:mm')
		};
        httpServices.promise('/system/syslogAction!countLength.action',obj).then(function(resp){
        	if(resp.data.status == 'success'){
                document.location.href = gridServices.exportAction('/system/syslogAction!exportExcel.action',obj); 
        	}else{
        		httpServices.promise('/system/syslogAction!exportExcel.action',obj).then(function(resp){
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
	                controller: 'downLoadCtrlLog',
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

    // 得到操作模块的 中英文字典
    $http({
		url:'/system/businessDictionaryAction!getModuleItem.action',
		method:'POST'
	}).then(function(resp){
		$scope.moudleArray = resp.data; 

		$scope.moudleDict = {}; // 定义字典
        for(var i=0; i<resp.data.length; i++){
            var key = resp.data[i].code;
            $scope.moudleDict[key] = resp.data[i].name;
        }

	}).then(function(){
		// 得到操作动作的 中英文字典
	    $http({
			url:'/system/businessDictionaryAction!getOperateItem.action',
			method:'POST'
		}).then(function(resp){
			$scope.actionArray = resp.data; 

			$scope.actionDict = {}; // 定义字典
	        for(var i=0; i<resp.data.length; i++){
	            var key = resp.data[i].code;
	            $scope.actionDict[key] = resp.data[i].name; 
	        }

	        $scope.getPage = function(promise){
				promise.then(function(resp){

		            $scope.gridOptions.totalItems = resp.data.total;
		            $scope.gridOptions.data = resp.data.rows;

		            for(var i=0; i<$scope.gridOptions.data.length; i++){
		                var moduleKey = $scope.gridOptions.data[i]['modulecode'];
		                var actionKey = $scope.gridOptions.data[i]['operateCode'];
		                //根据字典取得对应的模块、动作中文
		                $scope.gridOptions.data[i]['modulecode'] = $scope.moudleDict[moduleKey];
		                $scope.gridOptions.data[i]['operateCode'] = $scope.actionDict[actionKey];
		            }
				});
		        $scope.rows = null;
			};

			$scope.getPage($scope.promise);
		});

	});
	
});
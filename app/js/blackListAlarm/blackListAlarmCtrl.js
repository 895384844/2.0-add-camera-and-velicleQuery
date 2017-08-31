var blackListAlarmModule = angular.module('blackListAlarmModule', ['gridModule']);
blackListAlarmModule.controller('blackListAlarmCtrl',function($scope, $http, $filter, $stateParams, httpServices, gridServices, ModalService){

    $scope.blackList = {
        groupId : '',
        imei : '',
        imsi : '',
        statue : '',
        comment : ''
    };

    if(typeof($stateParams.statue) != 'undefined'){
        $scope.blackList.statue = $stateParams.statue;
    }

    $http({
        url:'/device/deviceAction!getDeviceGroup.action',
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
	        { field: 'name',displayName: '姓名',maxWidth:350,minWidth:130 },
	        { field: 'imei',displayName: 'IMEI',maxWidth:350,minWidth:130 },
	        { field: 'imsi',displayName: 'IMSI',maxWidth:350,minWidth:130 },
	        { field: 'deviceName',displayName: '采集设备名称',maxWidth:350,minWidth:130 },
	        { field: 'dateTime',displayName: '捕获时间',maxWidth:350,minWidth:130 },
            { field: 'statue',displayName: '处理状态',maxWidth:350,minWidth:130 },
            { field: 'comments',displayName: '处理意见',maxWidth:350,minWidth:130 }
	    ]
    };

    $scope.promise = gridServices.promiseNew('/query/TerminalAlarmLogAction!getTerminalAlarmLogPage.action',{
        statue : $scope.blackList.statue,
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
            
            $scope.promise = gridServices.promiseNew('/query/TerminalAlarmLogAction!getTerminalAlarmLogPage.action',{
                groupId : $scope.blackList.groupId,
                imsi : $scope.blackList.imsi,
                imei : $scope.blackList.imei,
                statue : $scope.blackList.statue,
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
                list[i]['deviceName'] = list[i]['eventSourceDevice']['name'];
                list[i]['name'] = list[i]['foundTerminal']['name'];
                list[i]['statue'] = list[i]['statue']==1?'已处理':'未处理';
            }
            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope.search = function(){

        var obj = {
            groupId : $scope.blackList.groupId,
            imsi : $scope.blackList.imsi,
            imei : $scope.blackList.imei,
            statue : $scope.blackList.statue,
            page : 1,
            rows : 20,
            sort: 'id',
            order: 'desc'
        };

        $scope.promise = gridServices.promiseNew('/query/TerminalAlarmLogAction!getTerminalAlarmLogPage.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.addComment = function(){
        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/blackListLog/comment.html',
                controller: 'addCommentCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/query/TerminalAlarmLogAction!getTerminalAlarmLogPage.action',{
                        deviceId : $scope.blackList.device,
                        imsi : $scope.blackList.imsi,
                        imei : $scope.blackList.imei,
                        statue : $scope.blackList.statue,
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
			groupId : $scope.blackList.groupId,
            imsi : $scope.blackList.imsi,
            imei : $scope.blackList.imei,
            statue : $scope.blackList.statue
		};

        httpServices.promise('/query/TerminalAlarmLogAction!countLength.action',obj).then(function(resp){
        	if(resp.data.status == 'success'){
                document.location.href = gridServices.exportAction('/query/TerminalAlarmLogAction!exportExcel.action',obj); 
        	}else{
        		httpServices.promise('/query/TerminalAlarmLogAction!exportExcel.action',obj).then(function(resp){
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
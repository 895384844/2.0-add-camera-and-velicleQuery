var deviceAlarmModule = angular.module('deviceAlarmModule', ['gridModule']);
deviceAlarmModule.controller('deviceAlarmCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
    
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
	        { field: 'number',displayName: '设备编号',maxWidth:450,minWidth:200 },
	        { field: 'name',displayName: '设备名称',maxWidth:450,minWidth:200 },
	        { field: 'peopleName',displayName: '告警接收人',maxWidth:450,minWidth:200 },
	        { field: 'contactTel',displayName: '告警接收人电话' ,maxWidth:450,minWidth:200}
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/query/DevicePeopleRelationAction!getDispatchPage.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/DevicePeopleRelationAction!getDispatchPage.action',{
                deviceName : $scope.device.name,
                deviceNumber : $scope.device.number,
                page: newPage,
                rows: pageSize 
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
            $scope.gridOptions.data = resp.data.rows;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope.device = {
        number : '',
        name : ''
    };

    $scope.search = function(){
        var obj = {
            deviceName : $scope.device.name,
            deviceNumber : $scope.device.number,
            page : 1,
            rows : 10
        };

        $scope.promise = gridServices.promiseNew('/query/DevicePeopleRelationAction!getDispatchPage.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            deviceName : $scope.device.name,
            deviceNumber : $scope.device.number
        };
        document.location.href = gridServices.exportAction('/query/DevicePeopleRelationAction!exportExcel.action',obj);
    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
			if(resp.data){
                ModalService.showModal({
	                templateUrl: 'modals/downLoad.html',
	                controller: 'downLoadCtrlHistory',
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
    $scope.add = function(){
        ModalService.showModal({
            templateUrl: 'modals/deviceAlarm/add.html',
            controller: 'addDeviceAlarmCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {                
                $scope.promise = gridServices.promiseNew('/query/DevicePeopleRelationAction!getDispatchPage.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
    };

    $scope.edit = function(){
        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/deviceAlarm/edit.html',
                controller: 'editDeviceAlarmCtrl',
                inputs: { 
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/DevicePeopleRelationAction!getDispatchPage.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }
    };

    $scope.delete = function(){
        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteDeviceAlarmCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/DevicePeopleRelationAction!getDispatchPage.action',{
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

});
var targetAlarmModule = angular.module('targetAlarmModule', ['gridModule']);
targetAlarmModule.controller('targetAlarmCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){

    $scope.peopleArray = []; 

    $http({
        url:'/query/PeopleAction!getPoliceList.action',
        method:'POST',
    }).then(function(resp){
        $scope.peopleArray = resp.data;
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
	        { field: 'name',displayName: '目标名称',maxWidth:400,minWidth:200 },
	        { field: 'imei',displayName: 'IMEI',maxWidth:400,minWidth:200 },
	        { field: 'imsi',displayName: 'IMSI',maxWidth:400,minWidth:200 },
	        { field: 'peopleName',displayName: '转发人姓名',maxWidth:400,minWidth:200 },
	        { field: 'contactTel',displayName: '转发人电话',maxWidth:400,minWidth:200 }
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/query/TerminalPeopleRelationAction!getDispatchPage.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/TerminalPeopleRelationAction!getDispatchPage.action',{
                terminalName : $scope.target.name,
                terminalIMEI : $scope.target.imei,
                terminalIMSI : $scope.target.imsi,
                dispatcherId : $scope.target.id,
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

    $scope.target = {
        name : '',
        imei : '',
        imsi : '',
        id : ''
    };

    $scope.search = function(){
        var obj = {
            terminalName : $scope.target.name,
            terminalIMEI : $scope.target.imei,
            terminalIMSI : $scope.target.imsi,
            dispatcherId : $scope.target.id,
            page : 1,
            rows : 20
        };
        $scope.promise = gridServices.promiseNew('/query/TerminalPeopleRelationAction!getDispatchPage.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            terminalName : $scope.target.name,
            terminalIMEI : $scope.target.imei,
            terminalIMSI : $scope.target.imsi,
            dispatcherId : $scope.target.id
        };
        document.location.href = gridServices.exportAction('/query/TerminalPeopleRelationAction!exportExcel.action',obj);
    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
			if(resp.data){
                ModalService.showModal({
	                templateUrl: 'modals/downLoad.html',
	                controller: 'downLoadCtrlTargetAlarm',
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
            templateUrl: 'modals/targetAlarm/add.html',
            controller: 'addTargetAlarmCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {                
                $scope.promise = gridServices.promiseNew('/query/TerminalPeopleRelationAction!getDispatchPage.action',{
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
                templateUrl: 'modals/targetAlarm/edit.html',
                controller: 'editTargetAlarmCtrl',
                inputs: { 
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/TerminalPeopleRelationAction!getDispatchPage.action',{
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
                controller: 'deleteTargetAlarmCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/TerminalPeopleRelationAction!getDispatchPage.action',{
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
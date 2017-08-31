var roleManageModule = angular.module('roleManageModule', ['gridModule']);
roleManageModule.controller('roleManageCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
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
	        { field: 'name',displayName: '角色',maxWidth:600,minWidth:300 },
	        { field: 'isDefaultRole',displayName: '是否为缺省角色',maxWidth:600,minWidth:300 },
	        { field: 'describle',displayName: '备注',maxWidth:600,minWidth:300 }
	    ]
	};

	$scope.promise = gridServices.promiseDefault('/system/roleAction!listRole.action');

	$scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
                name : $scope.role.name,
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
            $scope.gridOptions.data = resp.data.rows;
            for(var i=0; i<$scope.gridOptions.data.length; i++){
                if($scope.gridOptions.data[i]['isDefaultRole'] == true){
                    $scope.gridOptions.data[i]['isDefaultRole'] = '是';
                }else{
                    $scope.gridOptions.data[i]['isDefaultRole'] = '否';
                }
            }
		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

    $scope.role = { name : '' };

    $scope.search = function(){        
        var obj = {
            name : $scope.role.name,
            page : 1, 
            rows : 20,
            sort : 'id',
            order: 'desc'
        };

        $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {name : $scope.role.name};
        document.location.href = gridServices.exportAction('/system/roleAction!exportExcel.action',obj);
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
});

roleManageModule.controller('roleManageModalCtrl',function($scope, ModalService, gridServices){

	$scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteRoleCtrl',
                inputs: { // 将$scope.rows以参数名rows注入到 deleteUserCtrl
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
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

    $scope.add = function() {
        ModalService.showModal({
            templateUrl: 'modals/roleManage/add.html',
            controller: 'addRoleCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) { 
                //result 是addUserCtrl 控制器 在关闭后带过来的数据                
                $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
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
                templateUrl: 'modals/roleManage/edit.html',
                controller: 'editRoleCtrl',
                inputs: {  // 将$scope.row以参数名row注入到 editUserCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
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

    $scope.powerManage = function(){
        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/roleManage/powerManage.html',
                controller: 'powerManageCtrl',
                inputs: {  // 将$scope.row以参数名row注入到 editUserCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
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

    $scope.menuManage = function(){

        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/roleManage/menuManage.html',
                controller: 'menuManageCtrl',
                inputs: {  // 将$scope.row以参数名row注入到 editUserCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/system/roleAction!listRole.action',{
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

});
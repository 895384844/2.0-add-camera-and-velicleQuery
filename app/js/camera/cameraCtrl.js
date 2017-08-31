var cameraModule = angular.module('cameraModule', ['gridModule']);

cameraModule.controller('cameraCtrl',function($scope, $http, ModalService, gridServices){
	
	
	$http({
        url:'/query/cameraAction!listCamera.action',
        method:'POST'
    }).then(function(resp){
        $scope.groupArray = resp.data;
    });

    $scope.camera = {
        name : '',
        ip : ''
    };

    $scope.domainId = '';
	
    $http.post('/system/scopeAction!listScope.action').then(function(resp){
        $scope.roleList = resp.data;
    });

    $http({
		url:'/query/cameraAction!getCameraAddr.action',
		method:'POST'
	}).then(function(resp){
        $scope.cameraList = resp.data;
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
        rowHeight : 35
    };

    $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',{
        page: 1,
        rows: 20,
        sort: 'name',
        order: 'desc'
    });

    var str = "'hidden'";
    var green = "'btnGreen'";
    var gray = "'btnGray'";

    $scope.gridOptions.columnDefs = [
        { field: 'name',displayName: '设备地址'},
        { field: 'ip',displayName: '设备IP'},
        { field: 'port',displayName: '设备端口号'},
        { field: 'serverIp',displayName: '服务器IP'},
        { field: 'serverPort',displayName: '服务器端口号'},
        { field: 'laneNumber',displayName: '车道号'}       
    ];

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',{
                name : $scope.camera.name,
                ip : $scope.camera.ip,
                page: newPage,
                rows: pageSize,
                sort: 'name',
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

            var list = resp.data.rows;

            $scope.gridOptions.data = list;
            
            $http({
				url:'/query/cameraAction!getCameraAddr.action',
				method:'POST'
			}).then(function(resp){
		        $scope.cameraList = resp.data;
			});
		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

    $scope.search = function(){

        var obj = {
        	name : $scope.camera.name,
        	ip : $scope.camera.ip,
            page : 1,//当前页
            rows : 20,//当前每页显示数量
            sort : 'name',
            order: 'desc'
        };

        $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);

    };

    $scope.camera_downLoad = function(){    	
    	document.location.href = gridServices.exportAction('/system/downloadAction!downloadCameraTemplate.action');

	};

});

cameraModule.controller('cameraModalCtrl',function($scope, $http, $interval, usSpinnerService, ModalService, gridServices){
	
	$scope.edit = function(){
        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/camera/edit.html',
                controller: 'editCameraCtrl',
                inputs: { // 将$scope.row以参数名row注入到 editCameraCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'name',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }
    };

	$scope.add = function() {
        ModalService.showModal({
            templateUrl: 'modals/camera/add.html',
            controller: 'addCameraCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) { 
            	$http({
			        url:'/query/cameraAction!listCamera.action',
			        method:'POST'
			    }).then(function(resp){
			        $scope.groupArray = resp.data;
			    });
                //result 是addUserCtrl 控制器 在关闭后带过来的数据     
                $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'name',
                    order: 'desc'
                });                
                $scope.getPage($scope.promise);
				
            });
        });
    };

    $scope.delete = function() {
        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteCameraCtrl',
                inputs: { // 将$scope.rows以参数名rows注入到 deleteUserCtrl
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/cameraAction!listCamera.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'name',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条删除！');
        }

    };
    $scope.import = function(){
        ModalService.showModal({
            templateUrl: 'modals/camera/import.html',
            controller: 'importCameraCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {
                $scope.promise = gridServices.promiseDefault('/query/cameraAction!addCameraByExcel.action');
                $scope.getPage($scope.promise);
            });
        });
    };
});
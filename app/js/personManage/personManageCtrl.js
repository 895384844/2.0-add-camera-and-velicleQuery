var personManageModule = angular.module('personManageModule', ['gridModule']);
personManageModule.controller('personManageCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
    
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
	        { field: 'peopleName',displayName: '人员名称',maxWidth:400,minWidth:200 },
	        { field: 'sex',displayName: '性别',maxWidth:400,minWidth:200 },
	        { field: 'status',displayName: '身份',maxWidth:400,minWidth:200 },
	        { field: 'contactTel',displayName: '电话号码',maxWidth:400,minWidth:200 },
	        { field: 'email',displayName: '电子邮箱',maxWidth:400,minWidth:200 }
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/query/PeopleAction!getPeople.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/PeopleAction!getPeople.action',{
                peopleName : $scope.select.name,
                contactTel : $scope.select.phone,
                email : $scope.select.mail,
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

    $scope.select = {
        name : '',
        phone : '',
        mail : ''
    };

    $scope.search = function(){
        $scope.promise = gridServices.promiseNew('/query/PeopleAction!getPeople.action',{
            peopleName : $scope.select.name,
            contactTel : $scope.select.phone,
            email : $scope.select.mail,
            page: 1,
            rows: 20
        });
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            peopleName : $scope.select.name,
            contactTel : $scope.select.phone,
            email : $scope.select.mail
        };
        document.location.href = gridServices.exportAction('/query/PeopleAction!exportExcel.action',obj);
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
            templateUrl: 'modals/personManage/add.html',
            controller: 'addPersonCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {                
                $scope.promise = gridServices.promiseNew('/query/PeopleAction!getPeople.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20
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
                templateUrl: 'modals/personManage/edit.html',
                controller: 'editPersonCtrl',
                inputs: {
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {                
                    $scope.promise = gridServices.promiseNew('/query/PeopleAction!getPeople.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20
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
                controller: 'deletePersonCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {                
                    $scope.promise = gridServices.promiseNew('/query/PeopleAction!getPeople.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条删除！');
        }
    };

});
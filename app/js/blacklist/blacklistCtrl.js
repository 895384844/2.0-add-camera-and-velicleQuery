var blacklistModule = angular.module('blacklistModule', ['gridModule']);
blacklistModule.controller('blacklistCtrl',function($scope, $http, $filter,gridServices, httpServices, ModalService){
    
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
	        { field: 'name',displayName: '姓名',maxWidth:600,minWidth:200 },
	        { field: 'imei',displayName: 'IMEI',maxWidth:600,minWidth:200 },
	        { field: 'imsi',displayName: 'IMSI/MAC',maxWidth:600,minWidth:200 }
         //    ,
	        // { field: 'blacklist',displayName: '黑名单' }
	    ]
    };

    $scope.promise = gridServices.promiseDefault('/query/TerminalAction!getEditTerminalPage.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/TerminalAction!getEditTerminalPage.action',{
                name : $scope.blacklist.name,
                imsi : $scope.blacklist.imsi,
                imei : $scope.blacklist.imei,
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
            var list = resp.data.rows;
            for(var i=0; i<list.length; i++){
                if(list[i]['isblacklist'] == true){
                    list[i]['blacklist'] = '是';
                }else{
                    list[i]['blacklist'] = '否';
                }
            }
            $scope.gridOptions.data = list;
		});
        $scope.rows = null;
	};

    $scope.getPage($scope.promise);

    $scope. blacklist = {
        name : '',
        imei : '',
        imsi : ''
    };

    $scope.search = function(){
        var obj = {
            name : $scope.blacklist.name,
            imsi : $scope.blacklist.imsi,
            imei : $scope.blacklist.imei,
            page : 1,
            rows : 20
        };

        $scope.promise = gridServices.promiseNew('/query/TerminalAction!getEditTerminalPage.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var obj = {
            name : $scope.blacklist.name,
            imsi : $scope.blacklist.imsi,
            imei : $scope.blacklist.imei
        };
        document.location.href = gridServices.exportAction('/query/TerminalAction!exportExcel.action',obj);
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
            templateUrl: 'modals/blacklist/add.html',
            controller: 'addBlacklistCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {                
                $scope.promise = gridServices.promiseNew('/query/TerminalAction!getEditTerminalPage.action',{
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
                templateUrl: 'modals/blacklist/edit.html',
                controller: 'editBlacklistCtrl',
                inputs: { 
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/TerminalAction!getEditTerminalPage.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }
    };

    $scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteBlacklistCtrl',
                inputs: { 
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('/query/TerminalAction!getEditTerminalPage.action',{
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
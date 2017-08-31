var userManageModule = angular.module('userManageModule', ['gridModule']);

userManageModule.controller('userManageCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){

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
    
    $scope.promise = gridServices.promiseDefault('system/userAction!listUser.action');

	$scope.gridOptions.columnDefs = [
        { field: 'account',displayName: '用户名',maxWidth:300,minWidth:100 },
        { field: 'name',displayName: '真实姓名',maxWidth:300,minWidth:100 },
        { field: 'male',displayName: '性别',maxWidth:300,minWidth:100 },
        { field: 'mobile',displayName: '手机',maxWidth:300,minWidth:100 },
        { field: 'email',displayName: '电子邮箱',maxWidth:300,minWidth:100 },
        { field: 'isLocked',displayName: '账号状态',maxWidth:300,minWidth:100 },
        { field: 'describle',displayName: '备注',maxWidth:300,minWidth:100 }
    ]

	$scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
                account: $scope.user.account, 
                name : $scope.user.name,
                male : $scope.user.male,
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
                if($scope.gridOptions.data[i]['male'] == 1){
                    $scope.gridOptions.data[i]['male'] = '男';
                }else{
                    $scope.gridOptions.data[i]['male'] = '女';
                }
                if($scope.gridOptions.data[i]['isLocked'] == 1){
                    $scope.gridOptions.data[i]['isLocked'] = '锁定';
                }else{
                    $scope.gridOptions.data[i]['isLocked'] = '正常';
                }
            }
           
		});
        $scope.rows = null;
	}; 

	$scope.getPage($scope.promise);

    $scope.user = {
        account :'',
        name : '',
        male : ''
    };

    $scope.search = function(){
        
        if($scope.user.male == '男'){
            $scope.user.male = 1;
        }else if($scope.user.male == '女'){
            $scope.user.male = 2;
        }else{
            $scope.user.male = '';
        }

        var obj = {
            account: $scope.user.account, 
            name : $scope.user.name,
            male : $scope.user.male,
            page : 1, 
            rows : 20,
            sort : 'id',
            order: 'desc'
        };
        
        $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        if($scope.user.male == '男'){
            $scope.user.male = 1;
        }else if($scope.user.male == '女'){
            $scope.user.male = 2;
        }else{
            $scope.user.male = '';
        }

        var obj = {
            account: $scope.user.account, 
            name : $scope.user.name,
            male : $scope.user.male
        };

        document.location.href = gridServices.exportAction('/system/userAction!exportExcel.action',obj);

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
    $scope.clear = function(){
        $scope.user = {
            account : null,
            name : null,
            male : null
        };
    };

});

userManageModule.controller('userManageModalCtrl',function($scope, $http, ModalService, gridServices){

    $scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteUserCtrl',
                inputs: { // 将$scope.rows以参数名rows注入到 deleteUserCtrl
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
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
            templateUrl: 'modals/userManage/add.html',
            controller: 'addUserCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) { 
                //result 是addUserCtrl 控制器 在关闭后带过来的数据                
                $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
    };

    $scope.resetPsw = function() {

        if( $scope.rows != null && $scope.rows.length > 0){
            ModalService.showModal({
                templateUrl: 'modals/userManage/resetpsw.html',
                controller: 'resetPswCtrl',
                inputs: { // 将$scope.rows以参数名rows注入到 deleteUserCtrl
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条处理！');
        }

    };

    $scope.edit = function(){
        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/userManage/edit.html',
                controller: 'editUserCtrl',
                inputs: { // 将$scope.row以参数名row注入到 editUserCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
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

    $scope.role = function(){
        if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/userManage/role.html',
                controller: 'userRoleCtrl',
                inputs: {
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
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

	$scope.unLock = function(){
        if( $scope.rows != null && $scope.rows.length >0){
            var ids = [];
            var list = $scope.rows;
            for(var i=0; i<list.length; i++){
                ids.push(list[i]['id']);
            }
            $http({
                url:'/system/userAction!unlockPwd.action',
                method:'POST',
                params:{ ids : ids.join()}   
            }).then(function(resp){
            	if(resp.data.status == 'success'){
            		 $scope.promise = gridServices.promiseNew('system/userAction!listUser.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
            		alert('解锁成功！');
            	}else{
            		alert('解锁失败！');
            	}
            });
            
        }else{
            alert('请至少选择一条处理！');
        }
    };

});
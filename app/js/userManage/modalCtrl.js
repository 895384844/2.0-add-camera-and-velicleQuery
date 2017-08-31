var modalModule = angular.module('modalModule', []);

modalModule.controller('deleteUserCtrl',function($scope, $http, rows ,close){
	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/system/userAction!deleteUser.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
		}).then(function(resp){
			if(resp.data.msg == 'ok'){
				var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('删除失败！');
			}			
		});

	}

	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('addUserCtrl',function($scope, $http, httpServices, close){

    $scope.name = $scope.psw = $scope.realName = $scope.genderselected = 
    $scope.tel  =  $scope.mail = $scope.desc = null; 

    $scope.checkName = function(){
    	$http({
            method : 'POST',
            url : '/system/userAction!checkAccount.action',
            params : {
                account: $scope.name
            }
        }).then(function(resp){
            if(resp.data.status == 'failed'){
               alert(resp.data.info); 
            }
        });
    };

    $scope.checkPsw = function(){
    	$http({
            method : 'POST',
            url : '/system/userAction!checkPwd.action',
            params : {
                password: $scope.psw
            }
        }).then(function(resp){
            if(resp.data.status == 'failed'){
               alert(resp.data.info); 
            }
        });
    };

    $scope.sure = function(){  

        var obj = {
            enable : String(1),
            account : $scope.name,
            password : $scope.psw,
            name : $scope.realName,
            male : String($scope.genderselected == '男' ? 1 : 2),
            mobile : $scope.tel,
            email : $scope.mail,
            describle : $scope.desc
        };

        httpServices.promise('/system/userAction!addUser.action', obj ).then(function(resp){
         
			if(resp.data.flag === 'true'){
                var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('该用户已经存在！');
			}
			
		});
    };

	$scope.clear = function(){
    	$scope.name = $scope.psw = $scope.realName = $scope.genderselected = 
    	$scope.tel = $scope.mail = $scope.desc = null;
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('resetPswCtrl',function($scope, $http, rows, close){
    $scope.sure = function(){
    	var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/system/userAction!resetPassword.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
		}).then(function(resp){
			if(resp.data.status == 'success'){
				var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('重置密码失败！');
			}			
		});
    }

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('editUserCtrl',function($scope, $http, httpServices, row, close){
    
	$scope.name = row.account;
    $scope.realName = row.name;
    $scope.mail = row.email;
    $scope.desc = row.describle;
    $scope.genderselected = row.male;
    $scope.tel = row.mobile;

    $scope.checkName = function(){
    	$http({
            method : 'POST',
            url : '/system/userAction!checkAccount.action',
            params : {
                account: $scope.name
            }
        }).then(function(resp){
            if(resp.data.status == 'failed'){
               alert(resp.data.info); 
            }
        });
    };

    $scope.sure = function(){

        var obj = {
            enable : String(1),
            id : row.id,
            account : $scope.name,
            password : row.password,
            name : $scope.realName,
            male : String($scope.genderselected == '男' ? 1 : 2),
            mobile : $scope.tel,
            email : $scope.mail,
            describle : $scope.desc
        };

        httpServices.promise('/system/userAction!updateUser.action', obj ).then(function(resp){
		
			if(resp.data.flag){
				var result = '我是要带过去的数据！';
			    close(result,500); 
			}else{
                alert('编辑失败！！');
			}
		});

    };

	$scope.clear = function(){
    	$scope.name = $scope.psw = $scope.realName = $scope.genderselected = 
    	$scope.tel = $scope.mail = $scope.desc = null;
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('userRoleCtrl',function($scope, $http, $timeout, row, close){

    $scope.paginationOptions = {
		pageNumber: 1,
		pageSize: 10,
		sort: null
    };

	$scope.gridOptions_role = {
		paginationPageSizes: [10, 20, 30],
		paginationPageSize: 10,
		useExternalPagination: true,
		enableSorting: true,
		enableColumnResize: true,
		multiSelect: true,
		rowHeight : 35,
		columnDefs : [
	        { field: 'name',displayName: '角色名称' },
	        { field: 'describle',displayName: '描述' }
	    ]
	};

	$scope.promise = $http({
			url:'/system/userAction!listUserRole.action',
			method:'POST',
			params: {
		        id : row['id'],
                page : 1,
                rows : 10
            }
		});

	$scope.gridOptions_role.onRegisterApi = function(gridApi){
        
        $scope.gridApi = gridApi;

        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            var rows = gridApi.selection.getSelectedRows();

            $scope.ids = [];
	        for(var i=0; i<rows.length; i++){
	            $scope.ids.push(rows[i]['id']);
	        }
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            var rows = gridApi.selection.getSelectedRows();

            $scope.ids = [];
            for(var i=0; i<rows.length; i++){
                $scope.ids.push(rows[i]['id']);
            }
        });
	};

	function getPage(promise){
		promise.then(function(resp){

            $scope.gridOptions_role.totalItems = resp.data.total;
            $scope.gridOptions_role.data = resp.data.rows;
            //添加选中的行
            $timeout(function() {
            	if($scope.gridApi.selection.selectRow){
	                for(var i=0; i<$scope.gridOptions_role.data.length; i++){
	                	if($scope.gridOptions_role.data[i]['ck'] == 'true'){
	                   	    $scope.gridApi.selection.selectRow($scope.gridOptions_role.data[i]);
	                   };
	                }
	            } 
            }); 

		});
        rows = null;
	};

	getPage($scope.promise);


    $scope.sure = function(){

    	var obj = {
    		'model.id' : row['id'],
            'model.ids' :$scope.ids.join()
    	};

    	$http({  
			url:'/system/userAction!saveUserRole.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.msg == 'ok'){
				var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('编辑角色失败！！');
			}			
		});
        
    };
	$scope.close = function(result) {
 	    close(result, 500); 
    };
});
modalModule.controller('downLoadCtrlUserManage',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});

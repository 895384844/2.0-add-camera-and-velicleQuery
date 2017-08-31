modalModule.controller('deleteRoleCtrl',function($scope, $http, rows ,close){
	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/system/roleAction!deleteRole.action',
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

modalModule.controller('addRoleCtrl',function($scope, httpServices, close){
	$scope.role = {
        name : '',
        isDefaultRole : false,
        desc : ''
	};

    $scope.sure = function(){
    	var obj = {
    		enable : 1, 
			name : $scope.role.name,
			isDefaultRole : $scope.role.isDefaultRole,
			describle : $scope.role.desc
    	};   

    	httpServices.promise('/system/roleAction!addRole.action',obj).then(function(resp){
			if(resp.data.flag == true){
                var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('该角色已经存在！');
			}	
		});
    };

	$scope.clear = function(){
    	$scope.role = {
            name : null,
            isDefaultRole : null,
            desc : null
    	};
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('editRoleCtrl',function($scope, httpServices, row, close){
   
	$scope.role = {
		name : row.name,
		isDefaultRole : row.isDefaultRole == '是' ? true : false,
		desc : row.describle
	};

    $scope.sure = function(){
        var obj = {
            id : row['id'],
			enable : 1,
			name : $scope.role.name,
			isDefaultRole : $scope.role.isDefaultRole,
			describle : $scope.role.desc
        };

		httpServices.promise('/system/roleAction!updateRole.action',obj).then(function(resp){

			if(resp.data.flag){
				var result = '我是要带过去的数据！';
			    close(result,500); 
			}else{
                alert('编辑失败！！');
			}
		});

    };

	$scope.clear = function(){
    	$scope.role = {
            name : null,
            isDefaultRole : null,
            desc : null
    	};
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('powerManageCtrl',function($scope, $http, $timeout, row, close){

    $scope.gridOptions2 = {
		multiSelect: true,
		showTreeExpandNoChildren: true,
		rowHeight : 35,
		columnDefs : [
	        { field: 'name',displayName: '权限名称' },
	        { field: 'memo',displayName: '描述' }
	    ]
	};

	$scope.promise = $http({
		url:'/system/roleAction!listRoleResource.action',
		method:'POST',
		params: {
		    id : row['id'],
            sort : 'id',
            order : 'desc'
        }
	});

	$scope.gridOptions2.onRegisterApi = function(gridApi){
        
        $scope.gridApi = gridApi;

        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(row){

        	if( row.isSelected === true){
            	if(row.treeLevel !== 0){  // 子带父选择事件
                    var parentRow = row.treeNode.parentRow;

	            	parentRow.setSelected(function (selected) {
			            if (selected !== this.isSelected) {
			                this.isSelected = selected;
			           }
			        });
			        parentRow.isSelected = true;
            	}else{ //父带子事件

                    var childrenRows = row.treeNode.children;

                    for(var i=0; i<childrenRows.length; i++){
                        var childrenRow = childrenRows[i]['row'];

                        childrenRow.setSelected(function (selected) {
					        if (selected !== this.isSelected) {
					            this.isSelected = selected;
					        }
					    });
					    childrenRow.isSelected = true;                     
                    }
            	}
            }else{
            	if(row.treeLevel == 0){ // 父菜单反选事件
                    var childrenRows = row.treeNode.children;
                    for(var i=0; i<childrenRows.length; i++){
                        var childrenRow = childrenRows[i]['row'];

                        childrenRow.setSelected(function (selected) {
					        if (selected !== this.isSelected) {
					            this.isSelected = selected;
					        }
					    });
					    childrenRow.isSelected = false;                     
                    }
            	}
            }

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

		    //添加树结构
            var data = resp.data;

            var writeoutNode = function( childArray, currentLevel, dataArray ){

			    childArray.forEach( function( childNode ){
				    if ( childNode.children.length >= 0 ){
				        childNode.$$treeLevel = currentLevel;
				    }
				    dataArray.push( childNode );
				    writeoutNode( childNode.children, currentLevel + 1, dataArray );
			    });
			};

            $scope.gridOptions2.data = [];
            writeoutNode( data, 0, $scope.gridOptions2.data);

            //添加选中的行
            $timeout(function() {
            	if($scope.gridApi.selection.selectRow){

	                $scope.gridApi.grid.rows.map(function(row){
	                	var ckStatus = row.entity;
                        if(ckStatus.ck == 'true'){
                        	row.isSelected = true; 
                        }
                        if(ckStatus.ck != 'true'){
                        	row.isSelected = false; 
                        }
	                });     	

	            } 
            });

		});
        rows = null;
	};

	getPage($scope.promise);


    $scope.sure = function(){
        var obj = {
    		'model.id' : row['id'],
            'model.ids' :!!$scope.ids? $scope.ids.join() : ''
    	};

    	$http({  
			url:'/system/roleAction!saveRoleResource.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.msg == 'ok'){
				var result = '我是带过去的数据！！';
			    close(result,500); 
			}else{
                alert('权限分配失败！！');
			}			
		});
    };
	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('menuManageCtrl',function($scope, $http, $interval, $timeout, uiGridTreeViewConstants, row, close){

    $scope.gridOptions3 = {
		multiSelect: true,
		showTreeExpandNoChildren: true,
		rowHeight : 35,
		columnDefs : [
	        { field: 'name',displayName: '菜单名称' },
	        { field: 'desc',displayName: '描述' }
	    ]
	};

	$scope.promise = $http({
		url:'/system/roleAction!listRoleMenu.action',
		method:'POST',
		params: {
		    id : row['id'],
            sort : 'id',
            order : 'desc'
        }
	});

	$scope.gridOptions3.onRegisterApi = function(gridApi){
        
        $scope.gridApi = gridApi;

        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(row){

        	if( row.isSelected === true){
            	if(row.treeLevel !== 0){  // 子带父选择事件
                    var parentRow = row.treeNode.parentRow;

	            	parentRow.setSelected(function (selected) {
			            if (selected !== this.isSelected) {
			                this.isSelected = selected;
			           }
			        });
			        parentRow.isSelected = true;
            	}else{ //父带子事件

                    var childrenRows = row.treeNode.children;

                    for(var i=0; i<childrenRows.length; i++){
                        var childrenRow = childrenRows[i]['row'];

                        childrenRow.setSelected(function (selected) {
					        if (selected !== this.isSelected) {
					            this.isSelected = selected;
					        }
					    });
					    childrenRow.isSelected = true;                     
                    }
            	}
            }else{
            	if(row.treeLevel == 0){ // 父菜单反选事件
                    var childrenRows = row.treeNode.children;
                    for(var i=0; i<childrenRows.length; i++){
                        var childrenRow = childrenRows[i]['row'];

                        childrenRow.setSelected(function (selected) {
					        if (selected !== this.isSelected) {
					            this.isSelected = selected;
					        }
					    });
					    childrenRow.isSelected = false;                     
                    }
            	}
            }

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

            //添加树结构
            var data = resp.data;

            var writeoutNode = function( childArray, currentLevel, dataArray ){

			    childArray.forEach( function( childNode ){
				    if ( childNode.children.length >= 0 ){
				        childNode.$$treeLevel = currentLevel;
				    }
				    dataArray.push( childNode );
				    writeoutNode( childNode.children, currentLevel + 1, dataArray );
			    });
			};

            $scope.gridOptions3.data = [];
            writeoutNode( data, 0, $scope.gridOptions3.data);

            //添加选中的行

            $timeout(function() {
            	if($scope.gridApi.selection.selectRow){

	                $scope.gridApi.grid.rows.map(function(row){
	                	var ckStatus = row.entity;
                        if(ckStatus.ck == 'true'){
                        	row.isSelected = true; 
                        }
                        if(ckStatus.ck != 'true'){
                        	row.isSelected = false; 
                        }
	                });     	

	            } 
            });
		});

        rows = null;
	};

	getPage($scope.promise);

    $scope.sure = function(){
    	
        var obj = {
    		'model.id' : row['id'],
            'model.ids' : !!$scope.ids? $scope.ids.join() : ''
    	};

    	$http({  
			url:'/system/roleAction!saveRoleMenu.action',
			method:'POST',
			params:obj
		}).then(function(resp){
			if(resp.data.msg){
			    close(null,500); 
			}else{
                alert('菜单分配失败！！');
			}			
		});
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };


});
modalModule.controller('downLoadCtrlRoleManage',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
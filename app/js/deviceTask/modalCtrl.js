modalModule.controller('deleteTaskCtrl',function($scope, $http, rows ,close){

	$scope.sure = function(){	
        var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }	
		
        $http({  
			url:'/device/deviceBus!delBus.action',
			method:'POST',
			params:{ 'dids' : ids.join()}
		}).then(function(resp){
			if(resp.data.status == 'success'){
			    close(null,500); 
			}else{
                alert('删除失败！');
			}			
		});

	};

	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('resultCtrl',function($scope, $http, row ,close,ModalService,gridServices){

    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };

	$scope.gridOptions_result = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'result',displayName: '执行结果',width: 100,maxWidth:120,minWidth:80 },
            { field: 'atime',displayName: '执行时间',width: 130,maxWidth:150,minWidth:80 },
            { field: 'cause',displayName: '失败原因',width: 100,maxWidth:120,minWidth:80 },
            { field: 'ctime',displayName: '完成时间',width: 130,maxWidth:150,minWidth:80 }
        ]
    };	

    $scope.promise = $http({  
		url:'/device/deviceBus!listBusResult.action',
		method:'POST',
		params:{ 'id' : row.id}
    });

    $scope.gridOptions_result.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = $http({  
                url:'/device/deviceBus!listBusResult.action',
                method:'POST',
                params:{ 
                    'id' : row.id,
                    page: newPage,
                    rows: pageSize,
                    sort: 'id',
                    order: 'desc'
                }
            });

	        $scope.getPage($scope.promise);
        });
	};

	$scope.getPage = function(promise){

		promise.then(function(resp){

            $scope.gridOptions_result.totalItems = resp.data.total;
            
            var list = resp.data.rows;
            for(var i=0; i<list.length; i++){
                if(list[i]['result']==1){
                    list[i]['result'] = '执行失败';
                }else{
                    list[i]['result'] = '执行成功';
                }

                if(list[i]['cause']=='Time out for waiting to response.'){
                    list[i]['cause'] = '连接超时';
                }
            }

            $scope.gridOptions_result.data = list;

		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

	$scope.close = function(result) {
 	    close(result,500); 
    };
});
modalModule.controller('downLoadCtrlDeviceTask',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
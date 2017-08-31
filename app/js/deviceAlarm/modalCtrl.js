modalModule.controller('deleteDeviceAlarmCtrl',function($scope, $http, rows ,close){


	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/query/DevicePeopleRelationAction!delete.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
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

modalModule.controller('addDeviceAlarmCtrl',function($scope, $http, httpServices, close,ModalService,gridServices){

	$scope.forward = { 
        deviceName : '',
        peopleNames : '',
        deviceId : '',
        peopleIds : ''
	};

	$scope.device = {
		name : '',
        number : ''
	};

	$scope.people = {
		name : '',
		phone : '',
        email : ''
	};

	$scope.selDevice = { show : false };
	$scope.selPeople = { show : false };

	$scope.deviceShow = function(){
		$scope.selDevice.show = true;
		$scope.selPeople.show = false;
	};
	$scope.peopleShow = function(){
		$scope.selDevice.show = false;
		$scope.selPeople.show = true;
	};

    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };

	$scope.gridOptions_device = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        multiSelect: false,
        rowHeight : 35,
        columnDefs : [
            { field: 'identity',displayName: '标识',maxWidth:300,minWidth:100 },
            { field: 'name',displayName: '设备名称',maxWidth:300,minWidth:100 },
            { field: 'number',displayName: '设备编号',maxWidth:300,minWidth:100 },
            { field: 'address',displayName: '设备地址',maxWidth:300,minWidth:100 },
            { field: 'memo',displayName: '备注',maxWidth:300,minWidth:100 }
        ]
    };	

    $scope.promise_device = $http({  
		url:'/device/deviceAction!getScopeDevice.action',
		method:'POST',
		params: {
			page: 1,
            rows: 10,
            sort: 'id',
            order: 'desc'
		}
    });

    $scope.gridOptions_device.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise_device = $http({  
				url:'/device/deviceAction!getScopeDevice.action',
				method:'POST',
				params: {
                    name : $scope.device.name,
                    number : $scope.device.number,
					page: newPage,
                    rows: pageSize,
                    sort: 'id',
                    order: 'desc' 
				}
		    });

	        $scope.getPage1($scope.promise_device);
        });
        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            $scope.row = $scope.rows[0];
            $scope.forward.deviceName = $scope.row.name;
            $scope.forward.deviceId = $scope.row.identity;
        });
	};

	$scope.getPage1 = function(promise){

		promise.then(function(resp){
            $scope.gridOptions_device.totalItems = resp.data.total;
            $scope.gridOptions_device.data = resp.data.rows;

		});
        $scope.rows = null;
	};

	$scope.getPage1($scope.promise_device);

	$scope.gridOptions_people = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        multiSelect: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'id',displayName: '标识',maxWidth:250,minWidth:100 },
            { field: 'peopleName',displayName: '人员名称',maxWidth:250,minWidth:100 },
            { field: 'sex',displayName: '人员性别',maxWidth:250,minWidth:100 },
            { field: 'contactTel',displayName: '手机号码',maxWidth:250,minWidth:100 },
            { field: 'email',displayName: 'Email',maxWidth:250,minWidth:100},
            { field: 'status',displayName: '身份',maxWidth:250,minWidth:100 }
        ]
    };	

    $scope.promise_people = $http({  
		url:'/query/PeopleAction!getPeopleByDevice.action',
		method:'POST',
		params: {
			page: 1,
            rows: 10,
            sort: 'id',
            order: 'desc'
		}
    });

    $scope.gridOptions_people.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise_people = $http({  
				url:'/query/PeopleAction!getPeopleByDevice.action',
				method:'POST',
				params: {
                    peopleName : $scope.people.name,
                    contactTel : $scope.people.phone,
                    email : $scope.people.email,
					page: newPage,
                    rows: pageSize,
                    sort: 'id',
                    order: 'desc' 
				}
		    });

	        $scope.getPage2($scope.promise_people);
        });
        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            //$scope.row = $scope.rows[0];
            var nameStr = '';
            var idStr = ''
            for(var i=0; i<$scope.rows.length; i++){
                nameStr = nameStr + ', ' + $scope.rows[i].peopleName;
                idStr = idStr + ',' + $scope.rows[i].id;
            }
            $scope.forward.peopleNames = nameStr.substring(1);
            $scope.forward.peopleIds = idStr.substring(1);
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            $scope.rows = gridApi.selection.getSelectedRows();
            var nameStr = '';
            var idStr = ''
            for(var i=0; i<$scope.rows.length; i++){
                nameStr = nameStr + ', ' + $scope.rows[i].peopleName;
                idStr = idStr + ',' + $scope.rows[i].id;
            }
            $scope.forward.peopleNames = nameStr.substring(1);
            $scope.forward.peopleIds = idStr.substring(1);
        });
	};

	$scope.getPage2 = function(promise){

		promise.then(function(resp){
            $scope.gridOptions_people.totalItems = resp.data.total;
            $scope.gridOptions_people.data = resp.data.rows;

		});
        $scope.rows = null;
	};

	$scope.getPage2($scope.promise_people);

	$scope.searchDevice = function(){
		var obj = {
			name : $scope.device.name,
            number : $scope.device.number,
			page : 1, 
            rows : 10
		};
		$scope.promise_device = httpServices.promise('/device/deviceAction!getScopeDevice.action',obj);
	    $scope.getPage1($scope.promise_device);
	};

	$scope.searchPeople = function(){
		var obj = {
			peopleName : $scope.people.name,
            contactTel : $scope.people.phone,
            email : $scope.people.email,
			page : 1, 
            rows : 10
		};
		$scope.promise_people = httpServices.promise('/query/PeopleAction!getPeopleByDevice.action',obj);
	    $scope.getPage2($scope.promise_people);
	};


	$scope.sure = function(){

		var obj = {
			deviceId : $scope.forward.deviceId,
			peopleId : $scope.forward.peopleIds
		};

		httpServices.promise('/query/DevicePeopleRelationAction!add.action',obj)
		.then(function(resp){
            if (resp.data.result == 'SUCCESS') {
                close(null,500); 
            }else{
            	alert(resp.data.info);
            }
		});

	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };

});

modalModule.controller('editDeviceAlarmCtrl',function($scope, $http, $timeout, httpServices, row, close){

    $scope.forward = {
        deviceName : row.name,
        peopleNames : row.peopleName
    };

    $scope.people = {
        name : '',
        phone : '',
        email : ''
    };

    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };

    $scope.gridOptions = {
        enableRowSelection: true,
        enableSelectAll: true,
        selectionRowHeaderWidth: 35,
        rowHeight: 35,
        showGridFooter:true
    };

    $scope.gridOptions_people = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        multiSelect: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'id',displayName: '标识' },
            { field: 'peopleName',displayName: '人员名称' },
            { field: 'sex',displayName: '人员性别' },
            { field: 'contactTel',displayName: '手机号码' },
            { field: 'email',displayName: 'Email' },
            { field: 'status',displayName: '身份' }
        ]
    };  

    $scope.promise_people = $http({  
        url:'/query/PeopleAction!getPeopleByDevice.action',
        method:'POST',
        params: {
            page: 1,
            rows: 10,
            sort: 'id',
            order: 'desc'
        }
    });

    $scope.gridOptions_people.onRegisterApi = function(gridApi){
        $scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise_people = $http({  
                url:'/query/PeopleAction!getPeopleByDevice.action',
                method:'POST',
                params: {
                    peopleName : $scope.people.name,
                    contactTel : $scope.people.phone,
                    email : $scope.people.email,
                    page: newPage,
                    rows: pageSize,
                    sort: 'id',
                    order: 'desc' 
                }
            });

            $scope.getPage($scope.promise_people);
        });
        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            var rows = gridApi.selection.getSelectedRows();
            //$scope.row = $scope.rows[0];
            var nameStr = '';
            var idStr = ''
            for(var i=0; i<$scope.rows.length; i++){
                nameStr = nameStr + ', ' + $scope.rows[i].peopleName;
                idStr = idStr + ',' + $scope.rows[i].id;
            }
            $scope.forward.peopleNames = nameStr.substring(1);
            $scope.forward.peopleIds = idStr.substring(1);
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            $scope.rows = gridApi.selection.getSelectedRows();
            var nameStr = '';
            var idStr = ''
            for(var i=0; i<$scope.rows.length; i++){
                nameStr = nameStr + ', ' + $scope.rows[i].peopleName;
                idStr = idStr + ',' + $scope.rows[i].id;
            }
            $scope.forward.peopleNames = nameStr.substring(1);
            $scope.forward.peopleIds = idStr.substring(1);
        });
    };

    $scope.getPage = function(promise){

        promise.then(function(resp){
            $scope.gridOptions_people.totalItems = resp.data.total;
            $scope.gridOptions_people.data = resp.data.rows;
            //添加选中的行
            $timeout(function() {
                if($scope.gridApi.selection.selectRow){
                    for(var i=0; i<$scope.gridOptions_people.data.length; i++){
                        if($scope.gridOptions_people.data[i]['id'] == row.peopleId ){
                            $scope.gridApi.selection.selectRow($scope.gridOptions_people.data[i]);
                       };
                    }
                } 
            }); 
        });
        $scope.rows = null;
    };

    $scope.getPage($scope.promise_people);

    $scope.searchPeople = function(){
        var obj = {
            peopleName : $scope.people.name,
            contactTel : $scope.people.phone,
            email : $scope.people.email,
            page : 1, 
            rows : 10
        };
        $scope.promise_people = httpServices.promise('/query/PeopleAction!getPeopleByDevice.action',obj);
        $scope.getPage($scope.promise_people);
    };

	$scope.sure = function(){
		var obj = {
            deviceId : row.deviceId,
            peopleId : $scope.forward.peopleIds,
            id : row.id
        };

        httpServices.promise('/query/DevicePeopleRelationAction!add.action',obj)
        .then(function(resp){
            if (resp.data.result == 'SUCCESS') {
                close(null,500); 
            }else{
                alert(resp.data.info);
            }
        });
	};

	$scope.close = function(result) {
 	    close(result, 500); 
    };

});
modalModule.controller('downLoadCtrlDeviceAlarm',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});

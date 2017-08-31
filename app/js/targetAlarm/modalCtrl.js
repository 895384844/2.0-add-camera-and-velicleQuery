modalModule.controller('deleteTargetAlarmCtrl',function($scope, $http, rows ,close){

 

	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/query/TerminalPeopleRelationAction!deleteDispatchByTerminal.action',
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

modalModule.controller('addTargetAlarmCtrl',function($scope, $http, httpServices, close,ModalService,gridServices){

	$scope.forward = { 
        terminalName : '',
        peopleNames : '',
        terminalId : '',
        peopleIds : ''
	};

	$scope.terminal = {
		name : '',
		imei : '',
		imsi : ''
	};

	$scope.people = {
		name : '',
		phone : ''
	};

	$scope.selTerminal = { show : false };
	$scope.selPeople = { show : false };

	$scope.terminaShow = function(){
		$scope.selTerminal.show = true;
		$scope.selPeople.show = false;
	};
	$scope.peopleShow = function(){
		$scope.selTerminal.show = false;
		$scope.selPeople.show = true;
	};

    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };

	$scope.gridOptions_terminal = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        multiSelect: false,
        rowHeight : 35,
        columnDefs : [
            { field: 'name',displayName: '姓名',maxWidth:300,minWidth:200 },
            { field: 'imsi',displayName: 'IMSI',maxWidth:300,minWidth:200 },
            { field: 'imei',displayName: 'IMEI',maxWidth:300,minWidth:200 }
        ]
    };	

    $scope.promise_terminal = $http({  
		url:'/query/TerminalAction!getEditTerminalPage.action',
		method:'POST',
		params: {
			page: 1,
            rows: 10,
            sort: 'id',
            order: 'desc'
		}
    });

    $scope.gridOptions_terminal.onRegisterApi = function(gridApi){ 
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise_terminal = $http({  
				url:'/query/TerminalAction!getEditTerminalPage.action',
				method:'POST',
				params: {
                    name : $scope.terminal.name,
                    imsi : String($scope.terminal.imsi),
                    imei : String($scope.terminal.imei),
					page: newPage,
                    rows: pageSize,
                    sort: 'id',
                    order: 'desc' 
				}
		    });

	        $scope.getPage1($scope.promise_terminal);
        });
        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            $scope.row = $scope.rows[0];
            $scope.forward.terminalName = $scope.row.name;
            $scope.forward.terminalId = $scope.row.id;
        });
	};

	$scope.getPage1 = function(promise){

		promise.then(function(resp){
            $scope.gridOptions_terminal.totalItems = resp.data.total;
            $scope.gridOptions_terminal.data = resp.data.rows;

		});
        $scope.rows = null;
	};

	$scope.getPage1($scope.promise_terminal);

	$scope.gridOptions_people = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        multiSelect: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'peopleName',displayName: '名称',maxWidth:250,minWidth:150 },
            { field: 'sex',displayName: '性别',maxWidth:250,minWidth:150 },
            { field: 'contactTel',displayName: '手机号码',maxWidth:250,minWidth:150 },
            { field: 'status',displayName: '身份',maxWidth:250,minWidth:150 }
        ]
    };	

    $scope.promise_people = $http({  
		url:'/query/PeopleAction!getPeopleByPolice.action',
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
				url:'/query/PeopleAction!getPeopleByPolice.action',
				method:'POST',
				params: {
                    peopleName : $scope.people.name,
                    contactTel : $scope.people.phone,
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

	$scope.searchTerminal = function(){
		var obj = {
			name : $scope.terminal.name,
			imsi : String($scope.terminal.imsi),
			imei : String($scope.terminal.imei),
			page : 1, 
            rows : 10
		};
		$scope.promise_terminal = httpServices.promise('/query/TerminalAction!getEditTerminalPage.action',obj);
	    $scope.getPage1($scope.promise_terminal); 
	};

	$scope.searchPeople = function(){
		var obj = {
			peopleName : $scope.people.name,
			contactTel : $scope.people.phone,
			page : 1, 
            rows : 10
		};
		$scope.promise_people = httpServices.promise('/query/PeopleAction!getPeopleByPolice.action',obj);
	    $scope.getPage2($scope.promise_people);
	};


	$scope.sure = function(){

		var obj = {
			terminalId : $scope.forward.terminalId,
			peopleIds : $scope.forward.peopleIds
		};

		httpServices.promise('/query/TerminalPeopleRelationAction!addDispatch.action',obj)
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

modalModule.controller('editTargetAlarmCtrl',function($scope, $http, $timeout, httpServices, row, close){

    $scope.forward = {
        terminalName : row.name,
        peopleNames : row.peopleName
    };

    $scope.people = {
        name : '',
        phone : ''
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
            { field: 'peopleName',displayName: '名称' },
            { field: 'sex',displayName: '性别' },
            { field: 'contactTel',displayName: '手机号码' },
            { field: 'status',displayName: '身份' }
        ]
    };  

    $scope.promise_people = $http({  
        url:'/query/PeopleAction!getPeopleByPolice.action',
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
                url:'/query/PeopleAction!getPeopleByPolice.action',
                method:'POST',
                params: {
                    peopleName : $scope.people.name,
                    contactTel : $scope.people.phone,
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
            page : 1, 
            rows : 10
        };
        $scope.promise_people = httpServices.promise('/query/PeopleAction!getPeopleByPolice.action',obj);
        $scope.getPage($scope.promise_people);
    };

	$scope.sure = function(){
		var obj = {
            terminalId : row.terminalId,
            peopleIds : $scope.forward.peopleIds,
            id : row.id
        };

        httpServices.promise('/query/TerminalPeopleRelationAction!addDispatch.action',obj)
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
modalModule.controller('downLoadCtrlTargetAlarm',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
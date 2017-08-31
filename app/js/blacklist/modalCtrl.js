modalModule.controller('deleteBlacklistCtrl',function($scope, $http, rows ,close){

	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/query/TerminalAction!deleteTerminal.action',
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

modalModule.controller('addBlacklistCtrl',function($scope, httpServices, close){

	$scope.addBlacklist = {
		name : '',
		imei : '',
		imsi : ''
	};


	// $scope.$watch('addBlacklist',function(){

 //        if($scope.addBlacklist.imei !== '' || $scope.addBlacklist.imsi !== ''){
	//         $scope.atleastOne = false;
	// 	}else{
	// 		$scope.atleastOne = true;
	// 	}
	// },true);

 
	$scope.sure = function(){

		var obj = {
			name : $scope.addBlacklist.name,
			imei : $scope.addBlacklist.imei,
			imsi : $scope.addBlacklist.imsi,
			isblacklist : true
		};

		httpServices.promise('/query/TerminalAction!addTerminal.action',obj).then(function(resp){
			if(resp.data.status == 'success'){
				close(null,500);
			}else{
				alert('添加失败！');
			}
		});
    };


	$scope.close = function(result) {
 	    close(result, 500); 
    };

});

modalModule.controller('editBlacklistCtrl',function($scope, httpServices, row, close){



	$scope.addBlacklist = {
		name : row.name,
		imei : row.imei,
		imsi : row.imsi
	};

	$scope.sure = function(){

		var obj = {
			id : row.id,
			name : $scope.addBlacklist.name,
			imei : $scope.addBlacklist.imei,
			imsi : $scope.addBlacklist.imsi,
			isblacklist : true
		};

		httpServices.promise('/query/TerminalAction!editTerminal.action',obj).then(function(resp){
			if(resp.data.status == 'success'){
				close(null,500);
			}else{
				alert('编辑失败！');
			}
		});
    };

    $scope.close = function(result) {
 	    close(result, 500); 
    };
});
modalModule.controller('downLoadCtrlBlacklist',function($scope,  gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
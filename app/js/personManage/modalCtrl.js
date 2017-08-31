modalModule.controller('deletePersonCtrl',function($scope, $http, rows ,close){

	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/query/PeopleAction!deletePeople.action',
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

modalModule.controller('addPersonCtrl',function($scope, $http, httpServices, close){

	$scope.person = { 
		name : '',
		gender : '男',
		phone : '',
		mail : '',
		type : ''
	};

	$scope.sure = function(){
		var obj = {
			peopleName : $scope.person.name,
			sex : $scope.person.gender,
			contactTel : $scope.person.phone,
			Email : $scope.person.mail,
			status : $scope.person.type,
		};
		httpServices.promise('/query/PeopleAction!addPeople.action',obj).then(function(resp){
            if (resp.data.status == 'success') {
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

modalModule.controller('editPersonCtrl',function($scope, $http, httpServices, row, close){



	$scope.person = { 
		name : row.peopleName,
		gender : row.sex,
		phone : row.contactTel,
		mail : row.email,
		type : row.status
	};

	$scope.sure = function(){
		var obj = {
			id : row.id,
			peopleName : $scope.person.name,
			sex : $scope.person.gender,
			contactTel : $scope.person.phone,
			Email : $scope.person.mail,
			status : $scope.person.type,
		};
		httpServices.promise('/query/PeopleAction!editPeople.action',obj).then(function(resp){
            if (resp.data.status == 'success') {
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
modalModule.controller('downLoadCtrlPersonManage',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});

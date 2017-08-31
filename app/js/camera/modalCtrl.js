modalModule.controller('messageCtrl',function($scope, $http, mes ,close){
	$scope.mes = {
		text : mes 
	};
	$scope.close = function(result) {
 	    close(result,500); 
    };
});

modalModule.controller('deleteCameraCtrl',function($scope, $http, rows ,close){
	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        $http({  
			url:'/query/cameraAction!delete.action',
			method:'POST',
			params:{ 'ids' : ids.join()}
		}).then(function(resp){
			if(resp.data.status == 'success'){
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

modalModule.controller('addCameraCtrl',function($scope, $http, httpServices, close){

    $scope.name = $scope.psw = $scope.realName = $scope.genderselected = 
    $scope.tel  =  $scope.mail = $scope.desc = null; 

    $scope.sure = function(){  

        var obj = {
            name : $scope.name,
            ip : $scope.ip,
            port : $scope.port,
            laneNumber : $scope.laneNumber,
            serverPort : $scope.serverPort,
            serverIp : $scope.serverIp
        };

        httpServices.promise('/query/cameraAction!add.action', obj ).then(function(resp){
			if(resp.data.status === 'success'){
                var result = '我是带过去的数据！！';
			    close(result,500);
			}else{
                alert('添加设备失败！');
			}
			
		});
    };

	$scope.clear = function(){
    	$scope.name = $scope.ip = $scope.laneNumber = $scope.port = 
    	$scope.serverPort  = null;
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('editCameraCtrl',function($scope, $http, httpServices, row, close){
    
	$scope.name = row.name;
    $scope.ip = row.ip;
    $scope.port = row.port;
    $scope.serverPort = row.serverPort;
    $scope.laneNumber = row.laneNumber;
    $scope.serverIp = row.serverIp;

    $scope.sure = function(){

        var obj = {
            id : row.id,
            ip : $scope.ip,
            name : $scope.name,
            port : $scope.port,
            laneNumber : $scope.laneNumber,
            serverPort : $scope.serverPort,
            serverIp : $scope.serverIp
        };

        httpServices.promise('/query/cameraAction!edit.action', obj ).then(function(resp){
		
			if(resp.data.status){
				var result = '我是要带过去的数据！';
			    close(result,500); 
			}else{
                alert('编辑失败！！');
			}
		});

    };

	$scope.clear = function(){
    	$scope.name = $scope.ip = $scope.laneNumber = $scope.port = 
    	$scope.serverPort  = null;
    };

	$scope.close = function(result) {
 	    close(result, 500); 
    };
});

modalModule.controller('importCameraCtrl',function($scope, $http, close,Upload){

	$scope.errorMessage="";
	$scope.fileName="";
    $scope.close = function(result) {
 	    close(result,500); 
    };

    $scope.onFileSelect = function($file) { 
            if(!$file){
                return;
            }   
            var file = $file;
            $scope.errorMessage="";
            $scope.fileName=file.name;
            Upload.upload({
            	url:'/query/cameraAction!addCameraByExcel.action',
            	headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
                data: {"camera": $scope.cameraFile},
                file: file
            }).progress(function(evt) {       
                $scope.isWaiting=true;
            }).success(function(data,status,headers,config){ 
            	if(data.status == 'success'){
            		close(result,500); 
            		return;
            	}else{
            		alert(data.info);
            	}
      			$scope.errorMessage="导入文件验证失败!";
            }).error(function(data,status,headers,config){ 
            	$scope.errorMessage="导入文件上传失败!";
            }).finally(function(){
                $scope.isWaiting=false;
            });   
    
        };
});
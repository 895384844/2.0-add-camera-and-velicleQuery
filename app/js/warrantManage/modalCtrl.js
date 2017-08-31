modalModule.controller('importLicenseCtrl',function($scope, $http, close,Upload){

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
            	url:'/system/licenseAction!upload.action',
            	headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
                data: {license: $scope.licenseFile},
                file: file
            }).progress(function(evt) {       
                $scope.isWaiting=true;
            }).success(function(data,status,headers,config){ 
            	if(data.status){
            		close(result,500); 
            		return;
            	}
      			$scope.errorMessage="授权文件验证失败!";
            }).error(function(data,status,headers,config){ 
            	$scope.errorMessage="授权文件上传失败!";
            }).finally(function(){
                $scope.isWaiting=false;
            });   
    
        };
});
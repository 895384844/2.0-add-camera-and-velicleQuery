modalModule.controller('addCommentCtrl',function($scope, $http, httpServices, rows ,close){

	$scope.comment = {
		body : '告警已收到'
	};

	$scope.sure = function(){		
		var ids = [];
        for(var i=0; i<rows.length; i++){
            ids.push(rows[i]['id']);
        }

        var obj = {
        	'ids' : ids.join(),
        	'comments' : $scope.comment.body
        };

	    httpServices.promise('/query/TerminalAlarmLogAction!confirmAlarm.action',obj).then(function(resp){
	        if(resp.data.status == 'success'){
                close(null,500);
	        }else{
                alert('添加失败！');
	        }
	    });

	};

	$scope.close = function(result) {
 	    close(result,500); 
    };
});
modalModule.controller('downLoadCtrlBlacklistAlarm',function($scope, $http, gridServices, rows ,close){

    $scope.list = rows;

	$scope.downLoad = function(index){

        var obj = { fileName : $scope.list[index]};        
        document.location.href = gridServices.exportAction('/system/downloadAction!downloadFile.action',obj); 
        
	};

	$scope.close = function(result) {
 	    close(result,500);  
    };
});
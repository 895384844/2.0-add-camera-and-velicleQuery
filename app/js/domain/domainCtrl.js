var domainModule = angular.module('domainModule', []);
domainModule.controller('domainCtrl',function($scope, $http, ModalService){

	$scope.node = {};
	$scope.node.seeableAdd = $scope.node.seeableEdit = false;

    var getTreeList = function(){

    	$http.post('/system/scopeAction!listScope.action').then(function(resp){
            $scope.roleList = resp.data;
    	});
    };

    getTreeList();

    $scope.addShow = false;
    $scope.editShow = false;

    $scope.domainAdd = function(){
	    if($scope.mytree.currentNode) { 
            $scope.addShow = true;
            $scope.editShow = false;
	    }else{
	    	alert('选择添加的节点！');
	    	// ModalService.showModal({
      //           templateUrl: 'modals/message.html',
      //           controller: 'messageCtrl',
      //           inputs: { 
      //               mes: '选择添加的节点！'
      //           }
      //       }).then(function(modal) {
      //           modal.element.modal();
      //           modal.close.then(function(result) {});
      //       });

	    }
    };

    $scope.domainEdit = function(){
        if($scope.mytree.currentNode) {
            $scope.editShow = true;
            $scope.addShow = false;
	    }else{
	    	alert('选择要编辑的节点！');
	    }
    };

    $scope.domainDelete = function(){
        if($scope.mytree.currentNode) {

            if(confirm('确定要删除吗？')){
	            if($scope.mytree.currentNode.level == '1'){
		    		alert('root不能删除！');
		    	}else if($scope.mytree.currentNode.children.length != 0){
	                alert('有子节点不能删除！');
		    	}else{

	                var obj = "sid=" + $scope.mytree.currentNode.sid;

			    	$http({
						method: 'POST',
						url: '/system/scopeAction!delete.action',
						headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
						data: obj
					}).then(function(resp){
                        if(resp.data.code == 0){
                        	alert('下面有设备，不能删除！');
			            }else{
			            	getTreeList();
			            }
			    	});
		    	}
	        }else{
	            return;
	        }

        }else{
            alert('选择要删除的节点！');
        } 
    };


    $scope.node = {
    	name : '',
    	desc : '',
    	seeableAdd : 0
    };


    $scope.addAction = function(){

    	var watch = $scope.$watch( 'mytree.currentNode', function( newObj, oldObj ) {
            if( $scope.mytree && angular.isObject($scope.mytree.currentNode) ) {
	            if( $scope.mytree.currentNode.level == '3' ){
	                alert('管理域最多添加3层！');	
	            }else{

	                var obj = 
			            "pid="+$scope.mytree.currentNode.sid+
			            "&level="+$scope.mytree.currentNode.level+
						"&sname="+ $scope.node.name+
						"&desc="+$scope.node.desc+
						"&seeable="+String($scope.node.seeableAdd == true ? 0 : 1)
			        ;
			        $http({
						method: 'POST',
						url: '/system/scopeAction!addScope.action',
						headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
						data: obj
					}).then(function(resp){
			            if(resp.data.flag == 'true'){
	                        getTreeList();
	                        $scope.addShow = false;

                            $scope.node = {
						    	name : '',
						    	desc : '',
						    	seeableAdd : 0
						    };

			            }else{
			            	alert('名称不可重复！');
			            }
			    	});
	            } 
            }

            watch(); //取消监听

        }, false);

    };

    $scope.editAction = function(){

    	var watch = $scope.$watch( 'mytree.currentNode', function( newObj, oldObj ) {
            if( $scope.mytree && angular.isObject($scope.mytree.currentNode) ) {
	            if( $scope.mytree.currentNode.level == '1' ){
	                alert('root不能编辑！');
	            }else{

                    var obj = 
			            "sid="+$scope.mytree.currentNode.sid+
			            "&pid="+$scope.mytree.currentNode.pid+
						"&sname="+ $scope.mytree.currentNode.sname+
						"&desc="+$scope.mytree.currentNode.desc+
						"&seeable="+String($scope.node.seeableEdit == true ? 0 : 1)
			        ;

                    $http({
					method: 'POST',
					url: '/system/scopeAction!editScope.action',
					headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
					data: obj
					}).then(function(resp){

			            if(resp.data.flag == 'true'){
	                        getTreeList();
	                        $scope.editShow = false;
			            }else{
			            	alert('名称不可重复！');
			            }
			    	});
	            }
            }

            watch(); //取消监听

        }, false);
    }
});
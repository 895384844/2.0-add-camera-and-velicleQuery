var mesTelModule = angular.module('mesTelModule', ['gridModule']);
mesTelModule.controller('mesTelCtrl',function($scope, gridServices){

    //实现表格呈现
	$scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 20,
        sort: null
    };
	$scope.gridOptions = {
        paginationPageSizes: [20, 30],
        paginationPageSize: 20,
        useExternalPagination: true,
        enableSorting: false,
        enableColumnResize: true,
        multiSelect: true,
        rowHeight : 35
    };

    $scope.promise = gridServices.promiseDefault('/query/MessageTemplateAction!getMessageTemplatePage.action');

    $scope.gridOptions.columnDefs = [
        { field: 'type',displayName: '模板类型',maxWidth:500,minWidth:100 },
        { field: 'templateName',displayName: '模板名称',maxWidth:500,minWidth:100 },
        { field: 'templateString',displayName: '模板样式',maxWidth:500,minWidth:100 },
//      { field: 'defaultUsed',displayName: '是否为缺省模版 ' },
        { field: 'used',displayName: '是否启用',maxWidth:500,minWidth:100 }
    ];

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',{
                templateName : $scope.tel.name,
                templateString : $scope.tel.desc,
                used : $scope.tel.used,
                type : $scope.tel.type,
                page: newPage,
                rows: pageSize,
                sort: 'id',
                order: 'desc'
            });

	        $scope.getPage($scope.promise);
        });

        //表中行选择变化事件 
        gridApi.selection.on.rowSelectionChanged($scope,function(){
            $scope.rows = gridApi.selection.getSelectedRows();
            $scope.row = $scope.rows[0];
        });

        //表中行全选事件 
        gridApi.selection.on.rowSelectionChangedBatch($scope, function() {
            $scope.rows = gridApi.selection.getSelectedRows();
        });
	};

	$scope.getPage = function(promise){
		promise.then(function(resp){
            $scope.gridOptions.totalItems = resp.data.total;
            $scope.gridOptions.data = resp.data.rows;

            for(var i=0; i<$scope.gridOptions.data.length; i++){
                if($scope.gridOptions.data[i]['defaultUsed'] == 1){
                    $scope.gridOptions.data[i]['defaultUsed'] = '是';
                }else{
                    $scope.gridOptions.data[i]['defaultUsed'] = '否';
                }

                if($scope.gridOptions.data[i]['used'] == 1){
                    $scope.gridOptions.data[i]['used'] = '启用';
                }else{
                    $scope.gridOptions.data[i]['used'] = '未启用';
                }

                if($scope.gridOptions.data[i]['type'] == 0){
                    $scope.gridOptions.data[i]['type'] = '目标告警模板';
                }else if($scope.gridOptions.data[i]['type'] == 1){
                    $scope.gridOptions.data[i]['type'] = '设备告警模板';
                }else{
                	$scope.gridOptions.data[i]['type'] = '异地告警模板';
                }
            }
		});
        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

	$scope.tel = {
		name : '',
		desc : '',
		used : '',
		type : ''
	};

	$scope.search = function(){
		var obj = {
            templateName : $scope.tel.name,
            templateString : $scope.tel.desc,
            used : $scope.tel.used,
            type : $scope.tel.type,
            page : 1,
            rows : 20
		};

		$scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',obj);
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
	};

	$scope.clear = function(){
        $scope.tel = {
			name : '',
			desc : '',
			used : '',
			type : ''
		};
	};

});		

userManageModule.controller('mesTelModalCtrl',function($scope, ModalService, gridServices){

    $scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deleteTelCtrl',
                inputs: { // 将$scope.rows以参数名rows注入到 deleteUserCtrl
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }else{
            alert('请至少选择一条删除！');
        }
    };

    $scope.add = function(){

    	ModalService.showModal({
            templateUrl: 'modals/mesTelSet/add.html',
            controller: 'addMesTelCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() { 
                //result 是addUserCtrl 控制器 在关闭后带过来的数据                
                $scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',{
                    page: $scope.newPage ? $scope.newPage : 1,
                    rows: 20,
                    sort : 'id',
                    order: 'desc'
                });
                $scope.getPage($scope.promise);
            });
        });
    };

    $scope.edit = function(){
    	if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{
            ModalService.showModal({
                templateUrl: 'modals/mesTelSet/edit.html',
                controller: 'editMesTelCtrl',
                inputs: { // 将$scope.row以参数名row注入到 editUserCtrl
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',{
                        page: $scope.newPage ? $scope.newPage : 1,
                        rows: 20,
                        sort : 'id',
                        order: 'desc'
                    });
                    $scope.getPage($scope.promise);
                });
            });
        }
    };

    $scope.use = function(){
    	if( $scope.rows == null || $scope.rows.length != 1){
            alert('请选择其中一条处理！');
        }else{

            var selected = $scope.row; 

            if(selected.type == '目标告警模板'){
                selected.tel = 0;
            }else if(selected.type == '设备告警模板'){
                selected.tel = 1;
            }else{
                selected.tel = 2;
            }
        	gridServices.promiseNew('/query/MessageTemplateAction!startUsingTemplate.action',{
        		templateId : selected.templateId,
                type : selected.tel.toString()
            }).then(function(resp){
                
   
            }).then(function(){
            	$scope.promise = gridServices.promiseNew('/query/MessageTemplateAction!getMessageTemplatePage.action',{
	                page: $scope.newPage ? $scope.newPage : 1,
	                rows: 20,
	                sort : 'id',
	                order: 'desc'
	            });
	            $scope.getPage($scope.promise);
            });

        }
    };

});
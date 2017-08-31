var planTaskModule = angular.module('planTaskModule', ['gridModule']);

planTaskModule.controller('planTaskCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
    
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
        rowHeight : 35,
        columnDefs : [
            { field: 'name',displayName: '计划名称',maxWidth:350,minWidth:200 },
            { field: 'stime',displayName: '开始时间',maxWidth:350,minWidth:200 },
            { field: 'etime',displayName: '结束时间',maxWidth:350,minWidth:100 },
            { field: 'enable',displayName: '是否可用',maxWidth:350,minWidth:100 },
            { field: 'expression',displayName: '计划时间',maxWidth:350,minWidth:100 }
        ]
    };

    $scope.promise = gridServices.promiseNew('/device/deviceScheduler!listScheduler.action');

    $scope.gridOptions.onRegisterApi = function(gridApi){
		$scope.gridApi = gridApi;
        //分页变化事件
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
            $scope.newPage = newPage;
            
            $scope.promise = gridServices.promiseNew('/device/deviceScheduler!listScheduler.action',{
                name : $scope.plan.name,
                enable : $scope.plan.enable,
                startDate : $filter('date')($scope.plan.startDate, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.plan.closeDate, 'yyyy-MM-dd HH:mm:ss'),
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
            var list = resp.data.rows;
            
            for(var i=0; i<list.length; i++){

                var strArray = list[i]['expression'].split(',');

                strArray[0] = strArray[0] == '*' ? '全年' : strArray[0] + '月';
                strArray[1] = strArray[1] == '*' ? '每天' : strArray[1] + '日';
                strArray[2] = strArray[2] + '时';
                strArray[3] = strArray[3] + '分';

                list[i]['expression'] = strArray.join();

                list[i]['enable'] = list[i]['enable'] == '1' ? '是' : '否';
            }

            $scope.gridOptions.data = list;
		});

        $scope.rows = null;
	};

	$scope.getPage($scope.promise);

    $scope.plan = {
        name : '',
        enable : '',
        startDate : '',
        closeDate : ''
    };

    $scope.endDateBeforeRender = function ($view, $dates) {
           
        if ($scope.plan.startDate) {               
            var activeDate = moment($scope.plan.startDate).subtract(1, $view).add(1, 'minute');
            $dates.filter(function (date) {
                  return date.localDateValue() <= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.startDateOnSetTime = function () {
        $scope.$broadcast('start-date-changed');
    };
    
    $scope.endDateOnSetTime = function () {
        $scope.$broadcast('end-date-changed');
    };
    $scope.startDateBeforeRender = function ($dates) {
           
        if ($scope.plan.closeDate) {
                
            var activeDate = moment($scope.plan.closeDate);

            $dates.filter(function (date) {
                  return date.localDateValue() >= activeDate.valueOf();
            }).forEach(function (date) {
                  date.selectable = false;
            })
        }
    };

    $scope.search = function(){
        var obj = {
            name : $scope.plan.name,
            enable : $scope.plan.enable,
            startDate : $filter('date')($scope.plan.startDate, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.plan.closeDate, 'yyyy-MM-dd HH:mm:ss'),
            page : 1, 
            rows : 20,
            sort : 'id',
            order: 'desc'
        };

        $scope.promise = $http({
            url:'/device/deviceScheduler!searchScheduler.action',
            method:'POST',
            params: obj
        });
        $scope.getPage($scope.promise);

        //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
       var obj = {
            name : $scope.plan.name,
            enable : $scope.plan.enable,
            startDate : $filter('date')($scope.plan.startDate, 'yyyy-MM-dd HH:mm:ss'),
            closeDate : $filter('date')($scope.plan.closeDate, 'yyyy-MM-dd HH:mm:ss')
        };
        document.location.href = gridServices.exportAction('/device/deviceScheduler!exportExcel.action',obj);
    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
			if(resp.data){
                ModalService.showModal({
	                templateUrl: 'modals/downLoad.html',
	                controller: 'downLoadCtrlPlanTask',
	                inputs: { 
	                    rows: resp.data 
	                }
	            }).then(function(modal) {
	                modal.element.modal();
	                modal.close.then(function(result) {
	                });
	            });
			}
		});
	};

});

planTaskModule.controller('planTaskModalCtrl',function($scope, ModalService, gridServices){
    
    $scope.add = function() {
        ModalService.showModal({
            templateUrl: 'modals/planTask/add.html',
            controller: 'addPlanCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function() {               
                $scope.promise = gridServices.promiseNew('/device/deviceScheduler!listScheduler.action',{
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
                templateUrl: 'modals/planTask/edit.html',
                controller: 'editPlanCtrl',
                inputs: { 
                    row: $scope.row
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/device/deviceScheduler!listScheduler.action',{
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

    $scope.delete = function() {

        if( $scope.rows != null){
            ModalService.showModal({
                templateUrl: 'modals/delete.html',
                controller: 'deletePlanCtrl',
                inputs: {
                    rows: $scope.rows
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    $scope.promise = gridServices.promiseNew('/device/deviceScheduler!listScheduler.action',{
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

});
modalModule.controller('detailsCtrl',function($scope, $http,ModalService,gridServices,close,postData){
    $scope.paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };
    //console.info(postData);
	$scope.gridOptions_details = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        useExternalPagination: true,
        rowHeight : 35,
        columnDefs : [
            { field: 'deviceName',displayName: '设备名称',maxWidth:250,minWidth:80  },
            { field: 'deviceNum',displayName: '设备编号',maxWidth:250,minWidth:80  },
            { field: 'deviceAddr',displayName: '设备地址',maxWidth:250,minWidth:80  },
            { field: 'imei',displayName: 'IMEI',maxWidth:250,minWidth:80  },
            { field: 'imsi',displayName: 'IMSI',maxWidth:250,minWidth:80  },
            { field: 'phoneNum',displayName: '电话号码前七位',maxWidth:250,minWidth:80  },
            { field: 'attribution',displayName: '归属地',maxWidth:250,minWidth:80  },
            { field: 'is_nolocal',displayName: '是否为本地号码',maxWidth:250,minWidth:80  },
            { field: 'net_type',displayName: '网络类型',maxWidth:250,minWidth:80  },
            { field: 'time',displayName: '采集时间',maxWidth:250,minWidth:80  }
        ],
        onRegisterApi:function(gridApi){
            $scope.gridApi = gridApi;

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize){
                postData.page=newPage;
                postData.rows=pageSize;
                var promise = gridServices.promiseNew('/query/query/traceLogAction!CollisionSiderDetial.action',postData); 
                getPage(promise);
             });

            $scope.gridApi.core.on.renderingComplete($scope,function(){
                angular.element('.grid').css({"height":(angular.element(document.body).height()-180)+'px'});
                $scope.$watch( function(){
                    return angular.element(document.body).height();
                }, function(){
                     angular.element('.grid').css({"height":(angular.element(document.body).height()-180)+'px'});
                });
                $scope.search();
               
            } );
        }
    };	
 
    var getPage = function(promise){
		promise.then(function(resp){
            $scope.gridOptions_details.totalItems = resp.data.total;
            var list = resp.data.rows;
            
            $scope.gridOptions_details.data = [];
            for(var i=0; i<list.length; i++){
                if(!list[i].is_nolocal){
                    list[i].is_nolocal="是";
                }else{
                    list[i].is_nolocal="否";
                }
                $scope.gridOptions_details.data.push(list[i]);
            }
            
            var netTypeMap = {   //终端网络类型字典
                '0' : 'GSM',
                '2' : 'TD-SCDMA',
                '4' : 'WCDMA',
                '8' : 'TDD-LTE',
                '7' : 'FDD-LTE',
                'A' : 'CDMA'
            };
            
            var dataArray = [];
            for(var i=0; i<list.length; i++){
               
               for(var netTypeKey in netTypeMap){
                   if( netTypeKey == list[i]['net_type'] ){
                       list[i]['net_type'] = netTypeMap[netTypeKey];
                   }
               }       
                var obj = {
                    net_type : list[i]['net_type'],
                    deviceNum : list[i]['deviceNum'],
                    is_nolocal : list[i]['is_nolocal'],
                    deviceAddr : list[i]['deviceAddr'],
                    attribution : list[i]['attribution'],
                    imei : list[i]['imei'],
                    phoneNum : list[i]['phoneNum'],
                    imsi : list[i]['imsi'],
                    time : list[i]['time'],
                    deviceName : list[i]['deviceName']
                };
                var map = list[i]['device'];
                for(var key in map){
                    obj[key] = map[key];
                }
                dataArray.push(obj);
            }
            
            $scope.gridOptions_details.data = dataArray;
            
	});
	};
    
    
    $scope.search = function(){
        postData.page=1;
        postData.rows=20;
        var promise = gridServices.promiseNew('/query/query/traceLogAction!CollisionSiderDetial.action',postData);
        getPage(promise);

       //查询后将当前页重新设置为第一页
        $scope.gridApi.pagination.seek(1);
   
    };

    
	$scope.close = function(details) {
 	    close(details,500); 
    };
});
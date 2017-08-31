var sidebarModule = angular.module('sidebarModule', []);
sidebarModule.controller('sidebarCtrl',function( $scope, $http ){

    // 定义名称的中英文字典
    var nameObj = {
        //地理视图
        "地理视图" : "deviceView",
        //基站设备
        "设备管理" : "deviceManage",
        "设备任务" : "deviceTask",
        "计划任务" : "planTask",
        "摄像头管理" : 'camera',
        //业务管理
        "人员管理" : "personManage",
        "黑名单管理" : "blacklist",
        "目标告警通知策略" : "targetAlarm",
        "设备告警通知策略" : "deviceAlarm",
        //数据分析
        "终端轨迹跟踪" : "trajectory",
        "统计流量分析" : "trafficAnalysis",
        "碰撞分析" : "collisionAnalysis",
        "综合查询" : "historyQuery",
        "伴随分析" : "accompanyAnalysis",  //新加伴随分析
        "归属地统计":"attributionStatistics", //新加归属地统计
        "黑名单告警" : "blackListLog",
        "常驻人口分析" : "residentPopulation",
        "设备告警" : "deviceAlarmLog",
        "扫频日志" : "sweepLog",
        "WiFi设备上报信息" : "wifi",
        "通知记录" : "noticeRecord",
        "车辆信息查询" : "vehicleQuery",
        //系统管理
        "用户管理" : "userManage",
        "角色管理" : "roleManage",
        "日志管理" : "logManage",
        "系统设置" : "systemSetting",
        "授权管理" : "warrantManage",
        "管理域" : "domain"
    };

    $scope.$parent.hiddenAlarmInfo = {
        blacklistHidden : true,
        deviceAlarmHidden : true
    };

    $http.get('/system/menuAction!listCommMenuTree.action').then(function(resp){
    	
//    console.log(resp.data);
      
        var list = resp.data.rows;
        $scope.groups = [];
        $scope.mainArray = [];
        
//      console.log(JSON.stringify(resp.data));

        for(var i=0; i<list.length; i++){
            var subList = list[i]['children'];

            if(subList.length >0){
               
                var subMenu = [];
                for(var j=0; j<subList.length; j++){
                    var obj = {};

                    var key = subList[j]; 
                    
                    if(key == '黑名单告警'){
                        $scope.$parent.hiddenAlarmInfo.blacklistHidden = false;
                    }

                    if(key == '设备告警'){
                        $scope.$parent.hiddenAlarmInfo.deviceAlarmHidden = false;
                    }

                    var nameValue = nameObj[key]; //应用key值，对照中英文字典得到路径
                    obj['url'] = 'main.page({type:"' + nameValue + '"})';
                    
                    obj['text'] = subList[j];
                    subMenu.push(obj);
                    list[i]['subMenu'] = subMenu;
                }
                $scope.groups.push(list[i]);
            }else{
                var key = list[i]['name'];
                var nameValue = nameObj[key]; //应用key值，对照中英文字典得到路径
                if(key != '系统信息'){
                    list[i]['url'] = 'main.page({type:"' + nameValue + '"})'; 
                }else{
                    list[i]['url'] = 'main';
                }
                $scope.mainArray.push(list[i]);
            }
        }

    });

});
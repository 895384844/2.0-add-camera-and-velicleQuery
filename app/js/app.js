var routerApp = angular.module('routerApp', [
    'ui.router',
    'ngAnimate', 
    'ngSanitize',
    'ui.bootstrap',
    'ui.grid',
    'angular-echarts3',
    'ui.grid.pagination',
    'ui.grid.selection',
    'ui.grid.treeView',
    'ui.grid.autoResize',
    'ngTouch', 
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns',
    'ui.bootstrap.datetimepicker',
    'ui.dateTimeInput',
    'angularTreeview',
    'angularSpinner',
    'common.baiduMap',
    'angucomplete-alt',
    'angularModalService',
    'httpModule',
    'ngFileUpload',
    'loginModule',
    'findPwdModule',
    'mainModule',
    'sidebarModule',
    'modalModule',
    'autoHeightModule',
    'dateTimeSelectorModule',
    'userManageModule',
    'homeModule',
    'domainModule',
    'roleManageModule',
    'logManageModule',
    'warrantManageModule',
    'safeSetModule',
    'noticeSetModule',
    'mesSetModule',
    'mesTelModule',
    'mapSetModule',
    'deviceManageModule',
    'planTaskModule',
    'deviceTaskModule',
    'mapModule',
    'trajectoryModule',
    'trafficModule',
    'collisionModule',
    'historyQueryModule',
    'blackListAlarmModule',
    'residentPopulationModule',
    'deviceAlarmModule',
    'sweepLogModule',
    'wifiModule',	//新增wifi设备上报信息
    'cameraModule',	//新增摄像头管理
    'vehicleQueryModule',	//新增车辆信息查询
    'noticeRecordModule',
    'personManageModule',
    'blacklistModule',
    'targetAlarmModule',
    'deviceAlarmLogModule',
    'accompanyAnalysisModule',//新加伴随分析
    'attributionStatisticsModule' //新加归属地统计
    ]);

//定义token拦截器
routerApp.factory('AuthInterceptor', function ($window, $q, $location) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.localStorage.getItem('token')) {
                config.headers.Authorization = $window.localStorage.getItem('token');
            }
            return config || $q.when(config);
        },
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('login');
            }
            if (response.status === 403) {
                alert('您没有权限做该项操作！');
                return;
            }
            return response;
            // return response || $q.when(response);
        }
    };
});

 routerApp.config(function($httpProvider,$stateProvider, $urlRouterProvider) {

    //允许跨域
    $httpProvider.defaults.withCredentials = true;
    //添加拦截器
    $httpProvider.interceptors.push('AuthInterceptor');

    //定义路由
 	$urlRouterProvider.otherwise('/login'); 

    //重写URL规则
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path();
        var urlArray = [];
        urlArray = path.split('/');

        var lastUrlStr = urlArray[urlArray.length-1];

        if(lastUrlStr != 'blackListLog'){
            $location.search('statue',null);
        }

        if(lastUrlStr != 'deviceAlarmLog'){
            $location.search('level',null);
        }
    });

    //配置路由
 	$stateProvider
 	.state('login',{  
 		url: '/login',
        templateUrl: 'tpls/login/login.html'
 	})
    .state('findPwd',{  
        url: '/findPwd',
        templateUrl: 'tpls/login/findPwd.html'
    })
    .state('main',{
        url: '/main',
        views: {
            '': {
                templateUrl: 'tpls/main/main.html'
            },
            'page@main': {
                templateUrl: 'tpls/main/home.html' 
            }
        }
    })
    .state('main.page',{  
    //index为最大的抽象页面（指当前页面不是自己本身固有，而是借由ui-view模板生成）
    //所以，index页中的ui-view的state状态可以直接写（例如上面的main，login）
    //除了index以外的另外生成的抽象页面，路由的state状态必须以‘.’完成，如此处的main.page
        url: '/:type?statue&level',  
        //:type表示由a标签的ui-sref：main.page({type:"userManage"})属性带过来的参数
        //注意此处真正生成的url会追加到#/main的后边
        views: {
            'page@main': {   //main主页面中page模块重新加载新的模板
                templateUrl: getTemplateUrl
                // ,
                // controllerProvider : function($stateParams){
  
                // }
            },
            'setDefault@main.page': {
                templateUrl: 'tpls/main/safeSet.html' 
            }
        }
    })
    .state('main.page.safeSet',{  
        url: '/safeSet',
        templateUrl: 'tpls/main/safeSet.html'
    })
    .state('main.page.mesSet',{  
        url: '/mesSet',
        templateUrl: 'tpls/main/mesSet.html'
    })
    .state('main.page.mesTelSet',{  
        url: '/mesTelSet',
        templateUrl: 'tpls/main/mesTelSet.html'
    })
    .state('main.page.mapSet',{  
        url: '/mapSet',
        templateUrl: 'tpls/main/mapSet.html'
    })
    .state('main.page.noticeSet',{  
        url: '/noticeSet',
        templateUrl: 'tpls/main/noticeSet.html'
    });


    //此处的参数，代表路由状态被激活时ui-sref：main.page({type:"userManage"})带过来的参数
    function getTemplateUrl($params) { 
        return 'tpls/' + 'main/' + $params.type + '.html';
    } 
 });








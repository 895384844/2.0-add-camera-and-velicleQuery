modalModule.controller('showPicCtrl',function($scope, $http, close,Upload,value){
	var src = value.pic;
	$scope.pic_src = src.slice(14);
});
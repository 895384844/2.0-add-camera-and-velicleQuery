var mesSetModule = angular.module('mesSetModule', []);
mesSetModule.controller('mesSetCtrl', function($scope, $http, $interval, httpServices, usSpinnerService) {
	$scope.mes = {
		modem_number: '',
		network_type: '1',
		content: ''
	};

	$http({
		url: '/system/settingsAction!getSettings.action',
		method: 'POST'
	}).then(function(resp) {
		var obj = resp.data;
		$scope.mes.message_port = obj.message_port;
		$scope.mes.modem_number = obj.modem_number;
		$scope.mes.phone_number = obj.phone_number;
		$scope.mes.baudrate = obj.baudrate;
		$scope.mes.timeout = obj.timeout;
		$scope.mes.network_type = String(obj.network_type);
	});


	$scope.test = function() {
		var params = {
			mesagePort: $scope.mes.message_port,
			dstMblTelNumber: $scope.mes.modem_number,
			testMobile: $scope.mes.phone_number,
			baudRate: $scope.mes.baudrate,
			messageOvertime: $scope.mes.timeout,
			networkStandard: $scope.mes.network_type,
			msgContent: $scope.mes.content
		};

		httpServices.promise('/smmodem/SMModemAction!smsPortTest.action', params).then(function(resp) {
			usSpinnerService.spin('spinner-1');
			var timer = $interval(function() {
				$http({
					url: '/smmodem/SMModemAction!smsResultLoop.action',
					method: 'POST'
				}).then(function(resp) {
					usSpinnerService.stop('spinner-1');
					if(String(resp.data.status).trim() == 'success') {
						alert('短信已发送，请查看手机是否收到！');
						return;
					}
					alert('短信已发送，请查看手机是否收到！');
				});

			}, 20000, 1);
		});
	};

	$scope.sure = function() {
		var array = [];

		for(var key in $scope.mes) {
			var list = key + ':' + '"' + $scope.mes[key] + '"';
			array.push(list);
		}

		$http({
			url: '/system/settingsAction!setSettings.action',
			method: 'POST',
			params: {
				map: array.join()
			}
		}).then(function(resp) {
			if(resp.data.msg != 'ok') {
				alert('提交失败！');
			} else {
				alert('提交成功！');
			}
		});

	};

});
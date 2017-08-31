var modalModule = angular.module('modalModule', []);
modalModule.service('modalServices',function(){

	this.creatModal = function(){
        return function(){
            var $ctrl = this;
			$ctrl.items = ['item1', 'item2', 'item3'];

			$ctrl.open = function (size, parentSelector) {
				var parentElem = parentSelector ? angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
				var modalInstance = $uibModal.open({
					animation: true,
					ariaLabelledBy: 'modal-title',
					ariaDescribedBy: 'modal-body',
					templateUrl: 'myModalContent.html',
					controller: 'ModalInstanceCtrl',
					controllerAs: '$ctrl',
					size: size,
					appendTo: parentElem,
					resolve: {
						items: function () {
							return $ctrl.items;
						}
					}
				});

				modalInstance.result.then(function (selectedItem) {
					$ctrl.selected = selectedItem;
				}, function () {
					$log.info('Modal dismissed at: ' + new Date());
				});
			};
        };	
	};

	this.depend = function(){
		return function(){
			var $ctrl = this;
		    $ctrl.items = items;
		    $ctrl.selected = {
		        item: $ctrl.items[0]
		    };

		    $ctrl.ok = function () {
		        $uibModalInstance.close($ctrl.selected.item);
		    };

		    $ctrl.cancel = function () {
		        $uibModalInstance.dismiss('cancel');
		    };
		};
		
	};
	
});
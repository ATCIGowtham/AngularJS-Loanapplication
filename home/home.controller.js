(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController)
        .directive('myCustomer', function() {
            return {
              template: '<label ng-show=vm.monthlyPayment>Your Monthly EMI is: {{vm.monthlyPayment}}</label>'
            };
        })
        .directive('myCurrentTime', ['$interval', 'dateFilter', function($interval, dateFilter) {

            function link(scope, element, attrs) {
              var format,
                  timeoutId;
          
              function updateTime() {
                element.text(dateFilter(new Date(), format));
              }
          
              scope.$watch(attrs.myCurrentTime, function(value) {
                format = value;
                updateTime();
              });
          
              element.on('$destroy', function() {
                $interval.cancel(timeoutId);
              });
          
              // start the UI update process; save the timeoutId for canceling
              timeoutId = $interval(function() {
                updateTime(); // update DOM
              }, 1000);
            }
            return {
                link: link
            };
        }]);

    HomeController.$inject = ['UserService', '$rootScope'];
    function HomeController(UserService, $rootScope) {
        $rootScope.format = 'M/d/yy h:mm:ss a';
        var vm = this;

        vm.user = null;
        vm.calculateLoan = calculateLoan;
        vm.reset = reset;
        vm.allUsers = [];
        vm.deleteUser = deleteUser;
        vm.dataLoading = false;
        vm.monthlyPayment = '';

        initController();

        function initController() {
            loadCurrentUser();
            loadAllUsers();
        }

        function loadCurrentUser() {
            UserService.GetByUsername($rootScope.globals.currentUser.username)
                .then(function (user) {
                    vm.user = user;
                });
        }

        function loadAllUsers() {
            UserService.GetAll()
                .then(function (users) {
                    vm.allUsers = users;
                });
        }

        function deleteUser(id) {
            UserService.Delete(id)
            .then(function () {
                loadAllUsers();
            });
        }

        function calculateLoan() {
            vm.dataLoading = true;
            vm.monthlyPayment = '';
            console.log(vm);
            var monthlyInterestRate = vm.loanpercentage / 12 / 100;
            var monthlyPayment = (vm.loanamt * monthlyInterestRate) /
                    (1 - Math.pow(1 + monthlyInterestRate, -vm.tenure));
            vm.monthlyPayment = monthlyPayment;
            vm.dataLoading = false;
        }

        function reset() {
            vm.loanpercentage = '';
            vm.loanamt = '';
            vm.tenure = '';
            vm.agree = '';
            vm.agreeSign = '';
        }

    }

})();
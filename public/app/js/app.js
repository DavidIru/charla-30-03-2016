(function () {
    'use strict';
    angular
        .module('todoProject', [
            'ui.router',
            'ngRoute',
            'ngLodash'
        ])
        .run(['$rootScope', '$state', '$stateParams', '$window',
            function ($rootScope, $state, $stateParams, $window) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                $rootScope.$storage = $window.localStorage;
            }]);
})();

(function () {
    'use strict';
    angular
        .module('todoProject')
        .controller('TodoController', TodoController);

    TodoController.$inject = ['$scope'];
    /**
     * TodoController
     * @param $scope
     * @constructor
     */
    function TodoController($scope) {
        $scope.todos = [
            {
                text: 'Seguir a @DavidIruzubieta en twitter',
                done: false
            },
            {
                text: 'Ver el código del ejemplo',
                done: false
            }
        ];

        $scope.getTotalTodos = getTotalTodos;
        $scope.addTodo = addTodo;
        $scope.toggleState = toggleState;
        $scope.clearCompleted = clearCompleted;

        /**
         * Número de tareas total
         * @returns {Number}
         */
        function getTotalTodos() {
            return $scope.todos.length;
        }

        /**
         * Añadir nueva tarea
         */
        function addTodo() {
            $scope.todos.push({text: $scope.formTodoText, done: false});
            $scope.formTodoText = '';
        }

        /**
         * Cambiar estado de la tarea
         * @param todo
         */
        function toggleState(todo) {
            todo.done = !todo.done;
        }

        /**
         * Limpiar tareas completas
         */
        function clearCompleted() {
            $scope.todos = _.filter($scope.todos, function (todo) {
                return !todo.done;
            });
        }
    }
})();

(function () {
    'use strict';
    angular
        .module('todoProject')
        .constant('BASEPATH', {
            apiURL: '[your API URL]',
            webURL: '[your WEB URL]'
        });
})();

(function () {
    'use strict';
    angular
        .module('todoProject')
        .config(URLConfig)
        .config(InitialConfiguration);

    URLConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider'];
    /**
     * Configuración de URLs
     * @param $stateProvider
     * @param $locationProvider
     * @param $urlRouterProvider
     * @param helper
     * @constructor
     */
    function URLConfig($stateProvider, $locationProvider, $urlRouterProvider, helper) {
        $locationProvider.html5Mode(false);

        // defaults to dashboard
        $urlRouterProvider.otherwise('/todo');

        $stateProvider
            .state('todo', {
                url: '/todo',
                templateUrl: helper.basepath('components', 'todo'),
                controller: 'TodoController'
            });
    }

    InitialConfiguration.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide'];
    /**
     * Configuración inicial
     * @param $controllerProvider
     * @param $compileProvider
     * @param $filterProvider
     * @param $provide
     * @constructor
     */
    function InitialConfiguration($controllerProvider, $compileProvider, $filterProvider, $provide) {
        angular.module('todoProject').controller = $controllerProvider.register;
        angular.module('todoProject').directive = $compileProvider.directive;
        angular.module('todoProject').filter = $filterProvider.register;
        angular.module('todoProject').factory = $provide.factory;
        angular.module('todoProject').service = $provide.service;
        angular.module('todoProject').constant = $provide.constant;
        angular.module('todoProject').value = $provide.value;
    }
})();

(function () {
    'use strict';
    angular
        .module('todoProject')
        .provider('RouteHelpers', RouteHelpers);

    function RouteHelpers() {
        this.basepath = basepath;

        function basepath(type, folder, template) {
            template = template || 'template';
            if (folder) {
                return '/app/views/' + type + '/' + folder + '/' + template + '.html';
            }
            return '/app/views/' + type + '/' + template + '.html';
        }

        this.$get = function () {
            return {
                basepath: this.basepath
            };
        };
    }
})();

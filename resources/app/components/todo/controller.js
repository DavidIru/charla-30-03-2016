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

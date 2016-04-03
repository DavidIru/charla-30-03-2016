(function () {
    'use strict';
    angular
        .module('todoProject')
        .constant('BASEPATH', {
            apiURL: '@@apiURL',
            webURL: '@@webURL'
        });
})();

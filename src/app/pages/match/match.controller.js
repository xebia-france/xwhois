'use strict';

angular.module('app.xwhois')
    .controller('MatchController', function ($rootScope, $scope, $location, $timeout, $match, $navigation) {

        $scope.question = null;
        $scope.modal = false;
        $scope.totalTry = 0;
        $scope.score = 0;

        function nextImage() {
            $match.nextChallenge().then(function(question) {
                $scope.result = null;
                $scope.question = question;
            });
        }

        $scope.giveUp = function () {
            $scope.modal = false;
            $match.kill();
            $navigation.to('home', 600);
        };

        $scope.openModal = function() {
            $scope.modal = true;
        };

        $scope.closeModal = function() {
            $scope.modal = false;
        };

        $scope.chooseImage = function(chosedImage, name) {
            if ($scope.result !== null) {
                return;
            }
            $match.tryToAnswer(chosedImage, name).then(function (result) {
                $scope.result = result;
                $timeout(function() {
                    nextImage();
                }, 2000);
            });
        };

        $match.start();

        nextImage();

    });

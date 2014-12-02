"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/

angular.module('ajax-challenge', ['ui.bootstrap'])
    .config(function($httpProvider) {
        //Parse required two extra headers sent with every HTTP request: X-Parse-Application-Id, X-Parse-REST-API-Key
        //the first needs to be set to your application's ID value
        //the second needs to be set to your application's REST API key
        //both of these are generated by Parse when you create your application via their web site
        //the following lines will add these as default headers so that they are sent with every
        //HTTP request we make in this application
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'nfj4UkyebZf3gQWOHoFrsSVeMTBRn9P08xJsWl1Z';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = '4pPHNNnGG12HdNOLCGtQbzSOUrPkY4CuWJhVKTUA';
    })

    //comments controller and in-line function to retrieve the url from parse
    .controller('CommentsController', function($scope, $http) {
        var commentsUrl = 'https://api.parse.com/1/classes/comments';

        $scope.refreshComments = function() {
            //sets loading to a truthy value
            $scope.loading = true;
            $http.get(commentsUrl + '?order=-votes')
                //checks whether user has updated comments or deleted comments
                .success(function(responseData) {
                    $scope.comments = responseData.results;
                    if (responseData.results.length == 0) {
                        $scope.isEmpty = true;
                    }
                    else {
                        $scope.isEmpty = false;
                    }
                })
                .error(function(err) {
                    console.log(err);
                })
                //final execution of refreshComments
                .finally(function() {
                    $scope.loading = false;
                })
        };
        //invoke refreshComments()
        $scope.refreshComments();

        //properties in fields where user will be inputting data
        $scope.newComments = {
            title: '',
            firstName: '',
            lastName: '',
            body: '',
            votes: 0,
            rating: null
        };

        $scope.addComments = function() {
            //if user is "adding comment" with no valid data, request user to input valid info
            if (!($scope.newComments.title && $scope.newComments.firstName && $scope.newComments.lastName && $scope.newComments.body
                && $scope.newComments.rating)) {
                $scope.inserting = false;
                $scope.errorMessage = 'Error: Please put in your information correctly!';
                //return to avoid executing rest of code
                return;                
            }
            //if user is adding correct information, make the error message go away 
            //and update information accordingly
            $scope.errorMessage = null;

            $scope.inserting = true;

            $http.post(commentsUrl, $scope.newComments)
                .success(function(responseData) {
                    $scope.newComments.objectId = responseData.objectId;

                    //push() method
                    $scope.comments.push($scope.newComments);
                    //user has put in appropriate data in fields
                    $scope.isEmpty = false;

                    $scope.newComments = {ratings: null, votes: 0};

                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.inserting = false;
                })
        }; //addComment()

        //increments the votes when user clicks on the thumbs glyphicon
        $scope.incrementVotes = function(comment, amount) {
            $scope.updating = true;

            $scope.votes = {
                votes: {
                    __op: 'Increment',
                    amount: amount
                }
            };

            if ($scope.votes.votes.amount == -1) {
                if (comment.votes < 1 || comment.votes == null) {
                    return;
                }
            }

            $http.put(commentsUrl + '/' + comment.objectId, $scope.votes)
                .success(function(responseData) {
                    comment.votes = responseData.votes;
                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.updating = false;
                });
        }; //incrementVotes()

        //removes comments posted previously by former users and refreshs the 
        //comments section of the page
        $scope.deleteComment = function(comment) {
            $http.delete(commentsUrl + '/' + comment.objectId)
                .success(function () {
                    $scope.refreshComments();
                })
                .error(function (err) {
                    console.log(err);
                })

        }; //deleteComment()

    });
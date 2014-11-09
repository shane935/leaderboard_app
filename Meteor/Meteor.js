Names = new Mongo.Collection("names");

if (Meteor.isClient) {

    // Ensures searchText is reset on refresh should probably make this the 
    Session.set('searchText', '');
    Session.set('hide', true);

    Template.dropdown.helpers({
        searchText: function() {
            return Session.get("searchText");
        }
    });

    Template.dropdown.events({
        'keyup .dropdown-form input': function(event) {
            Session.set('searchText', event.target.value);
            if (event.keyCode === 40) {

            };
        },
        'focus .dropdown-form input': function(event) {
            Session.set('hide', false);
        },
        'blur .dropdown-form input': function(event) {
            Session.set('hide', true);
        },
        'submit .dropdown-form': function(event) {
            event.preventDefault();
            var text = event.target.dropdown.value;

            if (!Names.findOne({
                name: text
            })) {
                Names.insert({
                    name: text
                });
            }

            return false;
        }
    });

    Template.dropdownList.helpers({
        names: function() {
            var sort = {
                sort: {
                    name: 1
                }
            };
            if (Session.get("searchText") && Session.get("searchText").length > 0) {
                return Names.find({}, sort).fetch().filter(function(value) {
                    if (value.name.match(Session.get("searchText"))) {
                        return true;
                    }
                    return false;
                });
            } else {
                return Names.find({}, sort).fetch();
            }
        },
        hide: function() {
            return Session.get("hide");
        }
    });

    Template.dropdownList.events({
        'mousedown .js-user-select-list': function(event) {
            Session.set('searchText', event.target.innerHTML);
        }
    })
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}
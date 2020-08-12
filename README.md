# hiking_project_fe

This is the front end to this backend end:

Live site:

http://hikefinder.net/

TODO: 

https://jsfiddle.net/ydhnpsvj/

https://docs.mapbox.com/mapbox-gl-js/example/variable-label-placement/

https://docs.mapbox.com/help/troubleshooting/optimize-map-label-placement/

# HikeFinder.net 

Find hiking trails anywhere in the USA.

## Installation

1. Get a free access token from Mapbox. https://docs.mapbox.com/help/how-mapbox-works/access-tokens/

2. Clone this repository.

3. Follow these instructions to install npm and node. https://www.taniarascia.com/how-to-install-and-use-node-js-and-npm-mac-and-windows/

Run:

```
$ cd hiking_project_fe
$ bundle install
$ rake db:migrate 
$ rake db:seed 
$ rails s
```

There will multiple students and teachers in the system after seeding with the following credentials. Logging in not required to see the app in action.

Sample student login:
```
username: BillyStudent
password: password
```

Sample teacher login:
```
username: LarryTeacher
password: password
```

## Live demo

http://hikefinder.net

## Contributing Bugfixes or Features

* Fork the this repository
* Create a local development branch for the bugfix; I recommend naming the branch such that you'll recognize its purpose.
* Commit a change, and push your local branch to your github fork
* Send me pull request for your changes to be included

## License

Hikefinder is licensed under the MIT license. (http://opensource.org/licenses/MIT)

https://docs.mapbox.com/help/how-mapbox-works/access-tokens/
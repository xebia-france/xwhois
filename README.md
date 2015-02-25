Please go to [wiki page](https://github.com/xebia-france/xwhois/wiki).

### Overview ###

--


### Technical stack ###

- templates : Jade (http://jade-lang.com/)
- styles : Sass (http://sass-lang.com/), Bourbon (Neat, Bitters) (http://bourbon.io/)
- mvw fmk : AngularJs (https://angularjs.org/)
- routes : ngRouteSegment (http://angular-route-segment.com/)
- build : coffee (http://coffeescript.org/), gulp (http://gulpjs.com/)
- tests : Jasmine (http://jasmine.github.io/), Karma (http://karma-runner.github.io/0.12/index.html), Chai (http://chaijs.com/), Mocha


### Launch ###

```
$ npm install
$ npm rebuild node-sass
$ gulp serve
```

Then go to [http://localhost:4000](http://localhost:4000)


### Tests ###

```
$ gulp test
$ npm test
```

For tests driven development :

```
$ gulp test:loop
```


### Routes ###

File 'src/app/conf/routes.yml' contains all routes.

Each root route contains one template that will be injected in the '<... app-view-segment="0">' dom element.
Each sub-route template will be injected in a 'app-view-segment="1"' dom element found in the root template.
Etc.

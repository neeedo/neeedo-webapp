# neeedo-webapp <a href='https://travis-ci.org/neeedo/neeedo-webapp'><img src="https://travis-ci.org/neeedo/neeedo-webapp.svg?branch=master" alt="Travis Build Status"/></a> 

<a href='https://www.versioneye.com/user/projects/552e45184379b22cee000004'><img src='https://www.versioneye.com/user/projects/552e45184379b22cee000004/badge.svg?style=flat' alt="Dependency Status" /></a>

[![codecov.io](https://codecov.io/github/neeedo/neeedo-webapp/coverage.svg?branch=master)](https://codecov.io/github/neeedo/neeedo-webapp?branch=master)

![codecov.io](https://codecov.io/github/neeedo/neeedo-webapp/branch.svg?branch=master)

a [Sails](http://sailsjs.org) application

Installation
----------

- Install the latest [Node.js](https://nodejs.org/download/) (which includes the NPM package manager) .
- Checkout the project and install the NPM dependencies

```bash
git clone https://github.com/neeedo/neeedo-webapp.git
npm install
```

- If you want to make use of grunt (e.g. to run the code coverage task more smoothly), please install Grunt and set up the Grunt CLI (-> http://gruntjs.com/getting-started ).

Run the project
----------

```bash
npm start
```

- The default environment is 'development'. On production systems, set the NODE_ENV environment variable to 'production'.

Generate test coverage report
----------

```bash
grunt testcoverage
```

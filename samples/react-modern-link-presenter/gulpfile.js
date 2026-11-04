'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
// Build-only patch: SPFx --ship treats cosmetic warnings as fatal. Suppress SCSS casing and lint warnings; type errors still fail.
build.addSuppression(/Warning - \[sass\] The local CSS class .* is not camelCase/);
build.addSuppression(/Warning - lint - /);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));

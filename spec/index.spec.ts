import {testBasic} from './basic.spec.js';
import {testDocExamples} from './doc.examples.spec.js';
import {testFeaturesAndErrors} from './features.and.errors.spec.js';
import {testRealworldExamples} from './realworld.examples.spec.js';

import {ok, testsCount} from './utils.js';

declare const process: {env: {_START: string}};

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

testBasic();
testDocExamples();
testFeaturesAndErrors();

testRealworldExamples().then(() => {
  ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
});

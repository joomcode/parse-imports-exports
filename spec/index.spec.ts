import {testBasic} from './basic.spec';
import {testDocExamples} from './doc.examples.spec';
import {testFeaturesAndErrors} from './features.and.errors.spec';
import {testRealworldExamples} from './realworld.examples.spec';

import {ok, testsCount} from './utils';

declare const process: {env: {_START: string}};

const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

testBasic();
testDocExamples();
testFeaturesAndErrors();

testRealworldExamples().then(() => {
  ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
});

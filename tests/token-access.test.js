const test = require('node:test');
const assert = require('node:assert/strict');

const roles = require('../modules/token-access');

test('token roles include Sons of Ra and Builders of the Dawn', () => {
  assert(roles.sons_of_ra);
  assert.equal(roles.sons_of_ra.permission, 'SOLAR_FORGE_ACCESS');
  assert(roles.builders_of_the_dawn);
  assert.equal(roles.builders_of_the_dawn.permission, 'BLUEPRINT_CREATION');
});

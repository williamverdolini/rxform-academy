import * as ng from '@angular/core';

/**
 * setup "inject" function for angular dependency injection.
 * To use this function in tests, remember to add the following line in the test
 *
 * `jest.mock('@angular/core');`
 *
 * @export
 * @return {*}
 */
export function setupJestNgInject() {
  const _dependencies: {type: any, useValue: any}[] = [];
  const injection : {
    clear: ()=>void,
    add: (dependencies: {type: Function, useValue: any}[]) => void
  } = {
    clear: () => _dependencies.splice(0, _dependencies.length),
    add: (dependencies: {type: Function, useValue: any}[]) => _dependencies.push(...dependencies)
  }
  jest.spyOn(ng, 'inject').mockImplementation((x) => {
    return _dependencies.find(d => d.type === x)?.useValue;
    });
  return injection;
}
